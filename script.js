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
                    self.loading.delete(video);
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
    var controlsEl = null;
    var controlsTimeout = null;
    var loadingProgressInterval = null;
    var modalLoadingEl = null;
    var modalLoadingBarEl = null;
    var modalLoadingTextEl = null;
    var volumeSlider = null;

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
                        '<button class="modal-btn modal-mute-btn" aria-label="静音切换" title="静音">' +
                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>' +
                        '</button>' +
                        '<input type="range" class="modal-volume-slider" min="0" max="100" value="80" aria-label="音量">' +
                        '<button class="modal-btn modal-speed-btn" aria-label="播放速度" title="1x">1x</button>' +
                        '<button class="modal-btn modal-pip-btn" aria-label="画中画" title="画中画">' +
                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><rect x="12" y="9" width="8" height="6" rx="1" fill="currentColor" opacity="0.3"/></svg>' +
                        '</button>' +
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
        modalLoadingEl = modalOverlay.querySelector('.video-modal-loading');
        modalLoadingBarEl = modalOverlay.querySelector('.video-modal-loading-bar');
        modalLoadingTextEl = modalOverlay.querySelector('.video-modal-loading-text');

        modalOverlay.querySelector('.video-modal-close').addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) closeModal();
        });

        controlsEl = modalOverlay.querySelector('.video-modal-controls');
        function showControls() {
            if (controlsEl) controlsEl.classList.add('force-show');
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(function() {
                if (controlsEl) controlsEl.classList.remove('force-show');
            }, 3000);
        }
        modalOverlay.addEventListener('mousemove', showControls);
        modalOverlay.addEventListener('touchstart', showControls, { passive: true });
        showControls();

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

        modalVideo.addEventListener('waiting', function() {
            if (modalLoadingEl) modalLoadingEl.classList.add('active');
        });
        modalVideo.addEventListener('playing', function() {
            if (modalLoadingEl) modalLoadingEl.classList.remove('active');
        });
        modalVideo.addEventListener('canplay', function() {
            if (modalLoadingEl) modalLoadingEl.classList.remove('active');
        });

        modalVideo.addEventListener('loadstart', function() {
            if (modalLoadingEl) modalLoadingEl.classList.add('active');
            if (modalLoadingBarEl) modalLoadingBarEl.style.width = '0%';
            if (modalLoadingTextEl) modalLoadingTextEl.textContent = '加载中...';
            clearInterval(loadingProgressInterval);
            loadingProgressInterval = setInterval(function() {
                if (modalVideo.buffered.length > 0 && modalVideo.duration) {
                    var bufferedEnd = modalVideo.buffered.end(modalVideo.buffered.length - 1);
                    var pct = Math.round((bufferedEnd / modalVideo.duration) * 100);
                    if (modalLoadingBarEl) modalLoadingBarEl.style.width = pct + '%';
                    if (modalLoadingTextEl) modalLoadingTextEl.textContent = '加载中 ' + pct + '%';
                }
            }, 200);
        });
        modalVideo.addEventListener('canplaythrough', function() {
            clearInterval(loadingProgressInterval);
            loadingProgressInterval = null;
            if (modalLoadingBarEl) modalLoadingBarEl.style.width = '100%';
            if (modalLoadingTextEl) modalLoadingTextEl.textContent = '加载完成';
            setTimeout(function() {
                if (modalLoadingEl) modalLoadingEl.classList.remove('active');
            }, 300);
        });

        var speedBtns = modalOverlay.querySelectorAll('.video-modal-speed');
        speedBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var speed = parseFloat(this.getAttribute('data-speed'));
                modalVideo.playbackRate = speed;
                speedBtns.forEach(function(b) { b.classList.remove('active-speed'); });
                this.classList.add('active-speed');
            });
        });

        var muteBtn = modalOverlay.querySelector('.modal-mute-btn');
        volumeSlider = modalOverlay.querySelector('.modal-volume-slider');
        if (muteBtn && volumeSlider && modalVideo) {
            modalVideo.volume = 0.8;
            muteBtn.addEventListener('click', function() {
                modalVideo.muted = !modalVideo.muted;
                muteBtn.classList.toggle('muted', modalVideo.muted);
            });
            volumeSlider.addEventListener('input', function() {
                modalVideo.volume = this.value / 100;
                modalVideo.muted = false;
                muteBtn.classList.remove('muted');
            });
        }

        var speedBtn = modalOverlay.querySelector('.modal-speed-btn');
        var speeds = [0.5, 1, 1.5, 2];
        var currentSpeedIdx = 1;
        if (speedBtn && modalVideo) {
            speedBtn.addEventListener('click', function() {
                currentSpeedIdx = (currentSpeedIdx + 1) % speeds.length;
                modalVideo.playbackRate = speeds[currentSpeedIdx];
                speedBtn.textContent = speeds[currentSpeedIdx] + 'x';
                speedBtn.title = speeds[currentSpeedIdx] + 'x';
                speedBtns.forEach(function(b) { b.classList.remove('active-speed'); });
            });
        }

        var pipBtn = modalOverlay.querySelector('.modal-pip-btn');
        if (pipBtn && modalVideo) {
            pipBtn.addEventListener('click', function() {
                if (document.pictureInPictureElement) {
                    document.exitPictureInPicture();
                } else if (modalVideo.requestPictureInPicture) {
                    modalVideo.requestPictureInPicture().catch(function() {});
                }
            });
        }

        modalVideo.addEventListener('timeupdate', function() {
            if (modalVideo.src && modalVideo.currentTime > 0) {
                localStorage.setItem('video-progress-' + modalVideo.src, modalVideo.currentTime.toString());
            }
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
            if (volumeSlider) volumeSlider.value = Math.round(modalVideo.volume * 100);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            modalVideo.volume = Math.max(0, modalVideo.volume - 0.1);
            if (volumeSlider) volumeSlider.value = Math.round(modalVideo.volume * 100);
        }
    }

    function openModal(src, poster) {
        createModal();
        modalVideo.muted = false;
        modalVideo.src = src;
        if (poster) modalVideo.setAttribute('poster', poster);

        var savedTime = localStorage.getItem('video-progress-' + src);
        if (savedTime && !isNaN(parseFloat(savedTime))) {
            modalVideo.addEventListener('loadedmetadata', function() {
                modalVideo.currentTime = parseFloat(savedTime);
            }, { once: true });
        }

        if (volumeSlider) volumeSlider.value = Math.round(modalVideo.volume * 100);

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
        if (modalVideo.src && modalVideo.currentTime > 0) {
            localStorage.setItem('video-progress-' + modalVideo.src, modalVideo.currentTime.toString());
        }
        modalVideo.pause();
        clearInterval(loadingProgressInterval);
        loadingProgressInterval = null;
        modalVideo.removeAttribute('src');
        modalVideo.load();
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        clearTimeout(controlsTimeout);
        if (controlsEl) controlsEl.classList.remove('force-show');
        if (modalLoadingEl) modalLoadingEl.classList.remove('active');
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
                VideoLoader.loading.delete(video);
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

    var navLinks = document.querySelectorAll('.nav-links a');
    var navSections = document.querySelectorAll('#about, #sec-documentary, #sec-ads, #sec-game, #sec-real-documentary');
    var navObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var id = entry.target.id;
                navLinks.forEach(function(link) {
                    link.classList.remove('active');
                    var href = link.getAttribute('href');
                    if (href && (href === '#' + id || href.includes(id))) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.2, rootMargin: '-72px 0px -50% 0px' });

    navSections.forEach(function(section) {
        navObserver.observe(section);
    });

    var progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        var progressFill = progressBar.querySelector('.scroll-progress-fill');
        window.addEventListener('scroll', function() {
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            if (progressFill) progressFill.style.width = progress + '%';
        }, { passive: true });
    }

    var searchInput = document.getElementById('video-search');
    var filterBtns = document.querySelectorAll('.video-filter-btn');
    var currentFilter = 'all';

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterVideos();
        });
    }

    filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            filterBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            filterVideos();
        });
    });

    function filterVideos() {
        var keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
        var cards = document.querySelectorAll('.video-card');
        cards.forEach(function(card) {
            var category = (card.getAttribute('data-category') || '').toLowerCase();
            var title = (card.querySelector('h3') || {}).textContent || '';
            var desc = (card.querySelector('.video-description') || {}).textContent || '';
            var matchCategory = currentFilter === 'all' || category === currentFilter;
            var matchKeyword = !keyword || title.toLowerCase().includes(keyword) || desc.toLowerCase().includes(keyword);
            if (matchCategory && matchKeyword) {
                card.classList.remove('hidden-by-filter');
            } else {
                card.classList.add('hidden-by-filter');
            }
        });
    }

    var themeToggle = document.querySelector('.theme-toggle');
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }
    var savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            var newTheme = isDark ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
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
