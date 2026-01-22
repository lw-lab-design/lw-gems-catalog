(() => {
  // Works on GitHub Pages project sites (e.g. /lw-gems-catalog/)
  const parts = (location.pathname || "/").split("/").filter(Boolean);
  const base = parts.length ? `/${parts[0]}/` : "/";

  const path = (location.pathname || "").toLowerCase();
  const isProtected =
    path.endsWith("/catalog.html") ||
    path.includes("/p/");

  if (!isProtected) return;

  const ok = sessionStorage.getItem("lw_access") === "ok";
  if (!ok) {
    location.replace(base + "index.html");
  }
})();
