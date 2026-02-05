/**
 * Performance Optimization Module
 * Handles lazy loading, image optimization, and resource management
 * 
 * Estratégias implementadas:
 * - Native lazy loading com fallback IntersectionObserver
 * - Prefetch de links on hover (predictive)
 * - Connection-aware loading
 * - Idle-time prefetching
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    lazyLoadMargin: '200px', // Preload 200px before viewport
    prefetchDelay: 65, // ms before prefetching on hover
    idlePrefetchDelay: 2000, // ms of idle time before prefetch
    lowBandwidthThreshold: 2 // Mbps threshold for reduced experience
  };

  // ============================================
  // LAZY LOADING
  // ============================================
  
  /**
   * Initialize lazy loading for images
   * Uses native loading="lazy" with IntersectionObserver fallback
   */
  function initLazyLoading() {
    // Check for native lazy loading support
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading supported - images with loading="lazy" handle themselves
      console.log('✅ Native lazy loading supported');
      return;
    }

    // Fallback: IntersectionObserver for older browsers
    console.log('⚠️ Using IntersectionObserver fallback for lazy loading');
    
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Load the image
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
            }
            
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: CONFIG.lazyLoadMargin
      });

      lazyImages.forEach(img => imageObserver.observe(img));
    } else {
      // Ultimate fallback: load all images immediately
      lazyImages.forEach(img => {
        if (img.dataset.src) img.src = img.dataset.src;
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      });
    }
  }

  /**
   * Lazy load iframes (Calendly, YouTube, etc.)
   */
  function initIframeLazyLoading() {
    const lazyIframes = document.querySelectorAll('iframe[loading="lazy"]');
    
    if (!lazyIframes.length) return;
    
    if ('IntersectionObserver' in window) {
      const iframeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const iframe = entry.target;
            
            if (iframe.dataset.src) {
              iframe.src = iframe.dataset.src;
              iframe.removeAttribute('data-src');
            }
            
            observer.unobserve(iframe);
          }
        });
      }, {
        rootMargin: '500px' // Load iframes earlier (they're heavier)
      });

      lazyIframes.forEach(iframe => iframeObserver.observe(iframe));
    }
  }

  // ============================================
  // PREDICTIVE PREFETCHING
  // ============================================
  
  /**
   * Prefetch links on hover (predictive loading)
   * Improves perceived navigation speed
   */
  function initPrefetchOnHover() {
    // Don't prefetch on slow connections
    if (isSlowConnection()) {
      console.log('⚠️ Slow connection detected - prefetch disabled');
      return;
    }

    const prefetchedUrls = new Set();
    let hoverTimer = null;

    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a[href]');
      
      if (!link) return;
      
      const href = link.href;
      
      // Skip external links, anchors, and already prefetched
      if (!href || 
          href.startsWith('#') || 
          !href.startsWith(window.location.origin) ||
          prefetchedUrls.has(href)) {
        return;
      }

      // Delay prefetch to avoid unnecessary requests
      hoverTimer = setTimeout(() => {
        prefetchUrl(href);
        prefetchedUrls.add(href);
      }, CONFIG.prefetchDelay);
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a[href]')) {
        clearTimeout(hoverTimer);
      }
    });
  }

  /**
   * Prefetch a URL using link rel="prefetch"
   */
  function prefetchUrl(url) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';
    document.head.appendChild(link);
  }

  // ============================================
  // CONNECTION-AWARE LOADING
  // ============================================
  
  /**
   * Check if user has slow connection
   * Uses Network Information API
   */
  function isSlowConnection() {
    const connection = navigator.connection || 
                       navigator.mozConnection || 
                       navigator.webkitConnection;
    
    if (!connection) return false;
    
    // Check for explicit slow connection types
    if (connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g') {
      return true;
    }
    
    // Check for data saver mode
    if (connection.saveData) {
      return true;
    }
    
    // Check for low bandwidth
    if (connection.downlink && connection.downlink < CONFIG.lowBandwidthThreshold) {
      return true;
    }
    
    return false;
  }

  /**
   * Reduce experience for slow connections
   */
  function handleSlowConnection() {
    if (!isSlowConnection()) return;
    
    console.log('🐌 Slow connection detected - reducing experience');
    
    // Add class for CSS to hide non-essential images
    document.documentElement.classList.add('slow-connection');
    
    // Disable autoplay videos
    document.querySelectorAll('video[autoplay]').forEach(video => {
      video.removeAttribute('autoplay');
      video.pause();
    });
    
    // Reduce animation complexity
    document.documentElement.classList.add('reduce-motion');
  }

  // ============================================
  // IDLE-TIME OPTIMIZATION
  // ============================================
  
  /**
   * Prefetch next likely pages during idle time
   */
  function initIdlePrefetch() {
    if (!('requestIdleCallback' in window)) return;
    
    // Don't idle-prefetch on slow connections
    if (isSlowConnection()) return;

    requestIdleCallback(() => {
      // Prefetch likely next pages
      const linksToPrefetch = [
        '#contato',
        '#produtos',
        '#sobre'
      ];
      
      linksToPrefetch.forEach(selector => {
        const link = document.querySelector(`a[href="${selector}"]`);
        // Anchors don't need prefetching, but external links would
      });
    }, { timeout: CONFIG.idlePrefetchDelay });
  }

  // ============================================
  // IMAGE OPTIMIZATION
  // ============================================
  
  /**
   * Handle image loading errors gracefully
   */
  function initImageErrorHandling() {
    document.addEventListener('error', (e) => {
      if (e.target.tagName !== 'IMG') return;
      
      const img = e.target;
      
      // Try fallback image
      if (img.dataset.fallback) {
        img.src = img.dataset.fallback;
        return;
      }
      
      // Add error class for styling
      img.classList.add('img-error');
      
      // Set placeholder
      img.alt = img.alt || 'Imagem não disponível';
    }, true);
  }

  /**
   * Decode images off main thread
   */
  function initImageDecoding() {
    document.querySelectorAll('img[decoding="async"]').forEach(img => {
      if ('decode' in img) {
        img.decode().catch(() => {
          // Silently fail - image will still display normally
        });
      }
    });
  }

  // ============================================
  // PERFORMANCE METRICS
  // ============================================
  
  /**
   * Log Core Web Vitals (for debugging)
   */
  function logPerformanceMetrics() {
    if (!('PerformanceObserver' in window)) return;

    // Largest Contentful Paint (LCP)
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('📊 LCP:', Math.round(lastEntry.startTime), 'ms');
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {}

    // First Input Delay (FID)
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          console.log('📊 FID:', Math.round(entry.processingStart - entry.startTime), 'ms');
        });
      }).observe({ type: 'first-input', buffered: true });
    } catch (e) {}

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        console.log('📊 CLS:', clsValue.toFixed(4));
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}
  }

  // ============================================
  // RESOURCE HINTS
  // ============================================
  
  /**
   * Add dynamic resource hints based on user behavior
   */
  function addDynamicResourceHints() {
    // When user scrolls to contact section, preconnect to Calendly
    const contactSection = document.querySelector('#contato');
    
    if (contactSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Preconnect to Calendly
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = 'https://calendly.com';
            document.head.appendChild(link);
            
            observer.disconnect();
          }
        });
      }, { rootMargin: '500px' });
      
      observer.observe(contactSection);
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  
  function init() {
    // Run immediately
    handleSlowConnection();
    initImageErrorHandling();
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onDOMReady);
    } else {
      onDOMReady();
    }
  }

  function onDOMReady() {
    initLazyLoading();
    initIframeLazyLoading();
    initPrefetchOnHover();
    initIdlePrefetch();
    initImageDecoding();
    addDynamicResourceHints();
    
    // Log metrics in development
    if (window.location.hostname === 'localhost') {
      logPerformanceMetrics();
    }
    
    console.log('⚡ Performance module initialized');
  }

  // Start
  init();

})();
