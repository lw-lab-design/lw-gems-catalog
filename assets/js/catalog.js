(async () => {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;

  // optional: show error text in UI
  const showError = (msg) => {
    const p = document.createElement("p");
    p.className = "catalogError";
    p.textContent = msg;
    grid.insertAdjacentElement("beforebegin", p);
  };

  try {
    // IMPORTANT: relative path works in GitHub Pages subpaths
    const res = await fetch("assets/data/products.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`products.json not found (${res.status})`);

    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];

    if (!items.length) {
      showError("Catalog error: No items found in products.json.");
      return;
    }

    items.forEach((item) => {
      const href = item?.links?.ficheUrl || "#";
      const title = item?.title || "Untitled";
      const mediaDir = item?.mediaDir || "";
      const hero0 = item?.hero?.[0] || "";

      const card = document.createElement("a");
      card.className = "card";
      card.href = href;

      const img = document.createElement("img");
      img.src = mediaDir + hero0;
      img.alt = title;
      img.loading = "lazy";
      img.decoding = "async";

      const h3 = document.createElement("h3");
      h3.textContent = title;

      card.append(img, h3);
      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    showError("Catalog error: " + (err?.message || "Unknown error"));
  }
})();
