(async () => {
  const status = document.getElementById("catalogStatus");
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;

  try {
    // Ruta RELATIVA (clave en GitHub Pages)
    const url = new URL("assets/data/products.json", window.location.href);
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`products.json not found (${res.status})`);

    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];

    if (!items.length) {
      if (status) status.textContent = "No items found in products.json.";
      return;
    }

    const frag = document.createDocumentFragment();

    items.forEach((item) => {
      const ficheUrl = item?.links?.ficheUrl;
      const mediaDir = item?.mediaDir || "";
      const hero0 = item?.hero?.[0] || "";
      const title = item?.title || "Untitled";

      const card = document.createElement("a");
      card.className = "card";
      card.href = ficheUrl || "#";

      const img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.alt = title;
      img.src = mediaDir + hero0;

      const h3 = document.createElement("h3");
      h3.textContent = title;

      card.append(img, h3);
      frag.appendChild(card);
    });

    grid.innerHTML = "";
    grid.appendChild(frag);
    if (status) status.textContent = "";

  } catch (err) {
    console.error(err);
    if (status) status.textContent = `Catalog error: ${err.message}`;
  }
})();
