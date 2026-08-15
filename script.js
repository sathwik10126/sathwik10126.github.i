// ---- Navbar shadow on scroll ----
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('shadow', window.scrollY > 20);
});

// ==========================================
// CONTACT FORM — EmailJS (no backend needed)
// ==========================================
emailjs.init('19z430QvgUnlXmB6T'); // Public Key

const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

form.addEventListener('submit', function (e) {
  e.preventDefault();
  status.textContent = "Sending...";
  status.className = "mt-3 mb-0 small text-secondary";

  const nameVal = document.getElementById('name').value;
  const emailVal = document.getElementById('email').value;
  const messageVal = document.getElementById('message').value;

  const templateParams = {
    name: nameVal,
    from_name: nameVal,
    from_email: emailVal,
    email: emailVal,
    message: messageVal
  };

  emailjs.send('service_w15efdi', 'template_sdjlxnr', templateParams)
    .then(function () {
      status.textContent = "Message sent — I'll get back to you soon.";
      status.className = "mt-3 mb-0 small text-success fw-semibold";
      form.reset();
    })
    .catch(function (error) {
      console.error('EmailJS error:', error);
      status.textContent = "Something went wrong. Please try again.";
      status.className = "mt-3 mb-0 small text-danger fw-semibold";
    });
});

// ==========================================
// EASTER EGGS
// ==========================================

function showEggToast(text, duration = 2500) {
  const toast = document.getElementById('egg-toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showEggToast._t);
  showEggToast._t = setTimeout(() => toast.classList.remove('show'), duration);
}

console.log(
  '%c⚡ POW! You found the console. %c\nHi, I\'m Sathwik — AI/ML Engineer & Web Developer.\nLike what you see under the hood? Let\'s connect:\nhttps://github.com/sathwik10126\nhttps://www.linkedin.com/in/sathwik-sadam-11a114325/',
  'font-size:20px;font-weight:bold;color:#e0263f;',
  'font-size:13px;color:#16181d;'
);

const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiProgress = 0;

document.addEventListener('keydown', (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (key === konamiCode[konamiProgress]) {
    konamiProgress++;
    if (konamiProgress === konamiCode.length) {
      triggerHeroMode();
      konamiProgress = 0;
    }
  } else {
    konamiProgress = (key === konamiCode[0]) ? 1 : 0;
  }
});

function triggerHeroMode() {
  const flash = document.createElement('div');
  flash.className = 'flash-overlay';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 500);
  showEggToast('⚡ HERO MODE ACTIVATED! ⚡', 3000);
  launchConfetti(40);
}

let avatarClicks = 0;
let avatarClickTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  const avatar = document.querySelector('.hero-avatar');
  if (avatar) {
    avatar.addEventListener('click', () => {
      avatarClicks++;
      avatar.classList.remove('avatar-shake');
      void avatar.offsetWidth;
      avatar.classList.add('avatar-shake');

      clearTimeout(avatarClickTimer);
      avatarClickTimer = setTimeout(() => { avatarClicks = 0; }, 1500);

      if (avatarClicks === 5) {
        showEggToast('🤖 OK OK, I\'m awake! Nice clicking.', 2500);
        launchConfetti(25);
        avatarClicks = 0;
      }
    });
  }

  const brand = document.querySelector('.navbar-brand');
  if (brand) {
    brand.style.cursor = 'pointer';
    brand.addEventListener('dblclick', () => {
      brand.classList.remove('spin-once');
      void brand.offsetWidth;
      brand.classList.add('spin-once');
      showEggToast('WHOOSH! 💫', 1500);
    });
  }
});

let typedBuffer = '';
document.addEventListener('keypress', (e) => {
  typedBuffer += e.key.toLowerCase();
  if (typedBuffer.length > 10) typedBuffer = typedBuffer.slice(-10);

  if (typedBuffer.includes('flash')) {
    const flash = document.createElement('div');
    flash.className = 'flash-overlay';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
    showEggToast('⚡ Flash speed activated!', 2000);
    typedBuffer = '';
  }

  if (typedBuffer.includes('sathwik')) {
    showEggToast('👋 That\'s me! Thanks for typing my name.', 2500);
    launchConfetti(20);
    typedBuffer = '';
  }
});

function launchConfetti(count = 30) {
  const colors = ['#e0263f', '#ffb703', '#2563eb', '#16181d'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4500);
  }
}