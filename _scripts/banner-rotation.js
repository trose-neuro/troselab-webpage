/*
  rotates homepage banner images every 4 seconds.
*/

{
  const ROTATE_MS = 4000;

  const onLoad = () => {
    const header = document.querySelector("header.background[data-banner-images]");
    if (!header) return;

    let banners;
    try {
      banners = JSON.parse(header.dataset.bannerImages || "[]");
    } catch {
      return;
    }

    if (!Array.isArray(banners) || banners.length < 2) return;

    let index = 0;

    const setBanner = (nextIndex) => {
      const image = banners[nextIndex];
      if (!image) return;
      header.style.setProperty("--image", `url("${image}")`);
    };

    // keep first frame deterministic (twitter banner first)
    setBanner(index);

    window.setInterval(() => {
      index = (index + 1) % banners.length;
      setBanner(index);
    }, ROTATE_MS);
  };

  window.addEventListener("load", onLoad);
}
