package api

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/PetroProg/Films-List/internal/db"
	"github.com/PetroProg/Films-List/internal/models"
	"github.com/go-chi/chi/v5"
)

type API struct {
	db *db.DB
}

func NewAPI(database *db.DB) *API {
	return &API{db: database}
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func (a *API) GetFilms(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	search := r.URL.Query().Get("search")
	sort := r.URL.Query().Get("sort")

	films, stats, err := a.db.ListFilms(status, search, sort)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, models.FilmsResponse{
		Films: films,
		Stats: stats,
	})
}

func (a *API) GetFilm(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid film ID")
		return
	}

	film, err := a.db.GetFilmByID(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if film == nil {
		writeError(w, http.StatusNotFound, "Film not found")
		return
	}

	writeJSON(w, http.StatusOK, film)
}

func (a *API) CreateFilm(w http.ResponseWriter, r *http.Request) {
	var req models.CreateFilmRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if strings.TrimSpace(req.Title) == "" {
		writeError(w, http.StatusBadRequest, "Title is required")
		return
	}

	film, err := a.db.CreateFilm(req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, film)
}

func (a *API) UpdateFilm(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid film ID")
		return
	}

	var req models.UpdateFilmRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if strings.TrimSpace(req.Title) == "" {
		writeError(w, http.StatusBadRequest, "Title is required")
		return
	}

	film, err := a.db.UpdateFilm(id, req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, film)
}

func (a *API) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid film ID")
		return
	}

	var req models.UpdateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	validStatuses := map[string]bool{"plan": true, "watched": true, "dropped": true}
	if !validStatuses[req.Status] {
		writeError(w, http.StatusBadRequest, "Invalid status (allowed: plan, watched, dropped)")
		return
	}

	if err := a.db.UpdateFilmStatus(id, req.Status); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	film, err := a.db.GetFilmByID(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, film)
}

func (a *API) UpdateRating(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid film ID")
		return
	}

	var req models.UpdateRatingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Rating < 0 || req.Rating > 5 {
		writeError(w, http.StatusBadRequest, "Rating must be between 0 and 5")
		return
	}

	if err := a.db.UpdateFilmRating(id, req.Rating); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	film, err := a.db.GetFilmByID(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, film)
}

func (a *API) DeleteFilm(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid film ID")
		return
	}

	if err := a.db.DeleteFilm(id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"success": true, "id": id})
}

func (a *API) GetRandomFilm(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	if status == "" {
		status = "plan"
	}

	film, err := a.db.GetRandomFilm(status)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if film == nil {
		writeJSON(w, http.StatusOK, map[string]interface{}{"film": nil, "message": "No films match criteria"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"film": film})
}

func (a *API) ExportCSV(w http.ResponseWriter, r *http.Request) {
	films, err := a.db.ExportAllFilms()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", `attachment; filename="films_export.csv"`)

	// Write UTF-8 BOM for Microsoft Excel / Notion compatibility
	w.Write([]byte{0xEF, 0xBB, 0xBF})

	writer := csv.NewWriter(w)
	defer writer.Flush()

	// Header matching Notion CSV
	header := []string{"Название", "Год", "Оценка", "Просмотрен", "Ссылка", "Комментарий"}
	if err := writer.Write(header); err != nil {
		return
	}

	for _, f := range films {
		yearStr := ""
		if f.Year != nil {
			yearStr = strconv.Itoa(*f.Year)
		}
		ratingStr := ""
		if f.Rating > 0 {
			ratingStr = strconv.Itoa(f.Rating)
		}
		watchedStr := "No"
		if f.Status == "watched" {
			watchedStr = "Yes"
		} else if f.Status == "dropped" {
			watchedStr = "Dropped"
		}

		record := []string{
			f.Title,
			yearStr,
			ratingStr,
			watchedStr,
			f.URL,
			f.Comment,
		}
		if err := writer.Write(record); err != nil {
			return
		}
	}
}

func (a *API) ExportJSON(w http.ResponseWriter, r *http.Request) {
	films, err := a.db.ExportAllFilms()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Content-Disposition", `attachment; filename="films_export.json"`)

	encoder := json.NewEncoder(w)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(films); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
	}
}
