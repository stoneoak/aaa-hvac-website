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
// Update API_URL to your deployed backend once live.
// Set to empty string ('') to disable the API call and show a demo success message.
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

  if (!API_URL) {
    showSuccess();
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
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch {
    alert('Something went wrong. Please call us directly at (555) 000-0000.');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-calendar-check"></i><span>Request Appointment</span>';
  }
});

function showSuccess() {
  form.classList.add('hidden');
  successMsg.classList.remove('hidden');
  successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
