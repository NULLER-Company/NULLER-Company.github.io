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
                    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
            }
            matrixAnimId = requestAnimationFrame(drawMatrix);
        }

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                cancelAnimationFrame(matrixAnimId);
            } else {
                matrixAnimId = requestAnimationFrame(drawMatrix);
            }
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
            p.style.width = size;
            p.style.height = size;
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

        var mouseX = window.innerWidth / 2;
        var mouseY = window.innerHeight / 2;
        var glowX = mouseX;
        var glowY = mouseY;
        var glowVisible = false;

        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!glowVisible) {
                cursorGlow.classList.add('active');
                glowVisible = true;
            }
        });

        document.addEventListener('mouseleave', function () {
            cursorGlow.classList.remove('active');
            glowVisible = false;
        });

        document.addEventListener('mouseenter', function () {
            cursorGlow.classList.add('active');
            glowVisible = true;
        });

        function animateGlow() {
            glowX += (mouseX - glowX) * 0.18;
            glowY += (mouseY - glowY) * 0.18;
            cursorGlow.style.transform = 'translate3d(' + glowX + 'px, ' + glowY + 'px, 0) translate(-50%, -50%)';
            requestAnimationFrame(animateGlow);
        }
        animateGlow();
    }

    // ===== NAVBAR SCROLL =====
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

        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
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
    if (typingEl) {
        var phrases = [
            'Инициализация системы...',
            'Загрузка...',
            'Соединение с сервером...',
            'Вход разрешён!',
            'Добро пожаловать!'
        ];
        var phraseIdx = 0;
        var charIdx = 0;
        var isDeleting = false;

        function typeEffect() {
            var current = phrases[phraseIdx];
            typingEl.textContent = isDeleting
                ? current.substring(0, charIdx--)
                : current.substring(0, charIdx++);

            var speed = isDeleting ? 30 : 60;

            if (!isDeleting && charIdx > current.length) {
                speed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIdx < 0) {
                isDeleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                speed = 500;
            }
            setTimeout(typeEffect, speed);
        }
        setTimeout(typeEffect, 800);
    }

    // ===== FADE IN ON SCROLL =====
    var fadeEls = document.querySelectorAll('.fade-in');
    if (fadeEls.length) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.1 });
        fadeEls.forEach(function (el) { observer.observe(el); });
    }

    // ===== STATIC COUNTERS =====
    var staticCounters = document.querySelectorAll('.stat-number[data-static="true"]');
    if (staticCounters.length) {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var target = +entry.target.getAttribute('data-target');
                    var current = 0;
                    var increment = target / 60;
                    var timer = setInterval(function () {
                        current += increment;
                        if (current >= target) {
                            entry.target.textContent = target;
                            clearInterval(timer);
                        } else {
                            entry.target.textContent = Math.floor(current);
                        }
                    }, 25);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        staticCounters.forEach(function (c) { counterObserver.observe(c); });
    }

    // ===== COUNTER API =====
    function counterRequest(action, key) {
        var url = action
            ? API_BASE + '/' + NAMESPACE + '/' + key + '/' + action
            : API_BASE + '/' + NAMESPACE + '/' + key;
        return fetch(url)
            .then(function (r) { return r.json(); })
            .then(function (d) { return d.count || 0; })
            .catch(function (e) {
                console.warn('[NULLER Counter] Error:', e.message);
                return null;
            });
    }

    // ===== USERS PER MINUTE =====
    var usersEl = document.getElementById('usersPerMinute');
    if (usersEl) {
        var lastSlot = null;

        function updateUsersCounter() {
            var currentMinute = Math.floor(Date.now() / 60000);
            var slot = currentMinute % 2;
            var slotKey = 'users-slot-' + slot;

            if (lastSlot !== slot) {
                lastSlot = slot;
                counterRequest('up', slotKey);
            }

            counterRequest('', slotKey).then(function (count) {
                if (count !== null) {
                    animateNumber(usersEl, parseInt(usersEl.textContent) || 0, count);
                }
            });
        }

        updateUsersCounter();
        setInterval(updateUsersCounter, 10000);
    }

    // ===== TOTAL DOWNLOADS =====
    var downloadsEl = document.getElementById('totalDownloads');
    if (downloadsEl) {
        function updateDownloadsCounter() {
            counterRequest('', 'total-downloads').then(function (count) {
                if (count !== null) {
                    animateNumber(downloadsEl, parseInt(downloadsEl.textContent) || 0, count);
                }
            });
        }

        updateDownloadsCounter();
        setInterval(updateDownloadsCounter, 15000);
    }

    // ===== ANIMATE NUMBER =====
    function animateNumber(element, from, to) {
        if (from === to) { element.textContent = to; return; }
        var steps = 30;
        var stepValue = (to - from) / steps;
        var stepTime = 1000 / steps;
        var current = from;
        var step = 0;
        var timer = setInterval(function () {
            step++;
            current += stepValue;
            if (step >= steps) {
                element.textContent = to;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, stepTime);
    }

    // ===== DOWNLOAD BUTTON =====
    var dlBtn = document.getElementById('downloadBtn');
    if (dlBtn) {
        dlBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (this.dataset.loading === 'true') return;

            var downloadUrl = this.getAttribute('href');
            var appName = this.getAttribute('data-app') || 'unknown';
            var btn = this;

            if (!downloadUrl || downloadUrl === '#') {
                alert('Файл для скачивания ещё не загружен');
                return;
            }

            btn.dataset.loading = 'true';
            var originalText = btn.innerHTML;

            // Сразу открываем ссылку для скачивания
            window.open(downloadUrl, '_blank');

            btn.innerHTML = '✓ Скачивание начато!';
            btn.style.background = '#009900';
            btn.style.color = '#fff';

            // Счётчики в фоне
            fetch(API_BASE + '/' + NAMESPACE + '/total-downloads/up').catch(function () {});
            fetch(API_BASE + '/' + NAMESPACE + '/download-' + appName + '/up').catch(function () {});

            setTimeout(function () {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.color = '';
                delete btn.dataset.loading;
            }, 4000);
        });
    }

    // ===== APP SEARCH =====
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
        var noResults = document.getElementById('noResults');
        var searchTimer;

        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(function () {
                var q = searchInput.value.toLowerCase().trim();
                var visibleCount = 0;

                document.querySelectorAll('.app-card').forEach(function (card) {
                    var name = (card.querySelector('.app-name') || {}).textContent || '';
                    var desc = (card.querySelector('.app-desc') || {}).textContent || '';
                    var tags = '';
                    card.querySelectorAll('.app-tag').forEach(function (t) { tags += ' ' + t.textContent; });

                    var matches = name.toLowerCase().includes(q) ||
                                  desc.toLowerCase().includes(q) ||
                                  tags.toLowerCase().includes(q);
                    card.style.display = matches ? '' : 'none';
                    if (matches) visibleCount++;
                });

                if (noResults) {
                    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
                }
            }, 200);
        });
    }

    // ===== SCREENSHOT MODAL =====
    var screenshots = document.querySelectorAll('.screenshot');
    if (screenshots.length) {
        var sModal = document.createElement('div');
        sModal.className = 'screenshot-modal';
        sModal.innerHTML =
            '<button class="screenshot-modal-close" aria-label="Закрыть">✕</button>' +
            (screenshots.length > 1 ?
                '<button class="screenshot-modal-prev" aria-label="Назад">‹</button>' +
                '<button class="screenshot-modal-next" aria-label="Вперёд">›</button>' : '') +
            '<img src="" alt="Скриншот">' +
            (screenshots.length > 1 ?
                '<div class="screenshot-modal-counter"></div>' : '');
        document.body.appendChild(sModal);

        var sModalImg = sModal.querySelector('img');
        var sCounter = sModal.querySelector('.screenshot-modal-counter');
        var sIdx = 0;

        function showSS(idx) {
            sIdx = (idx + screenshots.length) % screenshots.length;
            sModalImg.src = screenshots[sIdx].getAttribute('href');
            if (sCounter) sCounter.textContent = (sIdx + 1) + ' / ' + screenshots.length;
        }

        screenshots.forEach(function (item, idx) {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                showSS(idx);
                sModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        });

        var sPrev = sModal.querySelector('.screenshot-modal-prev');
        var sNext = sModal.querySelector('.screenshot-modal-next');
        if (sPrev) sPrev.addEventListener('click', function (e) { e.stopPropagation(); showSS(sIdx - 1); });
        if (sNext) sNext.addEventListener('click', function (e) { e.stopPropagation(); showSS(sIdx + 1); });

        function closeSModal() {
            sModal.classList.remove('open');
            document.body.style.overflow = '';
        }

        sModal.querySelector('.screenshot-modal-close').addEventListener('click', function (e) { e.stopPropagation(); closeSModal(); });
        sModal.addEventListener('click', closeSModal);
        sModalImg.addEventListener('click', function (e) { e.stopPropagation(); });

        var sTouchX = 0;
        sModal.addEventListener('touchstart', function (e) { sTouchX = e.touches[0].clientX; });
        sModal.addEventListener('touchend', function (e) {
            var diff = sTouchX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) showSS(diff > 0 ? sIdx + 1 : sIdx - 1);
        });

        document.addEventListener('keydown', function (e) {
            if (!sModal.classList.contains('open')) return;
            if (e.key === 'ArrowRight') showSS(sIdx + 1);
            if (e.key === 'ArrowLeft') showSS(sIdx - 1);
            if (e.key === 'Escape') closeSModal();
        });
    }

    // ===== NEWS CAROUSEL — СДВИГ НА 1 КАРТОЧКУ =====
    var newsTrack = document.getElementById('newsTrack');
    var newsDots = document.getElementById('newsDots');
    var newsLeft = document.getElementById('newsLeft');
    var newsRight = document.getElementById('newsRight');

    if (newsTrack) {
        var newsCards = newsTrack.querySelectorAll('.news-card');
        var totalCards = newsCards.length;
        var currentCard = 0; // индекс первой видимой карточки

        function getVisibleCards() {
            if (window.innerWidth <= 600) return 1;
            if (window.innerWidth <= 900) return 2;
            return 3;
        }

        function getMaxCard() {
            // Максимальный индекс, на который можно сдвинуться
            return Math.max(0, totalCards - getVisibleCards());
        }

        function updateCarousel() {
            var visible = getVisibleCards();
            var maxCard = getMaxCard();

            // Ограничиваем currentCard
            if (currentCard > maxCard) currentCard = maxCard;
            if (currentCard < 0) currentCard = 0;

            // Ширина одной карточки в процентах
            var cardWidth = 100 / visible;
            var offset = currentCard * cardWidth;
            newsTrack.style.transform = 'translateX(-' + offset + '%)';

            // Обновляем стрелки
            if (newsLeft) newsLeft.disabled = (currentCard <= 0);
            if (newsRight) newsRight.disabled = (currentCard >= maxCard);

            // Обновляем точки
            if (newsDots) {
                newsDots.innerHTML = '';
                for (var i = 0; i <= maxCard; i++) {
                    var dot = document.createElement('button');
                    dot.className = 'news-dot' + (i === currentCard ? ' active' : '');
                    dot.setAttribute('aria-label', 'Карточка ' + (i + 1));
                    (function (idx) {
                        dot.addEventListener('click', function () {
                            currentCard = idx;
                            updateCarousel();
                        });
                    })(i);
                    newsDots.appendChild(dot);
                }
            }

            // Обновляем ширину карточек
            newsCards.forEach(function (card) {
                card.style.minWidth = cardWidth + '%';
            });
        }

        // Стрелки — сдвиг ровно на 1 карточку
        if (newsLeft) {
            newsLeft.addEventListener('click', function () {
                if (currentCard > 0) {
                    currentCard--;
                    updateCarousel();
                }
            });
        }

        if (newsRight) {
            newsRight.addEventListener('click', function () {
                if (currentCard < getMaxCard()) {
                    currentCard++;
                    updateCarousel();
                }
            });
        }

        // Touch свайп
        var nTouchX = 0;
        var nDragging = false;

        newsTrack.addEventListener('touchstart', function (e) {
            nTouchX = e.touches[0].clientX;
            nDragging = true;
        });

        newsTrack.addEventListener('touchend', function (e) {
            if (!nDragging) return;
            nDragging = false;
            var diff = nTouchX - e.changedTouches[0].clientX;
            if (diff > 50 && currentCard < getMaxCard()) {
                currentCard++;
                updateCarousel();
            } else if (diff < -50 && currentCard > 0) {
                currentCard--;
                updateCarousel();
            }
        });

        // Mouse drag
        var nMouseX = 0;
        var nMouseDragging = false;

        newsTrack.addEventListener('mousedown', function (e) {
            nMouseX = e.clientX;
            nMouseDragging = true;
            newsTrack.classList.add('grabbing');
            e.preventDefault();
        });

        document.addEventListener('mouseup', function (e) {
            if (!nMouseDragging) return;
            nMouseDragging = false;
            newsTrack.classList.remove('grabbing');
            var diff = nMouseX - e.clientX;
            if (diff > 50 && currentCard < getMaxCard()) {
                currentCard++;
                updateCarousel();
            } else if (diff < -50 && currentCard > 0) {
                currentCard--;
                updateCarousel();
            }
        });

        window.addEventListener('resize', updateCarousel);
        updateCarousel();

        // ===== NEWS MODAL =====
        var newsModal = document.getElementById('newsModal');
        if (newsModal) {
            var newsData = [
                {
                    title: 'Компания потеряла разработчиков!',
                    image: 'assets/images/news/news-devs.png',
                    body: 'Компании срочно требуются разработчики! Если вы умеете программировать или делать дизайн, присоединяйтесь к нашей команде. Подайте заявку на странице «Стать разработчиком».'
                },
                {
                    title: 'Движок GECKO',
                    image: 'assets/images/news/news-gecko.png',
                    body: 'Движок GECKO будет работать и в браузере, и на ПК. Движок будет поддерживать онлайн. Скоро релиз! Следите за обновлениями в нашем Telegram-канале.'
                },
                {
                    title: 'Масштабное обновление сайта',
                    image: 'assets/images/news/news-site.png',
                    body: 'На нашем предыдущем сайте мы обещали масштабное обновление сайта, и мы это сделали! Новый дизайн, новые функции, улучшенная производительность.'
                },
                {
                    title: 'ZERAX Company',
                    image: 'assets/images/news/news-zerax.png',
                    body: 'Полностью противоположная компания, которую создал один из уволившихся разработчиков. Компания не проявляет признаков конкуренции, а наоборот согласилась сотрудничать.'
                },
                {
                    title: 'NULLER сайт закрывается',
                    image: 'assets/images/news/news-oldsite.png',
                    body: 'Старый сайт NULLER закрывается и больше не будет играть роли официального. Однако, сайт останется, как памятник всем разработчикам NULLER. Старый сайт: https://sites.google.com/view/nuller'
                },
                {
                    title: 'Мы заботимся о Вас!',
                    image: 'assets/images/news/news-safety.png',
                    body: 'Мы публикуем на сайте только безопасные программы, проверенные модераторами. За безопасность мы отвечаем!'
                }
            ];

            var nModalTitle = document.getElementById('newsModalTitle');
            var nModalBody = document.getElementById('newsModalBody');
            var nModalImage = document.getElementById('newsModalImage');

            newsCards.forEach(function (card) {
                card.addEventListener('click', function () {
                    var idx = parseInt(card.getAttribute('data-news'));
                    var data = newsData[idx];
                    if (!data) return;

                    nModalTitle.textContent = data.title;
                    nModalBody.textContent = data.body;
                    nModalImage.innerHTML = '<img src="' + data.image + '" alt="' + data.title + '">';
                    newsModal.classList.add('open');
                    document.body.style.overflow = 'hidden';
                });
            });

            function closeNewsModal() {
                newsModal.classList.remove('open');
                document.body.style.overflow = '';
            }

            newsModal.querySelector('.news-modal-close').addEventListener('click', closeNewsModal);
            newsModal.querySelector('.news-modal-overlay').addEventListener('click', closeNewsModal);

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && newsModal.classList.contains('open')) closeNewsModal();
            });
        }
    }

    // ===== TEAM MEMBER MODAL =====
    var memberModal = document.getElementById('memberModal');
    if (memberModal) {
        var membersData = {
            'vak5037': {
                name: 'Vak5037',
                role: 'Основатель',
                avatar: 'assets/images/vak5037.png',
                cover: 'assets/images/covers/vak5037-cover.png',
                bio: 'Основатель компании NULLER Company. Занимается разработкой программ и управлением проектами. Создал компанию для объединения начинающих разработчиков.',
                gallery: [
                    'assets/images/gallery/vak5037-1.png',
                    'assets/images/gallery/vak5037-2.png',
                    'assets/images/gallery/vak5037-3.png'
                ],
                socials: [
                    { name: 'Telegram', url: 'https://t.me/+1vhGt7PhYGo1OThi' }
                ]
            },
            'redmik03': {
                name: 'redmik03',
                role: 'Рекламист',
                avatar: 'assets/images/redmik03.png',
                cover: 'assets/images/covers/redmik03-cover.png',
                bio: 'Рекламист компании NULLER Company. Занимается продвижением продуктов и привлечением новых пользователей.',
                gallery: [
                    'assets/images/gallery/redmik03-1.png',
                    'assets/images/gallery/redmik03-2.png',
                    'assets/images/gallery/redmik03-3.png'
                ],
                socials: [
                    { name: 'Telegram', url: 'https://t.me/+1vhGt7PhYGo1OThi' }
                ]
            }
        };

        var mName = document.getElementById('memberName');
        var mRole = document.getElementById('memberRole');
        var mAvatar = document.getElementById('memberAvatar');
        var mCover = document.getElementById('memberCover');
        var mBio = document.getElementById('memberBio');
        var mGallery = document.getElementById('memberGallery');
        var mSocials = document.getElementById('memberSocials');

        document.querySelectorAll('.team-card[data-member]').forEach(function (card) {
            card.addEventListener('click', function () {
                var key = card.getAttribute('data-member');
                var data = membersData[key];
                if (!data) return;

                mName.textContent = data.name;
                mRole.textContent = '// ' + data.role;
                mAvatar.innerHTML = '<img src="' + data.avatar + '" alt="' + data.name + '">';
                mBio.textContent = data.bio;

                if (data.cover) {
                    mCover.innerHTML = '<img src="' + data.cover + '" alt="">';
                    mCover.style.background = '';
                } else {
                    mCover.innerHTML = '';
                    mCover.style.background = 'linear-gradient(135deg, #031203, #0a3a0a)';
                }

                mGallery.innerHTML = '';
                if (data.gallery && data.gallery.length) {
                    data.gallery.forEach(function (img) {
                        var div = document.createElement('div');
                        div.className = 'member-gallery-img';
                        div.innerHTML = '<img src="' + img + '" alt="Фото" loading="lazy">';
                        mGallery.appendChild(div);
                    });
                }

                mSocials.innerHTML = '';
                if (data.socials && data.socials.length) {
                    data.socials.forEach(function (s) {
                        var a = document.createElement('a');
                        a.className = 'member-social-link';
                        a.href = s.url;
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        a.textContent = s.name;
                        mSocials.appendChild(a);
                    });
                }

                memberModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        });

        function closeMemberModal() {
            memberModal.classList.remove('open');
            document.body.style.overflow = '';
        }

        memberModal.querySelector('.member-modal-close').addEventListener('click', closeMemberModal);
        memberModal.querySelector('.member-modal-overlay').addEventListener('click', closeMemberModal);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && memberModal.classList.contains('open')) closeMemberModal();
        });
    }

    // ===== JOIN FORM =====
    var joinForm = document.getElementById('joinForm');
    if (joinForm) {
        var avatarUpload = document.getElementById('avatarUpload');
        var avatarInput = document.getElementById('avatarInput');
        var avatarPreview = document.getElementById('avatarPreview');
        var avatarImg = document.getElementById('avatarImg');
        var avatarPlaceholder = avatarPreview ? avatarPreview.querySelector('.avatar-placeholder') : null;

        if (avatarUpload && avatarInput) {
            avatarUpload.addEventListener('click', function () {
                avatarInput.click();
            });

            avatarInput.addEventListener('change', function () {
                var file = this.files[0];
                if (file && file.type.startsWith('image/')) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        avatarImg.src = e.target.result;
                        avatarImg.style.display = 'block';
                        if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
                        avatarPreview.classList.add('has-image');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        var bioTextarea = document.getElementById('joinBio');
        var bioCounter = document.getElementById('bioCounter');
        if (bioTextarea && bioCounter) {
            bioTextarea.addEventListener('input', function () {
                bioCounter.textContent = this.value.length;
            });
        }

        var formStatus = document.getElementById('formStatus');
        var joinSubmit = document.getElementById('joinSubmit');

        joinForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (joinSubmit.dataset.loading === 'true') return;
            joinSubmit.dataset.loading = 'true';
            joinSubmit.textContent = 'Отправка...';
            joinSubmit.style.opacity = '0.7';

            var formData = {
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

            // Замените YOUR_FORM_ID на ваш ID с formspree.io
            fetch('https://formspree.io/f/mjgzkpgj', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(function (response) {
                if (response.ok) {
                    formStatus.textContent = '✓ Заявка отправлена! Мы свяжемся с вами.';
                    formStatus.className = 'form-status success';
                    joinForm.reset();
                    if (avatarImg) { avatarImg.style.display = 'none'; avatarImg.src = ''; }
                    if (avatarPlaceholder) avatarPlaceholder.style.display = '';
                    if (avatarPreview) avatarPreview.classList.remove('has-image');
                    if (bioCounter) bioCounter.textContent = '0';
                } else {
                    throw new Error('Server error');
                }
            })
            .catch(function () {
                formStatus.textContent = '⚠ Ошибка отправки. Попробуйте позже или напишите в Telegram.';
                formStatus.className = 'form-status error';
            })
            .finally(function () {
                joinSubmit.textContent = 'Отправить заявку';
                joinSubmit.style.opacity = '';
                delete joinSubmit.dataset.loading;
            });
        });
    }

});
