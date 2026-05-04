"""
Serve the static site and accept booking POSTs, forwarding them by email (SMTP).

Run locally:
  uv sync
  export APPOINTMENT_TO_EMAIL=you@example.com SMTP_FROM=you@example.com \\
    SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_USER=you@gmail.com SMTP_PASSWORD=...
  uv run uvicorn main:app --reload --host 127.0.0.1 --port 8000

Open http://127.0.0.1:8000 — the form POSTs to the same origin.
"""

from __future__ import annotations

import os
import smtplib
import ssl
from email.message import EmailMessage
from pathlib import Path

from smtplib import SMTPException

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent

load_dotenv(ROOT / ".env")


class AppointmentPayload(BaseModel):
    name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=1)
    email: str = Field(default="", max_length=254)
    address: str = Field(..., min_length=1)
    service: str = Field(..., min_length=1)
    preferred_date: str = Field(..., min_length=1)
    time_window: str = Field(..., min_length=1)
    notes: str = ""


def _smtp_send(msg: EmailMessage) -> None:
    host = os.environ.get("SMTP_HOST", "localhost")
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ.get("SMTP_USER", "")
    password = os.environ.get("SMTP_PASSWORD", "")

    use_ssl = os.environ.get("SMTP_SSL", "").lower() in ("1", "true", "yes")
    if use_ssl:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(host, port, context=context) as smtp:
            if user:
                smtp.login(user, password)
            smtp.send_message(msg)
        return

    with smtplib.SMTP(host, port) as smtp:
        smtp.starttls(context=ssl.create_default_context())
        if user:
            smtp.login(user, password)
        smtp.send_message(msg)


def send_appointment_email(data: AppointmentPayload) -> None:
    to_addr = os.environ.get("APPOINTMENT_TO_EMAIL")
    from_addr = os.environ.get("SMTP_FROM")
    if not to_addr or not from_addr:
        raise HTTPException(
            status_code=503,
            detail="Email not configured: set APPOINTMENT_TO_EMAIL and SMTP_FROM",
        )

    body = f"""New appointment request (website)

Name: {data.name}
Phone: {data.phone}
Email: {data.email or "(not provided)"}
Address: {data.address}

Service: {data.service}
Preferred date: {data.preferred_date}
Time window: {data.time_window}

Notes:
{data.notes or "(none)"}
"""

    msg = EmailMessage()
    msg["Subject"] = f"[AAA HVAC] Appointment request — {data.name}"
    msg["From"] = from_addr
    msg["To"] = to_addr
    if data.email.strip() and "@" in data.email:
        msg["Reply-To"] = data.email.strip()
    msg.set_content(body)

    try:
        _smtp_send(msg)
    except (OSError, SMTPException) as e:
        print(f"SMTP error: {e}")
        raise HTTPException(status_code=502, detail="Could not send email") from e


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/appointments/request")
def appointments_request(payload: AppointmentPayload) -> dict[str, bool]:
    send_appointment_email(payload)
    return {"ok": True}


app.mount("/", StaticFiles(directory=ROOT, html=True), name="static")
