// script.js
// Portfolio Project Rendering and Contact Form Handler

const API_BASE_URL = 'http://localhost:5000/api';

/* ===== Contact Form Handler ===== */
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const message = document.getElementById('message')?.value || '';

    if (!name || !email || !message) {
      showFormStatus('Please fill in all fields', 'danger');
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending...';

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      if (response.ok) {
        showFormStatus('✓ Message sent! I\'ll get back to you soon.', 'success');
        contactForm.reset();
      } else {
        showFormStatus('✗ Error sending message. Please try again.', 'danger');
      }
    } catch (err) {
      showFormStatus('✗ Network error. Please try again later.', 'danger');
      console.error('Form error:', err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

function showFormStatus(message, type) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.className = `alert alert-${type} mt-3 mb-0`;
  formStatus.style.display = 'block';

  if (type === 'success') {
    setTimeout(() => {
      formStatus.style.display = 'none';
    }, 5000);
  }
}

/* ===== Smooth Scroll ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

let allProjects = [];
let activeFilter = 'all';

async function loadProjects() {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    allProjects = await res.json();
    buildFilters(allProjects);
    renderProjects();
  } catch (err) {
    console.error('Could not load projects:', err);
    reelTrack.innerHTML = `
      <p class="mono reel-status">
        Couldn't reach the backend at ${API_BASE_URL}. Start the API
        (see backend/README instructions) and refresh.
      </p>`;
  }
}

function buildFilters(projects) {
  const categories = ['all', ...new Set(projects.map((p) => p.category))];
  filterRow.innerHTML = categories
    .map(
      (cat) => `
      <button class="filter-btn ${cat === 'all' ? 'is-active' : ''}" data-filter="${cat}">
        ${cat.toUpperCase()}
      </button>`
    )
    .join('');

  filterRow.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      filterRow
        .querySelectorAll('.filter-btn')
        .forEach((b) => b.classList.toggle('is-active', b === btn));
      renderProjects();
    });
  });
}

function renderProjects() {
  const list =
    activeFilter === 'all'
      ? allProjects
      : allProjects.filter((p) => p.category === activeFilter);

  if (list.length === 0) {
    reelTrack.innerHTML = '<p class="mono reel-status">Nothing in this category yet.</p>';
    return;
  }

  reelTrack.innerHTML = list
    .map(
      (p) => `
      <article class="reel-card">
        <span class="reel-card__tc mono">${p.timecode}</span>
        <span class="reel-card__cat">${p.category}</span>
        <h3 class="reel-card__title">${p.title}</h3>
        <p class="reel-card__desc">${p.description}</p>
        <div class="reel-card__tags">
          ${p.tags.map((t) => `<span>${t}</span>`).join('')}
        </div>
      </article>`
    )
    .join('');
}

loadProjects();

/* ---------------------------------------------------------
   Contact form
--------------------------------------------------------- */
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId).closest('.field');
  const errorEl = document.getElementById(`${fieldId}Error`);
  if (message) {
    field.classList.add('has-error');
    errorEl.textContent = message;
  } else {
    field.classList.remove('has-error');
    errorEl.textContent = '';
  }
}

function validate({ name, email, message }) {
  let valid = true;

  if (!name.trim()) {
    setFieldError('name', 'Name is required.');
    valid = false;
  } else setFieldError('name', '');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('email', 'Enter a valid email address.');
    valid = false;
  } else setFieldError('email', '');

  if (message.trim().length < 10) {
    setFieldError('message', 'Message should be at least 10 characters.');
    valid = false;
  } else setFieldError('message', '');

  return valid;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value,
  };

  if (!validate(payload)) {
    formStatus.textContent = 'Please fix the fields above.';
    formStatus.className = 'form-status mono is-error';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  formStatus.textContent = '';
  formStatus.className = 'form-status mono';

  try {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.fields) {
        Object.entries(data.fields).forEach(([field, msg]) => setFieldError(field, msg));
      }
      throw new Error(data.error || 'Something went wrong.');
    }

    formStatus.textContent = data.message || "Sent — I'll get back to you soon.";
    formStatus.className = 'form-status mono is-success';
    form.reset();
  } catch (err) {
    formStatus.textContent = err.message || 'Could not send message. Try again shortly.';
    formStatus.className = 'form-status mono is-error';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send message';
  }
});