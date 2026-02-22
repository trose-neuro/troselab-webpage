(() => {
  const MODAL_ID = "image-lightbox";
  const DEFAULT_VIDEO_LOOP_SECONDS = 30;

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
        <video class="image-lightbox-video" controls preload="metadata" playsinline></video>
        <p class="image-lightbox-caption"></p>
      </div>
    `;
    document.body.appendChild(modal);
    const modalVideo = modal.querySelector(".image-lightbox-video");
    if (modalVideo) {
      modalVideo.addEventListener("timeupdate", () => {
        const loopSeconds = Number(modalVideo.dataset.maxSeconds || DEFAULT_VIDEO_LOOP_SECONDS);
        if (!Number.isFinite(loopSeconds) || loopSeconds <= 0) return;
        if (modalVideo.currentTime >= loopSeconds) {
          modalVideo.currentTime = 0;
          const playPromise = modalVideo.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        }
      });
    }
    return modal;
  }

  function clearModal(modal) {
    const modalImage = modal.querySelector(".image-lightbox-image");
    const modalVideo = modal.querySelector(".image-lightbox-video");
    const modalCaption = modal.querySelector(".image-lightbox-caption");

    if (modalImage) {
      modalImage.removeAttribute("src");
      modalImage.alt = "";
    }
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.removeAttribute("src");
      modalVideo.removeAttribute("poster");
      modalVideo.removeAttribute("data-max-seconds");
      modalVideo.load();
    }
    if (modalCaption) {
      modalCaption.textContent = "";
    }
    modal.removeAttribute("data-mode");
  }

  function setCaption(modal, caption) {
    const modalCaption = modal.querySelector(".image-lightbox-caption");
    if (!modalCaption) return;
    modalCaption.textContent = (caption || "").trim();
  }

  function closeModal(modal) {
    clearModal(modal);
    modal.removeAttribute("data-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
  }

  function openImageModal(src, alt, caption) {
    const modal = ensureModal();
    const modalImage = modal.querySelector(".image-lightbox-image");
    if (!modalImage) return;

    clearModal(modal);
    modalImage.src = src;
    modalImage.alt = alt || "Expanded image";
    setCaption(modal, caption || "");
    modal.dataset.mode = "image";
    modal.setAttribute("data-open", "true");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  }

  function openVideoModal(src, options = {}) {
    const modal = ensureModal();
    const modalVideo = modal.querySelector(".image-lightbox-video");
    if (!modalVideo || !src) return;

    clearModal(modal);
    modalVideo.src = src;
    if (options.poster) {
      modalVideo.poster = options.poster;
    }
    modalVideo.dataset.maxSeconds = String(
      Number(options.maxSeconds) > 0 ? Number(options.maxSeconds) : DEFAULT_VIDEO_LOOP_SECONDS
    );
    setCaption(modal, options.caption || "");
    modal.dataset.mode = "video";
    modal.setAttribute("data-open", "true");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");

    const playPromise = modalVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  function setupPreviewAutoplay() {
    const previews = Array.from(document.querySelectorAll('video[data-autoplay-preview="true"]'));
    if (!previews.length) return;

    const tryPlay = (video) => {
      if (!(video instanceof HTMLVideoElement) || document.hidden) return;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    previews.forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("autoplay", "");
      video.setAttribute("loop", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("disablepictureinpicture", "");
      video.setAttribute("disableremoteplayback", "");
      video.addEventListener("loadedmetadata", () => tryPlay(video), { passive: true });
      video.addEventListener("canplay", () => tryPlay(video), { passive: true });
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            if (!(video instanceof HTMLVideoElement)) return;
            if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
              tryPlay(video);
            } else {
              video.pause();
            }
          });
        },
        { threshold: [0, 0.25, 0.5] }
      );

      previews.forEach((video) => observer.observe(video));
    } else {
      previews.forEach((video) => tryPlay(video));
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) return;
      previews.forEach((video) => {
        const rect = video.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < window.innerHeight;
        if (visible) {
          tryPlay(video);
        }
      });
    });

    window.addEventListener("pageshow", () => {
      previews.forEach((video) => {
        const rect = video.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < window.innerHeight;
        if (visible) {
          tryPlay(video);
        }
      });
    });
  }

  setupPreviewAutoplay();

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

    const videoTrigger = target.closest("a.card-image[data-video-lightbox]");
    if (videoTrigger) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const src = videoTrigger.getAttribute("data-video-lightbox");
      if (!src) return;
      event.preventDefault();
      event.stopPropagation();
      openVideoModal(src, {
        caption: videoTrigger.getAttribute("data-video-caption"),
        poster: videoTrigger.getAttribute("data-video-poster"),
        maxSeconds: Number(videoTrigger.getAttribute("data-video-max-seconds"))
      });
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
    openImageModal(getHighResSource(image), image.getAttribute("alt"), "");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const modal = ensureModal();
    if (modal.getAttribute("data-open") === "true") {
      closeModal(modal);
    }
  });
})();
