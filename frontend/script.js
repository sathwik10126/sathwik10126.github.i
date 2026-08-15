// script.js
// Talks to the Express backend for project data + the contact form.
// Change API_BASE_URL if the backend runs somewhere other than localhost:5000.

const API_BASE_URL = 'http://localhost:5000/api';

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------------------------------------------------
   Mobile nav toggle
--------------------------------------------------------- */
const navToggle = document.getElementById('navToggle');
const siteNav = document.querySelector('.site-nav');

navToggle.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.site-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ---------------------------------------------------------
   Hero role ticker
--------------------------------------------------------- */
const roles = ['FILMMAKER', 'VIDEO EDITOR', 'MOTION DESIGNER', 'WEB DEVELOPER'];
const roleWord = document.getElementById('roleWord');
let roleIndex = 0;

function cycleRole() {
  roleIndex = (roleIndex + 1) % roles.length;
  roleWord.style.opacity = '0';
  setTimeout(() => {
    roleWord.textContent = roles[roleIndex];
    roleWord.style.opacity = '1';
  }, 220);
}
roleWord.style.transition = 'opacity 0.2s ease';
setInterval(cycleRole, 2200);

/* ---------------------------------------------------------
   Work / reel: fetch from backend, render cards, filter
--------------------------------------------------------- */
const reelTrack = document.getElementById('reelTrack');
const filterRow = document.getElementById('filterRow');

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