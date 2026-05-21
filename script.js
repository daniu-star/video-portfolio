document.addEventListener('DOMContentLoaded', function() {
    var VideoLoader = {
        queue: [],
        activeCount: 0,
        maxConcurrent: 2,
        timeouts: {},
        retries: {},
        maxRetries: 2,
        loadTimeout: 25000,
        loading: new WeakSet(),

        enqueue: function(video) {
            var src = video.getAttribute('src');
            if (!src || this.loading.has(video)) return;
            if (this.queue.indexOf(video) !== -1) return;

            this.loading.add(video);
            var id = this.getVideoId(video);
            this.retries[id] = 0;
            this.queue.push(video);
            this.processNext();
        },

        processNext: function() {
            if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) return;
            var video = this.queue.shift();
            var self = this;
            var id = this.getVideoId(video);
            var card = video.closest('.video-card') || video.closest('.video-item');
            var loadingEl = card ? card.querySelector('.video-loading') : null;
            var errorEl = card ? card.querySelector('.video-error') : null;

            if (loadingEl) loadingEl.classList.add('active');
            if (errorEl) errorEl.classList.remove('active');
            video.dataset.loaded = 'loading';

            this.activeCount++;

            function onSuccess() {
                cleanup();
                if (loadingEl) loadingEl.classList.remove('active');
                if (errorEl) errorEl.classList.remove('active');
                video.dataset.loaded = 'true';
                self.activeCount = Math.max(0, self.activeCount - 1);
                self.processNext();
            }

            function onFailure() {
                cleanup();
                if (loadingEl) loadingEl.classList.remove('active');
                self.activeCount = Math.max(0, self.activeCount - 1);
                if (self.retries[id] < self.maxRetries) {
                    self.retries[id]++;
                    video.removeAttribute('src');
                    video.setAttribute('src', src || video.getAttribute('src'));
                    self.queue.unshift(video);
                    self.processNext();
                } else {
                    if (errorEl) errorEl.classList.add('active');
                    video.dataset.loaded = 'error';
                    self.processNext();
                }
            }

            function onTimeout() {
                video.pause();
                onFailure();
            }

            function cleanup() {
                clearTimeout(self.timeouts[id]);
                delete self.timeouts[id];
                video.removeEventListener('canplay', onSuccess);
                video.removeEventListener('canplaythrough', onSuccess);
                video.removeEventListener('error', onFailure);
            }

            video.addEventListener('canplay', onSuccess, { once: true });
            video.addEventListener('canplaythrough', onSuccess, { once: true });
            video.addEventListener('error', onFailure, { once: true });

            self.timeouts[id] = setTimeout(onTimeout, self.loadTimeout);

            video.preload = 'auto';
            video.load();
        },

        getVideoId: function(video) {
            if (!video._vlId) video._vlId = Math.random().toString(36).substr(2, 9);
            return video._vlId;
        }
    };

    var videoObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var video = entry.target;
                videoObserver.unobserve(video);
                VideoLoader.enqueue(video);
            }
        });
    }, { threshold: 0.05, rootMargin: '300px 0px 300px 0px' });

    document.querySelectorAll('video').forEach(function(video) {
        var src = video.getAttribute('src');
        if (src) videoObserver.observe(video);
    });

    function setupVideoCard(card) {
        var video = card.querySelector('video');
        var playBtn = card.querySelector('.play-btn');
        var loadingEl = card.querySelector('.video-loading');
        var errorEl = card.querySelector('.video-error');
        if (!video) return;

        video.addEventListener('waiting', function() {
            if (loadingEl) loadingEl.classList.add('active');
        });
        video.addEventListener('playing', function() {
            if (loadingEl) loadingEl.classList.remove('active');
        });

        function loadAndPlay() {
            if (errorEl && errorEl.classList.contains('active')) {
                var src = video.getAttribute('src');
                if (src) {
                    video.removeAttribute('src');
                    video.setAttribute('src', src);
                    video.dataset.loaded = 'false';
                    VideoLoader.retries[VideoLoader.getVideoId(video)] = 0;
                    VideoLoader.enqueue(video);
                }
                return;
            }
            if (loadingEl) loadingEl.classList.add('active');
            video.preload = 'auto';
            video.load();
            var onReady = function() {
                if (loadingEl) loadingEl.classList.remove('active');
                video.muted = false;
                video.play().catch(function() {
                    video.muted = true;
                    video.play().catch(function() {
                        if (errorEl) errorEl.classList.add('active');
                        if (loadingEl) loadingEl.classList.remove('active');
                    });
                });
                video.removeEventListener('canplay', onReady);
                video.removeEventListener('canplaythrough', onReady);
            };
            var onErr = function() {
                if (loadingEl) loadingEl.classList.remove('active');
                if (errorEl) errorEl.classList.add('active');
                video.removeEventListener('error', onErr);
            };
            video.addEventListener('canplay', onReady, { once: true });
            video.addEventListener('canplaythrough', onReady, { once: true });
            video.addEventListener('error', onErr, { once: true });
        }

        if (playBtn) {
            playBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                loadAndPlay();
            });
            playBtn.addEventListener('touchend', function(e) {
                e.stopPropagation();
                e.preventDefault();
                loadAndPlay();
            });
        }

        card.addEventListener('click', function(e) {
            if (e.target.closest('.play-btn')) return;
            if (video.paused) {
                loadAndPlay();
            } else {
                video.pause();
            }
        });

        var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!isTouchDevice) {
            card.addEventListener('mouseenter', function() {
                if (video.dataset.loaded === 'true' && video.readyState >= 2) {
                    video.muted = true;
                    video.play().catch(function() {});
                }
            });
            card.addEventListener('mouseleave', function() {
                if (!video.paused) {
                    video.pause();
                    video.currentTime = 0;
                }
                if (loadingEl) loadingEl.classList.remove('active');
            });
        }
    }

    document.querySelectorAll('.video-card').forEach(setupVideoCard);

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
                var bars = entry.target.querySelectorAll('.stat-bar-fill');
                bars.forEach(function(bar) {
                    if (!bar.classList.contains('animated')) {
                        bar.classList.add('animated');
                    }
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

    var mouseGlow = document.getElementById('mouseGlow');
    if (mouseGlow) {
        document.addEventListener('mousemove', function(e) {
            mouseGlow.style.left = e.clientX + 'px';
            mouseGlow.style.top = e.clientY + 'px';
        });
    }
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
