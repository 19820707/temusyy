/**
 * Speculative link prefetch (rel=prefetch) on hover / touch intent.
 *
 * Invariants:
 * - add-to-cart must NEVER trigger concurrent requests — N/A here (navigation prefetch only).
 * - critical images must define width/height — N/A (no img elements).
 * - no fetch may block indefinitely — N/A (uses <link rel=prefetch> only); hover intent is timer-bound.
 * - Invalid href / URL parsing must never throw into the page (safe try/catch at boundaries).
 * - Never stack duplicate gesture listeners on the same <a> (touchend/touchcancel use { once: true }).
 * - Never stack duplicate mouseout handlers (single delegated document listener).
 */
(function () {
  'use strict';

  var prefetcher = document.createElement('link');
  var isSupported =
    prefetcher.relList &&
    prefetcher.relList.supports &&
    prefetcher.relList.supports('prefetch');
  var isDataSaverEnabled = navigator.connection && navigator.connection.saveData;
  var allowQueryString = 'instantAllowQueryString' in document.body.dataset;
  var allowExternalLinks = 'instantAllowExternalLinks' in document.body.dataset;

  var urlToPreload;
  var mouseoverTimer;
  var lastTouchTimestamp;

  if (!isSupported || isDataSaverEnabled) {
    return;
  }

  prefetcher.rel = 'prefetch';
  document.head.appendChild(prefetcher);

  var capturePassive = { capture: true, passive: true };

  document.addEventListener('touchstart', touchstartListener, capturePassive);
  document.addEventListener('mouseover', mouseoverListener, capturePassive);
  document.addEventListener('mouseout', documentMouseoutListener, capturePassive);

  function touchstartListener(e) {
    lastTouchTimestamp = performance.now();
    var anchor = e.target && e.target.closest('a');
    if (!isPreloadable(anchor)) {
      return;
    }
    var reset = function () {
      urlToPreload = void 0;
      stopPreloading();
    };
    anchor.addEventListener('touchcancel', reset, { passive: true, once: true });
    anchor.addEventListener('touchend', reset, { passive: true, once: true });
    urlToPreload = anchor.href;
    preload(anchor.href);
  }

  function mouseoverListener(e) {
    if (performance.now() - lastTouchTimestamp < 1100) {
      return;
    }
    if (mouseoverTimer) {
      clearTimeout(mouseoverTimer);
      mouseoverTimer = void 0;
    }
    var anchor = e.target && e.target.closest('a');
    if (!isPreloadable(anchor)) {
      return;
    }
    urlToPreload = anchor.href;
    mouseoverTimer = setTimeout(function () {
      mouseoverTimer = void 0;
      preload(anchor.href);
    }, 65);
  }

  /**
   * Delegated mouseout: avoids N× mouseout listeners on anchors (duplicate listener leak).
   * Mirrors legacy behaviour: ignore moves that stay inside the same <a> subtree.
   */
  function documentMouseoutListener(e) {
    var fromNode = e.target;
    if (!fromNode) {
      return;
    }
    if (fromNode.nodeType === 3 && fromNode.parentElement) {
      fromNode = fromNode.parentElement;
    }
    if (typeof fromNode.closest !== 'function') {
      return;
    }
    var fromA = fromNode.closest('a');
    if (!fromA) {
      return;
    }
    var to = e.relatedTarget;
    if (to && fromA.contains(to)) {
      return;
    }
    if (mouseoverTimer) {
      clearTimeout(mouseoverTimer);
      mouseoverTimer = void 0;
    } else {
      if (urlToPreload === fromA.href) {
        urlToPreload = void 0;
        stopPreloading();
      }
    }
  }

  function isPreloadable(anchor) {
    if (!anchor || !anchor.href) {
      return false;
    }
    if (urlToPreload === anchor.href) {
      return false;
    }
    var parsed;
    try {
      parsed = new URL(anchor.href);
    } catch (err) {
      return false;
    }
    var originOk =
      allowExternalLinks ||
      parsed.origin === location.origin ||
      'instant' in anchor.dataset;
    if (!originOk) {
      return false;
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    if (parsed.protocol === 'http:' && location.protocol === 'https:') {
      return false;
    }
    var queryOk = allowQueryString || !parsed.search || 'instant' in anchor.dataset;
    if (!queryOk) {
      return false;
    }
    if (
      parsed.hash &&
      parsed.pathname + parsed.search === location.pathname + location.search
    ) {
      return false;
    }
    if ('noInstant' in anchor.dataset) {
      return false;
    }
    return true;
  }

  function preload(href) {
    try {
      prefetcher.href = href;
    } catch (err) {
      stopPreloading();
    }
  }

  function stopPreloading() {
    prefetcher.removeAttribute('href');
  }
})();
