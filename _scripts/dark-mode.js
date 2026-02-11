/*
  manages light/dark mode.
*/

{
  const STORAGE_KEY = "dark-mode";
  const MEDIA_QUERY = "(prefers-color-scheme: dark)";
  const media = window.matchMedia(MEDIA_QUERY);

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

    const toggle = document.querySelector(".dark-toggle");
    if (toggle) {
      toggle.checked = isDark;
    }
  };

  const hasManualPreference = () => getSavedMode() !== null;

  // immediately apply saved mode, otherwise use system/browser preference
  const saved = getSavedMode();
  applyMode(saved === null ? media.matches : saved === "true");

  const onLoad = () => {
    // ensure toggle stays in sync after initial render
    applyMode(document.documentElement.dataset.dark === "true");
  };

  // after page loads
  window.addEventListener("load", onLoad);

  // follow live system changes unless user has chosen manually
  const onSystemModeChange = (event) => {
    if (!hasManualPreference()) {
      applyMode(event.matches);
    }
  };
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", onSystemModeChange);
  } else if (typeof media.addListener === "function") {
    media.addListener(onSystemModeChange);
  }

  // when user toggles mode button
  window.onDarkToggleChange = (event) => {
    const value = event.target.checked;
    applyMode(value);
    saveMode(String(value));
  };
}
