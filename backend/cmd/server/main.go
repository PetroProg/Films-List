package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/PetroProg/Films-List/internal/api"
	"github.com/PetroProg/Films-List/internal/db"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func main() {
	port := getEnv("PORT", "7070")
	dbPath := getEnv("DB_PATH", "./data/films.db")
	seedCSV := getEnv("SEED_CSV", "./seed.csv")
	staticDir := getEnv("STATIC_DIR", "./frontend/dist")

	log.Printf("Starting Films-List on port %s...", port)
	log.Printf("Database path: %s", dbPath)
	log.Printf("Static directory: %s", staticDir)

	database, err := db.InitDB(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	if err := database.SeedFromCSV(seedCSV); err != nil {
		log.Printf("Warning during initial seed: %v", err)
	}

	apiHandler := api.NewAPI(database)

	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link", "Content-Disposition"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	r.Route("/api", func(r chi.Router) {
		r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"status":"ok"}`))
		})
		r.Get("/films", apiHandler.GetFilms)
		r.Post("/films", apiHandler.CreateFilm)
		r.Get("/films/random", apiHandler.GetRandomFilm)
		r.Get("/films/{id}", apiHandler.GetFilm)
		r.Put("/films/{id}", apiHandler.UpdateFilm)
		r.Delete("/films/{id}", apiHandler.DeleteFilm)
		r.Patch("/films/{id}/status", apiHandler.UpdateStatus)
		r.Patch("/films/{id}/rating", apiHandler.UpdateRating)
		r.Get("/export/csv", apiHandler.ExportCSV)
		r.Get("/export/json", apiHandler.ExportJSON)
	})

	// Static SPA handler
	serveStaticSPA(r, staticDir)

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("Server listening on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited cleanly.")
}

func serveStaticSPA(r chi.Router, staticDir string) {
	workDir, _ := filepath.Abs(staticDir)
	fs := http.Dir(workDir)

	r.Get("/*", func(w http.ResponseWriter, req *http.Request) {
		// Don't intercept /api routes
		if strings.HasPrefix(req.URL.Path, "/api") {
			http.NotFound(w, req)
			return
		}

		path := filepath.Clean(req.URL.Path)
		targetFile := filepath.Join(workDir, path)

		info, err := os.Stat(targetFile)
		if err == nil && !info.IsDir() {
			http.ServeFile(w, req, targetFile)
			return
		}

		// Fallback to index.html for SPA
		indexPath := filepath.Join(workDir, "index.html")
		if _, err := os.Stat(indexPath); err == nil {
			http.ServeFile(w, req, indexPath)
			return
		}

		// If frontend is not built yet, show a helpful message
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		fmt.Fprintf(w, "<html><head><title>Films List API</title></head><body style='font-family:sans-serif;background:#1e1e2e;color:#cdd6f4;padding:40px;'><h2>Films List API is running</h2><p>Frontend is not built or path %s not found. API is available at <a style='color:#cba6f7' href='/api/films'>/api/films</a>.</p></body></html>", staticDir)
	})
	_ = fs
}
