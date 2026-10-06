/* slides.js - Presentation navigation and functionality */

class SlidePresentation {
  constructor() {
    this.currentSlide = 0;
    this.slides = document.querySelectorAll('.slide');
    this.totalSlides = this.slides.length;
    this.isTransitioning = false; // Prevent rapid slide changes

    this.init();
  }

  init() {
    // Set up event listeners
    this.setupKeyboardNavigation();
    this.setupTouchNavigation();
    this.setupClickNavigation();
    this.setupFullscreen(); // This was missing

    // Show first slide or from hash
    if (window.location.hash) {
      this.goToSlideFromHash();
    } else {
      this.showSlide(0);
    }

    // Add progress bar
    this.createProgressBar();
  }

  showSlide(index) {
    // Validate index
    if (index < 0 || index >= this.totalSlides) return;

    // Prevent rapid transitions
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Get previous and next slides for animation
    const previousSlide = this.slides[this.currentSlide];
    const nextSlide = this.slides[index];

    // Hide all slides
    this.slides.forEach(slide => {
      slide.classList.remove('active', 'exiting');
    });

    // Add exit animation to previous slide
    if (previousSlide && previousSlide !== nextSlide) {
      previousSlide.classList.add('exiting');
    }

    // Show current slide
    nextSlide.classList.add('active');
    this.currentSlide = index;

    // Update UI elements
    this.updateProgressBar();

    // Update URL hash
    window.location.hash = `slide-${index + 1}`;

    // Reset transition flag
    setTimeout(() => {
      this.isTransitioning = false;
      if (previousSlide) {
        previousSlide.classList.remove('exiting');
      }
    }, 300);
  }

  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.showSlide(this.currentSlide + 1);
    } else {
      // Optional: Loop back to first slide
      // this.showSlide(0);
    }
  }

  previousSlide() {
    if (this.currentSlide > 0) {
      this.showSlide(this.currentSlide - 1);
    } else {
      // Optional: Loop to last slide
      // this.showSlide(this.totalSlides - 1);
    }
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Ignore if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':  // Spacebar
        case 'PageDown':
          e.preventDefault();
          this.nextSlide();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          this.previousSlide();
          break;
        case 'Home':
          e.preventDefault();
          this.showSlide(0);
          break;
        case 'End':
          e.preventDefault();
          this.showSlide(this.totalSlides - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          this.toggleFullscreen();
          break;
        case 'Escape':
          // Exit fullscreen on Escape
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
        default:
          // Number keys 1-9
          if (e.key >= '1' && e.key <= '9') {
            const slideIndex = parseInt(e.key) - 1;
            if (slideIndex < this.totalSlides) {
              this.showSlide(slideIndex);
            }
          }
      }
    });
  }

  setupTouchNavigation() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;
      this.handleSwipe();
    }, { passive: true });

    this.handleSwipe = () => {
      const swipeThreshold = 50;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Only handle horizontal swipes
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
        if (diffX > 0) {
          this.nextSlide(); // Swipe left
        } else {
          this.previousSlide(); // Swipe right
        }
      }
    };
  }

  setupClickNavigation() {
    document.addEventListener('click', (e) => {
      // Ignore clicks on links or buttons
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;

      // Ignore if clicking on interactive elements
      if (e.target.closest('a, button, input, textarea, select')) return;

      const clickX = e.clientX;
      const screenWidth = window.innerWidth;

      // Click on right 40% advances
      if (clickX > screenWidth * 0.6) {
        this.nextSlide();
      }
      // Click on left 40% goes back
      else if (clickX < screenWidth * 0.4) {
        this.previousSlide();
      }
    });
  }

  setupFullscreen() {
    // Check if fullscreen is supported
    if (!document.fullscreenEnabled) return;

    // Add fullscreen button (optional)
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'fullscreen-btn';
    fullscreenBtn.innerHTML = '⛶';
    fullscreenBtn.setAttribute('aria-label', 'Toggle fullscreen');
    fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    document.body.appendChild(fullscreenBtn);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  createProgressBar() {
    if (!document.querySelector('.progress-bar')) {
      const progressBar = document.createElement('div');
      progressBar.className = 'progress-bar';
      document.body.appendChild(progressBar);
    }
  }

  updateProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }

  goToSlideFromHash() {
    const hash = window.location.hash;
    if (hash) {
      const slideNumber = parseInt(hash.replace('#slide-', ''));
      if (!isNaN(slideNumber) && slideNumber > 0 && slideNumber <= this.totalSlides) {
        this.showSlide(slideNumber - 1);
      }
    }
  }

  // Preload images for smoother transitions
  preloadImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.dataset.src) {
        const preloadImg = new Image();
        preloadImg.src = img.dataset.src;
        preloadImg.onload = () => {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        };
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const presentation = new SlidePresentation();

  // Handle direct linking to slides
  window.addEventListener('hashchange', () => {
    presentation.goToSlideFromHash();
  });

  // Preload images
  presentation.preloadImages();
});

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SlidePresentation;
}
