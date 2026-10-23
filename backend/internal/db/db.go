package db

import (
	"database/sql"
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/PetroProg/Films-List/internal/models"
	_ "modernc.org/sqlite"
)

type DB struct {
	conn *sql.DB
}

func normalizeText(s string) string {
	s = strings.ToLower(s)
	s = strings.ReplaceAll(s, "ё", "е")
	return strings.TrimSpace(s)
}

func makeSearchText(title string, year *int, comment string) string {
	var parts []string
	if title != "" {
		parts = append(parts, title)
	}
	if year != nil && *year > 0 {
		parts = append(parts, strconv.Itoa(*year))
	}
	if comment != "" {
		parts = append(parts, comment)
	}
	return normalizeText(strings.Join(parts, " "))
}

func InitDB(dbPath string) (*DB, error) {
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create db directory: %w", err)
	}

	conn, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite database: %w", err)
	}

	conn.SetMaxOpenConns(1)

	pragmas := []string{
		"PRAGMA journal_mode = WAL;",
		"PRAGMA foreign_keys = ON;",
		"PRAGMA busy_timeout = 5000;",
	}
	for _, p := range pragmas {
		if _, err := conn.Exec(p); err != nil {
			log.Printf("Warning: pragma %s error: %v", p, err)
		}
	}

	baseSchema := `
	CREATE TABLE IF NOT EXISTS films (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT NOT NULL,
		year INTEGER,
		url TEXT NOT NULL DEFAULT '',
		status TEXT NOT NULL DEFAULT 'plan',
		rating INTEGER NOT NULL DEFAULT 0,
		comment TEXT NOT NULL DEFAULT '',
		search_text TEXT NOT NULL DEFAULT '',
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	`

	if _, err := conn.Exec(baseSchema); err != nil {
		return nil, fmt.Errorf("failed to create base schema: %w", err)
	}

	// Migration: ensure search_text column exists on previously created database
	_, _ = conn.Exec("ALTER TABLE films ADD COLUMN search_text TEXT NOT NULL DEFAULT '';")

	indexSchema := `
	CREATE INDEX IF NOT EXISTS idx_films_status ON films(status);
	CREATE INDEX IF NOT EXISTS idx_films_title ON films(title);
	CREATE INDEX IF NOT EXISTS idx_films_year ON films(year);
	CREATE INDEX IF NOT EXISTS idx_films_rating ON films(rating);
	CREATE INDEX IF NOT EXISTS idx_films_search ON films(search_text);
	`

	if _, err := conn.Exec(indexSchema); err != nil {
		return nil, fmt.Errorf("failed to create index schema: %w", err)
	}

	// Backfill any empty search_text entries
	rows, err := conn.Query("SELECT id, title, year, comment FROM films WHERE search_text = ''")
	if err == nil {
		type backfillItem struct {
			id int64
			st string
		}
		var items []backfillItem
		for rows.Next() {
			var id int64
			var title, comment string
			var year sql.NullInt64
			if err := rows.Scan(&id, &title, &year, &comment); err == nil {
				var y *int
				if year.Valid {
					yi := int(year.Int64)
					y = &yi
				}
				items = append(items, backfillItem{id: id, st: makeSearchText(title, y, comment)})
			}
		}
		rows.Close()
		for _, it := range items {
			_, _ = conn.Exec("UPDATE films SET search_text = ? WHERE id = ?", it.st, it.id)
		}
	}

	return &DB{conn: conn}, nil
}

func (d *DB) Close() error {
	return d.conn.Close()
}

