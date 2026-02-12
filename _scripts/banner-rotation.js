/*
  Rotates homepage banner images every 10 seconds with a gentle crossfade.
*/

{
  const ROTATE_MS = 10000;
  const FADE_MS = 1700;

  const makeLayer = () => {
    const layer = document.createElement("div");
    layer.className = "banner-rotator-layer";
    layer.dataset.active = "false";
    return layer;
  };

  const parseBanners = (target) => {
    try {
      const banners = JSON.parse(target.dataset.bannerImages || "[]");
      return Array.isArray(banners) ? banners.filter(Boolean) : [];
    } catch {
      return [];
    }
  };

  const setupBannerRotation = (target) => {
    const banners = parseBanners(target);
    if (banners.length < 2) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const rotator = document.createElement("div");
    rotator.className = "banner-rotator";
    rotator.setAttribute("aria-hidden", "true");

    const front = makeLayer();
    const back = makeLayer();
    rotator.append(front, back);
    target.prepend(rotator);

    let currentLayer = front;
    let nextLayer = back;
    let index = 0;

    // Keep first frame deterministic (twitter banner first).
    currentLayer.style.backgroundImage = `url("${banners[index]}")`;
    currentLayer.dataset.active = "true";
    target.style.setProperty("--image", `url("${banners[index]}")`);
    target.dataset.rotating = "true";

    const advance = () => {
      const nextIndex = (index + 1) % banners.length;
      const nextImage = banners[nextIndex];
      if (!nextImage) return;

      nextLayer.style.backgroundImage = `url("${nextImage}")`;
      window.requestAnimationFrame(() => {
        nextLayer.dataset.active = "true";
        currentLayer.dataset.active = "false";
      });

      window.setTimeout(() => {
        target.style.setProperty("--image", `url("${nextImage}")`);
        index = nextIndex;
        const swap = currentLayer;
        currentLayer = nextLayer;
        nextLayer = swap;
      }, FADE_MS);
    };

    window.setInterval(advance, ROTATE_MS);
  };

  const onLoad = () => {
    const targets = document.querySelectorAll(".background[data-banner-images]");
    targets.forEach(setupBannerRotation);
  };

  window.addEventListener("load", onLoad);
}
