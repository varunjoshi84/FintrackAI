document.addEventListener("DOMContentLoaded", () => {
  console.log("🔷 GSAP loaded?", !!window.gsap);

  if (!window.gsap) return;

  gsap.from(".hero h2", { y: -30, opacity: 0, duration: 1 });
  gsap.from(".hero p", { y: 30, opacity: 0, duration: 1, delay: 0.3 });
  gsap.from(".upload-illustration", { x: -50, opacity: 0, duration: 1, delay: 0.6 });
  gsap.from(".upload-form-block", { x: 50, opacity: 0, duration: 1, delay: 0.6 });

  const previewObserver = new MutationObserver(() => {
    gsap.fromTo("#previewSection", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });
  });
  previewObserver.observe(document.getElementById("previewSection"), { attributes: true, attributeFilter: ["style"] });

  const downloadObserver = new MutationObserver(() => {
    gsap.fromTo("#downloadSection", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });
  });
  downloadObserver.observe(document.getElementById("downloadSection"), { attributes: true, attributeFilter: ["style"] });
});
