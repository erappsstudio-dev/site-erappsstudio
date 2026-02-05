/**
 * GSAP Animations - Performance-First
 * Princípios:
 * - Animar apenas transform e opacity (GPU-accelerated)
 * - will-change apenas durante animação
 * - ScrollTrigger com scrub para parallax suave
 */

const GSAP_LOAD_TIMEOUT = 1200; // ms
const GSAP_POST_TIMEOUT_DELAY = 500;
const GSAP_POLL_DELAY = 16;
const MOBILE_ANIMATION_CLASS = 'mobile-animations';

let animationsInitialized = false;
let fallbackInitialized = false;

function getNow() {
  if (window.performance && typeof window.performance.now === 'function') {
    return window.performance.now();
  }
  return Date.now();
}

function scheduleNextTick(callback) {
  if (typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(callback);
  } else {
    window.setTimeout(callback, GSAP_POLL_DELAY);
  }
}

function registerScrollTrigger() {
  if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({
      limitCallbacks: true,
      ignoreMobileResize: true
    });
  }
}

function startAnimationSequence() {
  if (animationsInitialized) return;
  if (typeof gsap === 'undefined') return;

  animationsInitialized = true;
  registerScrollTrigger();

  initFadeInUpAnimations();
  initHeroParallax();
  initCounterAnimations();
  initHeroTimeline();
  initCardAnimations();
  initStaggerAnimations();
}

function waitForGSAP(startTime = getNow()) {
  if (animationsInitialized) return;

  if (typeof gsap !== 'undefined') {
    startAnimationSequence();
    return;
  }

  const elapsed = getNow() - startTime;

  if (elapsed >= GSAP_LOAD_TIMEOUT) {
    if (!fallbackInitialized) {
      fallbackInitialized = true;
      console.warn('GSAP not available within timeout. Using CSS fallback animations.');
      initCSSFallbackAnimations();
    }
    window.setTimeout(() => waitForGSAP(startTime), GSAP_POST_TIMEOUT_DELAY);
    return;
  }

  scheduleNextTick(() => waitForGSAP(startTime));
}

function initAnimationsController() {
  if (animationsInitialized) return;

  if (document.documentElement.classList.contains(MOBILE_ANIMATION_CLASS)) {
    fallbackInitialized = true;
    console.warn('Mobile-only animation mode detected; falling back to CSS animations.');
    initCSSFallbackAnimations();
    return;
  }

  waitForGSAP();
}

function onDOMReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

onDOMReady(initAnimationsController);

/**
 * Fade-in on Scroll (Reutilizável)
 * Anima todos os elementos com classe .fade-in-up
 */
function initFadeInUpAnimations() {
  if (typeof ScrollTrigger === 'undefined') {
    // Fallback: se ScrollTrigger não carregar, mostra os elementos imediatamente
    document.querySelectorAll('.fade-in-up').forEach(elem => {
      elem.style.opacity = '1';
      elem.style.transform = 'none';
    });
    return;
  }

  gsap.utils.toArray('.fade-in-up').forEach((elem) => {
    // Check if element is in the hero (above the fold)
    const isInHero = elem.closest('.hero') !== null;
    
    // Set initial state via GSAP (overrides CSS)
    gsap.set(elem, { 
      opacity: 0, 
      y: 40,
      willChange: 'transform, opacity' 
    });
    
    if (isInHero) {
      // Hero elements: animate immediately on page load
      gsap.to(elem, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.2, // Small delay for smoother experience
        ease: 'power3.out',
        onComplete: () => {
          gsap.set(elem, { willChange: 'auto', clearProps: 'transform' });
        }
      });
    } else {
      // Other elements: animate on scroll
      gsap.to(elem, {
        scrollTrigger: {
          trigger: elem,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        onComplete: () => {
          gsap.set(elem, { willChange: 'auto', clearProps: 'transform' });
        }
      });
    }
  });
}

