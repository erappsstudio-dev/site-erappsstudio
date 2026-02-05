/**
 * Dark Mode + Neon Accents
 * Theme Toggle System
 * STUDIO25 Palette Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  createThemeToggle();
});

/**
 * Initialize Dark Mode
 * Detects system preference and saved user preference
 */
function initDarkMode() {
  // Check localStorage for saved theme
  const savedTheme = localStorage.getItem('theme');
  
  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Apply theme
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    enableDarkMode();
  } else {
    disableDarkMode();
  }
  
  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        enableDarkMode();
      } else {
        disableDarkMode();
      }
    }
  });
}

/**
 * Enable Dark Mode
 */
function enableDarkMode() {
  document.documentElement.setAttribute('data-theme', 'dark');
  document.body.classList.add('dark-mode');
  localStorage.setItem('theme', 'dark');
  updateThemeToggleIcon('dark');
}

/**
 * Disable Dark Mode
 */
function disableDarkMode() {
  document.documentElement.removeAttribute('data-theme');
  document.body.classList.remove('dark-mode');
  localStorage.setItem('theme', 'light');
  updateThemeToggleIcon('light');
}

/**
 * Toggle Theme
 */
function toggleTheme() {
  const isDark = document.body.classList.contains('dark-mode');
  
  if (isDark) {
    disableDarkMode();
  } else {
    enableDarkMode();
  }
  
  // Add transition class for smooth theme change
  document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  setTimeout(() => {
    document.body.style.transition = '';
  }, 300);
}

/**
 * Create Theme Toggle Button
 */
function createThemeToggle() {
  const toggle = document.createElement('button');
  toggle.className = 'theme-toggle';
  toggle.setAttribute('aria-label', 'Toggle dark mode');
  toggle.innerHTML = `
    <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
    <svg class="moon-icon" style="display: none;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  `;
  
  toggle.addEventListener('click', toggleTheme);
  document.body.appendChild(toggle);
  
  // Update icon based on current theme
  const isDark = document.body.classList.contains('dark-mode');
  updateThemeToggleIcon(isDark ? 'dark' : 'light');
}

/**
 * Update Theme Toggle Icon
 */
function updateThemeToggleIcon(theme) {
  const sunIcon = document.querySelector('.theme-toggle .sun-icon');
  const moonIcon = document.querySelector('.theme-toggle .moon-icon');
  
  if (!sunIcon || !moonIcon) return;
  
  if (theme === 'dark') {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  } else {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  }
}

/**
 * Apply Neon Effects to Specific Elements
 */
function applyNeonEffects() {
  // Add neon glow to headings
  const headings = document.querySelectorAll('h1, h2, h3');
  headings.forEach((heading, index) => {
    if (index % 3 === 0) {
      heading.classList.add('neon-cyan');
    } else if (index % 3 === 1) {
      heading.classList.add('neon-magenta');
    } else {
      heading.classList.add('neon-yellow');
    }
  });
  
  // Add gradient text to specific elements
  const gradientElements = document.querySelectorAll('.hero-title, .section-title');
  gradientElements.forEach(el => {
    el.classList.add('gradient-text-neon');
  });
}

/**
 * Neon Cursor Trail Effect (Optional)
 */
function initNeonCursor() {
  if (window.innerWidth < 768) return; // Skip on mobile
  
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  const maxParticles = 50;
  
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * 2 - 1;
      this.speedY = Math.random() * 2 - 1;
      this.color = `hsl(${Math.random() * 60 + 180}, 100%, 50%)`;
      this.life = 100;
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life -= 2;
      if (this.size > 0.2) this.size -= 0.1;
    }
    
    draw() {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.life / 100;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  
  document.addEventListener('mousemove', (e) => {
    if (particles.length < maxParticles) {
      particles.push(new Particle(e.clientX, e.clientY));
    }
  });
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      
      if (particles[i].life <= 0) {
        particles.splice(i, 1);
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
  
  // Clean up on window resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

/**
 * Keyboard Shortcut for Theme Toggle
 * Ctrl/Cmd + Shift + D
 */
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    toggleTheme();
  }
});

// Export functions
window.ERAppsStudio = window.ERAppsStudio || {};
window.ERAppsStudio.darkMode = {
  enableDarkMode,
  disableDarkMode,
  toggleTheme,
  applyNeonEffects,
  initNeonCursor
};
