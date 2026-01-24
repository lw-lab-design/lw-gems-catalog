// assets/js/catalog.js
(() => {
  function getBasePath() {
    // /lw-gems-catalog/catalog.html  ->  /lw-gems-catalog/
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
    if (!grid) return;

    const msg = document.getElementById("catalogMsg");

    try {
      // IMPORTANTE: NO usar "/assets/..." (ruta absoluta)
      const url = join(base, "assets/data/products.json");
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`products.json not found (${res.status}) @ ${url}`);

      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : [];

      if (!items.length) {
        if (msg) {
          msg.textContent = "No items found in products.json.";
          msg.hidden = false;
        }
        return;
      }

      grid.innerHTML = "";

      items.forEach((item) => {
        const ficheRel = item?.links?.ficheUrl || "#";
        const imgRel =
          (item?.mediaDir || "") + (item?.hero?.[0] || "");

        const card = document.createElement("a");
        card.className = "card";
        card.href = ficheRel.startsWith("http") ? ficheRel : join(base, ficheRel);

        const img = document.createElement("img");
        img.src = imgRel.startsWith("http") ? imgRel : join(base, imgRel);
        img.alt = item?.title || "Catalog item";
        img.loading = "lazy";
        img.decoding = "async";

        const h3 = document.createElement("h3");
        h3.textContent = item?.title || "Untitled";

        card.append(img, h3);
        grid.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      if (msg) {
        msg.textContent = "Catalog failed to load (products.json path). Check console.";
        msg.hidden = false;
      }
    }
  }

  // Por si el script no está deferido en algún momento
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
