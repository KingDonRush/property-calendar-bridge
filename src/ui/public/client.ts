export const MOBILE_JS = `
class SwipeDetector {
  constructor(element, onSwipe) {
    this.startX = 0;
    this.startY = 0;
    this.element = element;
    this.onSwipe = onSwipe;
    this.threshold = 50; // min distance

    this.element.addEventListener('touchstart', this.handleStart.bind(this), { passive: true });
    this.element.addEventListener('touchend', this.handleEnd.bind(this));
  }

  handleStart(e) {
    this.startX = e.changedTouches[0].screenX;
    this.startY = e.changedTouches[0].screenY;
  }

  handleEnd(e) {
    const endX = e.changedTouches[0].screenX;
    const endY = e.changedTouches[0].screenY;

    const diffX = endX - this.startX;
    const diffY = endY - this.startY;

    // Check if horizontal swipe dominates vertical movement
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.threshold) {
      if (diffX > 0) {
        this.onSwipe('right');
      } else {
        this.onSwipe('left');
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  const toggleBtn = document.getElementById('mobile-menu-toggle');

  function openMenu() {
    nav.classList.add('open');
  }

  function closeMenu() {
    nav.classList.remove('open');
  }

  // Toggle button click
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      nav.classList.contains('open') ? closeMenu() : openMenu();
    });
  }

  // Gestures on body
  new SwipeDetector(document.body, (direction) => {
    if (direction === 'right') {
      openMenu();
    } else if (direction === 'left') {
      closeMenu();
    }
  });

  // Close when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') &&
        !nav.contains(e.target) &&
        !toggleBtn.contains(e.target)) {
      closeMenu();
    }
  });
});
`;
