// assets/js/catalog.js
(() => {
  function getBasePath() {
    // /lw-gems-catalog/catalog.html -> /lw-gems-catalog/
    const parts = (location.pathname || "/").split("/").filter(Boolean);
    return parts.length ? `/${parts[0]}/` : "/";
  }

  function join(base, path) {
    const b = String(base || "/").replace(/\/+$/, "/");
    const p = String(path || "").replace(/^\/+/, "");
    return b + p;
  }

  async function run() {
    const base = getBasePath();
    const grid = document.getElementById("catalogGrid");
    const msg = document.getElementById("catalogMsg");

    if (!grid) return;

    try {
      // NUNCA "/assets/..." en GitHub Pages project sites
      const url = join(base, "assets/data/products.json");
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`Fetch failed ${res.status}: ${url}`);
      }

      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : [];

      if (!items.length) {
        if (msg) msg.textContent = "products.json loaded, but items[] is empty.";
        return;
      }

      grid.innerHTML = "";

      items.forEach((item) => {
        const title = item?.title || "Untitled";
        const ficheRel = item?.links?.ficheUrl || "#";
        const mediaDir = item?.mediaDir || "";
        const hero0 = item?.hero?.[0] || "";

        const card = document.createElement("a");
        card.className = "card";
        card.href = ficheRel.startsWith("http") ? ficheRel : join(base, ficheRel);

        const img = document.createElement("img");
        const imgRel = mediaDir + hero0;
        img.src = imgRel.startsWith("http") ? imgRel : join(base, imgRel);
        img.alt = title;
        img.loading = "lazy";
        img.decoding = "async";

        const h3 = document.createElement("h3");
        h3.textContent = title;

        card.append(img, h3);
        grid.appendChild(card);
      });

      if (msg) msg.textContent = `Loaded ${items.length} items.`;
    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = `Catalog error: ${err.message}`;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
