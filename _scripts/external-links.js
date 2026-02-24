/*
  If the site is embedded in a frame (e.g., custom wrapper domain), external
  links should navigate at top-level to avoid frame-blocked destinations.
*/

{
  const INTERNAL_HOSTS = new Set([
    "trose-neuro.github.io",
    "www.troselab.de",
    "troselab.de",
  ]);

  const isHttp = (url) => url.protocol === "http:" || url.protocol === "https:";

  const isInternal = (url) => {
    if (!isHttp(url)) return true;
    if (url.origin === window.location.origin) return true;

    const path = url.pathname || "/";
    if (url.hostname === "trose-neuro.github.io" && path.startsWith("/troselab-webpage/")) {
      return true;
    }

    return INTERNAL_HOSTS.has(url.hostname);
  };

  const addRel = (anchor) => {
    const rel = new Set((anchor.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
    rel.add("noopener");
    rel.add("noreferrer");
    anchor.setAttribute("rel", Array.from(rel).join(" "));
  };

  const normalizeExternalLinks = () => {
    const inFrame = window.top !== window.self;
    const anchors = document.querySelectorAll("a[href]");

    for (const anchor of anchors) {
      const rawHref = (anchor.getAttribute("href") || "").trim();
      if (!rawHref) continue;
      if (
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:") ||
        rawHref.startsWith("javascript:")
      ) {
        continue;
      }

      let url;
      try {
        url = new URL(rawHref, window.location.href);
      } catch {
        continue;
      }

      if (!isHttp(url) || isInternal(url)) continue;

      if (!anchor.hasAttribute("target")) {
        anchor.setAttribute("target", inFrame ? "_top" : "_blank");
      }

      if (anchor.getAttribute("target") === "_blank") {
        addRel(anchor);
      }
    }
  };

  window.addEventListener("load", normalizeExternalLinks);
  window.addEventListener("tagsfetched", normalizeExternalLinks);
}
