// ===== CONSTANTS =====
var NAMESPACE = 'nuller-company-2024';
var API_BASE = 'https://api.counterapi.dev/v1';

document.addEventListener('DOMContentLoaded', function () {

    var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // ===== MATRIX RAIN =====
    var canvas = document.getElementById('matrixCanvas');
    if (canvas) {
        var ctx = canvas.getContext('2d');
        var chars = 'NULLER01アカサタナハマヤラワ{}[]<>/\\';
        var fontSize = window.innerWidth < 600 ? 11 : 14;
        var drops = [];
        var matrixAnimId;
        var lastMatrixTime = 0;
        var matrixInterval = isTouch ? 80 : 50;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drops = Array(Math.ceil(canvas.width / fontSize)).fill(1);
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        function drawMatrix(timestamp) {
            if (timestamp - lastMatrixTime >= matrixInterval) {
                lastMatrixTime = timestamp;
                ctx.fillStyle = 'rgba(13, 61, 13, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#00ff00';
                ctx.font = fontSize + 'px "Share Tech Mono", monospace';
                for (var i = 0; i < drops.length; i++) {
                    var text = chars[Math.floor(Math.random() * chars.length)];
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                    drops[i]++;
                }
            }
            matrixAnimId = requestAnimationFrame(drawMatrix);
        }

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) cancelAnimationFrame(matrixAnimId);
            else matrixAnimId = requestAnimationFrame(drawMatrix);
        });
        matrixAnimId = requestAnimationFrame(drawMatrix);
    }

    // ===== PARTICLES =====
    var particlesEl = document.getElementById('particles');
    if (particlesEl) {
        var count = isTouch ? 15 : 30;
        for (var i = 0; i < count; i++) {
            var p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDelay = (Math.random() * 8) + 's';
            p.style.animationDuration = (6 + Math.random() * 6) + 's';
            var size = (1 + Math.random() * 2) + 'px';
            p.style.width = size; p.style.height = size;
            particlesEl.appendChild(p);
        }
    }

    // ===== CURSOR GLOW =====
    if (!isTouch) {
        var cursorGlow = document.querySelector('.cursor-glow');
        if (!cursorGlow) {
            cursorGlow = document.createElement('div');
            cursorGlow.className = 'cursor-glow';
            document.body.appendChild(cursorGlow);
        }
        var mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
        var glowX = mouseX, glowY = mouseY, glowVis = false;

        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX; mouseY = e.clientY;
            if (!glowVis) { cursorGlow.classList.add('active'); glowVis = true; }
        });
        document.addEventListener('mouseleave', function () { cursorGlow.classList.remove('active'); glowVis = false; });
        document.addEventListener('mouseenter', function () { cursorGlow.classList.add('active'); glowVis = true; });

        (function animGlow() {
            glowX += (mouseX - glowX) * 0.18;
            glowY += (mouseY - glowY) * 0.18;
            cursorGlow.style.transform = 'translate3d(' + glowX + 'px,' + glowY + 'px,0) translate(-50%,-50%)';
            requestAnimationFrame(animGlow);
        })();
    }

    // ===== NAVBAR =====
    var navbar = document.getElementById('navbar');
    if (navbar) window.addEventListener('scroll', function () { navbar.classList.toggle('scrolled', window.scrollY > 50); });

    // ===== MOBILE TOGGLE =====
    var mobileToggle = document.getElementById('mobileToggle');
    var navLinks = document.querySelector('.nav-links');
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open'); mobileToggle.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(function (l) {
            l.addEventListener('click', function () { navLinks.classList.remove('open'); mobileToggle.classList.remove('open'); });
        });
        document.addEventListener('click', function (e) {
            if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
                navLinks.classList.remove('open'); mobileToggle.classList.remove('open');
            }
        });
    }

    // ===== TYPING EFFECT — ПЛАВНАЯ АНИМАЦИЯ =====
    var typingEl = document.getElementById('typingText');
    if (typingEl) {
        var phrases = [
            'Инициализация системы...',
            'Загрузка...',
            'Соединение с сервером...',
            'Вход разрешён!',
            'Добро пожаловать!'
        ];
        var pIdx = 0, cIdx = 0, isDel = false;

        function typeEffect() {
            var current = phrases[pIdx];

            if (!isDel) {
                // Печатаем: добавляем символы с анимацией
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
                // Удаляем: убираем символы
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
    }

    // ===== FADE IN =====
    var fadeEls = document.querySelectorAll('.fade-in');
    if (fadeEls.length) {
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('visible'); });
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

    // ===== COUNTER API =====
    function counterReq(action, key) {
        var url = action ? API_BASE + '/' + NAMESPACE + '/' + key + '/' + action
                         : API_BASE + '/' + NAMESPACE + '/' + key;
        return fetch(url).then(function (r) { return r.json(); })
            .then(function (d) { return d.count || 0; })
            .catch(function () { return null; });
    }

    function animNum(el, from, to) {
        if (from === to) { el.textContent = to; return; }
        var steps = 30, sv = (to - from) / steps, st = 1000 / steps, cur = from, s = 0;
        var ti = setInterval(function () {
            s++; cur += sv;
            if (s >= steps) { el.textContent = to; clearInterval(ti); }
            else el.textContent = Math.floor(cur);
        }, st);
    }

    // ===== USERS PER MINUTE =====
    // Логика: считаем реальных онлайн через API + добавляем детерминистичное псевдослучайное 1-5
    // Псевдослучайное число одинаково для всех пользователей в одну минуту
    var usersEl = document.getElementById('usersPerMinute');
    if (usersEl) {
        var lastSlot = null;

        function getMinuteRandom() {
            // Детерминистичное число 1-5 основанное на текущей минуте
            // Одинаковое у всех устройств в одну и ту же минуту
            var minute = Math.floor(Date.now() / 60000);
            return (minute * 9301 + 49297) % 5 + 1;
        }

        function updateUsers() {
            var curMin = Math.floor(Date.now() / 60000);
            var slot = curMin % 2;
            var slotKey = 'users-slot-' + slot;

            // Регистрируем посещение при смене слота
            if (lastSlot !== slot) {
                lastSlot = slot;
                counterReq('up', slotKey);
            }

            counterReq('', slotKey).then(function (realCount) {
                if (realCount === null) realCount = 0;
                var bonus = getMinuteRandom();
                var total = realCount + bonus;
                animNum(usersEl, parseInt(usersEl.textContent) || 0, total);
            });
        }

        updateUsers();
        setInterval(updateUsers, 10000);
    }

    // ===== TOTAL DOWNLOADS =====
    var dlEl = document.getElementById('totalDownloads');
    if (dlEl) {
        function updateDL() {
            counterReq('', 'total-downloads').then(function (c) {
                if (c !== null) animNum(dlEl, parseInt(dlEl.textContent) || 0, c);
            });
        }
        updateDL();
        setInterval(updateDL, 15000);
    }

    // ===== DOWNLOAD BUTTON — ПРЯМОЕ СКАЧИВАНИЕ + СЧЁТЧИК =====
    var dlBtn = document.getElementById('downloadBtn');
    if (dlBtn) {
        dlBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (this.dataset.loading === 'true') return;

            var url = this.getAttribute('href');
            var app = this.getAttribute('data-app') || 'unknown';
            var btn = this;

            if (!url || url === '#') { alert('Файл не загружен'); return; }

            btn.dataset.loading = 'true';
            var orig = btn.innerHTML;

            // Перекидываем на страницу загрузки Google Drive
            window.location.href = url;

            // Увеличиваем счётчик
            fetch(API_BASE + '/' + NAMESPACE + '/total-downloads/up').catch(function () {});
            fetch(API_BASE + '/' + NAMESPACE + '/download-' + app + '/up').catch(function () {});

            btn.innerHTML = '✓ Скачивание начато!';
            btn.style.background = '#009900';
            btn.style.color = '#fff';

            setTimeout(function () {
                btn.innerHTML = orig;
                btn.style.background = '';
                btn.style.color = '';
                delete btn.dataset.loading;
            }, 4000);
        });
    }

    // ===== APP SEARCH =====
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
        var noRes = document.getElementById('noResults');
        var sTimer;
        searchInput.addEventListener('input', function () {
            clearTimeout(sTimer);
            sTimer = setTimeout(function () {
                var q = searchInput.value.toLowerCase().trim();
                var vis = 0;
                document.querySelectorAll('.app-card').forEach(function (card) {
                    var n = (card.querySelector('.app-name') || {}).textContent || '';
                    var d = (card.querySelector('.app-desc') || {}).textContent || '';
                    var tags = '';
                    card.querySelectorAll('.app-tag').forEach(function (t) { tags += ' ' + t.textContent; });
                    var m = n.toLowerCase().includes(q) || d.toLowerCase().includes(q) || tags.toLowerCase().includes(q);
                    card.style.display = m ? '' : 'none';
                    if (m) vis++;
                });
                if (noRes) noRes.style.display = vis === 0 ? 'block' : 'none';
            }, 200);
        });
    }

    // ===== UNIVERSAL IMAGE MODAL (для скриншотов И галереи разработчиков) =====
    // Создаём один модал для всех изображений
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
    imgModal.addEventListener('touchstart', function (e) { imgTouchX = e.touches[0].clientX; });
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

    // ===== Привязка скриншотов к универсальному модалу =====
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

           // ===== NEWS CAROUSEL — БЕСШОВНАЯ КРУГОВАЯ =====
        var newsTrack = document.getElementById('newsTrack');
        var newsDots = document.getElementById('newsDots');
        var newsLeft = document.getElementById('newsLeft');
        var newsRight = document.getElementById('newsRight');
    
        if (newsTrack) {
            var originalCards = Array.from(newsTrack.querySelectorAll('.news-card'));
            var totalCards = originalCards.length;
    
            if (totalCards <= 1) {
                // Одна новость — без карусели
                if (newsLeft) newsLeft.style.display = 'none';
                if (newsRight) newsRight.style.display = 'none';
                if (newsDots) newsDots.style.display = 'none';
                originalCards.forEach(function (c) { c.style.minWidth = '100%'; });
            } else {
                // === Карусель: всегда показываем 1 карточку по центру ===
                var slideIndex = 0;
                var isAnimating = false;
                var allSlides = []; // будет заполнен после клонирования
                var clonesCount = 0;
    
                function buildCarousel() {
                    // Удаляем старые клоны
                    newsTrack.querySelectorAll('[data-clone]').forEach(function (c) { c.remove(); });
    
                    // Клонируем все карточки в начало и конец для бесшовности
                    clonesCount = totalCards;
    
                    // Клоны в конец
                    for (var i = 0; i < clonesCount; i++) {
                        var cloneEnd = originalCards[i].cloneNode(true);
                        cloneEnd.setAttribute('data-clone', 'end');
                        cloneEnd.removeAttribute('id');
                        newsTrack.appendChild(cloneEnd);
                    }
    
                    // Клоны в начало (вставляем перед первым элементом)
                    for (var j = totalCards - 1; j >= 0; j--) {
                        var cloneStart = originalCards[j].cloneNode(true);
                        cloneStart.setAttribute('data-clone', 'start');
                        cloneStart.removeAttribute('id');
                        newsTrack.insertBefore(cloneStart, newsTrack.firstChild);
                    }
    
                    // Собираем все слайды (клоны начала + оригиналы + клоны конца)
                    allSlides = Array.from(newsTrack.querySelectorAll('.news-card'));
    
                    // Привязываем клики на клонах к модалке
                    allSlides.forEach(function (slide) {
                        if (slide.getAttribute('data-clone')) {
                            slide.addEventListener('click', function () {
                                var idx = parseInt(slide.getAttribute('data-news'));
                                if (!isNaN(idx) && originalCards[idx]) {
                                    originalCards[idx].click();
                                }
                            });
                        }
                    });
                }
    
                function getCardWidth() {
                    // Всегда 1 карточка на экран — гарантирует что вся плашка видна
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
                    // realIndex: 0..totalCards-1 (индекс оригинальной карточки)
                    // В массиве allSlides оригиналы начинаются с позиции clonesCount
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
    
                function slideToDirection(dir) {
                    // dir: 1 (вперёд) или -1 (назад)
                    if (isAnimating) return;
                    isAnimating = true;
    
                    var w = getCardWidth();
                    var currentPos = clonesCount + slideIndex;
                    var nextPos = currentPos + dir;
    
                    newsTrack.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    newsTrack.style.transform = 'translateX(-' + (nextPos * w) + 'px)';
    
                    // Вычисляем реальный индекс
                    var nextReal = ((slideIndex + dir) % totalCards + totalCards) % totalCards;
    
                    setTimeout(function () {
                        // Телепортируемся к оригиналу без анимации
                        newsTrack.style.transition = 'none';
                        slideIndex = nextReal;
                        var realPos = clonesCount + slideIndex;
                        newsTrack.style.transform = 'translateX(-' + (realPos * w) + 'px)';
                        updateDots();
                        isAnimating = false;
                    }, 460);
                }
    
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
                                if (isAnimating) return;
                                if (idx === slideIndex) return;
    
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
    
                // Стрелки
                if (newsLeft) newsLeft.addEventListener('click', function () { slideToDirection(-1); });
                if (newsRight) newsRight.addEventListener('click', function () { slideToDirection(1); });
    
                // Touch свайп
                var touchStartX = 0;
                var touchStartTime = 0;
                var touchMoved = false;
    
                newsTrack.addEventListener('touchstart', function (e) {
                    if (isAnimating) return;
                    touchStartX = e.touches[0].clientX;
                    touchStartTime = Date.now();
                    touchMoved = false;
                }, { passive: true });
    
                newsTrack.addEventListener('touchmove', function () {
                    touchMoved = true;
                }, { passive: true });
    
                newsTrack.addEventListener('touchend', function (e) {
                    if (isAnimating) return;
                    var diff = touchStartX - e.changedTouches[0].clientX;
                    var elapsed = Date.now() - touchStartTime;
    
                    // Быстрый свайп (< 300ms) или длинный (> 40px)
                    if (Math.abs(diff) > 40 || (Math.abs(diff) > 20 && elapsed < 300)) {
                        if (diff > 0) slideToDirection(1);
                        else slideToDirection(-1);
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
                        if (diff > 0) slideToDirection(1);
                        else slideToDirection(-1);
                    }
                });
    
                // Ресайз — пересчитываем
                var resizeTimer;
                window.addEventListener('resize', function () {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(function () {
                        setCardSizes();
                        jumpToSlide(slideIndex, false);
                    }, 150);
                });
    
                // Запуск
                initCarousel();
            }
    
            // ===== NEWS MODAL =====
            var newsModal = document.getElementById('newsModal');
            if (newsModal) {
                var newsData = [
                    { title: 'Компания потеряла разработчиков!', image: 'assets/images/news/news-devs.png', body: 'Компании срочно требуются разработчики! Если вы умеете программировать или делать дизайн, присоединяйтесь к нашей команде. Подайте заявку на странице «Стать разработчиком».' },
                    { title: 'Движок GECKO', image: 'assets/images/news/news-gecko.png', body: 'Движок GECKO будет работать и в браузере, и на ПК. Движок будет поддерживать онлайн. Скоро релиз! Следите за обновлениями в нашем Telegram-канале.' },
                    { title: 'Мы заботимся о Вас!', image: 'assets/images/news/news-safety.png', body: 'Мы публикуем на сайте только безопасные программы, проверенные модераторами. За безопасность мы отвечаем!' }
                ];
    
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
                    mC.innerHTML = '<img src="' + data.cover + '" alt="">';
                    mC.style.background = '';
                } else {
                    mC.innerHTML = '';
                    mC.style.background = 'linear-gradient(135deg, #031203, #0a3a0a)';
                }

                // Gallery — кликабельная!
                mG.innerHTML = '';
                if (data.gallery && data.gallery.length) {
                    data.gallery.forEach(function (img, gIdx) {
                        var div = document.createElement('div');
                        div.className = 'member-gallery-img';
                        div.innerHTML = '<img src="' + img + '" alt="Фото" loading="lazy">';
                        div.addEventListener('click', function (e) {
                            e.stopPropagation();
                            // Открываем универсальный модал с галереей
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
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && memberModal.classList.contains('open')) closeMM(); });
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
                if (file && file.type.startsWith('image/')) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        avIm.src = e.target.result; avIm.style.display = 'block';
                        if (avPh) avPh.style.display = 'none';
                        avPr.classList.add('has-image');
                    };
                    reader.readAsDataURL(file);
                }
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

            fetch('https://formspree.io/f/YOUR_FORM_ID', {
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
