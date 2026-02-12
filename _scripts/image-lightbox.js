(() => {
  const MODAL_ID = "image-lightbox";

  function parseBestSrc(srcset) {
    if (!srcset) return null;

    const candidates = srcset
      .split(",")
      .map((entry) => entry.trim())
      .map((entry) => {
        const parts = entry.split(/\s+/);
        const url = parts[0];
        const width = Number((parts[1] || "").replace("w", "")) || 0;
        return { url, width };
      })
      .filter((candidate) => candidate.url);

    if (!candidates.length) return null;

    candidates.sort((a, b) => b.width - a.width);
    return candidates[0].url;
  }

  function getHighResSource(image) {
    const explicit = image.getAttribute("data-highres");
    if (explicit) {
      return explicit;
    }

    const picture = image.closest("picture");
    const jpgSource = picture?.querySelector('source[type="image/jpeg"]');
    const webpSource = picture?.querySelector('source[type="image/webp"]');
    const bestSrcset = parseBestSrc(
      jpgSource?.getAttribute("srcset") || webpSource?.getAttribute("srcset")
    );

    return bestSrcset || image.currentSrc || image.src;
  }

  function ensureModal() {
    const existing = document.getElementById(MODAL_ID);
    if (existing) return existing;

    const modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.className = "image-lightbox";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <button class="image-lightbox-close" type="button" aria-label="Close image">×</button>
      <div class="image-lightbox-backdrop"></div>
      <div class="image-lightbox-content">
        <img class="image-lightbox-image" alt="">
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  function closeModal(modal) {
    modal.removeAttribute("data-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
  }

  function openModal(src, alt) {
    const modal = ensureModal();
    const modalImage = modal.querySelector(".image-lightbox-image");
    if (!modalImage) return;

    modalImage.src = src;
    modalImage.alt = alt || "Expanded image";
    modal.setAttribute("data-open", "true");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const modal = ensureModal();
    const clickedClose =
      target.closest(".image-lightbox-close") || target.closest(".image-lightbox-backdrop");
    if (clickedClose) {
      closeModal(modal);
      return;
    }

    let image = target.closest("img.portrait-image");
    let isZoomTarget = Boolean(image && image.closest("a.portrait"));

    if (!isZoomTarget) {
      const figureImage = target.closest(".figure-image img");
      const figureLink = figureImage?.closest("a.figure-image");
      if (figureImage && figureLink && !figureLink.hasAttribute("href")) {
        image = figureImage;
        isZoomTarget = true;
      }
    }

    if (!isZoomTarget || !image) return;

    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    openModal(getHighResSource(image), image.getAttribute("alt"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const modal = ensureModal();
    if (modal.getAttribute("data-open") === "true") {
      closeModal(modal);
    }
  });
})();