/**
 * Parallax Background (Hero)
 * Scrub suave para efeito de profundidade
 */
function initHeroParallax() {
  if (typeof ScrollTrigger === 'undefined') return;

  const heroBg = document.querySelector('.hero-bg, .hero-video-bg');
  const hero = document.querySelector('.hero');
  
  if (!heroBg || !hero) return;

  gsap.to(heroBg, {
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    },
    yPercent: 30,
    ease: 'none'
  });
}

/**
 * Counter Animation (Stats)
 * Animação de números com scroll trigger
 */
function initCounterAnimations() {
  const counters = document.querySelectorAll('.counter, [data-target], .hero-stat-number[data-count]');
  
  if (!counters.length) return;

  counters.forEach((elem) => {
    animateCounter(elem);
  });
}

function animateCounter(elem) {
  // Get target from data-target or data-count attribute
  const target = parseInt(elem.getAttribute('data-target') || elem.getAttribute('data-count') || 0);
  
  if (!target) return;
  
  const duration = 2;
  const suffix = elem.getAttribute('data-suffix') || '';
  const prefix = elem.getAttribute('data-prefix') || '';
  
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.to({ val: 0 }, {
      val: target,
      duration: duration,
      ease: 'power2.out',
      onUpdate: function() {
        elem.textContent = prefix + Math.ceil(this.targets()[0].val) + suffix;
      },
      scrollTrigger: {
        trigger: elem,
        start: 'top 80%',
        once: true
      }
    });
  } else {
    // Fallback without ScrollTrigger
    gsap.to({ val: 0 }, {
      val: target,
      duration: duration,
      ease: 'power2.out',
      delay: 0.5,
      onUpdate: function() {
        elem.textContent = prefix + Math.ceil(this.targets()[0].val) + suffix;
      }
    });
  }
}

/**
 * Hero Section Timeline
 * Sequência de entrada coordenada
 */
function initHeroTimeline() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Mark hero as loaded
  setTimeout(() => {
    hero.classList.add('loaded');
  }, 100);

  const heroTitle = document.querySelector('.hero-content h1');
  const heroSubtitle = document.querySelector('.hero-content .hero-tagline, .hero-content p');
  const heroCTA = document.querySelectorAll('.cta-duo a, .cta-duo button');
  const heroStats = document.querySelector('.hero-stats');
  const scrollIndicator = document.querySelector('.scroll-indicator');

  if (!heroTitle) return;

  // Main Hero Timeline
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  // Add will-change for performance
  gsap.set([heroTitle, heroSubtitle, heroCTA, heroStats].filter(Boolean), { 
    willChange: 'transform, opacity' 
  });

  tl.from(heroTitle, { 
    y: 100, 
    opacity: 0, 
    duration: 1.2 
  })
  .from(heroSubtitle, { 
    y: 50, 
    opacity: 0, 
    duration: 0.8 
  }, '-=0.6')
  .from(heroCTA, { 
    y: 30, 
    opacity: 0, 
    stagger: 0.2, 
    duration: 0.6 
  }, '-=0.4');

  // Stats animation
  if (heroStats) {
    tl.from(heroStats, {
      y: 40,
      opacity: 0,
      duration: 0.8
    }, '-=0.2');
  }

  // Remove will-change after timeline completes
  tl.call(() => {
    gsap.set([heroTitle, heroSubtitle, heroCTA, heroStats].filter(Boolean), { 
      willChange: 'auto' 
    });
  });

  // Scroll Indicator - Infinite bounce
  if (scrollIndicator) {
    gsap.to(scrollIndicator, {
      y: 10,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      duration: 1
    });
  }
}

/**
 * Card Animations
 * Hover effects com GPU acceleration
 */
