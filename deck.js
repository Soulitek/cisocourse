/**
 * Slide Deck Navigation Controller
 * Handles keyboard navigation, URL hash routing, and progress tracking
 */

(function() {
    'use strict';

    // Get all slides
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let currentSlideIndex = 0;

    // Get UI elements
    const progressFill = document.querySelector('.progress-fill');
    const currentSlideSpan = document.getElementById('current-slide');
    const totalSlidesSpan = document.getElementById('total-slides');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    // Initialize
    function init() {
        // Set total slides counter
        totalSlidesSpan.textContent = totalSlides;

        // Load slide from URL hash if present
        const hash = window.location.hash;
        if (hash) {
            const slideId = hash.substring(1); // Remove '#'
            const slideIndex = Array.from(slides).findIndex(slide => slide.id === slideId);
            if (slideIndex !== -1) {
                currentSlideIndex = slideIndex;
            }
        }

        // Show initial slide
        showSlide(currentSlideIndex);

        // Set up event listeners
        setupEventListeners();

        // Update URL hash on load
        updateHash();
    }

    // Set up all event listeners
    function setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', handleKeyPress);

        // Button navigation
        if (prevBtn) {
            prevBtn.addEventListener('click', () => navigate(-1));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => navigate(1));
        }

        // Handle browser back/forward buttons
        window.addEventListener('hashchange', handleHashChange);

        // Touch gestures for mobile (optional)
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next slide
                    navigate(1);
                } else {
                    // Swipe right - previous slide
                    navigate(-1);
                }
            }
        }
    }

    // Handle keyboard presses
    function handleKeyPress(e) {
        // Ignore if user is typing in an input or textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                navigate(-1);
                break;

            case 'ArrowRight':
            case 'ArrowDown':
            case 'PageDown':
            case ' ': // Spacebar
                e.preventDefault();
                navigate(1);
                break;

            case 'Home':
                e.preventDefault();
                goToSlide(0);
                break;

            case 'End':
                e.preventDefault();
                goToSlide(totalSlides - 1);
                break;
        }
    }

    // Handle hash change (browser back/forward)
    function handleHashChange() {
        const hash = window.location.hash;
        if (hash) {
            const slideId = hash.substring(1);
            const slideIndex = Array.from(slides).findIndex(slide => slide.id === slideId);
            if (slideIndex !== -1 && slideIndex !== currentSlideIndex) {
                currentSlideIndex = slideIndex;
                showSlide(currentSlideIndex);
            }
        }
    }

    // Navigate to next/previous slide
    function navigate(direction) {
        const newIndex = currentSlideIndex + direction;
        if (newIndex >= 0 && newIndex < totalSlides) {
            goToSlide(newIndex);
        }
    }

    // Go to specific slide by index
    function goToSlide(index) {
        if (index >= 0 && index < totalSlides) {
            currentSlideIndex = index;
            showSlide(currentSlideIndex);
            updateHash();
        }
    }

    // Show slide and update UI
    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });

        // Show current slide
        if (slides[index]) {
            slides[index].classList.add('active');
            
            // Scroll to top of slide container
            slides[index].scrollTop = 0;
        }

        // Update progress bar
        updateProgress(index);

        // Update slide counter
        if (currentSlideSpan) {
            currentSlideSpan.textContent = index + 1;
        }

        // Update navigation buttons
        updateNavButtons(index);

        // Focus management for accessibility
        slides[index].focus();
    }

    // Update progress bar
    function updateProgress(index) {
        if (progressFill) {
            const percentage = ((index + 1) / totalSlides) * 100;
            progressFill.style.width = percentage + '%';
        }
    }

    // Update navigation buttons state
    function updateNavButtons(index) {
        if (prevBtn) {
            prevBtn.disabled = index === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = index === totalSlides - 1;
        }
    }

    // Update URL hash without triggering navigation
    function updateHash() {
        const slide = slides[currentSlideIndex];
        if (slide && slide.id) {
            // Use replaceState to avoid adding to history
            if (history.replaceState) {
                history.replaceState(null, null, '#' + slide.id);
            } else {
                // Fallback for older browsers
                window.location.hash = '#' + slide.id;
            }
        }
    }

    // Auto-close notes when navigating (optional)
    function closeAllNotes() {
        const notes = document.querySelectorAll('.notes[open]');
        notes.forEach(note => {
            note.removeAttribute('open');
        });
    }

    // Initialize on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose navigation functions globally for debugging (optional)
    window.deckNavigation = {
        goToSlide: goToSlide,
        next: () => navigate(1),
        prev: () => navigate(-1),
        current: () => currentSlideIndex,
        total: () => totalSlides
    };

})();