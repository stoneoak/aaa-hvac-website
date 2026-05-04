// ── Mobile menu ──────────────────────────────────────────────────────────────
const menuBtn    = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon   = menuBtn.querySelector('i');

menuBtn.addEventListener('click', () => {
  const open = !mobileMenu.classList.contains('hidden');
  mobileMenu.classList.toggle('hidden');
  menuIcon.className = open ? 'fa-solid fa-bars text-lg' : 'fa-solid fa-xmark text-lg';
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    menuIcon.className = 'fa-solid fa-bars text-lg';
  });
});

// ── Date picker minimum ───────────────────────────────────────────────────────
document.getElementById('date').min = new Date().toISOString().split('T')[0];

// ── Booking form ──────────────────────────────────────────────────────────────
// Same-origin POST to /appointments/request when using `uv run uvicorn main:app` (see main.py).
// Set DEMO_MODE true only for plain `python -m http.server` with no API (fake success).
const DEMO_MODE = false;
const API_URL = '';

const form       = document.getElementById('booking-form');
const successMsg = document.getElementById('booking-success');
const submitBtn  = document.getElementById('submit-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name:           document.getElementById('name').value,
    phone:          document.getElementById('phone').value,
    email:          document.getElementById('email').value,
    address:        document.getElementById('address').value,
    service:        document.getElementById('service').value,
    preferred_date: document.getElementById('date').value,
    time_window:    document.getElementById('time-window').value,
    notes:          document.getElementById('notes').value,
  };

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Submitting…</span>';

  if (DEMO_MODE) {
    showSuccess();
    resetSubmitButton();
    return;
  }

  try {
    const res = await fetch(`${API_URL}/appointments/request`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (res.ok) {
      showSuccess();
      resetSubmitButton();
    } else {
      let extra = '';
      try {
        const errBody = await res.json();
        if (Array.isArray(errBody.detail)) {
          const msg = errBody.detail[0];
          if (msg?.msg) extra = `\n\n${msg.msg}`;
        } else if (typeof errBody.detail === 'string') {
          extra = `\n\n${errBody.detail}`;
        }
      } catch {
        /* ignore */
      }
      throw new Error(`HTTP ${res.status}${extra}`);
    }
  } catch (err) {
    const hint = err instanceof Error && err.message.startsWith('HTTP')
      ? err.message
      : '';
    alert(
      `Something went wrong.${hint ? `\n${hint}` : ''}\n\nPlease call us at (726) 237-4888.`,
    );
    resetSubmitButton();
  }
});

function resetSubmitButton() {
  submitBtn.disabled = false;
  submitBtn.innerHTML = '<i class="fa-solid fa-calendar-check"></i><span>Request Appointment</span>';
}

function showSuccess() {
  form.classList.add('hidden');
  successMsg.classList.remove('hidden');
  successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
