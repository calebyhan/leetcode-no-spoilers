// LeetCode No-Spoilers (personal)
// Updated to properly integrate buttons into the toolbar

(function () {
  'use strict';
  
  const DEBUG = false; // Set to true for debugging

  let lastUrl = location.href;
  let observer = null;
  let linkInterceptorAdded = false;

  // Utility: debug logging
  function log(...args) {
    if (DEBUG) console.log('[LeetCode No-Spoilers]', ...args);
  }

  // Utility: show a tiny toast
  function toast(msg, ms = 1500) {
    log('Toast:', msg);
    let el = document.getElementById("lc-ns-banner");
    if (!el) {
      el = document.createElement("div");
      el.id = "lc-ns-banner";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = "block";
    setTimeout(() => (el.style.display = "none"), ms);
  }

  // Find containers that contain substantial code (editors, solution blocks)
  function findCodeContainers() {
    const sels = [
      // Code editors (main target)
      '.monaco-editor',
      '[class*="editor"]',
      '[class*="Editor"]',
      // Large code blocks and containers
      'div[class*="code"][style*="height"]',
      'pre[class*="language-"]',
      // Solution-specific containers
      '[data-track-load*="solution"]',
      '[data-track-load*="editorial"]',
      'div[class*="solution"]:not([class*="solution-"] button)',
      'div[class*="Solution"]:not([class*="solution-"] button)',
      'article[class*="solution"]',
      'section[class*="solution"]',
      // Editorial containers
      'div[class*="editorial"]',
      'article[class*="editorial"]',
      'section[class*="editorial"]',
      // Submission containers
      'div[class*="submission"]',
      'article[class*="submission"]',
      // Discussion solution containers
      'div[class*="discuss"] pre[class*="language-"]',
      'div[class*="comment"] pre[class*="language-"]'
    ];
    
    const found = new Set();
    
    sels.forEach(sel => {
      try {
        document.querySelectorAll(sel).forEach(el => {
          if (el.closest('nav') ||
              el.closest('header') ||
              el.closest('[role="navigation"]') ||
              el.offsetWidth < 200 || 
              el.offsetHeight < 100) {
            return;
          }
          
          if (containsSubstantialCode(el)) {
            found.add(el);
          }
        });
      } catch (e) {
        log('Error with selector:', sel, e);
      }
    });
    
    const list = Array.from(found);
    log('Found substantial code containers:', list.length, list);
    return list;
  }

  // Helper function to determine if an element contains substantial code content
  function containsSubstantialCode(element) {
    if (!element) return false;
    
    const text = element.textContent || '';
    const html = element.innerHTML || '';
    const tagName = element.tagName.toLowerCase();
    
    const minWidth = 200;
    const minHeight = 100;
    const minTextLength = 50;
    
    if (element.offsetWidth < minWidth || element.offsetHeight < minHeight) {
      if (!element.classList.contains('monaco-editor') && 
          !element.querySelector('.monaco-editor')) {
        return false;
      }
    }
    
    if (text.length < minTextLength) {
      if (!element.classList.contains('monaco-editor') && 
          !element.querySelector('.monaco-editor') &&
          !element.classList.contains('editor')) {
        return false;
      }
    }
    
    if (element.classList.contains('monaco-editor') || 
        element.querySelector('.monaco-editor') ||
        element.classList.contains('CodeMirror') ||
        element.querySelector('.CodeMirror')) {
      return true;
    }
    
    const substantialCodePatterns = [
      /```[\s\S]*```/,
      /^[ ]*[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{[\s\S]*\}/m,
      /class\s+[A-Z][a-zA-Z0-9_]*[\s\S]*\{[\s\S]*\}/m,
      /(\b(def|function|class|if|for|while|return)\b[\s\S]*){2,}/,
      /^.*[{};].*\n.*[{};]/m
    ];
    
    const hasSubstantialCode = substantialCodePatterns.some(pattern => 
      pattern.test(text) || pattern.test(html)
    );
    
    const isSubstantialCodeContext = element.closest('[class*="solution"][class*="content"]') ||
                                   element.closest('[class*="editorial"][class*="content"]') ||
                                   element.closest('[data-track*="solution"]') ||
                                   element.closest('.monaco-editor') ||
                                   (tagName === 'pre' && text.length > minTextLength);
    
    const hasSubstantialSolutionContent = /\b(solution|approach|algorithm|implementation)\b/i.test(text) &&
                                        (hasSubstantialCode || text.length > 200);
    
    return hasSubstantialCode || isSubstantialCodeContext || hasSubstantialSolutionContent;
  }

  // Apply blur classes to code containers
  function hideCode() {
    const targets = findCodeContainers();
    let hidden = 0;
    
    targets.forEach(el => {
      if (!el.dataset.lcNsHidden) {
        el.classList.add("lc-ns-blur");
        el.dataset.lcNsHidden = "1";
        hidden++;
        log('Hidden code container:', el);
      }
    });
    
    log(`Hidden ${hidden} code containers`);
    return hidden;
  }

  // Reveal hidden code temporarily
  function showCode() {
    const elements = document.querySelectorAll(".lc-ns-blur[data-lc-ns-hidden]");
    elements.forEach(el => {
      el.classList.remove("lc-ns-blur");
      el.dataset.lcNsShown = "1";
    });
    
    const message = elements.length ? 
      `Revealed ${elements.length} code section${elements.length > 1 ? 's' : ''}` : 
      "No hidden code to show";
    toast(message);
    log(message);
  }

  // Hide code again after it was shown
  function hideCodeAgain() {
    const elements = document.querySelectorAll("[data-lc-ns-hidden][data-lc-ns-shown]");
    elements.forEach(el => {
      el.classList.add("lc-ns-blur");
      delete el.dataset.lcNsShown;
    });
    
    const message = elements.length ? 
      `Hidden ${elements.length} code section${elements.length > 1 ? 's' : ''} again` : 
      "No code to hide";
    toast(message);
    log(message);
  }

  // Create button matching LeetCode's style
  function createToolbarButton(iconSvg, tooltip, onClick) {
    const button = document.createElement("button");
    button.className = "relative inline-flex gap-2 items-center justify-center font-medium cursor-pointer focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors bg-transparent enabled:hover:bg-fill-secondary enabled:active:bg-fill-primary text-caption rounded text-text-primary aspect-1 group ml-auto h-full p-1";
    button.setAttribute("data-state", "closed");
    button.title = tooltip;
    
    const iconContainer = document.createElement("div");
    iconContainer.className = "relative text-[14px] leading-[normal] p-[1px] before:block before:h-3.5 before:w-3.5 text-sd-muted-foreground";
    iconContainer.innerHTML = iconSvg;
    
    button.appendChild(iconContainer);
    button.addEventListener("click", onClick);
    
    return button;
  }

  // Floating control UI
  function ensureControls() {
    if (document.getElementById("lc-ns-show-btn") || document.getElementById("lc-ns-hide-btn")) return;
    
    // Find the toolbar container
    const toolbar = document.querySelector('div.flex.h-full.items-center.gap-1');
    if (!toolbar) {
      log('Toolbar not found, retrying later');
      setTimeout(ensureControls, 500);
      return;
    }
    
    // SVG icons matching LeetCode's style
    const eyeOpenSvg = `<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="eye" 
      class="svg-inline--fa fa-eye absolute left-1/2 top-1/2 h-[1em] -translate-x-1/2 -translate-y-1/2 align-[-0.125em]" 
      role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
      <path fill="currentColor" d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"></path>
    </svg>`;
    
    const eyeSlashSvg = `<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="eye-slash" 
      class="svg-inline--fa fa-eye-slash absolute left-1/2 top-1/2 h-[1em] -translate-x-1/2 -translate-y-1/2 align-[-0.125em]" 
      role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
      <path fill="currentColor" d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 91.9 268.8 72 320 72c97.2 0 181.3 73.7 213.3 184c-15.3 31.3-39 68.6-70.3 101.1L376.5 288c5.7-11.3 8.9-24 8.9-37.6c0-45.1-36.5-81.6-81.6-81.6c-10.5 0-20.5 2-29.7 5.6L189.8 123.4zm23.5 171L127.6 368.8c-39.6-40.6-66.4-86.1-79.9-118.4c-3.3-7.9-3.3-16.7 0-24.6c14.9-35.7 46.2-87.7 93-131.1C187.5 51 252.2 14.2 332.2 5.8L308.5 26.9C296.7 27.6 285 29 273.5 31c-76.6 13.4-139.3 59.7-167.6 125.3c-7.9 18.3-12.3 37.5-13.1 57l119.5 93.1zm93.1 72.6l40.3 31.4c-5.9 .9-12 1.4-18.2 1.4c-44.2 0-80-35.8-80-80c0-2.1 .1-4.2 .3-6.3l57.6 44.9v8.6z"></path>
    </svg>`;
    
    // Create buttons
    const btnShow = createToolbarButton(eyeOpenSvg, "Show hidden code temporarily", () => {
      try {
        showCode();
      } catch (e) {
        log('Error showing code:', e);
        toast("Error showing code");
      }
    });
    btnShow.id = "lc-ns-show-btn";
    
    const btnHide = createToolbarButton(eyeSlashSvg, "Hide code again", () => {
      try {
        hideCodeAgain();
      } catch (e) {
        log('Error hiding code:', e);
        toast("Error hiding code");
      }
    });
    btnHide.id = "lc-ns-hide-btn";
    
    // Insert buttons at the beginning of the toolbar
    toolbar.insertBefore(btnHide, toolbar.firstChild);
    toolbar.insertBefore(btnShow, toolbar.firstChild);
    
    log('Controls added to toolbar');
  }

  // Intercept clicks on code/solution links
  function interceptCodeLinks() {
    if (linkInterceptorAdded) return;
    
    const handler = (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      
      const href = a.getAttribute('href') || '';
      
      const isCodeLink = /\/(editorial|solution|solutions|submissions|community\/solutions|discuss\/.*\/solution)/i.test(href) ||
                        /tab=code|tab=solutions|tab=submissions/i.test(href);
      
      if (isCodeLink) {
        log('Intercepted code link:', href);
        
        const message = `⚠️ Warning: You're about to view code/solution content.\n\nURL: ${href}\n\nAre you sure you want to proceed?`;
        const go = confirm(message);
        
        if (!go) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          toast("🛡️ Stayed away from code");
          log('Blocked navigation to:', href);
          return false;
        } else {
          log('User confirmed navigation to:', href);
        }
      }
    };
    
    document.addEventListener("click", handler, true);
    linkInterceptorAdded = true;
    log('Link interceptor added');
  }

  // Watch for SPA navigations
  function watchUrlChanges() {
    const check = () => {
      if (lastUrl !== location.href) {
        log('URL changed:', lastUrl, '→', location.href);
        lastUrl = location.href;
        setTimeout(onRouteChange, 100);
      }
    };
    
    setInterval(check, 300);
    
    window.addEventListener('popstate', () => {
      setTimeout(check, 50);
    });
    
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setTimeout(check, 50);
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      setTimeout(check, 50);
    };
    
    log('URL change watchers installed');
  }

  // Rerun logic on route changes / first load
  function onRouteChange() {
    log('Route change handler triggered');
    
    document.querySelectorAll("[data-lc-ns-shown]").forEach(el => {
      el.classList.add("lc-ns-blur");
      delete el.dataset.lcNsShown;
    });

    ensureControls();
    
    if (!linkInterceptorAdded) {
      interceptCodeLinks();
    }

    log('Checking for code to hide');
    setTimeout(() => {
      hideCode();
      observeMutations();
    }, 200);
  }

  function observeMutations() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    
    observer = new MutationObserver((mutations) => {
      let shouldProcess = false;
      let hasSignificantChanges = false;
      
      for (const mutation of mutations) {
        // Check if our buttons were removed
        if (!document.getElementById("lc-ns-show-btn") || !document.getElementById("lc-ns-hide-btn")) {
          ensureControls();
        }
        
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node;
              const rect = element.getBoundingClientRect();
              
              if (element.children.length > 0 || 
                  element.textContent.trim().length > 20 ||
                  rect.width > 100 || rect.height > 100) {
                shouldProcess = true;
                
                if (containsSubstantialCode(element) || 
                    element.querySelector('.monaco-editor') ||
                    element.querySelector('[class*="editor"]') ||
                    element.querySelector('[class*="solution"]') ||
                    element.querySelector('pre[class*="language-"]')) {
                  hasSignificantChanges = true;
                }
                break;
              }
            }
          }
        }
        
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
          const element = mutation.target;
          if (element.nodeType === Node.ELEMENT_NODE && containsSubstantialCode(element)) {
            shouldProcess = true;
            hasSignificantChanges = true;
          }
        }
        
        if (shouldProcess && hasSignificantChanges) break;
      }
      
      if (!shouldProcess) return;
      
      log('Processing DOM mutations, significant changes:', hasSignificantChanges);
      
      setTimeout(() => {
        if (hasSignificantChanges) {
          const hidden = hideCode();
          if (hidden > 0) {
            log(`Mutation observer: hidden ${hidden} new code elements`);
          }
        }
      }, 100);
    });
    
    try {
      observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'data-track'],
        characterData: false
      });
      log('Code hiding mutation observer started');
    } catch (e) {
      log('Error starting mutation observer:', e);
    }
  }

  // Kickoff
  function init() {
    log('Initializing LeetCode No-Spoilers extension');
    
    // Add CSS for blur effect and toast
    const style = document.createElement('style');
    style.textContent = `
      .lc-ns-blur {
        filter: blur(8px) !important;
        user-select: none !important;
        pointer-events: none !important;
        opacity: 0.5 !important;
      }
    `;
    document.head.appendChild(style);
    
    try {
      ensureControls();
      onRouteChange();
      watchUrlChanges();
      log('Extension initialized successfully');
    } catch (e) {
      log('Error during initialization:', e);
    }
  }

  // Wait for page to be ready before initializing
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    setTimeout(init, 100);
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  });
  
})();