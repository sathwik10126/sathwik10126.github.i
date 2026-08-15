// ---- Edit these with your real projects ----
const projects = [
  {
    title: "Image Classifier API",
    desc: "CNN-based image classification model served via a Flask REST API with a React frontend.",
    tags: ["PyTorch", "Flask", "React"],
    demo: "#",
    code: "https://github.com/sathwik10126"
  },
  {
    title: "Sentiment Analysis Dashboard",
    desc: "NLP pipeline analyzing text in real time, visualized with a live dashboard.",
    tags: ["NLP", "Node.js", "Chart.js"],
    demo: "#",
    code: "https://github.com/sathwik10126"
  },
  {
    title: "Full-Stack Task Manager",
    desc: "MERN stack app with authentication, drag-and-drop boards, and REST API backend.",
    tags: ["MongoDB", "Express", "React", "Node"],
    demo: "#",
    code: "https://github.com/sathwik10126"
  }
];

function renderProjects() {
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = projects.map(p => `
    <div class="project-card reveal">
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <div class="project-tags">
        ${p.tags.map(t => `<span>${t}</span>`).join('')}
      </div>
      <div class="project-links">
        <a href="${p.demo}" target="_blank">Live Demo</a>
        <a href="${p.code}" target="_blank">Source Code</a>
      </div>
    </div>
  `).join('');
  observeReveals(); // re-observe newly injected cards
}
renderProjects();

// ---- Mobile nav ----
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('show'));

// ---- Navbar background on scroll ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ---- Active nav link tracking ----
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

function updateActiveLink() {
  let current = '';
  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= 120 && rect.bottom >= 120) current = sec.id;
  });
  navLinkEls.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}
window.addEventListener('scroll', updateActiveLink);

// ---- Scroll reveal animation ----
function observeReveals() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}
observeReveals();

// ---- Contact form -> backend ----
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = "Sending...";
  status.style.color = "var(--muted)";

  const data = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value
  };

  try {
    const res = await fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (res.ok) {
      status.textContent = "Message sent — I'll get back to you soon.";
      status.style.color = "#4ade80";
      form.reset();
    } else {
      status.textContent = result.error || "Something went wrong.";
      status.style.color = "#ff6b6b";
    }
  } catch (err) {
    status.textContent = "Could not reach server. Try again later.";
    status.style.color = "#ff6b6b";
  }
});