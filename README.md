# AAA HVAC Website

Single-page business website with an appointment booking form that emails submissions via SMTP.

The FastAPI backend (`main.py`) serves both the static frontend and the `/appointments/request` API, so there is only one process to run.

## Prerequisites

- [uv](https://docs.astral.sh/uv/) — Python package manager

## Setup

**1. Install dependencies**

```bash
uv sync
```

**2. Configure environment**

```bash
cp .env.example .env
```

Edit `.env` and fill in your SMTP credentials. For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) rather than your normal account password.

| Variable | Description |
|---|---|
| `APPOINTMENT_TO_EMAIL` | Inbox where booking requests are delivered |
| `SMTP_FROM` | From address (must be permitted by your SMTP provider) |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (`587` for STARTTLS, `465` for SSL) |
| `SMTP_USER` | SMTP login username |
| `SMTP_PASSWORD` | SMTP login password |
| `SMTP_SSL` | Set to `true` for port-465 SSL connections (optional) |

## Running locally

```bash
uv run uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Then open [http://127.0.0.1:8000](http://127.0.0.1:8000).

The `--reload` flag restarts the server automatically when source files change. Omit it in production.

## Production deployment

Run without `--reload` and bind to the appropriate host/port for your environment:

```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

For a reverse proxy setup (nginx, Caddy, etc.), bind to `127.0.0.1` and proxy from port 80/443.
