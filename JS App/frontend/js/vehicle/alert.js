
export function showAlert(container, message, type = "info", autoHide = 3000) {
  if (!container) return;

  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  container.appendChild(alert);

  if (autoHide > 0) {
    setTimeout(() => {
      alert.remove();
    }, autoHide);
  }
}
