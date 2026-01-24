(async () => {
  try {
    // IMPORTANT: relative URL so it works on GitHub Pages project path (/lw-gems-catalog/)
    const res = await fetch("assets/data/products.json", { cache: "no-store" });
    if (!res.ok) throw new Error("products.json not found");

    const data = await res.json();
    const grid = document.getElementById("catalogGrid");
    if (!grid) return;

    (data.items || []).forEach((item) => {
      const card = document.createElement("a");
      card.className = "card";
      card.href = item?.links?.ficheUrl || "#";

      const img = document.createElement("img");
      const dir = item?.mediaDir || "";
      const hero0 = item?.hero?.[0] || "";
      img.src = dir + hero0;
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
  }
})();
