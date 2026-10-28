export const suppressHoldReleaseClick = () => {
  let armed = false;

  const swallow = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    cleanup();
  };

  const cleanup = () => {
    window.removeEventListener("click", swallow, true);
    window.removeEventListener("pointerdown", cleanup, true);
  };

  const arm = () => {
    if (armed) return;
    armed = true;
    window.removeEventListener("pointerup", arm, true);
    window.removeEventListener("pointercancel", arm, true);
    window.addEventListener("click", swallow, true);
    window.addEventListener("pointerdown", cleanup, true);
  };

  window.addEventListener("pointerup", arm, true);
  window.addEventListener("pointercancel", arm, true);
};
