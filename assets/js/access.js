(() => {
  // Simple access gate (curation-level, not bank-grade security)
  const ok = sessionStorage.getItem("lw_access") === "ok";
  if (!ok) {
    // Preserve target for after login (optional)
    const target = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
    window.location.replace(`/lw-gems-catalog/index.html#t=${target}`);
  }
})();
