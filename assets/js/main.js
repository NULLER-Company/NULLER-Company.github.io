// ===== CONSTANTS =====
var NAMESPACE = 'nuller-company-2026';
var API_BASE = 'https://api.counterapi.dev/v1';
// ⚠️ ЗАМЕНИ на свой реальный Formspree ID!
var FORMSPREE_JOIN_ID = 'mjgzkpgj';
var FORMSPREE_WISH_ID = 'mvzybkzy';

document.addEventListener('DOMContentLoaded', function () {

    var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== HEXAGON BACKGROUND (3D tiles with green-cyan glowing seams) =====
    var hexCanvas = document.getElementById('hexBg');
    if (hexCanvas) {
        var ctx = hexCanvas.getContext('2d', { alpha: false });
        var dpr = Math.min(window.devicePixelRatio || 1, 2);

        var hexRadius = isTouch ? 38 : 46;
        var gapSize = 6;
        var hexagons = [];
        var hexAnimId;
        var mouseX = -9999, mouseY = -9999;
        var hexTime = 0;

        function getHexDims(r) {
            return {
                w: r * 2,
                horizSpacing: r * 1.5,
                vertSpacing: Math.sqrt(3) * r
            };
        }

        function resizeHexCanvas() {
            var w = window.innerWidth;
            var h = window.innerHeight;
            hexCanvas.width = w * dpr;
            hexCanvas.height = h * dpr;
            hexCanvas.style.width = w + 'px';
            hexCanvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            buildHexGrid(w, h);
        }

        function buildHexGrid(w, h) {
            hexagons = [];
            var d = getHexDims(hexRadius);
            var cols = Math.ceil(w / d.horizSpacing) + 2;
            var rows = Math.ceil(h / d.vertSpacing) + 2;

            for (var col = -1; col < cols; col++) {
                for (var row = -1; row < rows; row++) {
                    var x = col * d.horizSpacing;
                    var y = row * d.vertSpacing + (col % 2 === 1 ? d.vertSpacing / 2 : 0);

                    hexagons.push({
                        x: x,
                        y: y,
                        glowPhase: Math.random() * Math.PI * 2,
                        glowSpeed: 0.3 + Math.random() * 0.5,
                        baseGlow: 0.15 + Math.random() * 0.35,
                        colorMix: Math.random(), // 0 = green, 1 = cyan
                        pulse: 0
                    });
                }
            }
        }

        function hexPath(cx, cy, r) {
            ctx.beginPath();
            for (var i = 0; i < 6; i++) {
                var angle = (Math.PI / 3) * i;
                var px = cx + r * Math.cos(angle);
                var py = cy + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
        }

        // Цвет: смесь зелёного и голубого в зависимости от colorMix
        function getGlowColor(mix, alpha) {
            // green: 0, 255, 170    cyan: 0, 212, 255
            var r = 0;
            var g = Math.round(255 * (1 - mix) + 212 * mix);
            var b = Math.round(170 * (1 - mix) + 255 * mix);
            return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha.toFixed(3) + ')';
        }

        function drawHexBackground() {
            var w = hexCanvas.width / dpr;
            var h = hexCanvas.height / dpr;

            ctx.fillStyle = '#020a14';
            ctx.fillRect(0, 0, w, h);

            hexTime += 0.016;
            var innerR = hexRadius - gapSize / 2;

            // === 1: свечение под плитками ===
            for (var i = 0; i < hexagons.length; i++) {
                var hex = hexagons[i];
                var glowWave = Math.sin(hexTime * hex.glowSpeed + hex.glowPhase) * 0.5 + 0.5;
                var intensity = hex.baseGlow + glowWave * 0.4 + hex.pulse;

                var dx = hex.x - mouseX;
                var dy = hex.y - mouseY;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 250) {
                    intensity += (1 - dist / 250) * 0.6;
                }
                intensity = Math.min(intensity, 1.2);

                if (intensity > 0.2) {
                    var glow = ctx.createRadialGradient(
                        hex.x, hex.y, 0,
                        hex.x, hex.y, hexRadius * 1.4
                    );
                    var a = intensity * 0.5;
                    glow.addColorStop(0, getGlowColor(hex.colorMix, a * 0.8));
                    glow.addColorStop(0.5, getGlowColor(hex.colorMix, a * 0.35));
                    glow.addColorStop(1, getGlowColor(hex.colorMix, 0));
                    ctx.fillStyle = glow;
                    ctx.fillRect(
                        hex.x - hexRadius * 1.5,
                        hex.y - hexRadius * 1.5,
                        hexRadius * 3,
                        hexRadius * 3
                    );
                }

                hex.pulse *= 0.94;
            }

            // === 2: яркие линии в швах ===
            for (var i = 0; i < hexagons.length; i++) {
                var hex = hexagons[i];
                var glowWave = Math.sin(hexTime * hex.glowSpeed + hex.glowPhase) * 0.5 + 0.5;
                var intensity = hex.baseGlow + glowWave * 0.4 + hex.pulse;

                var dx = hex.x - mouseX;
                var dy = hex.y - mouseY;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 250) {
                    intensity += (1 - dist / 250) * 0.6;
                }
                intensity = Math.min(intensity, 1.2);

                if (intensity > 0.3) {
                    hexPath(hex.x, hex.y, hexRadius - 1);
                    ctx.strokeStyle = getGlowColor(hex.colorMix, intensity * 0.6);
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
            }

            // === 3: тёмные плитки сверху ===
            for (var i = 0; i < hexagons.length; i++) {
                var hex = hexagons[i];

                var tileGrad = ctx.createLinearGradient(
                    hex.x, hex.y - innerR,
                    hex.x, hex.y + innerR
                );
                tileGrad.addColorStop(0, '#0c2030');
                tileGrad.addColorStop(0.5, '#08151f');
                tileGrad.addColorStop(1, '#050d14');

                hexPath(hex.x, hex.y, innerR);
                ctx.fillStyle = tileGrad;
                ctx.fill();

                hexPath(hex.x, hex.y, innerR);
                ctx.strokeStyle = 'rgba(20, 50, 70, 0.4)';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Блик сверху для 3D
                ctx.save();
                hexPath(hex.x, hex.y, innerR);
                ctx.clip();
                var bevel = ctx.createLinearGradient(
                    hex.x, hex.y - innerR,
                    hex.x, hex.y - innerR * 0.3
                );
                bevel.addColorStop(0, 'rgba(60, 130, 130, 0.15)');
                bevel.addColorStop(1, 'rgba(60, 130, 130, 0)');
                ctx.fillStyle = bevel;
                ctx.fillRect(hex.x - innerR, hex.y - innerR, innerR * 2, innerR);
                ctx.restore();
            }

            hexAnimId = requestAnimationFrame(drawHexBackground);
        }

        resizeHexCanvas();

        var rTimer;
        window.addEventListener('resize', function () {
            clearTimeout(rTimer);
            rTimer = setTimeout(resizeHexCanvas, 150);
        });

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                cancelAnimationFrame(hexAnimId);
            } else {
                hexAnimId = requestAnimationFrame(drawHexBackground);
            }
        });

        if (!isTouch) {
            document.addEventListener('mousemove', function (e) {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });
            document.addEventListener('mouseleave', function () {
                mouseX = -9999;
                mouseY = -9999;
            });
            document.addEventListener('click', function (e) {
                for (var i = 0; i < hexagons.length; i++) {
                    var hex = hexagons[i];
                    var dx = hex.x - e.clientX;
                    var dy = hex.y - e.clientY;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 300) {
                        hex.pulse += (1 - dist / 300) * 1.2;
                    }
                }
            });
        }

        if (prefersReducedMotion) {
            cancelAnimationFrame(hexAnimId);
            drawHexBackground();
            cancelAnimationFrame(hexAnimId);
        } else {
            hexAnimId = requestAnimationFrame(drawHexBackground);
        }
    }

    // ===== AMBIENT PARTICLES =====
    var ambientEl = document.getElementById('ambientParticles');
    if (ambientEl && !prefersReducedMotion) {
        var pCount = isTouch ? 10 : 18;
        var pColors = [
            'rgba(0, 255, 170, 0.5)',
            'rgba(0, 212, 255, 0.4)',
            'rgba(0, 255, 213, 0.4)'
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
            var color = pColors[Math.floor(Math.random() * pColors.length)];
            p.style.background = color;
            p.style.boxShadow = '0 0 6px ' + color;
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

    // ===== DOWNLOAD BUTTON =====
    var dlBtn = document.getElementById('downloadBtn');
    if (dlBtn) {
        dlBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (this.dataset.loading === 'true') return;

            var url = this.getAttribute('href');
            var app = this.getAttribute('data-app') || 'unknown';
            var btn = this;

            if (!url || url === '#' || url.indexOf('ВАШ_ID') !== -1) {
                alert('Файл ещё не загружен. Попробуйте позже.');
                return;
            }

            btn.dataset.loading = 'true';
            var orig = btn.innerHTML;

            window.open(url, '_blank');

            fetch(API_BASE + '/' + NAMESPACE + '/total-downloads/up').catch(function () {});
            fetch(API_BASE + '/' + NAMESPACE + '/download-' + app + '/up').catch(function () {});

            btn.innerHTML = '✓ Скачивание начато!';
            btn.style.background = 'linear-gradient(135deg, #00ffaa, #00d490)';
            btn.style.color = '#020a14';

            setTimeout(function () {
                btn.innerHTML = orig;
                btn.style.background = '';
                btn.style.color = '';
                delete btn.dataset.loading;
            }, 4000);
        });
    }

    // ===== APP SEARCH + FILTERS =====
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

    var imgTouchX = 0;
    imgModal.addEventListener('touchstart', function (e) { imgTouchX = e.touches[0].clientX; }, { passive: true });
    imgModal.addEventListener('touchend', function (e) {
        var diff = imgTouchX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { imgModalIdx += diff > 0 ? 1 : -1; showImageModal(); }
    });

    document.addEventListener('keydown', function (e) {
        if (!imgModal.classList.contains('open')) return;
        if (e.key === 'ArrowRight') { imgModalIdx++; showImageModal(); }
        if (e.key === 'ArrowLeft') { imgModalIdx--; showImageModal(); }
        if (e.key === 'Escape') closeImageModal();
    });

    // Screenshots
    var screenshots = document.querySelectorAll('.screenshot');
    if (screenshots.length) {
        var ssSources = [];
        screenshots.forEach(function (s) { ssSources.push(s.getAttribute('href')); });
        screenshots.forEach(function (s, idx) {
            s.addEventListener('click', function (e) {
                e.preventDefault();
                openImageModal(ssSources, idx);
            });
        });
    }

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
                    cloneEnd.removeAttribute('id');
                    newsTrack.appendChild(cloneEnd);
                }

                for (var j = totalCards - 1; j >= 0; j--) {
                    var cloneStart = originalCards[j].cloneNode(true);
                    cloneStart.setAttribute('data-clone', 'start');
                    cloneStart.setAttribute('aria-hidden', 'true');
                    cloneStart.removeAttribute('id');
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
                if (newsLeft) newsLeft.disabled = false;
                if (newsRight) newsRight.disabled = false;
            }

            if (newsLeft) newsLeft.addEventListener('click', function () { if (slideToDirection) slideToDirection(-1); });
            if (newsRight) newsRight.addEventListener('click', function () { if (slideToDirection) slideToDirection(1); });

            // Touch swipe
            var touchStartX = 0;
            var touchStartTime = 0;

            newsTrack.addEventListener('touchstart', function (e) {
                if (isAnimating) return;
                touchStartX = e.touches[0].clientX;
                touchStartTime = Date.now();
            }, { passive: true });

            newsTrack.addEventListener('touchend', function (e) {
                if (isAnimating) return;
                var diff = touchStartX - e.changedTouches[0].clientX;
                var elapsed = Date.now() - touchStartTime;

                if (Math.abs(diff) > 40 || (Math.abs(diff) > 20 && elapsed < 300)) {
                    if (slideToDirection) slideToDirection(diff > 0 ? 1 : -1);
                }
            });

            // Mouse drag
            var mouseStartX = 0;
            var mouseDragging = false;

            newsTrack.addEventListener('mousedown', function (e) {
                if (isAnimating) return;
                mouseStartX = e.clientX;
                mouseDragging = true;
                newsTrack.classList.add('grabbing');
                e.preventDefault();
            });

            document.addEventListener('mousemove', function (e) {
                if (mouseDragging) e.preventDefault();
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

            // Resize
            var resizeTimer;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () {
                    setCardSizes();
                    jumpToSlide(slideIndex, false);
                }, 150);
            });

            initCarousel();

            // ===== AUTOPLAY =====
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
                if (autoplayTimer) {
                    clearInterval(autoplayTimer);
                    autoplayTimer = null;
                }
            }

            var carouselEl = newsTrack.closest('.news-carousel');
            if (carouselEl) {
                carouselEl.addEventListener('mouseenter', function () { isHovered = true; });
                carouselEl.addEventListener('mouseleave', function () { isHovered = false; });
                carouselEl.addEventListener('touchstart', function () { isHovered = true; }, { passive: true });
                carouselEl.addEventListener('touchend', function () {
                    setTimeout(function () { isHovered = false; }, 3000);
                });
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

            function closeNM() { newsModal.classList.remove('open'); document.body.style.overflow = ''; }
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
                    mC.style.background = 'linear-gradient(135deg, #02101e, #0a2434)';
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
                        a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
                        a.textContent = s.name;
                        mS.appendChild(a);
                    });
                }

                memberModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        });

        function closeMM() { memberModal.classList.remove('open'); document.body.style.overflow = ''; }
        memberModal.querySelector('.member-modal-close').addEventListener('click', closeMM);
        memberModal.querySelector('.member-modal-overlay').addEventListener('click', closeMM);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && memberModal.classList.contains('open')) closeMM();
        });
    }

    // ===== WISH FORM =====
    var wishForm = document.getElementById('wishForm');
    if (wishForm) {
        var wishStatus = document.getElementById('wishStatus');
        var wishSubmit = document.getElementById('wishSubmit');

        wishForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (wishSubmit.dataset.loading === 'true') return;
            wishSubmit.dataset.loading = 'true';
            wishSubmit.querySelector('.wish-submit-text').textContent = 'Отправка...';
            wishSubmit.style.opacity = '0.7';

            var fd = {
                name: (wishForm.querySelector('[name="name"]') || {}).value || 'Аноним',
                wish: (wishForm.querySelector('[name="wish"]') || {}).value || '',
                _subject: 'Пожелание от пользователя NULLER',
                timestamp: new Date().toISOString()
            };

            fetch('https://formspree.io/f/' + FORMSPREE_WISH_ID, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fd)
            })
            .then(function (r) {
                if (r.ok) {
                    wishStatus.textContent = '✓ Спасибо за пожелание! Мы обязательно прочитаем.';
                    wishStatus.className = 'form-status success';
                    wishForm.reset();
                } else throw new Error('err');
            })
            .catch(function () {
                wishStatus.textContent = '⚠ Ошибка. Попробуйте позже или напишите в Telegram.';
                wishStatus.className = 'form-status error';
            })
            .finally(function () {
                wishSubmit.querySelector('.wish-submit-text').textContent = 'Отправить пожелание';
                wishSubmit.style.opacity = '';
                delete wishSubmit.dataset.loading;
            });
        });
    }

    // ===== JOIN FORM =====
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
                    avIm.src = e.target.result; avIm.style.display = 'block';
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
                method: 'POST', headers: { 'Content-Type': 'application/json' },
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
                jSub.style.opacity = ''; delete jSub.dataset.loading;
            });
        });
    }

});

