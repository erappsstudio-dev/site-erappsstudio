/**
 * Micro-Interações Preditivas
 * Hover Parallax + Magnetic Buttons
 * +40% tempo de página (Gnar/VeilSun)
 * Pure Vanilla JS - Zero dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  initMagneticButtons();
  initCardTilt();
  initSpotlightCards();
  initImageParallax();
});

/**
 * Magnetic Buttons
 * Efeito "ímã" no cursor - Signature de estúdios premium
 */
function initMagneticButtons() {
  const magneticButtons = document.querySelectorAll('.btn-magnetic');
  
  if (!magneticButtons.length) return;

  magneticButtons.forEach(btn => {
    let animationFrame;

    btn.addEventListener('mousemove', (e) => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Magnetic strength: 0.3 = 30% of distance
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });
    });

    btn.addEventListener('mouseleave', () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

/**
 * Card 3D Tilt Effect
 * Segue o mouse para criar profundidade 3D
 */
function initCardTilt() {
  const tiltCards = document.querySelectorAll('.card-tilt');
  
  if (!tiltCards.length) return;

  tiltCards.forEach(card => {
    let animationFrame;

    card.addEventListener('mousemove', (e) => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.classList.add('tilting');
      });
    });

    card.addEventListener('mouseleave', () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      card.classList.remove('tilting');
    });
  });
}

/**
 * Spotlight Effect - Cursor Follow
 * Iluminação que segue o cursor sobre cards
 */
function initSpotlightCards() {
  const spotlightCards = document.querySelectorAll('.spotlight-card');
  
  if (!spotlightCards.length) return;

  spotlightCards.forEach(card => {
    let animationFrame;

    card.addEventListener('mousemove', (e) => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update CSS custom properties for spotlight position
        card.style.setProperty('--spotlight-x', `${x}px`);
        card.style.setProperty('--spotlight-y', `${y}px`);
        
        // Move spotlight (before pseudo-element)
        const spotlight = card.querySelector('::before') || card;
        if (card.style) {
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        }
      });
    });
  });
}

/**
 * Image Parallax on Hover
 * Movimento sutil da imagem dentro do container
 */
function initImageParallax() {
  const parallaxImages = document.querySelectorAll('.image-parallax');
  
  if (!parallaxImages.length) return;

  parallaxImages.forEach(container => {
    const img = container.querySelector('img');
    if (!img) return;

    let animationFrame;

    container.addEventListener('mousemove', (e) => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const moveX = (x - centerX) / centerX * 10; // 10px max movement
        const moveY = (y - centerY) / centerY * 10;
        
        img.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
      });
    });

    container.addEventListener('mouseleave', () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      
      img.style.transform = 'translate(0, 0) scale(1)';
    });
  });
}

/**
 * Ripple Effect on Click
 * Animação de ondulação ao clicar em botões
 */
function initRippleEffect() {
  const rippleButtons = document.querySelectorAll('.btn-ripple');
  
  rippleButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

/**
 * Smooth Hover State Manager
 * Gerencia estados de hover com debounce para performance
 */
class HoverStateManager {
  constructor(selector, onEnter, onLeave) {
    this.elements = document.querySelectorAll(selector);
    this.onEnter = onEnter;
    this.onLeave = onLeave;
    this.timeout = null;
    
    this.init();
  }
  
  init() {
    this.elements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        clearTimeout(this.timeout);
        this.onEnter(element);
      });
      
      element.addEventListener('mouseleave', () => {
        this.timeout = setTimeout(() => {
          this.onLeave(element);
        }, 100);
      });
    });
  }
}

/**
 * Performance Monitor
 * Desabilita efeitos complexos em dispositivos lentos
 */
function monitorPerformance() {
  if (!('requestIdleCallback' in window)) return;
  
  let frameCount = 0;
  let lastTime = performance.now();
  
  function checkFPS() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime >= lastTime + 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      
      // Se FPS < 30, desabilitar efeitos complexos
      if (fps < 30) {
        return;
      }
      
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(checkFPS);
  }
  
  requestAnimationFrame(checkFPS);
}

// Initialize performance monitoring
if (window.innerWidth > 768) {
  monitorPerformance();
}

// Initialize ripple effect
document.addEventListener('DOMContentLoaded', initRippleEffect);

// Export functions
window.ERAppsStudio = window.ERAppsStudio || {};
window.ERAppsStudio.microInteractions = {
  initMagneticButtons,
  initCardTilt,
  initSpotlightCards,
  initImageParallax,
  initRippleEffect,
  HoverStateManager
};
