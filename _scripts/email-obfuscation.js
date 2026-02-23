(() => {
  function decodeReversed(value) {
    return String(value || "").split("").reverse().join("");
  }

  function initObfuscatedEmailLinks() {
    const links = document.querySelectorAll('a[data-email-obfuscated="true"][data-email-reversed]');
    links.forEach((link) => {
      const reversed = link.getAttribute("data-email-reversed");
      if (!reversed) return;
      const email = decodeReversed(reversed);
      if (!email || !email.includes("@")) return;
      link.setAttribute("href", `mailto:${email}`);
      if (!link.getAttribute("aria-label")) {
        link.setAttribute("aria-label", "Email");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initObfuscatedEmailLinks, { once: true });
  } else {
    initObfuscatedEmailLinks();
  }
})();
