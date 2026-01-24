(async () => {
  const res = await fetch("/assets/data/products.json", { cache: "no-store" });
  const data = await res.json();

  const grid = document.getElementById("catalogGrid");
  if (!grid) return;

  data.items.forEach(item => {
    const card = document.createElement("a");
    card.className = "card";
    card.href = item.links.ficheUrl;

    const img = document.createElement("img");
    img.src = item.mediaDir + item.hero[0];
    img.alt = item.title;

    const h3 = document.createElement("h3");
    h3.textContent = item.title;

    card.append(img, h3);
    grid.appendChild(card);
  });
})();
