/* ==========================================================================
   COLORTEK — main.js
   Shared interactions for every page. No dependencies, no scroll listeners:
   IntersectionObserver drives everything. All motion is gated on html.js so
   the site renders complete without JavaScript, and on prefers-reduced-motion.
   ========================================================================== */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ------------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------------ */

  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("menu");

  if (toggle && menu) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
    };

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Crossing into the desktop layout hides the toggle; without this the
    // body could stay scroll-locked with no control visible to unlock it.
    window.matchMedia("(min-width: 921px)").addEventListener("change", function (e) {
      if (e.matches) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------------
     Nav: solid once the page scrolls.
     A 1px sentinel above the fold, watched instead of a scroll listener.
     ------------------------------------------------------------------------ */

  var nav = document.getElementById("nav");

  if (nav && hasIO) {
    var sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;";
    document.body.prepend(sentinel);

    new IntersectionObserver(function (entries) {
      nav.classList.toggle("is-scrolled", !entries[0].isIntersecting);
    }, { rootMargin: "24px 0px 0px 0px" }).observe(sentinel);
  } else if (nav) {
    nav.classList.add("is-scrolled");
  }

  /* ------------------------------------------------------------------------
     Current page marker — now set at build time in Base.astro.

     The old logic compared the last path segment ("glass.html"). Under
     directory URLs that segment is empty for both the location and every
     href, so every link matched and the entire nav bar underlined itself.
     Doing it at build time also makes it work with JavaScript disabled.
     ------------------------------------------------------------------------ */

  /* ------------------------------------------------------------------------
     Reveals: [data-reveal] elements and stacking panels.
     Everything reveals once and unobserves; nothing re-runs on scroll-up.
     ------------------------------------------------------------------------ */

  /* ------------------------------------------------------------------------
     Stat counters. Count up once on view, ~1.1s ease-out. The final value is
     already in the markup, so no JS means no zeroes; width is reserved
     before counting so the row never reflows mid-animation.
     ------------------------------------------------------------------------ */

  function runCounter(el) {
    var target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;

    // Standard numbers like ISO 9001 are identifiers, not quantities, so they
    // opt out of thousands separators with data-count-plain.
    var plain = el.hasAttribute("data-count-plain");

    el.style.minWidth = el.offsetWidth + "px";

    var start = performance.now();
    var duration = 1100;

    function tick(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var value = Math.round(target * eased);
      el.textContent = plain ? String(value) : value.toLocaleString("en-IN");
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var counters = document.querySelectorAll("[data-count]");

  if (hasIO && !reduced) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ------------------------------------------------------------------------
     Product ranges: the sticky cut-out swaps as the pointer moves down the
     rows. Fade out fast, swap, fade back. Guarded against re-triggering the
     same image, and pointer-only: touch layouts hide the panel entirely.
     ------------------------------------------------------------------------ */

  var rangesPanel = document.querySelector(".ranges__panel");
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (rangesPanel && canHover) {
    var panelImg = rangesPanel.querySelector("img");
    var currentSrc = panelImg.getAttribute("src");
    var swapTimer = null;

    document.querySelectorAll(".range-row").forEach(function (row) {
      row.addEventListener("pointerenter", function () {
        var src = row.dataset.cutout;
        if (!src || src === currentSrc) return;
        currentSrc = src;

        rangesPanel.classList.add("is-swapping");
        clearTimeout(swapTimer);
        swapTimer = setTimeout(function () {
          panelImg.onload = function () { rangesPanel.classList.remove("is-swapping"); };
          panelImg.setAttribute("src", src);
          if (panelImg.complete) rangesPanel.classList.remove("is-swapping");
        }, 170);
      });
    });
  }

  /* ------------------------------------------------------------------------
     Ambient film. Plays only while on screen; the visible toggle is the
     accessible control (WCAG 2.2.2). Reduced-motion users get the poster.
     ------------------------------------------------------------------------ */

  var film = document.querySelector(".film__video");
  var filmToggle = document.querySelector(".film__toggle");

  if (film) {
    var userPaused = false;

    var setToggle = function (playing) {
      if (!filmToggle) return;
      filmToggle.textContent = playing ? "Pause" : "Play";
      filmToggle.setAttribute("aria-label", playing ? "Pause video" : "Play video");
    };

    if (reduced) {
      film.removeAttribute("autoplay");
      film.pause();
      setToggle(false);
    } else if (hasIO) {
      new IntersectionObserver(function (entries) {
        if (userPaused) return;
        if (entries[0].isIntersecting) {
          film.play().catch(function () { setToggle(false); });
          setToggle(true);
        } else {
          film.pause();
        }
      }, { threshold: 0.25 }).observe(film);
    }

    if (filmToggle) {
      filmToggle.addEventListener("click", function () {
        if (film.paused) {
          userPaused = false;
          film.play().catch(function () {});
          setToggle(true);
        } else {
          userPaused = true;
          film.pause();
          setToggle(false);
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     Factory film: poster with one press. On play the cover fades, native
     controls appear, sound stays on — a plant tour is meant to be heard.
     ------------------------------------------------------------------------ */

  /* ------------------------------------------------------------------------
     Copy-link button on articles. Falls back to selecting nothing loudly:
     if the clipboard API is unavailable the button simply does not change.
     ------------------------------------------------------------------------ */

  /* ------------------------------------------------------------------------
     Article contents: highlight the section the reader is in. Observes the
     headings themselves against a band near the top of the viewport, so the
     active item changes as a section arrives rather than on every pixel.
     ------------------------------------------------------------------------ */

  var tocLinks = document.querySelectorAll(".toc__list a");

  if (tocLinks.length && hasIO) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

    var tocHeadings = Object.keys(byId)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    /* The reading line sits just under the fixed navigation. The current
       section is simply the last heading that has passed above it. */
    var READING_LINE = 160;

    var pickCurrent = function () {
      var current = tocHeadings[0];
      tocHeadings.forEach(function (h) {
        if (h.getBoundingClientRect().top <= READING_LINE) current = h;
      });
      tocLinks.forEach(function (a) {
        a.classList.toggle("is-current", a === byId[current.id]);
      });
    };

    /* A heading toggles intersection exactly as it crosses that line, so
       every crossing recomputes, and nothing runs in between. */
    var lineObserver = new IntersectionObserver(pickCurrent, {
      rootMargin: "-" + READING_LINE + "px 0px 0px 0px"
    });

    tocHeadings.forEach(function (h) { lineObserver.observe(h); });
    pickCurrent();
  }

  /* ------------------------------------------------------------------------
     Copy-link. Toggles a class only: replacing textContent would destroy the
     icon inside the button, which is the bug this replaces. The async
     clipboard API refuses in a few real situations (an unfocused document,
     older Safari), so a selection-based copy backs it up: the button must
     never look like it did nothing.
     ------------------------------------------------------------------------ */

  function legacyCopy(text) {
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
    document.body.appendChild(field);
    field.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(field);
    return ok;
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var revert;

    var confirmCopied = function () {
      btn.classList.add("is-copied");
      clearTimeout(revert);
      revert = setTimeout(function () { btn.classList.remove("is-copied"); }, 1800);
    };

    btn.addEventListener("click", function () {
      var text = btn.dataset.copy;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(confirmCopied, function () {
          if (legacyCopy(text)) confirmCopied();
        });
        return;
      }

      if (legacyCopy(text)) confirmCopied();
    });
  });

  var vplayer = document.querySelector(".vplayer");
  var vplayerCover = vplayer && vplayer.querySelector(".vplayer__cover");
  var vplayerVideo = vplayer && vplayer.querySelector(".vplayer__video");

  if (vplayer && vplayerCover) {
    vplayerCover.addEventListener("click", function () {
      var youtubeId = vplayer.dataset.youtube;
      vplayerCover.classList.add("is-hidden");

      if (youtubeId) {
        /* Facade pattern: YouTube's player (and its cookies) load only now,
           on a deliberate click. Nothing from youtube.com touches a visitor
           who never presses play. nocookie domain, no related videos. */
        var frame = document.createElement("iframe");
        frame.className = "vplayer__frame";
        frame.src = "https://www.youtube-nocookie.com/embed/" + youtubeId +
                    "?autoplay=1&rel=0&playsinline=1";
        frame.title = "Colortek factory film";
        frame.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
        frame.allowFullscreen = true;
        frame.setAttribute("frameborder", "0");
        if (vplayerVideo) vplayerVideo.remove();
        vplayer.appendChild(frame);
        return;
      }

      if (vplayerVideo) {
        vplayerVideo.setAttribute("controls", "");
        vplayerVideo.play();
      }
    });

    // Self-hosted only: when it ends, put the poster cover back.
    if (vplayerVideo) {
      vplayerVideo.addEventListener("ended", function () {
        vplayerCover.classList.remove("is-hidden");
        vplayerVideo.removeAttribute("controls");
      });
    }
  }

  /* ------------------------------------------------------------------------
     Range pages: application-sector tabs. One category panel visible at a
     time; the URL hash deep-links a category (glass.html#liquor).
     ------------------------------------------------------------------------ */

  var sectorTabs = Array.prototype.slice.call(document.querySelectorAll(".sector[role='tab']"));

  if (sectorTabs.length) {
    var activateSector = function (tab, updateHash) {
      var panel = document.getElementById(tab.getAttribute("aria-controls"));
      if (!panel) return;

      sectorTabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });

      document.querySelectorAll(".catpanel").forEach(function (p) {
        p.hidden = p !== panel;
      });

      if (!reduced) {
        panel.classList.add("is-entering");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { panel.classList.remove("is-entering"); });
        });
      }

      if (updateHash && history.replaceState) {
        history.replaceState(null, "", "#" + panel.id.replace("panel-", ""));
      }
    };

    sectorTabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { activateSector(tab, true); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = sectorTabs[(i + 1) % sectorTabs.length];
        if (e.key === "ArrowLeft") next = sectorTabs[(i - 1 + sectorTabs.length) % sectorTabs.length];
        if (e.key === "Home") next = sectorTabs[0];
        if (e.key === "End") next = sectorTabs[sectorTabs.length - 1];
        if (next) {
          e.preventDefault();
          next.focus();
          activateSector(next, true);
        }
      });
    });

    // Deep link: #liquor opens the liquor tab, on load and on hash change
    // (back/forward, or links targeting a category from the same page).
    var openFromHash = function () {
      var tab = window.location.hash &&
        document.getElementById("tab-" + window.location.hash.slice(1));
      if (tab) {
        activateSector(tab, false);
        // The hash has no matching element for the browser to scroll to,
        // so bring the opened category into view ourselves.
        var catSection = document.querySelector(".catpanels");
        if (catSection) catSection.scrollIntoView({ block: "start" });
      }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
  }

  /* ------------------------------------------------------------------------
     Catalogue filtering. Checkboxes are OR within a facet and AND across
     facets: "Glass or Metal" but "Glass AND Metallic". Search matches name,
     system, finish and industry.

     Desktop shows one panel at a time under its trigger; a phone shows every
     facet in a single bottom sheet, because a menu tree on a small screen is
     more taps than it is worth. Same inputs drive both.
     ------------------------------------------------------------------------ */

  var catGrid = document.getElementById("cat-grid");

  if (catGrid) {
    var cards = Array.prototype.slice.call(catGrid.querySelectorAll(".ccard"));
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".cfopt input"));
    var triggers = Array.prototype.slice.call(document.querySelectorAll(".cfdrop__btn"));
    var panelWrap = document.getElementById("cat-panels");
    var filterRoot = document.getElementById("cat-filters");
    var filterPanels = Array.prototype.slice.call(panelWrap.querySelectorAll(".cfdrop__panel"));
    var search = document.getElementById("cat-search");
    var countEl = document.getElementById("cat-count");
    var clearBtn = document.getElementById("cat-clear");
    var badge = document.getElementById("cat-badge");
    var emptyEl = document.getElementById("cat-empty");
    var backdrop = document.getElementById("cat-backdrop");
    var sheetOpen = document.getElementById("cat-sheet-open");
    var phone = window.matchMedia("(max-width: 860px)");

    var chosen = function () {
      var state = { substrate: [], finish: [], industry: [] };
      boxes.forEach(function (b) { if (b.checked) state[b.dataset.facet].push(b.value); });
      return state;
    };

    var matches = function (card, state, term) {
      if (term && card.dataset.search.indexOf(term) === -1) return false;
      for (var facet in state) {
        var picks = state[facet];
        if (!picks.length) continue;
        var have = (card.dataset[facet] || "").split("|");
        if (!picks.some(function (p) { return have.indexOf(p) !== -1; })) return false;
      }
      return true;
    };

    var apply = function () {
      var state = chosen();
      var term = (search && search.value || "").trim().toLowerCase();
      var shown = 0;

      cards.forEach(function (card) {
        var ok = matches(card, state, term);
        card.hidden = !ok;
        if (ok) shown++;
      });

      countEl.textContent = shown;
      countEl.parentNode.lastChild.textContent = shown === 1 ? " finish" : " finishes";
      emptyEl.hidden = shown !== 0;

      var picked = state.substrate.length + state.finish.length + state.industry.length;
      clearBtn.hidden = !(picked || term);
      if (badge) {
        badge.hidden = picked === 0;
        badge.textContent = picked;
      }

      triggers.forEach(function (btn) {
        var picks = state[btn.dataset.facet];
        var label = btn.querySelector(".cfdrop__label");
        if (!label.dataset.base) label.dataset.base = label.textContent;
        label.textContent = picks.length ? picks.join(", ") : label.dataset.base;
        btn.classList.toggle("is-set", picks.length > 0);
      });

      boxes.forEach(function (b) {
        if (b.checked) { b.parentNode.classList.remove("is-empty"); return; }
        var probe = chosen();
        probe[b.dataset.facet] = probe[b.dataset.facet].concat([b.value]);
        b.parentNode.classList.toggle("is-empty",
          !cards.some(function (c) { return matches(c, probe, term); }));
      });
    };

    var closeAll = function () {
      filterPanels.forEach(function (p) { p.hidden = true; });
      triggers.forEach(function (t) { t.setAttribute("aria-expanded", "false"); });
      panelWrap.classList.remove("is-open");
      if (filterRoot) filterRoot.classList.remove("is-sheet");
      if (sheetOpen) sheetOpen.setAttribute("aria-expanded", "false");
      if (backdrop) backdrop.hidden = true;
      document.body.classList.remove("menu-open");
    };

    var openSheet = function () {
      filterPanels.forEach(function (p) { p.hidden = false; p.style.maxHeight = ""; });
      panelWrap.classList.add("is-open");
      if (filterRoot) filterRoot.classList.add("is-sheet");
      if (sheetOpen) sheetOpen.setAttribute("aria-expanded", "true");
      if (backdrop) backdrop.hidden = false;
      document.body.classList.add("menu-open");
    };

    triggers.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        var wasOpen = !panel.hidden;
        closeAll();
        if (wasOpen) return;
        panel.hidden = false;
        // sit the panel under its own trigger, clamped inside the bar
        var left = btn.offsetLeft;
        var max = panelWrap.offsetWidth - panel.offsetWidth;
        panel.style.left = Math.max(0, Math.min(left, max)) + "px";
        // and never let it run past the fold: a long facet scrolls in place
        if (!phone.matches) {
          var room = window.innerHeight - panel.getBoundingClientRect().top - 24;
          panel.style.maxHeight = Math.max(200, Math.min(room, 420)) + "px";
        } else {
          panel.style.maxHeight = "";
        }
        btn.setAttribute("aria-expanded", "true");
      });
    });

    if (sheetOpen) {
      sheetOpen.addEventListener("click", function (e) {
        e.stopPropagation();
        if (panelWrap.classList.contains("is-open")) closeAll();
        else openSheet();
      });
    }

    panelWrap.addEventListener("click", function (e) { e.stopPropagation(); });
    document.querySelectorAll("[data-close-sheet]").forEach(function (b) {
      b.addEventListener("click", closeAll);
    });
    if (backdrop) backdrop.addEventListener("click", closeAll);
    document.addEventListener("click", closeAll);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });
    phone.addEventListener("change", closeAll);

    boxes.forEach(function (b) { b.addEventListener("change", apply); });
    if (search) search.addEventListener("input", apply);

    var clearAll = function () {
      boxes.forEach(function (b) { b.checked = false; });
      if (search) search.value = "";
      apply();
    };

    clearBtn.addEventListener("click", function (e) { e.stopPropagation(); clearAll(); });
    document.querySelectorAll("[data-clear-filters]").forEach(function (b) {
      b.addEventListener("click", function () { clearAll(); closeAll(); });
    });

    apply();
  }

  var revealEls = document.querySelectorAll("[data-reveal]");
  var stackPanels = document.querySelectorAll(".panel");

  if (hasIO && !reduced) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });

    // Panels reveal their content once roughly a third of the panel is in view.
    var panelObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          panelObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    stackPanels.forEach(function (el) { panelObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
    stackPanels.forEach(function (el) { el.classList.add("in"); });
  }

})();
