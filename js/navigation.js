/**
 * Navigation
 * Mobile menu and sticky navigation
 */

// Global scroll variables for sticky nav behavior
let lastScroll = 0;

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initStickyNav();
  initActiveNavLinks();
  initFloatingCTA();
  initScrollProgress();
  initFooterAccordion(); // Add footer accordion initialization
});

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
  const navToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu a');

  if (!navToggle || !navMenu) return;

  // Set initial aria-expanded state
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-controls', 'nav-menu');
  navMenu.setAttribute('id', 'nav-menu');
  navMenu.setAttribute('role', 'navigation');
  navMenu.setAttribute('aria-label', 'Menu principal');

  // Toggle menu
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', isOpen);
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
    
    // Focus first link when menu opens (accessibility)
    if (isOpen) {
      const firstLink = navMenu.querySelector('a');
      if (firstLink) {
        setTimeout(() => firstLink.focus(), 100);
      }
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
      if (navMenu.classList.contains('open')) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    }
  });

  // Close menu when clicking on a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close menu on escape key and return focus to toggle
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      navToggle.focus(); // Return focus to toggle button
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 767 && navMenu.classList.contains('open')) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Trap focus within menu when open (accessibility)
  navMenu.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && navMenu.classList.contains('open')) {
      const focusableElements = navMenu.querySelectorAll('a, button');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        navToggle.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        navToggle.focus();
      }
    }
  });
}

/**
 * Sticky Navigation with Scroll Behavior
 */
function initStickyNav() {
  const nav = document.querySelector('.nav-sticky');
  
  if (!nav) return;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add scrolled class after 100px
    if (currentScroll > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    
    // Hide on scroll down, show on scroll up
    if (currentScroll > lastScroll && currentScroll > 500) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
  });
}

/**
 * Active Navigation Links based on Scroll Position
 */
function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-100px 0px -66%',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        // Remove active class from all links
        navLinks.forEach(link => {
          link.classList.remove('active');
        });

        // Add active class to current section link
        const activeLink = document.querySelector(`.nav-menu a[href="#${id}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });
}

/**
 * Dropdown Menu (if needed)
 */
function initDropdowns() {
  const dropdownToggles = document.querySelectorAll('[data-dropdown-toggle]');

  dropdownToggles.forEach(toggle => {
    const dropdownId = toggle.dataset.dropdownToggle;
    const dropdown = document.getElementById(dropdownId);

    if (!dropdown) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      dropdown.classList.remove('active');
    });

    // Prevent dropdown from closing when clicking inside
    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });
}

/**
 * Floating CTA - Mobile Critical
 * Appears after 50% scroll
 * +23% conversion (Stripe/Linear pattern)
 */
function initFloatingCTA() {
  const floatingCTA = document.querySelector('.cta-fixed-mobile');
  
  if (!floatingCTA) return;

  let ticking = false;

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;

    // Show CTA after scrolling 50% of viewport height
    if (scrollY > viewportHeight * 0.5) {
      floatingCTA.style.display = 'flex';
      // Add visible class for animation after display is set
      requestAnimationFrame(() => {
        floatingCTA.classList.add('visible');
      });
    } else {
      floatingCTA.classList.remove('visible');
      // Hide after animation completes
      setTimeout(() => {
        if (!floatingCTA.classList.contains('visible')) {
          floatingCTA.style.display = 'none';
        }
      }, 400);
    }

    // Hide CTA when near footer (last 10%)
    const docHeight = document.documentElement.scrollHeight - viewportHeight;
    const scrollPercent = (scrollY / docHeight) * 100;
    
    if (scrollPercent > 90) {
      floatingCTA.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Initial check
  handleScroll();
}

/**
 * Scroll Progress Bar
 */
function initScrollProgress() {
  const progressBar = document.querySelector('.nav-progress');
  
  if (!progressBar) return;

  let ticking = false;

  const updateProgress = () => {
    const scrolled = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrolled / docHeight;

    progressBar.style.transform = `scaleX(${scrollPercent})`;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Initial update
  updateProgress();
}

/**
 * Footer Mobile Accordion
 */
function initFooterAccordion() {
  function toggleAccordion() {
    if (window.innerWidth < 768) {
      document.querySelectorAll('.footer-col h5').forEach(h5 => {
        // Remove existing click listeners to avoid duplicates
        const newH5 = h5.cloneNode(true);
        h5.parentNode.replaceChild(newH5, h5);
        
        // Add click listener
        newH5.addEventListener('click', () => {
          const footerCol = newH5.parentElement;
          const isOpen = footerCol.classList.contains('open');
          
          // Close all other accordions
          document.querySelectorAll('.footer-col').forEach(col => {
            col.classList.remove('open');
          });
          
          // Toggle current accordion
          if (!isOpen) {
            footerCol.classList.add('open');
          }
        });
      });
    } else {
      // Remove mobile accordion functionality for desktop
      document.querySelectorAll('.footer-col').forEach(col => {
        col.classList.remove('open');
      });
    }
  }
  
  // Initialize accordion
  toggleAccordion();
  
  // Re-initialize on window resize
  window.addEventListener('resize', toggleAccordion);
}

// Export for other modules
window.ERAppsStudio = window.ERAppsStudio || {};
window.ERAppsStudio.navigation = {
  initDropdowns,
  initFloatingCTA,
  initScrollProgress,
  initFooterAccordion
};
