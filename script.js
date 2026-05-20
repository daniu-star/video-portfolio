document.addEventListener('DOMContentLoaded', function() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        video.addEventListener('loadeddata', function() {
            this.classList.add('loaded');
        });
        
        video.addEventListener('play', function() {
            videos.forEach(v => {
                if (v !== this && !v.paused) {
                    v.pause();
                }
            });
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

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        const visibleEntries = entries.filter(e => e.isIntersecting);
        visibleEntries.forEach((entry, index) => {
            entry.target.style.transitionDelay = (index * 100) + 'ms';
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) scale(1)';
            if (entry.target.classList.contains('reveal-title')) {
                const spans = entry.target.querySelectorAll('.reveal-span');
                spans.forEach((span, i) => {
                    span.style.transitionDelay = (i * 80) + 'ms';
                    span.style.transform = 'translateY(0)';
                });
                entry.target.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.video-card, .video-item, .category-card, .bento-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px) scale(0.95)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        observer.observe(el);
    });

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const numbers = entry.target.querySelectorAll('.stat-number');
                numbers.forEach(num => {
                    const target = parseInt(num.getAttribute('data-target'));
                    if (!target || num.dataset.animated === 'true') return;
                    num.dataset.animated = 'true';
                    const duration = 1800;
                    const startTime = performance.now();
                    function step(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.round(eased * target);
                        num.textContent = current.toLocaleString();
                        if (progress < 1) requestAnimationFrame(step);
                    }
                    requestAnimationFrame(step);
                });
                const bars = entry.target.querySelectorAll('.stat-bar-fill');
                bars.forEach(bar => {
                    if (!bar.classList.contains('animated')) {
                        bar.classList.add('animated');
                    }
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    const statsCard = document.querySelector('.bento-stats');
    if (statsCard) statsObserver.observe(statsCard);

    const navbar = document.querySelector('.navbar');

    const lenis = new Lenis({
        duration: 1.2,
        easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        orientation: 'vertical',
        smoothWheel: true,
    });

    lenis.on('scroll', function(e) {
        var currentScroll = e.animatedScroll || e.scroll || window.pageYOffset;
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 2px 20px rgba(99, 102, 241, 0.08)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(99, 102, 241, 0.04)';
        }
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                lenis.scrollTo(target, { offset: -80, duration: 1.2 });
            }
        });
    });

    const spotlightCards = document.querySelectorAll('.bento-card, .video-card');
    spotlightCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            this.style.setProperty('--mouse-x', x + '%');
            this.style.setProperty('--mouse-y', y + '%');
            if (this.classList.contains('bento-card')) {
                const centerX = (e.clientX - rect.left) / rect.width - 0.5;
                const centerY = (e.clientY - rect.top) / rect.height - 0.5;
                this.style.setProperty('--tilt-x', (centerY * -6) + 'deg');
                this.style.setProperty('--tilt-y', (centerX * 6) + 'deg');
            }
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

    const magneticBtns = document.querySelectorAll('.cta-primary, .play-btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const strength = 12;
            this.style.transform = 'translate3d(' + (x / rect.width) * strength + 'px, ' + (y / rect.height) * strength + 'px, 0)';
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