func (d *DB) SeedFromCSV(csvPath string) error {
	var count int
	err := d.conn.QueryRow("SELECT COUNT(*) FROM films").Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		log.Printf("Database already contains %d films, skipping initial seed", count)
		return nil
	}

	file, err := os.Open(csvPath)
	if err != nil {
		if os.IsNotExist(err) {
			log.Printf("Seed file %s not found, skipping initial seed", csvPath)
			return nil
		}
		return fmt.Errorf("failed to open seed csv: %w", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	header, err := reader.Read()
	if err != nil {
		return fmt.Errorf("failed to read csv header: %w", err)
	}

	headerMap := make(map[string]int)
	for i, h := range header {
		clean := strings.TrimSpace(strings.TrimPrefix(h, "\ufeff"))
		headerMap[clean] = i
	}

	titleIdx, ok1 := headerMap["Название"]
	yearIdx, ok2 := headerMap["Год"]
	ratingIdx, ok3 := headerMap["Оценка"]
	watchedIdx, ok4 := headerMap["Просмотрен"]
	commentIdx, ok5 := headerMap["Комментарий"]

	if !ok1 || !ok2 || !ok4 {
		return fmt.Errorf("csv header does not match expected fields: %v", header)
	}

	tx, err := d.conn.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
		INSERT INTO films (title, year, url, status, rating, comment, search_text)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	imported := 0
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return fmt.Errorf("error reading csv record: %w", err)
		}

		title := ""
		if titleIdx < len(record) {
			title = strings.TrimSpace(record[titleIdx])
		}
		if title == "" {
			continue
		}

		var year *int
		if ok2 && yearIdx < len(record) {
			yStr := strings.TrimSpace(record[yearIdx])
			if y, err := strconv.Atoi(yStr); err == nil && y > 1800 {
				year = &y
			}
		}

		rating := 0
		if ok3 && ratingIdx < len(record) {
			rStr := strings.TrimSpace(record[ratingIdx])
			if r, err := strconv.Atoi(rStr); err == nil && r >= 0 && r <= 10 {
				rating = r
			}
		}

		status := "plan"
		if ok4 && watchedIdx < len(record) {
			wStr := strings.ToLower(strings.TrimSpace(record[watchedIdx]))
			if wStr == "yes" || wStr == "да" || wStr == "1" || wStr == "true" {
				status = "watched"
			}
		}

		url := ""
		comment := ""
		if ok5 && commentIdx < len(record) {
			cStr := strings.TrimSpace(record[commentIdx])
			if strings.HasPrefix(cStr, "http://") || strings.HasPrefix(cStr, "https://") {
				url = cStr
			} else {
				comment = cStr
			}
		}

		st := makeSearchText(title, year, comment)
		if _, err := stmt.Exec(title, year, url, status, rating, comment, st); err != nil {
			return fmt.Errorf("failed to insert film '%s': %w", title, err)
		}
		imported++
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit seed transaction: %w", err)
	}

	log.Printf("Successfully imported %d films from seed CSV", imported)
	return nil
}

func (d *DB) GetStats() (models.Stats, error) {
	var s models.Stats
	err := d.conn.QueryRow(`
		SELECT 
			COUNT(*),
			COALESCE(SUM(CASE WHEN status = 'plan' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN status = 'watched' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN status = 'dropped' THEN 1 ELSE 0 END), 0),
			COALESCE(AVG(CASE WHEN rating > 0 THEN rating END), 0.0)
		FROM films
	`).Scan(&s.Total, &s.Plan, &s.Watched, &s.Dropped, &s.AvgRating)
	return s, err
}

func (d *DB) ListFilms(status, search, sort string) ([]models.Film, models.Stats, error) {
	stats, err := d.GetStats()
	if err != nil {
		return nil, stats, err
	}

	var where []string
	var args []interface{}

	if status != "" && status != "all" {
		where = append(where, "status = ?")
		args = append(args, status)
	}

	if search != "" {
		words := strings.Fields(normalizeText(search))
		for _, w := range words {
			where = append(where, "search_text LIKE ?")
			args = append(args, "%"+w+"%")
		}
	}

	whereClause := ""
	if len(where) > 0 {
		whereClause = "WHERE " + strings.Join(where, " AND ")
	}

	orderBy := "id DESC"
	switch sort {
	case "title_asc":
		orderBy = "search_text ASC"
	case "title_desc":
		orderBy = "search_text DESC"
	case "year_desc":
		orderBy = "year DESC NULLS LAST, search_text ASC"
	case "year_asc":
		orderBy = "year ASC NULLS LAST, search_text ASC"
	case "rating_desc":
		orderBy = "rating DESC, search_text ASC"
	case "rating_asc":
		orderBy = "rating ASC, search_text ASC"
	case "oldest":
		orderBy = "id ASC"
	default:
		orderBy = "id DESC"
	}

	query := fmt.Sprintf(`
		SELECT id, title, year, url, status, rating, comment, created_at, updated_at
		FROM films
		%s
		ORDER BY %s
	`, whereClause, orderBy)

	rows, err := d.conn.Query(query, args...)
	if err != nil {
		return nil, stats, err
	}
	defer rows.Close()

	var films []models.Film
	for rows.Next() {
		var f models.Film
		var year sql.NullInt64
		if err := rows.Scan(&f.ID, &f.Title, &year, &f.URL, &f.Status, &f.Rating, &f.Comment, &f.CreatedAt, &f.UpdatedAt); err != nil {
			return nil, stats, err
		}
		if year.Valid {
			y := int(year.Int64)
			f.Year = &y
		}
		films = append(films, f)
	}

	if films == nil {
		films = []models.Film{}
	}

	return films, stats, nil
}

