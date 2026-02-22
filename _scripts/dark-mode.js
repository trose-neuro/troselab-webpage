/*
  manages light/dark mode.
*/

{
  const STORAGE_KEY = "dark-mode";
  const DEFAULT_DARK = true;

  const getSavedMode = () => {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const saveMode = (value) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore storage errors and keep in-memory behavior only
    }
  };

  const applyMode = (isDark) => {
    document.documentElement.dataset.dark = isDark ? "true" : "false";

    const themeColor = isDark ? "#0d131b" : "#edf2f7";
    const themeColorMetas = document.querySelectorAll('meta[name="theme-color"]');
    themeColorMetas.forEach((meta) => meta.setAttribute("content", themeColor));

    const toggle = document.querySelector(".dark-toggle");
    if (toggle) {
      toggle.checked = isDark;
    }
  };

  // immediately apply saved mode, otherwise default to dark mode
  const saved = getSavedMode();
  applyMode(saved === null ? DEFAULT_DARK : saved === "true");

  const onLoad = () => {
    // ensure toggle stays in sync after initial render
    applyMode(document.documentElement.dataset.dark === "true");
  };

  // after page loads
  window.addEventListener("load", onLoad);

  // when user toggles mode button
  window.onDarkToggleChange = (event) => {
    const value = event.target.checked;
    applyMode(value);
    saveMode(String(value));
  };
}
