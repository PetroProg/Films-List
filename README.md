# Films List 🎬

A minimalist, ultra-lightweight movie tracker and personal film database designed with the **Catppuccin Mocha** color palette.

Built to run locally on home servers with automatic **HTTPS** via **Tailscale Serve**.

---

## ⚡ Highlights

- 🎨 **Catppuccin Mocha Design**: Aesthetic, eye-friendly dark mode styled with Tailwind CSS (`#1e1e2e`, `#181825`, `#cba6f7`, `#b4befe`, `#fab387`, `#a6e3a1`).
- 🪶 **Ultra-Lightweight Footprint**: High-performance backend in **Go** using pure-Go SQLite (`modernc.org/sqlite`, CGO=0). The entire Docker container consumes only **~2.7 MB of RAM**!
- 📱 **Progressive Web App (PWA)**: Installable directly to home screens on Android (Samsung, Pixel), iOS, and desktop browsers with native standalone window experience.
- 🎲 **"What to Watch?" (Roulette)**: An interactive random picker that suggests a film from your "Plan to watch" queue with one click.
- 🔍 **Instant Search & Smart Filters**: Filter by status (*All*, *Plan*, *Watched*, *Dropped*), sort by date, title, release year, or rating, and search in real-time.
- ⭐ **One-Click Quick Actions**: Rate films (1–5 stars) directly on the card/row or toggle watch status without opening modal forms.
- 🔗 **Direct Watch Links**: One-click "Watch" button with external link icons (e.g. Rezka, Kinopoisk, IMDb).
- 📥 **One-Click Data Export**: Download your full collection anytime as **CSV** (with UTF-8 BOM for full Microsoft Excel / Notion compatibility) or **JSON**.
- 🔒 **Tailscale HTTPS**: Pre-configured for automated TLS certificates via Tailscale Serve.

---

## 🛠 Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Backend** | Go (Golang) 1.23 | Chi Router, CORS middleware, graceful shutdown |
| **Database** | SQLite (WAL mode) | `modernc.org/sqlite` (pure Go, zero CGO dependencies) |
| **Frontend** | React 18 + TypeScript | Vite, Tailwind CSS (Catppuccin Mocha), Lucide Icons |
| **PWA** | Vite PWA Plugin | Service Worker (Workbox), manifest, standalone mode |
| **Container** | Multi-stage Docker | Node 20 (build) $\rightarrow$ Go 1.23 (build) $\rightarrow$ Alpine 3.20 (runtime) |

---

## 🚀 Quick Start

### 1. Run with Docker Compose

Clone the repository and launch the container:

```bash
git clone https://github.com/PetroProg/Films-List.git
cd Films-List
docker compose up -d --build
```

The application will be accessible at `http://localhost:7070`.

### 2. Enable HTTPS via Tailscale Serve

If you are using Tailscale on your server:

```bash
tailscale serve --bg --https=7443 127.0.0.1:7070
```

Now you can open `https://<your-machine-name>.<tailnet>.ts.net:7443` securely from any device in your Tailscale network!

---

## ⚙️ Configuration

Environment variables configured in `docker-compose.yml`:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `7070` | HTTP port for the web server |
| `DB_PATH` | `/data/films.db` | Path to persistent SQLite database file |
| `SEED_CSV` | `/app/seed.csv` | Optional path to initial CSV seed file |
| `STATIC_DIR` | `/app/frontend/dist` | Directory containing built frontend static assets |

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check endpoint (`{"status":"ok"}`) |
| `GET` | `/api/films` | Get list of films (supports `?status=`, `?search=`, `?sort=`) |
| `POST` | `/api/films` | Add a new film |
| `GET` | `/api/films/{id}` | Get film details by ID |
| `PUT` | `/api/films/{id}` | Update film details |
| `PATCH` | `/api/films/{id}/status` | Quick update status (`plan`, `watched`, `dropped`) |
| `PATCH` | `/api/films/{id}/rating` | Quick update rating (0 to 5) |
| `DELETE` | `/api/films/{id}` | Remove film from database |
| `GET` | `/api/films/random` | Get a random film (supports `?status=plan`) |
| `GET` | `/api/export/csv` | Export entire database as UTF-8 CSV |
| `GET` | `/api/export/json` | Export entire database as JSON |

---

## 📂 Project Structure

```
Films-List/
├── backend/                  # Go backend source code
│   ├── cmd/server/           # Application entrypoint (main.go)
│   ├── internal/api/         # REST API handlers
│   ├── internal/db/          # SQLite schema, queries, and CSV seeder
│   └── internal/models/      # Data transfer objects & entity structs
├── frontend/                 # React 18 + Vite frontend
│   ├── public/               # PWA manifest and icons
│   └── src/
│       ├── components/       # Header, FilterBar, FilmCard, FilmRow, Modals
│       ├── types.ts          # TypeScript models
│       ├── api.ts            # Frontend API client
│       └── App.tsx           # Main application view & state
├── Dockerfile                # Multi-stage build (Node -> Go -> Alpine)
├── docker-compose.yml        # Docker compose service definition
├── seed.example.csv          # Template for CSV data seeding
└── README.md                 # Project documentation
```

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
