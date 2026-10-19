package models

type Film struct {
	ID        int64  `json:"id"`
	Title     string `json:"title"`
	Year      *int   `json:"year"`
	URL       string `json:"url"`
	Status    string `json:"status"` // "plan", "watched", "dropped"
	Rating    int    `json:"rating"` // 0-5
	Comment   string `json:"comment"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type Stats struct {
	Total     int     `json:"total"`
	Plan      int     `json:"plan"`
	Watched   int     `json:"watched"`
	Dropped   int     `json:"dropped"`
	AvgRating float64 `json:"avg_rating"`
}

type FilmsResponse struct {
	Films []Film `json:"films"`
	Stats Stats  `json:"stats"`
}

type CreateFilmRequest struct {
	Title   string `json:"title"`
	Year    *int   `json:"year"`
	URL     string `json:"url"`
	Status  string `json:"status"`
	Rating  int    `json:"rating"`
	Comment string `json:"comment"`
}

type UpdateFilmRequest struct {
	Title   string `json:"title"`
	Year    *int   `json:"year"`
	URL     string `json:"url"`
	Status  string `json:"status"`
	Rating  int    `json:"rating"`
	Comment string `json:"comment"`
}

type UpdateStatusRequest struct {
	Status string `json:"status"`
}

type UpdateRatingRequest struct {
	Rating int `json:"rating"`
}
