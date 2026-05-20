document.addEventListener('DOMContentLoaded', function() {
    var videos = document.querySelectorAll('video');
    
    videos.forEach(function(video) {
        video.addEventListener('loadeddata', function() {
            this.classList.add('loaded');
        });
        
        video.addEventListener('play', function() {
            videos.forEach(function(v) {
                if (v !== this && !v.paused) {
                    v.pause();
                }
            }.bind(this));
        });

        video.addEventListener('error', function() {
            var card = this.closest('.video-card') || this.closest('.video-item');
            var errorEl = card ? card.querySelector('.video-error') : null;
            if (errorEl) errorEl.classList.add('active');
        });

        video.addEventListener('canplay', function() {
            var card = this.closest('.video-card') || this.closest('.video-item');
            var loadingEl = card ? card.querySelector('.video-loading') : null;
            var errorEl = card ? card.querySelector('.video-error') : null;
            if (loadingEl) loadingEl.classList.remove('active');
            if (errorEl) errorEl.classList.remove('active');
        });
    });

    var observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    var scrollObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (entry.target.classList.contains('reveal-title')) {
                    var spans = entry.target.querySelectorAll('.reveal-span');
                    spans.forEach(function(span, i) {
                        setTimeout(function() {
                            span.style.transform = 'translateY(0)';
                        }, i * 80);
                    });
                    entry.target.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)';
                }
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll, .video-card, .video-item, .category-card, .bento-card').forEach(function(el) {
        scrollObserver.observe(el);
    });

    var statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var numbers = entry.target.querySelectorAll('.stat-number');
                numbers.forEach(function(num) {
                    var target = parseInt(num.getAttribute('data-target'));
                    if (!target || num.dataset.animated === 'true') return;
                    num.dataset.animated = 'true';
                    var duration = 1800;
                    var startTime = performance.now();
                    function step(currentTime) {
                        var elapsed = currentTime - startTime;
                        var progress = Math.min(elapsed / duration, 1);
                        var eased = 1 - Math.pow(1 - progress, 3);
                        var current = Math.round(eased * target);
                        num.textContent = current.toLocaleString();
                        if (progress < 1) requestAnimationFrame(step);
                    }
                    requestAnimationFrame(step);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    var statsCard = document.querySelector('.bento-stats');
    if (statsCard) statsObserver.observe(statsCard);

    var navbar = document.querySelector('.navbar');
    
    var navbarObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) {
                navbar.style.boxShadow = '0 2px 20px rgba(99, 102, 241, 0.08)';
            } else {
                navbar.style.boxShadow = '0 2px 10px rgba(99, 102, 241, 0.04)';
            }
        });
    }, { threshold: 0, rootMargin: '-100px 0px 0px 0px' });

    var heroSection = document.querySelector('.hero, .hero-section');
    if (heroSection) navbarObserver.observe(heroSection);

    if (typeof Lenis !== 'undefined') {
        var lenis = new Lenis({
            duration: 1.2,
            easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
            orientation: 'vertical',
            smoothWheel: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                var target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    lenis.scrollTo(target, { offset: -80, duration: 1.2 });
                }
            });
        });
    }

    var spotlightCards = document.querySelectorAll('.bento-card, .video-card');
    var throttledMouseMove = throttle(function(card, e) {
        var rect = card.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
        if (card.classList.contains('bento-card')) {
            var centerX = (e.clientX - rect.left) / rect.width - 0.5;
            var centerY = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.setProperty('--tilt-x', (centerY * -6) + 'deg');
            card.style.setProperty('--tilt-y', (centerX * 6) + 'deg');
        }
    }, 16);

    spotlightCards.forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
            throttledMouseMove(this, e);
        });
        card.addEventListener('mouseleave', function() {
            this.style.setProperty('--mouse-x', '50%');
            this.style.setProperty('--mouse-y', '50%');
            if (this.classList.contains('bento-card')) {
                this.style.setProperty('--tilt-x', '0deg');
                this.style.setProperty('--tilt-y', '0deg');
            }
        });
    });

    var magneticBtns = document.querySelectorAll('.cta-primary, .play-btn');
    var throttledMagneticMove = throttle(function(btn, e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        var strength = 12;
        btn.style.transform = 'translate3d(' + (x / rect.width) * strength + 'px, ' + (y / rect.height) * strength + 'px, 0)';
    }, 16);

    magneticBtns.forEach(function(btn) {
        btn.addEventListener('mousemove', function(e) {
            throttledMagneticMove(this, e);
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translate3d(0, 0, 0)';
            this.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });
        btn.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.15s ease-out';
        });
    });
});

function throttle(func, limit) {
    var inThrottle;
    return function() {
        var args = arguments;
        var context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(function() {
                inThrottle = false;
            }, limit);
        }
    };
}