/* ===== MANGO CLICKER COUNTDOWN ===== */
(function () {
    'use strict';

    // 28.05.2026 00:00:00 по Москве (UTC+3)
    var RELEASE_UTC = Date.UTC(2026, 4, 27, 21, 0, 0, 0);

    var elDays = document.getElementById('mangoDays');
    var elHours = document.getElementById('mangoHours');
    var elMinutes = document.getElementById('mangoMinutes');
    var elSeconds = document.getElementById('mangoSeconds');
    var elTimerSection = document.getElementById('mangoTimerSection');
    var elReleased = document.getElementById('mangoReleased');
    var elConfetti = document.getElementById('mangoConfetti');
    var elBtn = document.getElementById('mangoBtn');

    if (
        !elDays || !elHours || !elMinutes || !elSeconds ||
        !elTimerSection || !elReleased || !elConfetti
    ) {
        return;
    }

    var isReleased = false;

    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function updateTimer() {
        var now = Date.now();
        var diff = RELEASE_UTC - now;

        if (diff <= 0) {
            showReleased();
            return;
        }

        var totalSeconds = Math.floor(diff / 1000);
        var days = Math.floor(totalSeconds / 86400);
        var hours = Math.floor((totalSeconds % 86400) / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = totalSeconds % 60;

        elDays.textContent = pad(days);
        elHours.textContent = pad(hours);
        elMinutes.textContent = pad(minutes);
        elSeconds.textContent = pad(seconds);

        setTimeout(updateTimer, 1000 - (Date.now() % 1000));
    }

    function showReleased() {
        if (isReleased) return;
        isReleased = true;

        elTimerSection.style.display = 'none';
        elReleased.style.display = 'block';

        if (elBtn) {
            elBtn.style.pointerEvents = 'auto';
            elBtn.removeAttribute('data-locked');
            elBtn.removeAttribute('aria-disabled');
            elBtn.removeAttribute('tabindex');
        }

        spawnConfetti();
    }

    function spawnConfetti() {
        var colors = ['#00ffaa', '#00d4ff', '#00ffd5', '#00e0bb', '#ffffff', '#6acca8', '#00d490'];
        var shapes = ['circle', 'rect'];
        var count = 80;

        for (var i = 0; i < count; i++) {
            var piece = document.createElement('div');
            piece.className = 'mango-confetti-piece';

            var color = colors[Math.floor(Math.random() * colors.length)];
            var shape = shapes[Math.floor(Math.random() * shapes.length)];
            var left = Math.random() * 100;
            var size = Math.random() * 8 + 5;
            var duration = Math.random() * 2 + 2;
            var delay = Math.random() * 1.5;

            piece.style.left = left + '%';
            piece.style.width = size + 'px';
            piece.style.height = size + 'px';
            piece.style.backgroundColor = color;
            piece.style.borderRadius = shape === 'circle' ? '50%' : '2px';
            piece.style.animationDuration = duration + 's';
            piece.style.animationDelay = delay + 's';

            elConfetti.appendChild(piece);
        }

        setTimeout(function () {
            elConfetti.innerHTML = '';
        }, 5000);
    }

    if (elBtn) {
        elBtn.setAttribute('data-locked', 'true');
        elBtn.setAttribute('aria-disabled', 'true');
        elBtn.setAttribute('tabindex', '-1');
        elBtn.style.pointerEvents = 'none';

        elBtn.addEventListener('click', function (e) {
            if (!isReleased) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
    }

    setInterval(function () {
        if (!isReleased) {
            elReleased.style.display = 'none';
            elTimerSection.style.display = '';
            if (elBtn) {
                elBtn.style.pointerEvents = 'none';
            }
        }
    }, 2000);

    updateTimer();
})();