func (d *DB) GetFilmByID(id int64) (*models.Film, error) {
	row := d.conn.QueryRow(`
		SELECT id, title, year, url, status, rating, comment, created_at, updated_at
		FROM films WHERE id = ?
	`, id)

	var f models.Film
	var year sql.NullInt64
	if err := row.Scan(&f.ID, &f.Title, &year, &f.URL, &f.Status, &f.Rating, &f.Comment, &f.CreatedAt, &f.UpdatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if year.Valid {
		y := int(year.Int64)
		f.Year = &y
	}
	return &f, nil
}

func (d *DB) CreateFilm(req models.CreateFilmRequest) (*models.Film, error) {
	if strings.TrimSpace(req.Title) == "" {
		return nil, errors.New("title cannot be empty")
	}
	if req.Status == "" {
		req.Status = "plan"
	}

	st := makeSearchText(req.Title, req.Year, req.Comment)
	res, err := d.conn.Exec(`
		INSERT INTO films (title, year, url, status, rating, comment, search_text, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
	`, strings.TrimSpace(req.Title), req.Year, strings.TrimSpace(req.URL), req.Status, req.Rating, strings.TrimSpace(req.Comment), st)
	if err != nil {
		return nil, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}

	return d.GetFilmByID(id)
}

func (d *DB) UpdateFilm(id int64, req models.UpdateFilmRequest) (*models.Film, error) {
	if strings.TrimSpace(req.Title) == "" {
		return nil, errors.New("title cannot be empty")
	}
	if req.Status == "" {
		req.Status = "plan"
	}

	st := makeSearchText(req.Title, req.Year, req.Comment)
	res, err := d.conn.Exec(`
		UPDATE films
		SET title = ?, year = ?, url = ?, status = ?, rating = ?, comment = ?, search_text = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`, strings.TrimSpace(req.Title), req.Year, strings.TrimSpace(req.URL), req.Status, req.Rating, strings.TrimSpace(req.Comment), st, id)
	if err != nil {
		return nil, err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return nil, err
	}
	if rows == 0 {
		return nil, sql.ErrNoRows
	}

	return d.GetFilmByID(id)
}

func (d *DB) UpdateFilmStatus(id int64, status string) error {
	res, err := d.conn.Exec(`
		UPDATE films
		SET status = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`, status, id)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (d *DB) UpdateFilmRating(id int64, rating int) error {
	res, err := d.conn.Exec(`
		UPDATE films
		SET rating = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`, rating, id)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (d *DB) DeleteFilm(id int64) error {
	res, err := d.conn.Exec("DELETE FROM films WHERE id = ?", id)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (d *DB) GetRandomFilm(status string) (*models.Film, error) {
	where := ""
	var args []interface{}
	if status != "" && status != "all" {
		where = "WHERE status = ?"
		args = append(args, status)
	}

	query := fmt.Sprintf(`
		SELECT id, title, year, url, status, rating, comment, created_at, updated_at
		FROM films
		%s
		ORDER BY RANDOM()
		LIMIT 1
	`, where)

	row := d.conn.QueryRow(query, args...)

	var f models.Film
	var year sql.NullInt64
	if err := row.Scan(&f.ID, &f.Title, &year, &f.URL, &f.Status, &f.Rating, &f.Comment, &f.CreatedAt, &f.UpdatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if year.Valid {
		y := int(year.Int64)
		f.Year = &y
	}
	return &f, nil
}

func (d *DB) ExportAllFilms() ([]models.Film, error) {
	rows, err := d.conn.Query(`
		SELECT id, title, year, url, status, rating, comment, created_at, updated_at
		FROM films
		ORDER BY id ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var films []models.Film
	for rows.Next() {
		var f models.Film
		var year sql.NullInt64
		if err := rows.Scan(&f.ID, &f.Title, &year, &f.URL, &f.Status, &f.Rating, &f.Comment, &f.CreatedAt, &f.UpdatedAt); err != nil {
			return nil, err
		}
		if year.Valid {
			y := int(year.Int64)
			f.Year = &y
		}
		films = append(films, f)
	}
	return films, nil
}
