(function () {
  "use strict";

  const body = document.body;
  const topbar = document.querySelector(".topbar");

  const selectors = {
    langSwitcher: "[data-lang-switcher]",
    langToggle: "[data-lang-toggle]",
    langMenu: "[data-lang-menu]",
    burger: "[data-burger]",
    drawer: "[data-drawer]",
    drawerBackdrop: "[data-drawer-backdrop]",
    drawerClose: "[data-drawer-close]",
    privacyOpen: "[data-privacy-open]",
    privacyModal: "[data-privacy-modal]",
    privacyOverlay: "[data-privacy-overlay]",
    privacyClose: "[data-privacy-close]",
    faqItem: ".faq-item",
    faqQuestion: ".faq-question",
    reveal: ".reveal",
    forms: "[data-lead-form]"
  };

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  function setAriaExpanded(el, state) {
    if (!el) return;
    el.setAttribute("aria-expanded", String(Boolean(state)));
  }

  function lockScroll() {
    body.classList.add("lock-scroll");
  }

  function unlockScroll() {
    if (!isDrawerOpen() && !isModalOpen()) {
      body.classList.remove("lock-scroll");
    }
  }

  function isDrawerOpen() {
    const drawer = qs(selectors.drawer);
    return drawer ? drawer.classList.contains("open") : false;
  }

  function isModalOpen() {
    const modal = qs(selectors.privacyModal);
    return modal ? modal.classList.contains("open") : false;
  }

  function closeLangMenus(except) {
    qsa(selectors.langSwitcher).forEach((switcher) => {
      if (except && switcher === except) return;
      switcher.classList.remove("open");
      setAriaExpanded(qs(selectors.langToggle, switcher), false);
    });
  }

  function initLanguageMenus() {
    qsa(selectors.langSwitcher).forEach((switcher) => {
      const toggle = qs(selectors.langToggle, switcher);
      const menu = qs(selectors.langMenu, switcher);
      if (!toggle || !menu) return;

      toggle.addEventListener("click", function (event) {
        event.stopPropagation();
        const willOpen = !switcher.classList.contains("open");
        closeLangMenus(switcher);
        switcher.classList.toggle("open", willOpen);
        setAriaExpanded(toggle, willOpen);
      });

      menu.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          switcher.classList.remove("open");
          setAriaExpanded(toggle, false);
          toggle.focus();
        }
      });
    });

    document.addEventListener("click", function () {
      closeLangMenus();
    });
  }

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  let trapContext = null;

  function activateFocusTrap(container) {
    if (!container) return;
    const focusables = qsa(focusableSelector, container).filter((el) => {
      return el.offsetParent !== null || getComputedStyle(el).position === "fixed";
    });
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    trapContext = { container, first, last, previous: document.activeElement };

    container.addEventListener("keydown", trapHandler);
    first.focus();
  }

  function deactivateFocusTrap() {
    if (!trapContext) return;
    trapContext.container.removeEventListener("keydown", trapHandler);
    if (trapContext.previous && typeof trapContext.previous.focus === "function") {
      trapContext.previous.focus();
    }
    trapContext = null;
  }

  function trapHandler(event) {
    if (!trapContext) return;
    if (event.key !== "Tab") return;

    const active = document.activeElement;
    if (event.shiftKey && active === trapContext.first) {
      event.preventDefault();
      trapContext.last.focus();
      return;
    }

    if (!event.shiftKey && active === trapContext.last) {
      event.preventDefault();
      trapContext.first.focus();
    }
  }

  function initDrawer() {
    const burger = qs(selectors.burger);
    const drawer = qs(selectors.drawer);
    const backdrop = qs(selectors.drawerBackdrop, drawer || document);
    const closeBtn = qs(selectors.drawerClose, drawer || document);

    if (!burger || !drawer || !backdrop || !closeBtn) return;

    function openDrawer() {
      drawer.classList.add("open");
      burger.setAttribute("aria-expanded", "true");
      lockScroll();
      activateFocusTrap(drawer);
    }

    function closeDrawer() {
      drawer.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      deactivateFocusTrap();
      unlockScroll();
    }

    burger.addEventListener("click", openDrawer);
    backdrop.addEventListener("click", closeDrawer);
    closeBtn.addEventListener("click", closeDrawer);

    qsa("a", drawer).forEach((link) => {
      link.addEventListener("click", closeDrawer);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && drawer.classList.contains("open")) {
        closeDrawer();
      }
    });
  }

  function initPrivacyModal() {
    const modal = qs(selectors.privacyModal);
    const overlay = qs(selectors.privacyOverlay, modal || document);
    const closers = qsa(selectors.privacyClose, modal || document);
    const openers = qsa(selectors.privacyOpen);

    if (!modal || !overlay || !openers.length) return;

    function openModal(event) {
      if (event) event.preventDefault();
      modal.classList.add("open");
      lockScroll();
      activateFocusTrap(modal);
    }

    function closeModal() {
      modal.classList.remove("open");
      deactivateFocusTrap();
      unlockScroll();
    }

    openers.forEach((opener) => opener.addEventListener("click", openModal));
    overlay.addEventListener("click", closeModal);
    closers.forEach((el) => el.addEventListener("click", closeModal));

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.classList.contains("open")) {
        closeModal();
      }
    });
  }

  function initFaq() {
    const items = qsa(selectors.faqItem);
    if (!items.length) return;

    items.forEach((item, index) => {
      const question = qs(selectors.faqQuestion, item);
      if (!question) return;

      if (index === 0) {
        item.classList.add("active");
        setAriaExpanded(question, true);
      } else {
        setAriaExpanded(question, false);
      }

      question.addEventListener("click", function () {
        const currentlyActive = item.classList.contains("active");

        items.forEach((other) => {
          other.classList.remove("active");
          setAriaExpanded(qs(selectors.faqQuestion, other), false);
        });

        if (!currentlyActive) {
          item.classList.add("active");
          setAriaExpanded(question, true);
        }
      });
    });
  }

  function initRevealAnimations() {
    const elements = qsa(selectors.reveal);
    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((element) => observer.observe(element));
  }

  function initFormValidation() {
    const forms = qsa(selectors.forms);
    if (!forms.length) return;

    forms.forEach((form) => {
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        const nameInput = qs("input[name='name']", form);
        const emailInput = qs("input[name='email']", form);
        const phoneInput = qs("input[name='phone']", form);

        let valid = true;

        [nameInput, emailInput, phoneInput].forEach((input) => {
          if (!input) return;
          if (!input.value.trim()) {
            input.setAttribute("aria-invalid", "true");
            valid = false;
          } else {
            input.removeAttribute("aria-invalid");
          }
        });

        const emailValue = emailInput ? emailInput.value.trim() : "";
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput && emailValue && !emailPattern.test(emailValue)) {
          emailInput.setAttribute("aria-invalid", "true");
          valid = false;
        }

        if (!valid) {
          const firstInvalid = qs("[aria-invalid='true']", form);
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        form.reset();
        const note = qs("[data-form-note]", form);
        if (note) {
          note.hidden = false;
          setTimeout(() => {
            note.hidden = true;
          }, 4200);
        }
      });
    });
  }

  function initTopbarShadow() {
    if (!topbar) return;
    function updateShadow() {
      if (window.scrollY > 16) {
        topbar.style.boxShadow = "0 10px 20px rgba(24, 32, 40, 0.12)";
      } else {
        topbar.style.boxShadow = "none";
      }
    }
    updateShadow();
    window.addEventListener("scroll", updateShadow, { passive: true });
  }

  function init() {
    initLanguageMenus();
    initDrawer();
    initPrivacyModal();
    initFaq();
    initRevealAnimations();
    initFormValidation();
    initTopbarShadow();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
