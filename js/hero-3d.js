/**
 * Hero Image Sequence Animation
 * Versão Robusta com Debug
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroSequence();
  initScrollTriggerHero();
  initHeroParallax();
  initScrollIndicator();
});

function initHeroSequence() {
  const container = document.querySelector('.hero-sequence');
  if (!container) {
    console.error('[HeroDebug] Container .hero-sequence não encontrado.');
    return;
  }

  const canvas = container.querySelector('canvas');
  if (!canvas) {
    console.error('[HeroDebug] Canvas não encontrado dentro da sequence.');
    return;
  }

  // Captura dados e faz log para conferência
  const base = container.dataset.seqBase || '';
  const count = parseInt(container.dataset.seqCount, 10) || 0;
  const pad = parseInt(container.dataset.seqPad, 10) || 3;
  const ext = container.dataset.seqExt || 'png';

  console.log(`[HeroDebug] Config: Base="${base}", Count=${count}, Ext=${ext}`);

  if (!base || !count) {
    console.error('[HeroDebug] Base ou Count inválidos.');
    return;
  }

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frameState = { frame: 0 };
  
  // Começa assim que um mínimo de frames estiver pronto
  const minReady = Math.min(10, count); 
  let images = new Array(count);
  let loaded = 0;
  let ready = false;
  let started = false;
  let dpr = window.devicePixelRatio || 1;
  let resizeTimer = null;
  let startTimer = null;

  const frameSrc = (i) => `${base}${String(i).padStart(pad, '0')}.${ext}`;

  // Função segura para desenhar
  const drawFrame = (index) => {
    const img = images[index];
    // Se a imagem não existe ou não carregou (width=0), sai
    if (!img || !img.complete || !img.naturalWidth) return false;

    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;
    
    // Limpa
    ctx.clearRect(0, 0, cw, ch);

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    
    // Calcula cover
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    
    ctx.drawImage(img, dx, dy, dw, dh);
    return true;
  };

  const resizeCanvas = () => {
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Tenta redesenhar o frame atual após resize
    drawFrame(Math.round(frameState.frame));
  };

  const setupScrollScrub = () => {
    if (!window.gsap || typeof ScrollTrigger === 'undefined') {
      console.warn('[HeroDebug] GSAP ou ScrollTrigger não carregados. Animação cancelada.');
      return;
    }
    
    console.log('[HeroDebug] Iniciando ScrollTrigger...');

    if (gsap.registerPlugin) {
      gsap.registerPlugin(ScrollTrigger);
    }

    const hero = document.querySelector('.hero');
    
    // Animação atrelada ao scroll
    gsap.to(frameState, {
      frame: count - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5, // Suavidade do scrub
        pin: true,  // Fixa o elemento
        anticipatePin: 1
      },
      onUpdate: () => {
        // Renderiza o frame correspondente ao scroll
        drawFrame(Math.round(frameState.frame));
      }
    });
  };

  const onReady = () => {
    if (ready) return;
    ready = true;
    console.log('[HeroDebug] Sistema pronto. Ativando animação.');
    resizeCanvas();
    setupScrollScrub();
  };

  const startIfReady = (force = false) => {
    if (started) return;
    if (force || loaded >= minReady) {
      started = true;
      onReady();
    }
  };

  // Inicializa tamanho do canvas imediatamente
  resizeCanvas();
  // Tenta desenhar o primeiro frame já na inicialização
  drawFrame(0);

  // Pré-carregamento das imagens
  console.log(`[HeroDebug] Iniciando download de ${count} frames...`);
  
  for (let i = 0; i < count; i += 1) {
    const img = new Image();
    img.decoding = 'async';
    img.src = frameSrc(i);
    
    img.onload = () => {
      loaded += 1;
      // Assim que a primeira imagem (frame 0) carregar, desenha ela!
      if (i === 0) {
        console.log('[HeroDebug] Frame 0 carregado com sucesso. Desenhando...');
        drawFrame(0);
      }
      startIfReady();
    };
    
    img.onerror = () => {
      loaded += 1;
      // Log de erro apenas para as primeiras imagens para não poluir
      if (i < 3) {
        console.error(`[HeroDebug] Erro ao carregar: ${img.src}`);
      }
      startIfReady();
    };
    
    images[i] = img;
  }

  // Inicia no load da página (mesmo sem mínimo de frames)
  window.addEventListener('load', () => {
    startIfReady(true);
  }, { once: true });

  // Fallback: força o início após 2s
  startTimer = setTimeout(() => {
    if (!started) {
      console.warn('[HeroDebug] Timeout acionado. Forçando início.');
      startIfReady(true);
    }
  }, 2000);

  // Resize handler
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 150);
  });
}

function initScrollTriggerHero() {
  if (typeof ScrollTrigger === 'undefined') return;

  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero-content');

  if (!hero || !heroContent) return;

  // Animação do texto subindo e sumindo
  gsap.to(heroContent, {
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
    y: 200,
    opacity: 0,
    ease: 'power4.out'
  });
}

function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Efeito simples de mouse move
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
  });

  function animateParallax() {
    currentX += (mouseX - currentX) * 0.1;
    currentY += (mouseY - currentY) * 0.1;

    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      heroContent.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
    requestAnimationFrame(animateParallax);
  }

  if (window.innerWidth > 768) {
    animateParallax();
  }
}

function initScrollIndicator() {
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (!scrollIndicator) return;

  scrollIndicator.addEventListener('click', () => {
    const nextSection = document.querySelector('#servicos');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}
