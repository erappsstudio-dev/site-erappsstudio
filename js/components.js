/**
 * Component Interactions
 * Counter animations, Footer accordion, and other component-specific logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initCounterAnimations();
  initFooterAccordion();
  initCalendly();
});

/**
 * Counter Animations for Social Proof Cards
 * Uses GSAP if available, falls back to vanilla JS
 */
function initCounterAnimations() {
  const counters = document.querySelectorAll('.counter[data-target]');
  
  if (!counters.length) return;

  // Check if GSAP is available
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const obj = { value: 0 };
      
      gsap.to(obj, {
        value: target,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => {
          counter.textContent = Math.round(obj.value);
        },
        scrollTrigger: {
          trigger: counter,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    });
  } else {
    // Fallback: Vanilla JS animation
    const animateCounter = (counter) => {
      const target = parseInt(counter.getAttribute('data-target'));
      const duration = 2000; // 2 seconds
      const increment = target / (duration / 16); // 60fps
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };

      updateCounter();
    };

    // Intersection Observer to trigger when visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }
}

/**
 * Footer Accordion for Mobile
 * Toggles accordion sections on mobile, always open on desktop
 */
function initFooterAccordion() {
  const triggers = document.querySelectorAll('.footer-accordion-trigger');
  
  if (!triggers.length) return;

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      // Only work on mobile (< 768px)
      if (window.innerWidth >= 768) return;

      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const contentId = trigger.getAttribute('aria-controls');
      const content = document.getElementById(contentId);

      // Toggle state
      trigger.setAttribute('aria-expanded', !isExpanded);
      
      // Animate content
      if (!isExpanded) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = '0';
      }
    });
  });

  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // On desktop, ensure all are expanded
      if (window.innerWidth >= 768) {
        triggers.forEach(trigger => {
          trigger.setAttribute('aria-expanded', 'true');
          const contentId = trigger.getAttribute('aria-controls');
          const content = document.getElementById(contentId);
          if (content) {
            content.style.maxHeight = 'none';
          }
        });
      } else {
        // On mobile, collapse all
        triggers.forEach(trigger => {
          trigger.setAttribute('aria-expanded', 'false');
          const contentId = trigger.getAttribute('aria-controls');
          const content = document.getElementById(contentId);
          if (content) {
            content.style.maxHeight = '0';
          }
        });
      }
    }, 250);
  });

  // Initialize state based on viewport
  if (window.innerWidth >= 768) {
    triggers.forEach(trigger => {
      trigger.setAttribute('aria-expanded', 'true');
      const contentId = trigger.getAttribute('aria-controls');
      const content = document.getElementById(contentId);
      if (content) {
        content.style.maxHeight = 'none';
      }
    });
  }
}

/**
 * Calendly Integration
 * Load Calendly widget script if element exists
 */
function initCalendly() {
  const calendlyWidget = document.querySelector('.calendly-inline-widget');
  
  if (!calendlyWidget) return;

  // Check if Calendly script is already loaded
  if (window.Calendly) {
    console.log('Calendly already loaded');
    return;
  }

  // Load Calendly script dynamically
  const script = document.createElement('script');
  script.src = 'https://assets.calendly.com/assets/external/widget.js';
  script.async = true;
  script.onload = () => {
    console.log('Calendly widget loaded successfully');
  };
  script.onerror = () => {
    console.error('Failed to load Calendly widget');
  };

  document.head.appendChild(script);

  // Load Calendly CSS
  const link = document.createElement('link');
  link.href = 'https://assets.calendly.com/assets/external/widget.css';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

// Export functions
window.ERAppsStudio = window.ERAppsStudio || {};
window.ERAppsStudio.components = {
  initCounterAnimations,
  initFooterAccordion,
  initCalendly
};