function initCardAnimations() {
  const cards = document.querySelectorAll('.card, .glass-card, .produto-card, .value-card, .social-proof-card');

  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      gsap.to(this, {
        y: -8,
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    card.addEventListener('mouseleave', function() {
      gsap.to(this, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });
}

/**
 * Stagger Animations para listas e grids
 * Nota: Elementos com .fade-in-up já são animados por initFadeInUpAnimations
 * Esta função anima elementos SEM a classe .fade-in-up
 */
function initStaggerAnimations() {
  if (typeof ScrollTrigger === 'undefined') return;

  // Produto cards stagger - Skip if they have .fade-in-up (handled separately)
  const produtoCards = gsap.utils.toArray('.produto-card:not(.fade-in-up)');
  if (produtoCards.length) {
    gsap.set(produtoCards, { 
      opacity: 0, 
      y: 60,
      willChange: 'transform, opacity' 
    });
    
    gsap.to(produtoCards, {
      scrollTrigger: {
        trigger: produtoCards[0],
        start: 'top 85%',
        once: true
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      onComplete: () => {
        gsap.set(produtoCards, { willChange: 'auto', clearProps: 'transform' });
      }
    });
  }

  // Value cards stagger - Skip if they have .fade-in-up
  const valueCards = gsap.utils.toArray('.value-card:not(.fade-in-up)');
  if (valueCards.length) {
    gsap.set(valueCards, { 
      opacity: 0, 
      y: 40,
      willChange: 'transform, opacity' 
    });
    
    gsap.to(valueCards, {
      scrollTrigger: {
        trigger: valueCards[0],
        start: 'top 85%',
        once: true
      },
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(valueCards, { willChange: 'auto', clearProps: 'transform' });
      }
    });
  }

  // Social proof cards stagger
  const socialCards = gsap.utils.toArray('.social-proof-card');
  if (socialCards.length) {
    gsap.set(socialCards, { 
      opacity: 0, 
      y: 30,
      willChange: 'transform, opacity' 
    });
    
    gsap.to(socialCards, {
      scrollTrigger: {
        trigger: socialCards[0],
        start: 'top 85%',
        once: true
      },
      y: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(socialCards, { willChange: 'auto', clearProps: 'transform' });
      }
    });
  }

  // Footer columns stagger
  const footerCols = gsap.utils.toArray('.footer-col');
  if (footerCols.length) {
    gsap.set(footerCols, { opacity: 0, y: 30 });
    
    gsap.to(footerCols, {
      scrollTrigger: {
        trigger: footerCols[0],
        start: 'top 90%',
        once: true
      },
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }
}

/**
 * CSS Fallback Animations
 * Para quando GSAP não está disponível
 */
function initCSSFallbackAnimations() {
  // Add CSS class to enable CSS-only animations
  document.body.classList.add('no-gsap');
  
  // Use IntersectionObserver for fade-in
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
  }
}

/**
 * Utility: Animate element with custom options
 */
function animateElement(selector, options = {}) {
  if (typeof gsap === 'undefined') return;

  const defaults = {
    y: 30,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out',
    stagger: 0.1
  };

  const config = { ...defaults, ...options };
  const elements = gsap.utils.toArray(selector);

  if (!elements.length) return;

  if (typeof ScrollTrigger !== 'undefined' && config.scrollTrigger !== false) {
    gsap.from(elements, {
      scrollTrigger: {
        trigger: elements[0],
        start: 'top 85%',
        toggleActions: 'play none none reverse',
        ...config.scrollTrigger
      },
      ...config
    });
  } else {
    gsap.from(elements, config);
  }
}

/**
 * Utility: Create parallax effect
 */
function createParallax(selector, speed = 0.5) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const elements = gsap.utils.toArray(selector);

  elements.forEach(elem => {
    gsap.to(elem, {
      scrollTrigger: {
        trigger: elem,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      },
      yPercent: speed * 100,
      ease: 'none'
    });
  });
}

// Export functions for external use
window.ERAppsStudio = window.ERAppsStudio || {};
window.ERAppsStudio.animations = {
  animateElement,
  animateCounter,
  createParallax,
  initFadeInUpAnimations,
  initCounterAnimations
};
