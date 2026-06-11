(() => {
  const KEY = "sgteam_skins_scroll_y";
  const FLAG = "sgteam_skins_should_restore_scroll";

  function shouldRestore() {
    return sessionStorage.getItem(FLAG) === "1";
  }

  function saveScroll() {
    sessionStorage.setItem(KEY, String(window.scrollY || window.pageYOffset || 0));
    sessionStorage.setItem(FLAG, "1");
  }

  function getSavedY() {
    const y = Number(sessionStorage.getItem(KEY) || 0);
    return Number.isFinite(y) ? y : 0;
  }

  function jumpToSaved() {
    window.scrollTo(0, getSavedY());
  }

  function revealPage() {
    document.documentElement.classList.remove("sg-scroll-restoring");
    const style = document.getElementById("sg-scroll-restore-style");
    if (style) style.remove();
  }

  function restoreScroll() {
    if (!shouldRestore()) {
      revealPage();
      return;
    }

    jumpToSaved();

    requestAnimationFrame(() => {
      jumpToSaved();
      revealPage();
    });

    setTimeout(jumpToSaved, 80);
    setTimeout(jumpToSaved, 220);
    setTimeout(jumpToSaved, 500);

    setTimeout(() => {
      jumpToSaved();
      sessionStorage.removeItem(FLAG);
    }, 800);
  }

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target && target.matches && target.matches('select[name="forma"]')) {
      saveScroll();
    }
  }, true);

  document.addEventListener("submit", () => {
    saveScroll();
  }, true);

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!target || !target.matches) return;

    if (target.matches('button[type="submit"], input[type="submit"], .modal-footer .btn, .card-footer .btn')) {
      saveScroll();
    }
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", restoreScroll);
  } else {
    restoreScroll();
  }

  window.addEventListener("load", restoreScroll);
})();
