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
            var progressBar = card ? card.querySelector('.video-loading-progress-bar') : null;
            var percentEl = card ? card.querySelector('.video-loading-percent') : null;

            if (loadingEl) loadingEl.classList.add('active');
            if (errorEl) errorEl.classList.remove('active');
            video.dataset.loaded = 'loading';

            this.activeCount++;

            function updateProgress() {
                if (video.buffered.length > 0) {
                    var buffered = video.buffered.end(video.buffered.length - 1);
                    var pct = video.duration > 0 ? Math.round((buffered / video.duration) * 100) : 0;
                    if (progressBar) progressBar.style.width = pct + '%';
                    if (percentEl) percentEl.textContent = pct + '%';
                }
            }

            var progressInterval = setInterval(updateProgress, 300);

            function onSuccess() {
                cleanup();
                clearInterval(progressInterval);
                if (progressBar) progressBar.style.width = '100%';
                if (percentEl) percentEl.textContent = '100%';
                setTimeout(function() {
                    if (loadingEl) loadingEl.classList.remove('active');
                }, 300);
                if (errorEl) errorEl.classList.remove('active');
                video.dataset.loaded = 'true';
                self.activeCount = Math.max(0, self.activeCount - 1);
                self.processNext();
            }

            function onFailure() {
                cleanup();
                clearInterval(progressInterval);
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

    var modalOverlay = null;
    var modalVideo = null;
    var currentSpeed = 1;
    var speeds = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

    function createModal() {
        if (modalOverlay) return;
        modalOverlay = document.createElement('div');
        modalOverlay.className = 'video-modal-overlay';
        modalOverlay.innerHTML =
            '<div class="video-modal-container">' +
                '<button class="video-modal-close" aria-label="关闭">✕</button>' +
                '<video playsinline></video>' +
                '<div class="video-modal-loading">' +
                    '<div class="video-modal-loading-inner">' +
                        '<div class="video-modal-loading-spinner"></div>' +
                        '<div class="video-modal-loading-progress"><div class="video-modal-loading-bar"></div></div>' +
                        '<div class="video-modal-loading-text">加载中...</div>' +
                    '</div>' +
                '</div>' +
                '<div class="video-modal-controls">' +
                    '<div class="video-modal-progress">' +
                        '<div class="video-modal-progress-buffered"></div>' +
                        '<div class="video-modal-progress-played"></div>' +
                        '<div class="video-modal-progress-thumb"></div>' +
                    '</div>' +
                    '<div class="video-modal-btns">' +
                        '<button class="video-modal-btn video-modal-play-btn" aria-label="播放/暂停">' +
                            '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
                        '</button>' +
                        '<span class="video-modal-time">0:00 / 0:00</span>' +
                        '<div class="video-modal-speed-group">' +
                            '<button class="video-modal-speed" data-speed="0.5">0.5x</button>' +
                            '<button class="video-modal-speed" data-speed="1">1x</button>' +
                            '<button class="video-modal-speed" data-speed="1.5">1.5x</button>' +
                            '<button class="video-modal-speed" data-speed="2">2x</button>' +
                            '<button class="video-modal-speed" data-speed="3">3x</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modalOverlay);
        modalVideo = modalOverlay.querySelector('video');

        modalOverlay.querySelector('.video-modal-close').addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) closeModal();
        });

        var playBtn = modalOverlay.querySelector('.video-modal-play-btn');
        playBtn.addEventListener('click', function() {
            if (modalVideo.paused) {
                modalVideo.play();
            } else {
                modalVideo.pause();
            }
        });

        modalVideo.addEventListener('click', function() {
            if (modalVideo.paused) {
                modalVideo.play();
            } else {
                modalVideo.pause();
            }
        });

        modalVideo.addEventListener('play', function() {
            playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        });

        modalVideo.addEventListener('pause', function() {
            playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        });

        var progressBar = modalOverlay.querySelector('.video-modal-progress');
        var progressPlayed = modalOverlay.querySelector('.video-modal-progress-played');
        var progressBuffered = modalOverlay.querySelector('.video-modal-progress-buffered');
        var progressThumb = modalOverlay.querySelector('.video-modal-progress-thumb');
        var timeDisplay = modalOverlay.querySelector('.video-modal-time');

        modalVideo.addEventListener('timeupdate', function() {
            if (modalVideo.duration) {
                var pct = (modalVideo.currentTime / modalVideo.duration) * 100;
                progressPlayed.style.width = pct + '%';
                progressThumb.style.left = pct + '%';
                timeDisplay.textContent = formatTime(modalVideo.currentTime) + ' / ' + formatTime(modalVideo.duration);
            }
        });

        modalVideo.addEventListener('progress', function() {
            if (modalVideo.buffered.length > 0 && modalVideo.duration) {
                var bufferedEnd = modalVideo.buffered.end(modalVideo.buffered.length - 1);
                progressBuffered.style.width = (bufferedEnd / modalVideo.duration) * 100 + '%';
            }
        });

        var isSeeking = false;
        progressBar.addEventListener('mousedown', function(e) {
            isSeeking = true;
            seekTo(e);
        });
        document.addEventListener('mousemove', function(e) {
            if (isSeeking) seekTo(e);
        });
        document.addEventListener('mouseup', function() {
            isSeeking = false;
        });

        progressBar.addEventListener('touchstart', function(e) {
            isSeeking = true;
            seekTo(e.touches[0]);
        }, { passive: true });
        progressBar.addEventListener('touchmove', function(e) {
            if (isSeeking) seekTo(e.touches[0]);
        }, { passive: true });
        progressBar.addEventListener('touchend', function() {
            isSeeking = false;
        });

        function seekTo(e) {
            var rect = progressBar.getBoundingClientRect();
            var x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            var pct = x / rect.width;
            if (modalVideo.duration) {
                modalVideo.currentTime = pct * modalVideo.duration;
            }
        }

        var modalLoading = modalOverlay.querySelector('.video-modal-loading');
        var modalLoadingBar = modalOverlay.querySelector('.video-modal-loading-bar');
        var modalLoadingText = modalOverlay.querySelector('.video-modal-loading-text');

        modalVideo.addEventListener('waiting', function() {
            modalLoading.classList.add('active');
        });
        modalVideo.addEventListener('playing', function() {
            modalLoading.classList.remove('active');
        });
        modalVideo.addEventListener('canplay', function() {
            modalLoading.classList.remove('active');
        });

        var loadingProgressInterval = null;
        modalVideo.addEventListener('loadstart', function() {
            modalLoading.classList.add('active');
            modalLoadingBar.style.width = '0%';
            modalLoadingText.textContent = '加载中...';
            clearInterval(loadingProgressInterval);
            loadingProgressInterval = setInterval(function() {
                if (modalVideo.buffered.length > 0 && modalVideo.duration) {
                    var bufferedEnd = modalVideo.buffered.end(modalVideo.buffered.length - 1);
                    var pct = Math.round((bufferedEnd / modalVideo.duration) * 100);
                    modalLoadingBar.style.width = pct + '%';
                    modalLoadingText.textContent = '加载中 ' + pct + '%';
                }
            }, 200);
        });
        modalVideo.addEventListener('canplaythrough', function() {
            clearInterval(loadingProgressInterval);
            modalLoadingBar.style.width = '100%';
            modalLoadingText.textContent = '加载完成';
            setTimeout(function() {
                modalLoading.classList.remove('active');
            }, 300);
        });

        var speedBtns = modalOverlay.querySelectorAll('.video-modal-speed');
        speedBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var speed = parseFloat(this.getAttribute('data-speed'));
                modalVideo.playbackRate = speed;
                currentSpeed = speed;
                speedBtns.forEach(function(b) { b.classList.remove('active-speed'); });
                this.classList.add('active-speed');
            });
        });

        document.addEventListener('keydown', handleModalKeydown);
    }

    function handleModalKeydown(e) {
        if (!modalOverlay || !modalOverlay.classList.contains('active')) return;
        if (e.key === 'Escape') {
            closeModal();
            return;
        }
        if (!modalVideo) return;

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            modalVideo.currentTime = Math.min(modalVideo.duration || 0, modalVideo.currentTime + 5);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            modalVideo.currentTime = Math.max(0, modalVideo.currentTime - 5);
        } else if (e.key === ' ') {
            e.preventDefault();
            if (modalVideo.paused) {
                modalVideo.play();
            } else {
                modalVideo.pause();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            modalVideo.volume = Math.min(1, modalVideo.volume + 0.1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            modalVideo.volume = Math.max(0, modalVideo.volume - 0.1);
        }
    }

    function openModal(src, poster) {
        createModal();
        modalVideo.src = src;
        if (poster) modalVideo.setAttribute('poster', poster);
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        var defaultSpeedBtn = modalOverlay.querySelector('.video-modal-speed[data-speed="1"]');
        modalOverlay.querySelectorAll('.video-modal-speed').forEach(function(b) { b.classList.remove('active-speed'); });
        if (defaultSpeedBtn) defaultSpeedBtn.classList.add('active-speed');
        modalVideo.playbackRate = 1;

        modalVideo.play().catch(function() {
            modalVideo.muted = true;
            modalVideo.play().catch(function() {});
        });
    }

    function closeModal() {
        if (!modalOverlay) return;
        modalVideo.pause();
        modalVideo.src = '';
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        var m = Math.floor(seconds / 60);
        var s = Math.floor(seconds % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

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

        function openVideoModal() {
            var src = video.getAttribute('src');
            var poster = video.getAttribute('poster');
            if (!src) return;

            if (errorEl && errorEl.classList.contains('active')) {
                video.removeAttribute('src');
                video.setAttribute('src', src);
                video.dataset.loaded = 'false';
                VideoLoader.retries[VideoLoader.getVideoId(video)] = 0;
                VideoLoader.enqueue(video);
                return;
            }

            openModal(src, poster);
        }

        if (playBtn) {
            playBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                openVideoModal();
            });
            playBtn.addEventListener('touchend', function(e) {
                e.stopPropagation();
                e.preventDefault();
                openVideoModal();
            });
        }

        card.addEventListener('click', function(e) {
            if (e.target.closest('.play-btn')) return;
            openVideoModal();
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
