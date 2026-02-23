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

  const ensureMeta = (name, attrs = {}) => {
    const selector = `meta[name="${name}"]${
      attrs.media ? `[media="${attrs.media}"]` : ":not([media])"
    }`;
    let meta = document.querySelector(selector);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", name);
      if (attrs.media) {
        meta.setAttribute("media", attrs.media);
      }
      const head = document.head || document.querySelector("head");
      if (head) {
        head.appendChild(meta);
      }
    }
    return meta;
  };

  const applyMode = (isDark) => {
    document.documentElement.dataset.dark = isDark ? "true" : "false";
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";

    const computedBackground =
      window.getComputedStyle(document.documentElement).getPropertyValue("--background").trim() ||
      (isDark ? "#0d131b" : "#edf2f7");
    const themeColor = computedBackground;
    ensureMeta("theme-color", { media: "(prefers-color-scheme: dark)" });
    ensureMeta("theme-color", { media: "(prefers-color-scheme: light)" });
    ensureMeta("theme-color");

    const themeColorMetas = document.querySelectorAll('meta[name="theme-color"]');
    themeColorMetas.forEach((meta) => meta.setAttribute("content", themeColor));
    const colorSchemeMeta =
      document.querySelector('meta[name="color-scheme"]') || ensureMeta("color-scheme");
    if (colorSchemeMeta) {
      colorSchemeMeta.setAttribute("content", isDark ? "dark" : "light");
    }
    const supportedSchemesMeta =
      document.querySelector('meta[name="supported-color-schemes"]') ||
      ensureMeta("supported-color-schemes");
    if (supportedSchemesMeta) {
      supportedSchemesMeta.setAttribute("content", "dark light");
    }

    if (document.body) {
      document.body.style.backgroundColor = themeColor;
    }
    document.documentElement.style.backgroundColor = themeColor;

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
