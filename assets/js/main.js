// ===== CONSTANTS =====
var NAMESPACE = 'nuller-company-2026';
var API_BASE = 'https://api.counterapi.dev/v1';
var FORMSPREE_JOIN_ID = 'mjgzkpgj';
var FORMSPREE_WISH_ID = 'mvzybkzy';

document.addEventListener('DOMContentLoaded', function () {

    var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== HEXAGON BACKGROUND =====
    var hexCanvas = document.getElementById('hexBg');
    if (hexCanvas) {
        var ctx = hexCanvas.getContext('2d');
        var hexSize = 40;
        var hexGap = 4;
        var cols, rows;
        var hexGrid = [];
        var pulses = [];
        var hexAnimId;
        var lastHexTime = 0;
        var hexInterval = isTouch ? 50 : 30;

        // Hex geometry
        var hexW = hexSize * 2;
        var hexH = Math.sqrt(3) * hexSize;

        function resizeHexCanvas() {
            hexCanvas.width = window.innerWidth;
            hexCanvas.height = window.innerHeight;
            cols = Math.ceil(hexCanvas.width / (hexW * 0.75)) + 2;
            rows = Math.ceil(hexCanvas.height / hexH) + 2;
            buildHexGrid();
        }

        function buildHexGrid() {
            hexGrid = [];
            for (var r = -1; r < rows; r++) {
                for (var c = -1; c < cols; c++) {
                    var x = c * (hexW * 0.75 + hexGap);
                    var y = r * (hexH + hexGap);
                    if (c % 2 === 1) y += (hexH + hexGap) / 2;

                    hexGrid.push({
                        x: x,
                        y: y,
                        brightness: 0,
                        targetBrightness: 0,
                        pulsePhase: Math.random() * Math.PI * 2,
                        edgeProgress: -1, // -1 means no edge animation
                        edgeSpeed: 0
                    });
                }
            }
        }

        function drawHexagon(cx, cy, size) {
            ctx.beginPath();
            for (var i = 0; i < 6; i++) {
                var angle = (Math.PI / 3) * i - Math.PI / 6;
                var px = cx + size * Math.cos(angle);
                var py = cy + size * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
        }

        function getHexEdgePoint(cx, cy, size, progress) {
            // progress 0..6 maps to edges of hexagon
            var edgeIndex = Math.floor(progress) % 6;
            var t = progress - Math.floor(progress);
            var a1 = (Math.PI / 3) * edgeIndex - Math.PI / 6;
            var a2 = (Math.PI / 3) * ((edgeIndex + 1) % 6) - Math.PI / 6;
            return {
                x: cx + size * (Math.cos(a1) * (1 - t) + Math.cos(a2) * t),
                y: cy + size * (Math.sin(a1) * (1 - t) + Math.sin(a2) * t)
            };
        }

        // Spawn pulses periodically
        function spawnPulse() {
            if (hexGrid.length === 0) return;
            var idx = Math.floor(Math.random() * hexGrid.length);
            var hex = hexGrid[idx];
            hex.targetBrightness = 0.4 + Math.random() * 0.4;
            hex.edgeProgress = 0;
            hex.edgeSpeed = 0.03 + Math.random() * 0.04;

            // Radial pulse wave
            pulses.push({
                cx: hex.x,
                cy: hex.y,
                radius: 0,
                maxRadius: 150 + Math.random() * 200,
                speed: 1.5 + Math.random() * 2,
                strength: 0.2 + Math.random() * 0.3,
                alive: true
            });
        }

        var spawnTimer = 0;

        function drawHexBackground(timestamp) {
            if (prefersReducedMotion) {
                // Static hexagons
                ctx.clearRect(0, 0, hexCanvas.width, hexCanvas.height);
                for (var i = 0; i < hexGrid.length; i++) {
                    var h = hexGrid[i];
                    drawHexagon(h.x, h.y, hexSize - 1);
                    ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
                return;
            }

            if (timestamp - lastHexTime < hexInterval) {
                hexAnimId = requestAnimationFrame(drawHexBackground);
                return;
            }
            lastHexTime = timestamp;

            ctx.clearRect(0, 0, hexCanvas.width, hexCanvas.height);

            var time = timestamp * 0.001;

            // Spawn pulses
            spawnTimer++;
            if (spawnTimer > (isTouch ? 80 : 40)) {
                spawnPulse();
                spawnTimer = 0;
            }

            // Update pulses
            for (var p = pulses.length - 1; p >= 0; p--) {
                var pulse = pulses[p];
                pulse.radius += pulse.speed;
                if (pulse.radius > pulse.maxRadius) {
                    pulses.splice(p, 1);
                }
            }

            // Draw hexagons
            for (var i = 0; i < hexGrid.length; i++) {
                var h = hexGrid[i];

                // Check pulse influence
                for (var p = 0; p < pulses.length; p++) {
                    var pulse = pulses[p];
                    var dx = h.x - pulse.cx;
                    var dy = h.y - pulse.cy;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    var ringDist = Math.abs(dist - pulse.radius);

                    if (ringDist < 30) {
                        var influence = (1 - ringDist / 30) * pulse.strength;
                        h.targetBrightness = Math.max(h.targetBrightness, influence);
                        if (h.edgeProgress < 0 && influence > 0.15) {
                            h.edgeProgress = 0;
                            h.edgeSpeed = 0.04 + Math.random() * 0.03;
                        }
                    }
                }

                // Smooth brightness
                h.brightness += (h.targetBrightness - h.brightness) * 0.08;
                h.targetBrightness *= 0.97;

                if (h.brightness < 0.005) h.brightness = 0;

                // Base subtle animation
                var basePulse = Math.sin(time * 0.5 + h.pulsePhase) * 0.5 + 0.5;
                var baseAlpha = 0.02 + basePulse * 0.015;

                // Draw hex fill
                drawHexagon(h.x, h.y, hexSize - 1);
                if (h.brightness > 0.01) {
                    var fillAlpha = h.brightness * 0.08;
                    ctx.fillStyle = 'rgba(0, 240, 255, ' + fillAlpha + ')';
                    ctx.fill();
                }

                // Draw hex border
                drawHexagon(h.x, h.y, hexSize - 1);
                var borderAlpha = baseAlpha + h.brightness * 0.3;
                ctx.strokeStyle = 'rgba(0, 240, 255, ' + borderAlpha.toFixed(3) + ')';
                ctx.lineWidth = 0.5 + h.brightness;
                ctx.stroke();

                // Edge running light
                if (h.edgeProgress >= 0) {
                    h.edgeProgress += h.edgeSpeed;

                    if (h.edgeProgress < 6) {
                        // Draw glowing dot running along edge
                        var trailLength = 1.2;
                        var steps = 8;
                        for (var s = 0; s < steps; s++) {
                            var prog = h.edgeProgress - (s * trailLength / steps);
                            if (prog < 0) continue;
                            var pt = getHexEdgePoint(h.x, h.y, hexSize - 1, prog % 6);
                            var alpha = (1 - s / steps) * (0.5 + h.brightness * 0.5);

                            // Cyan glow
                            ctx.beginPath();
                            ctx.arc(pt.x, pt.y, 2.5 - s * 0.2, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(0, 240, 255, ' + (alpha * 0.8).toFixed(3) + ')';
                            ctx.fill();

                            // Bigger soft glow on first point
                            if (s === 0) {
                                ctx.beginPath();
                                ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
                                ctx.fillStyle = 'rgba(0, 240, 255, ' + (alpha * 0.15).toFixed(3) + ')';
                                ctx.fill();
                            }
                        }
                    } else {
                        h.edgeProgress = -1;
                    }
                }
            }

            hexAnimId = requestAnimationFrame(drawHexBackground);
        }

        resizeHexCanvas();
        window.addEventListener('resize', function () {
            resizeHexCanvas();
        });

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) cancelAnimationFrame(hexAnimId);
            else hexAnimId = requestAnimationFrame(drawHexBackground);
        });

        hexAnimId = requestAnimationFrame(drawHexBackground);

        // Mouse interaction — spawn pulse near cursor
        if (!isTouch) {
            document.addEventListener('mousemove', function (e) {
                for (var i = 0; i < hexGrid.length; i++) {
                    var h = hexGrid[i];
                    var dx = h.x - e.clientX;
                    var dy = h.y - e.clientY;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        var influence = (1 - dist / 100) * 0.3;
                        h.targetBrightness = Math.max(h.targetBrightness, influence);
                        if (dist < 50 && h.edgeProgress < 0 && Math.random() > 0.92) {
                            h.edgeProgress = 0;
                            h.edgeSpeed = 0.05 + Math.random() * 0.03;
                        }
                    }
                }
            });
        }
    }

    // ===== AMBIENT PARTICLES =====
    var ambientEl = document.getElementById('ambientParticles');
    if (ambientEl && !prefersReducedMotion) {
        var pCount = isTouch ? 10 : 20;
        var colors = [
            'rgba(0, 240, 255, 0.4)',
            'rgba(168, 85, 247, 0.3)',
            'rgba(14, 165, 233, 0.3)',
            'rgba(0, 240, 255, 0.2)'
        ];
        for (var i = 0; i < pCount; i++) {
            var p = document.createElement('div');
            p.className = 'ambient-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDelay = (Math.random() * 10) + 's';
            p.style.animationDuration = (8 + Math.random() * 8) + 's';
            var size = (1 + Math.random() * 3) + 'px';
            p.style.width = size;
            p.style.height = size;
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.boxShadow = '0 0 6px ' + colors[Math.floor(Math.random() * colors.length)];
            ambientEl.appendChild(p);
        }
    }

    // ===== NAVBAR =====
    var navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ===== MOBILE TOGGLE =====
    var mobileToggle = document.getElementById('mobileToggle');
    var navLinks = document.querySelector('.nav-links');
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            mobileToggle.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(function (l) {
            l.addEventListener('click', function () {
                navLinks.classList.remove('open');
                mobileToggle.classList.remove('open');
            });
        });
        document.addEventListener('click', function (e) {
            if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
                navLinks.classList.remove('open');
                mobileToggle.classList.remove('open');
            }
        });
    }

    // ===== TYPING EFFECT =====
    var typingEl = document.getElementById('typingText');
    if (typingEl && !prefersReducedMotion) {
        var phrases = [
            'Инициализация системы...',
            'Hexagon Event активирован...',
            'Загрузка модулей...',
            'Соединение установлено.',
            'Добро пожаловать в NULLER!'
        ];
        var pIdx = 0, cIdx = 0, isDel = false;

        function typeEffect() {
            var current = phrases[pIdx];
            if (!isDel) {
                cIdx++;
                var html = '';
                for (var i = 0; i < cIdx && i < current.length; i++) {
                    var ch = current[i] === ' ' ? '&nbsp;' : current[i];
                    if (i === cIdx - 1) {
                        html += '<span class="typing-char" style="animation-delay:0s">' + ch + '</span>';
                    } else {
                        html += '<span style="display:inline-block">' + ch + '</span>';
                    }
                }
                typingEl.innerHTML = html;
                if (cIdx >= current.length) {
                    setTimeout(function () { isDel = true; typeEffect(); }, 2000);
                    return;
                }
                setTimeout(typeEffect, 50 + Math.random() * 40);
            } else {
                cIdx--;
                var html2 = '';
                for (var j = 0; j < cIdx; j++) {
                    var ch2 = current[j] === ' ' ? '&nbsp;' : current[j];
                    html2 += '<span style="display:inline-block">' + ch2 + '</span>';
                }
                typingEl.innerHTML = html2;
                if (cIdx <= 0) {
                    isDel = false;
                    pIdx = (pIdx + 1) % phrases.length;
                    setTimeout(typeEffect, 400);
                    return;
                }
                setTimeout(typeEffect, 25);
            }
        }
        setTimeout(typeEffect, 800);
    } else if (typingEl) {
        typingEl.textContent = 'Добро пожаловать в NULLER!';
    }

    // ===== FADE IN =====
    var fadeEls = document.querySelectorAll('.fade-in');
    if (fadeEls.length) {
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) e.target.classList.add('visible');
            });
        }, { threshold: 0.1 });
        fadeEls.forEach(function (el) { obs.observe(el); });
    }

    // ===== STATIC COUNTERS =====
    var statics = document.querySelectorAll('.stat-number[data-static="true"]');
    if (statics.length) {
        var cObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    var t = +e.target.getAttribute('data-target'), cur = 0, inc = t / 60;
                    var ti = setInterval(function () {
                        cur += inc;
                        if (cur >= t) { e.target.textContent = t; clearInterval(ti); }
                        else e.target.textContent = Math.floor(cur);
                    }, 25);
                    cObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.5 });
        statics.forEach(function (c) { cObs.observe(c); });
    }

    // ===== UNIVERSAL IMAGE MODAL =====
    var imgModal = document.createElement('div');
    imgModal.className = 'screenshot-modal';
    imgModal.innerHTML =
        '<button class="screenshot-modal-close" aria-label="Закрыть">✕</button>' +
        '<button class="screenshot-modal-prev" aria-label="Назад">‹</button>' +
        '<button class="screenshot-modal-next" aria-label="Вперёд">›</button>' +
        '<img src="" alt="Изображение">' +
        '<div class="screenshot-modal-counter"></div>';
    document.body.appendChild(imgModal);

    var imgModalImg = imgModal.querySelector('img');
    var imgModalCounter = imgModal.querySelector('.screenshot-modal-counter');
    var imgModalSources = [];
    var imgModalIdx = 0;

    function openImageModal(sources, startIdx) {
        imgModalSources = sources;
        imgModalIdx = startIdx || 0;
        showImageModal();
        imgModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function showImageModal() {
        imgModalIdx = (imgModalIdx + imgModalSources.length) % imgModalSources.length;
        imgModalImg.src = imgModalSources[imgModalIdx];
        if (imgModalSources.length > 1) {
            imgModalCounter.textContent = (imgModalIdx + 1) + ' / ' + imgModalSources.length;
            imgModalCounter.style.display = '';
            imgModal.querySelector('.screenshot-modal-prev').style.display = '';
            imgModal.querySelector('.screenshot-modal-next').style.display = '';
        } else {
            imgModalCounter.style.display = 'none';
            imgModal.querySelector('.screenshot-modal-prev').style.display = 'none';
            imgModal.querySelector('.screenshot-modal-next').style.display = 'none';
        }
    }

    function closeImageModal() {
        imgModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    imgModal.querySelector('.screenshot-modal-close').addEventListener('click', function (e) { e.stopPropagation(); closeImageModal(); });
    imgModal.querySelector('.screenshot-modal-prev').addEventListener('click', function (e) { e.stopPropagation(); imgModalIdx--; showImageModal(); });
    imgModal.querySelector('.screenshot-modal-next').addEventListener('click', function (e) { e.stopPropagation(); imgModalIdx++; showImageModal(); });
    imgModal.addEventListener('click', closeImageModal);
    imgModalImg.addEventListener('click', function (e) { e.stopPropagation(); });

    document.addEventListener('keydown', function (e) {
        if (!imgModal.classList.contains('open')) return;
        if (e.key === 'ArrowRight') { imgModalIdx++; showImageModal(); }
        if (e.key === 'ArrowLeft') { imgModalIdx--; showImageModal(); }
        if (e.key === 'Escape') closeImageModal();
    });

    // ===== NEWS CAROUSEL =====
    var newsTrack = document.getElementById('newsTrack');
    var newsDots = document.getElementById('newsDots');
    var newsLeft = document.getElementById('newsLeft');
    var newsRight = document.getElementById('newsRight');

    var slideToDirection = null;
    var isAnimating = false;

    if (newsTrack) {
        var originalCards = Array.from(newsTrack.querySelectorAll('.news-card'));
        var totalCards = originalCards.length;

        if (totalCards <= 1) {
            if (newsLeft) newsLeft.style.display = 'none';
            if (newsRight) newsRight.style.display = 'none';
            if (newsDots) newsDots.style.display = 'none';
            originalCards.forEach(function (c) { c.style.minWidth = '100%'; });
        } else {
            var slideIndex = 0;
            var allSlides = [];
            var clonesCount = 0;

            function buildCarousel() {
                newsTrack.querySelectorAll('[data-clone]').forEach(function (c) { c.remove(); });
                clonesCount = totalCards;

                for (var i = 0; i < clonesCount; i++) {
                    var cloneEnd = originalCards[i].cloneNode(true);
                    cloneEnd.setAttribute('data-clone', 'end');
                    cloneEnd.setAttribute('aria-hidden', 'true');
                    newsTrack.appendChild(cloneEnd);
                }

                for (var j = totalCards - 1; j >= 0; j--) {
                    var cloneStart = originalCards[j].cloneNode(true);
                    cloneStart.setAttribute('data-clone', 'start');
                    cloneStart.setAttribute('aria-hidden', 'true');
                    newsTrack.insertBefore(cloneStart, newsTrack.firstChild);
                }

                allSlides = Array.from(newsTrack.querySelectorAll('.news-card'));

                allSlides.forEach(function (slide) {
                    if (slide.getAttribute('data-clone')) {
                        slide.addEventListener('click', function () {
                            var newsIdx = parseInt(slide.getAttribute('data-news'));
                            for (var k = 0; k < originalCards.length; k++) {
                                if (parseInt(originalCards[k].getAttribute('data-news')) === newsIdx) {
                                    originalCards[k].click();
                                    break;
                                }
                            }
                        });
                    }
                });
            }

            function getCardWidth() {
                return newsTrack.parentElement.offsetWidth;
            }

            function setCardSizes() {
                var w = getCardWidth();
                allSlides.forEach(function (s) {
                    s.style.minWidth = w + 'px';
                    s.style.maxWidth = w + 'px';
                    s.style.flex = '0 0 ' + w + 'px';
                });
            }

            function jumpToSlide(realIndex, animate) {
                var targetPos = clonesCount + realIndex;
                var w = getCardWidth();
                if (animate) {
                    newsTrack.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                } else {
                    newsTrack.style.transition = 'none';
                }
                newsTrack.style.transform = 'translateX(-' + (targetPos * w) + 'px)';
                slideIndex = realIndex;
                updateDots();
            }

            slideToDirection = function (dir) {
                if (isAnimating) return;
                isAnimating = true;
                var w = getCardWidth();
                var currentPos = clonesCount + slideIndex;
                var nextPos = currentPos + dir;

                newsTrack.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                newsTrack.style.transform = 'translateX(-' + (nextPos * w) + 'px)';

                var nextReal = ((slideIndex + dir) % totalCards + totalCards) % totalCards;

                setTimeout(function () {
                    newsTrack.style.transition = 'none';
                    slideIndex = nextReal;
                    var realPos = clonesCount + slideIndex;
                    newsTrack.style.transform = 'translateX(-' + (realPos * w) + 'px)';
                    updateDots();
                    isAnimating = false;
                }, 460);
            };

            function updateDots() {
                if (!newsDots) return;
                var dots = newsDots.querySelectorAll('.news-dot');
                dots.forEach(function (d, i) {
                    d.className = 'news-dot' + (i === slideIndex ? ' active' : '');
                });
            }

            function createDots() {
                if (!newsDots) return;
                newsDots.innerHTML = '';
                for (var i = 0; i < totalCards; i++) {
                    var dot = document.createElement('button');
                    dot.className = 'news-dot' + (i === slideIndex ? ' active' : '');
                    dot.setAttribute('aria-label', 'Новость ' + (i + 1));
                    (function (idx) {
                        dot.addEventListener('click', function () {
                            if (isAnimating || idx === slideIndex) return;
                            isAnimating = true;
                            var w = getCardWidth();
                            var targetPos = clonesCount + idx;
                            newsTrack.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                            newsTrack.style.transform = 'translateX(-' + (targetPos * w) + 'px)';
                            slideIndex = idx;
                            setTimeout(function () {
                                updateDots();
                                isAnimating = false;
                            }, 460);
                        });
                    })(i);
                    newsDots.appendChild(dot);
                }
            }

            function initCarousel() {
                buildCarousel();
                setCardSizes();
                slideIndex = 0;
                jumpToSlide(0, false);
                createDots();
            }

            if (newsLeft) newsLeft.addEventListener('click', function () { if (slideToDirection) slideToDirection(-1); });
            if (newsRight) newsRight.addEventListener('click', function () { if (slideToDirection) slideToDirection(1); });

            // Touch swipe
            var touchStartX = 0;
            newsTrack.addEventListener('touchstart', function (e) {
                if (isAnimating) return;
                touchStartX = e.touches[0].clientX;
            }, { passive: true });

            newsTrack.addEventListener('touchend', function (e) {
                if (isAnimating) return;
                var diff = touchStartX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 40) {
                    if (slideToDirection) slideToDirection(diff > 0 ? 1 : -1);
                }
            });

            // Mouse drag
            var mouseStartX = 0, mouseDragging = false;
            newsTrack.addEventListener('mousedown', function (e) {
                if (isAnimating) return;
                mouseStartX = e.clientX;
                mouseDragging = true;
                newsTrack.classList.add('grabbing');
                e.preventDefault();
            });

            document.addEventListener('mouseup', function (e) {
                if (!mouseDragging) return;
                mouseDragging = false;
                newsTrack.classList.remove('grabbing');
                if (isAnimating) return;
                var diff = mouseStartX - e.clientX;
                if (Math.abs(diff) > 40) {
                    if (slideToDirection) slideToDirection(diff > 0 ? 1 : -1);
                }
            });

            var resizeTimer;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () {
                    setCardSizes();
                    jumpToSlide(slideIndex, false);
                }, 150);
            });

            initCarousel();

            // Autoplay
            var autoplayTimer = null;
            var autoplayDelay = 10000;
            var isHovered = false;

            function startAutoplay() {
                stopAutoplay();
                autoplayTimer = setInterval(function () {
                    if (!isHovered && !isAnimating && !document.hidden && slideToDirection) {
                        slideToDirection(1);
                    }
                }, autoplayDelay);
            }

            function stopAutoplay() {
                if (autoplayTimer) clearInterval(autoplayTimer);
                autoplayTimer = null;
            }

            var carouselEl = newsTrack.closest('.news-carousel');
            if (carouselEl) {
                carouselEl.addEventListener('mouseenter', function () { isHovered = true; });
                carouselEl.addEventListener('mouseleave', function () { isHovered = false; });
            }

            document.addEventListener('visibilitychange', function () {
                if (document.hidden) stopAutoplay();
                else startAutoplay();
            });

            startAutoplay();
        }

        // ===== NEWS MODAL =====
        var newsModal = document.getElementById('newsModal');
        if (newsModal) {
            var newsData = {
                0: { title: 'Компания потеряла разработчиков!', image: 'assets/images/news/news-devs.png', body: 'Компании срочно требуются разработчики! Если вы умеете программировать или делать дизайн, присоединяйтесь к нашей команде. Подайте заявку на странице «Стать разработчиком».' },
                1: { title: 'Движок GECKO', image: 'assets/images/news/news-gecko.png', body: 'Движок GECKO будет работать и в браузере, и на ПК. Движок будет поддерживать онлайн. Скоро релиз! Следите за обновлениями в нашем Telegram-канале.' },
                2: { title: 'Мы заботимся о Вас!', image: 'assets/images/news/news-safety.png', body: 'Мы публикуем на сайте только безопасные программы, проверенные модераторами. За безопасность мы отвечаем!' }
            };

            var nMT = document.getElementById('newsModalTitle');
            var nMB = document.getElementById('newsModalBody');
            var nMI = document.getElementById('newsModalImage');

            originalCards.forEach(function (card) {
                card.addEventListener('click', function () {
                    var idx = parseInt(card.getAttribute('data-news'));
                    var data = newsData[idx];
                    if (!data) return;
                    nMT.textContent = data.title;
                    nMB.textContent = data.body;
                    nMI.innerHTML = '<img src="' + data.image + '" alt="' + data.title + '">';
                    newsModal.classList.add('open');
                    document.body.style.overflow = 'hidden';
                });
            });

            function closeNM() {
                newsModal.classList.remove('open');
                document.body.style.overflow = '';
            }
            newsModal.querySelector('.news-modal-close').addEventListener('click', closeNM);
            newsModal.querySelector('.news-modal-overlay').addEventListener('click', closeNM);
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && newsModal.classList.contains('open')) closeNM();
            });
        }
    }

    // ===== TEAM MEMBER MODAL =====
    var memberModal = document.getElementById('memberModal');
    if (memberModal) {
        var membersData = {
            'vak5037': {
                name: 'Vak5037', role: 'Основатель',
                avatar: 'assets/images/vak5037.png',
                cover: 'assets/images/covers/vak5037-cover.png',
                bio: 'Основатель компании NULLER Company. Занимается разработкой программ и управлением проектами. Создал компанию для объединения начинающих разработчиков.',
                gallery: ['assets/images/gallery/vak5037-1.png', 'assets/images/gallery/vak5037-2.png', 'assets/images/gallery/vak5037-3.png'],
                socials: [{ name: 'Telegram', url: 'https://t.me/+1vhGt7PhYGo1OThi' }]
            },
            'redmik03': {
                name: 'redmik03', role: 'Рекламист',
                avatar: 'assets/images/redmik03.png',
                cover: 'assets/images/covers/redmik03-cover.png',
                bio: 'Рекламист компании NULLER Company. Занимается продвижением продуктов и привлечением новых пользователей.',
                gallery: ['assets/images/gallery/redmik03-1.png', 'assets/images/gallery/redmik03-2.png', 'assets/images/gallery/redmik03-3.png'],
                socials: [{ name: 'Telegram', url: 'https://t.me/+1vhGt7PhYGo1OThi' }]
            }
        };

        var mN = document.getElementById('memberName');
        var mR = document.getElementById('memberRole');
        var mA = document.getElementById('memberAvatar');
        var mC = document.getElementById('memberCover');
        var mB = document.getElementById('memberBio');
        var mG = document.getElementById('memberGallery');
        var mS = document.getElementById('memberSocials');

        document.querySelectorAll('.team-card[data-member]').forEach(function (card) {
            card.addEventListener('click', function () {
                var key = card.getAttribute('data-member');
                var data = membersData[key];
                if (!data) return;

                mN.textContent = data.name;
                mR.textContent = '// ' + data.role;
                mA.innerHTML = '<img src="' + data.avatar + '" alt="' + data.name + '">';
                mB.textContent = data.bio;

                if (data.cover) {
                    mC.innerHTML = '<img src="' + data.cover + '" alt="" role="presentation">';
                    mC.style.background = '';
                } else {
                    mC.innerHTML = '';
                    mC.style.background = 'linear-gradient(135deg, #0a1128, rgba(0,240,255,0.05))';
                }

                mG.innerHTML = '';
                if (data.gallery && data.gallery.length) {
                    data.gallery.forEach(function (img, gIdx) {
                        var div = document.createElement('div');
                        div.className = 'member-gallery-img';
                        div.innerHTML = '<img src="' + img + '" alt="Фото" loading="lazy">';
                        div.addEventListener('click', function (e) {
                            e.stopPropagation();
                            openImageModal(data.gallery, gIdx);
                        });
                        mG.appendChild(div);
                    });
                }

                mS.innerHTML = '';
                if (data.socials && data.socials.length) {
                    data.socials.forEach(function (s) {
                        var a = document.createElement('a');
                        a.className = 'member-social-link';
                        a.href = s.url;
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        a.textContent = s.name;
                        mS.appendChild(a);
                    });
                }

                memberModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        });

        function closeMM() {
            memberModal.classList.remove('open');
            document.body.style.overflow = '';
        }
        memberModal.querySelector('.member-modal-close').addEventListener('click', closeMM);
        memberModal.querySelector('.member-modal-overlay').addEventListener('click', closeMM);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && memberModal.classList.contains('open')) closeMM();
        });
    }

    // ===== DOWNLOAD BUTTON (for other pages) =====
    var dlBtn = document.getElementById('downloadBtn');
    if (dlBtn) {
        dlBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (this.dataset.loading === 'true') return;
            var url = this.getAttribute('href');
            var app = this.getAttribute('data-app') || 'unknown';
            var btn = this;

            if (!url || url === '#') {
                alert('Файл ещё не загружен. Попробуйте позже.');
                return;
            }

            btn.dataset.loading = 'true';
            var orig = btn.innerHTML;
            window.open(url, '_blank');

            fetch(API_BASE + '/' + NAMESPACE + '/total-downloads/up').catch(function () {});
            fetch(API_BASE + '/' + NAMESPACE + '/download-' + app + '/up').catch(function () {});

            btn.innerHTML = '✓ Скачивание начато!';
            btn.style.background = 'linear-gradient(135deg, #00cc88, #00aa66)';
            btn.style.color = '#fff';

            setTimeout(function () {
                btn.innerHTML = orig;
                btn.style.background = '';
                btn.style.color = '';
                delete btn.dataset.loading;
            }, 4000);
        });
    }

    // ===== APP SEARCH + FILTERS (for apps page) =====
    var searchInput = document.getElementById('searchInput');
    var filterTabs = document.querySelectorAll('.apps-filter-tab');

    if (searchInput || filterTabs.length) {
        var noRes = document.getElementById('noResults');
        var sTimer;
        var currentFilter = 'all';

        function applyFilters() {
            var q = searchInput ? searchInput.value.toLowerCase().trim() : '';
            var vis = 0;
            var visibleByCategory = { active: 0, archived: 0, legacy: 0 };

            document.querySelectorAll('.app-card').forEach(function (card) {
                var status = card.getAttribute('data-status') || 'active';
                var n = (card.querySelector('.app-name') || {}).textContent || '';
                var d = (card.querySelector('.app-desc') || {}).textContent || '';
                var tags = '';
                card.querySelectorAll('.app-tag').forEach(function (t) { tags += ' ' + t.textContent; });

                var matchSearch = q === '' ||
                    n.toLowerCase().includes(q) ||
                    d.toLowerCase().includes(q) ||
                    tags.toLowerCase().includes(q);

                var matchFilter = currentFilter === 'all' || status === currentFilter;
                var show = matchSearch && matchFilter;
                card.style.display = show ? '' : 'none';

                if (show) {
                    vis++;
                    if (visibleByCategory[status] !== undefined) visibleByCategory[status]++;
                }
            });

            document.querySelectorAll('.apps-category').forEach(function (cat) {
                var cName = cat.getAttribute('data-category');
                var hasVisible = visibleByCategory[cName] > 0;
                if (currentFilter === 'all') {
                    cat.classList.toggle('hidden', !hasVisible);
                } else {
                    cat.classList.toggle('hidden', cName !== currentFilter || !hasVisible);
                }
            });

            if (noRes) noRes.style.display = vis === 0 ? 'block' : 'none';
        }

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                clearTimeout(sTimer);
                sTimer = setTimeout(applyFilters, 200);
            });
        }

        filterTabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                filterTabs.forEach(function (t) { t.classList.remove('active'); });
                tab.classList.add('active');
                currentFilter = tab.getAttribute('data-filter');
                applyFilters();
            });
        });
    }

    // ===== JOIN FORM (for join page) =====
    var joinForm = document.getElementById('joinForm');
    if (joinForm) {
        var avUp = document.getElementById('avatarUpload');
        var avIn = document.getElementById('avatarInput');
        var avPr = document.getElementById('avatarPreview');
        var avIm = document.getElementById('avatarImg');
        var avPh = avPr ? avPr.querySelector('.avatar-placeholder') : null;

        if (avUp && avIn) {
            avUp.addEventListener('click', function () { avIn.click(); });
            avIn.addEventListener('change', function () {
                var file = this.files[0];
                if (!file) return;
                if (!file.type.startsWith('image/')) {
                    alert('Пожалуйста, выберите изображение.');
                    return;
                }
                if (file.size > 5 * 1024 * 1024) {
                    alert('Файл слишком большой. Максимум 5 MB.');
                    this.value = '';
                    return;
                }
                var reader = new FileReader();
                reader.onload = function (e) {
                    avIm.src = e.target.result;
                    avIm.style.display = 'block';
                    if (avPh) avPh.style.display = 'none';
                    avPr.classList.add('has-image');
                };
                reader.readAsDataURL(file);
            });
        }

        var bioTA = document.getElementById('joinBio');
        var bioCnt = document.getElementById('bioCounter');
        if (bioTA && bioCnt) {
            bioTA.addEventListener('input', function () { bioCnt.textContent = this.value.length; });
        }

        var fStat = document.getElementById('formStatus');
        var jSub = document.getElementById('joinSubmit');

        joinForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (jSub.dataset.loading === 'true') return;
            jSub.dataset.loading = 'true';
            jSub.textContent = 'Отправка...';
            jSub.style.opacity = '0.7';

            var fd = {
                name: (document.getElementById('joinName') || {}).value || '',
                bio: (document.getElementById('joinBio') || {}).value || '',
                skills: (document.getElementById('joinSkills') || {}).value || '',
                contact: (document.getElementById('joinContact') || {}).value || '',
                telegram: (joinForm.querySelector('[name="telegram"]') || {}).value || '',
                vk: (joinForm.querySelector('[name="vk"]') || {}).value || '',
                github: (joinForm.querySelector('[name="github"]') || {}).value || '',
                discord: (joinForm.querySelector('[name="discord"]') || {}).value || '',
                timestamp: new Date().toISOString()
            };

            fetch('https://formspree.io/f/' + FORMSPREE_JOIN_ID, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fd)
            })
            .then(function (r) {
                if (r.ok) {
                    fStat.textContent = '✓ Заявка отправлена! Мы свяжемся с вами.';
                    fStat.className = 'form-status success';
                    joinForm.reset();
                    if (avIm) { avIm.style.display = 'none'; avIm.src = ''; }
                    if (avPh) avPh.style.display = '';
                    if (avPr) avPr.classList.remove('has-image');
                    if (bioCnt) bioCnt.textContent = '0';
                } else throw new Error('err');
            })
            .catch(function () {
                fStat.textContent = '⚠ Ошибка отправки. Попробуйте позже или напишите в Telegram.';
                fStat.className = 'form-status error';
            })
            .finally(function () {
                jSub.textContent = 'Отправить заявку';
                jSub.style.opacity = '';
                delete jSub.dataset.loading;
            });
        });
    }

});
