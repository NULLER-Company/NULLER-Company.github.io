// ===== CONFIG =====
var FORMSPREE_JOIN_ID = 'mjgzkpgj';

document.addEventListener('DOMContentLoaded', function () {

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // ===== BACKGROUND — smooth gradient blobs =====
    var bgCanvas = document.querySelector('.bg-canvas');
    if (bgCanvas && !prefersReducedMotion) {
        var ctx = bgCanvas.getContext('2d');
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var blobs = [];
        var w, h, animId;
    
        function resize() {
            w = window.innerWidth;
            h = window.innerHeight;
            bgCanvas.width = w * dpr;
            bgCanvas.height = h * dpr;
            bgCanvas.style.width = w + 'px';
            bgCanvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
    
        function initBlobs() {
            blobs = [];
            var count = isTouch ? 2 : 3;
            for (var i = 0; i < count; i++) {
                blobs.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: 400 + Math.random() * 300,
                    vx: (Math.random() - 0.5) * 0.15,
                    vy: (Math.random() - 0.5) * 0.15
                });
            }
        }
    
        function drawBg() {
            // Полностью очищаем — чтобы не было артефактов
            ctx.clearRect(0, 0, w, h);
    
            for (var i = 0; i < blobs.length; i++) {
                var b = blobs[i];
                b.x += b.vx;
                b.y += b.vy;
    
                if (b.x < -b.r) b.x = w + b.r;
                if (b.x > w + b.r) b.x = -b.r;
                if (b.y < -b.r) b.y = h + b.r;
                if (b.y > h + b.r) b.y = -b.r;
    
                var grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
                grad.addColorStop(0, 'rgba(57, 255, 20, 0.06)');
                grad.addColorStop(0.4, 'rgba(57, 255, 20, 0.02)');
                grad.addColorStop(1, 'rgba(57, 255, 20, 0)');
                ctx.fillStyle = grad;
                ctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
            }
    
            animId = requestAnimationFrame(drawBg);
        }
    
        resize();
        initBlobs();
        drawBg();
    
        var rTimer;
        window.addEventListener('resize', function () {
            clearTimeout(rTimer);
            rTimer = setTimeout(function () {
                resize();
                initBlobs();
            }, 200);
        });
    
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) cancelAnimationFrame(animId);
            else animId = requestAnimationFrame(drawBg);
        });
    }
    
    // ===== NAVBAR SCROLL =====
    var navbar = document.getElementById('navbar');
    if (navbar) {
        var scrollTimer;
        window.addEventListener('scroll', function () {
            if (scrollTimer) return;
            scrollTimer = requestAnimationFrame(function () {
                navbar.classList.toggle('scrolled', window.scrollY > 30);
                scrollTimer = null;
            });
        });
    }

    // ===== MOBILE TOGGLE =====
    var mToggle = document.getElementById('mobileToggle');
    var navLinks = document.querySelector('.nav-links');
    if (mToggle && navLinks) {
        mToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            navLinks.classList.toggle('open');
            mToggle.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(function (l) {
            l.addEventListener('click', function () {
                navLinks.classList.remove('open');
                mToggle.classList.remove('open');
            });
        });
        document.addEventListener('click', function (e) {
            if (!navLinks.contains(e.target) && !mToggle.contains(e.target)) {
                navLinks.classList.remove('open');
                mToggle.classList.remove('open');
            }
        });
    }

    // ===== REVEAL ON SCROLL =====
    var reveals = document.querySelectorAll('.reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
        var revObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    revObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        reveals.forEach(function (el) { revObs.observe(el); });
    }

    // ===== STAT COUNTERS =====
    var stats = document.querySelectorAll('.stat-num[data-target]');
    if (stats.length && 'IntersectionObserver' in window) {
        var statObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                var el = e.target;
                var target = parseInt(el.getAttribute('data-target'), 10);
                var current = 0;
                var duration = 1500;
                var start = null;

                function step(ts) {
                    if (!start) start = ts;
                    var progress = Math.min((ts - start) / duration, 1);
                    var eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.floor(target * eased);
                    if (progress < 1) requestAnimationFrame(step);
                    else el.textContent = target;
                }

                requestAnimationFrame(step);
                statObs.unobserve(el);
            });
        }, { threshold: 0.4 });
        stats.forEach(function (s) { statObs.observe(s); });
    }

    // ===== APP CARD HOVER GLOW =====
    document.querySelectorAll('.app-card').forEach(function (card) {
        if (isTouch) return;
        card.addEventListener('mousemove', function (e) {
            var r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
    });

    // ===== SEARCH =====
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
        var noRes = document.getElementById('noResults');
        var sTimer;

        function applySearch() {
            var q = searchInput.value.toLowerCase().trim();
            var vis = 0;
            document.querySelectorAll('.app-card').forEach(function (card) {
                var n = (card.querySelector('.app-name') || {}).textContent || '';
                var d = (card.querySelector('.app-desc') || {}).textContent || '';
                var tags = '';
                card.querySelectorAll('.app-tag').forEach(function (t) { tags += ' ' + t.textContent; });

                var match = !q ||
                    n.toLowerCase().indexOf(q) !== -1 ||
                    d.toLowerCase().indexOf(q) !== -1 ||
                    tags.toLowerCase().indexOf(q) !== -1;

                card.style.display = match ? '' : 'none';
                if (match) vis++;
            });
            if (noRes) noRes.style.display = vis === 0 ? 'block' : 'none';
        }

        searchInput.addEventListener('input', function () {
            clearTimeout(sTimer);
            sTimer = setTimeout(applySearch, 180);
        });
    }

    // ===== DOWNLOAD BUTTON =====
    var dlBtn = document.getElementById('downloadBtn');
    if (dlBtn) {
        dlBtn.addEventListener('click', function (e) {
            if (this.dataset.loading === 'true') { e.preventDefault(); return; }
            var url = this.getAttribute('href');
            if (!url || url === '#') { e.preventDefault(); alert('Файл ещё не загружен.'); return; }

            var orig = this.innerHTML;
            this.dataset.loading = 'true';

            var btn = this;
            setTimeout(function () {
                btn.innerHTML = '<span class="dl-button-icon">✓</span> Скачивание начато';
                setTimeout(function () {
                    btn.innerHTML = orig;
                    delete btn.dataset.loading;
                }, 3000);
            }, 100);
        });
    }

    // ===== IMAGE MODAL =====
    var imgModal = document.createElement('div');
    imgModal.className = 'img-modal';
    imgModal.innerHTML =
        '<button class="img-modal-close" aria-label="Закрыть">✕</button>' +
        '<button class="img-modal-prev" aria-label="Назад">‹</button>' +
        '<button class="img-modal-next" aria-label="Вперёд">›</button>' +
        '<img src="" alt="">' +
        '<div class="img-modal-counter"></div>';
    document.body.appendChild(imgModal);

    var imgEl = imgModal.querySelector('img');
    var imgCounter = imgModal.querySelector('.img-modal-counter');
    var imgPrev = imgModal.querySelector('.img-modal-prev');
    var imgNext = imgModal.querySelector('.img-modal-next');
    var imgSources = [];
    var imgIdx = 0;

    function openImg(sources, idx) {
        imgSources = sources;
        imgIdx = idx || 0;
        showImg();
        imgModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function showImg() {
        imgIdx = (imgIdx + imgSources.length) % imgSources.length;
        imgEl.src = imgSources[imgIdx];
        if (imgSources.length > 1) {
            imgCounter.textContent = (imgIdx + 1) + ' / ' + imgSources.length;
            imgCounter.style.display = '';
            imgPrev.style.display = '';
            imgNext.style.display = '';
        } else {
            imgCounter.style.display = 'none';
            imgPrev.style.display = 'none';
            imgNext.style.display = 'none';
        }
    }

    function closeImg() {
        imgModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    imgModal.querySelector('.img-modal-close').addEventListener('click', function (e) { e.stopPropagation(); closeImg(); });
    imgPrev.addEventListener('click', function (e) { e.stopPropagation(); imgIdx--; showImg(); });
    imgNext.addEventListener('click', function (e) { e.stopPropagation(); imgIdx++; showImg(); });
    imgModal.addEventListener('click', function (e) { if (e.target === imgModal) closeImg(); });

    document.addEventListener('keydown', function (e) {
        if (!imgModal.classList.contains('open')) return;
        if (e.key === 'Escape') closeImg();
        if (e.key === 'ArrowRight') { imgIdx++; showImg(); }
        if (e.key === 'ArrowLeft') { imgIdx--; showImg(); }
    });

    var screenshots = document.querySelectorAll('.screenshot');
    if (screenshots.length) {
        var ssSrcs = [];
        screenshots.forEach(function (s) { ssSrcs.push(s.getAttribute('href')); });
        screenshots.forEach(function (s, idx) {
            s.addEventListener('click', function (e) {
                e.preventDefault();
                openImg(ssSrcs, idx);
            });
        });
    }

    // ===== NEWS CAROUSEL =====
    var newsTrack = document.getElementById('newsTrack');
    if (newsTrack) {
        var originalCards = Array.from(newsTrack.querySelectorAll('.news-card'));
        var totalCards = originalCards.length;
        var newsArrows = document.querySelectorAll('.news-arrow');
        var newsDotsEl = document.getElementById('newsDots');

        if (totalCards > 1) {
            var idx = 0;
            var isAnim = false;

            function cardWidth() {
                return newsTrack.parentElement.offsetWidth;
            }

            function setSizes() {
                var w = cardWidth();
                originalCards.forEach(function (c) {
                    c.style.flex = '0 0 ' + w + 'px';
                });
            }

            function goTo(i, animate) {
                idx = ((i % totalCards) + totalCards) % totalCards;
                var w = cardWidth();
                newsTrack.style.transition = animate ? 'transform 0.5s cubic-bezier(0.4,0,0.2,1)' : 'none';
                newsTrack.style.transform = 'translateX(-' + (idx * w) + 'px)';
                updateDots();
            }

            function next() { if (!isAnim) { isAnim = true; goTo(idx + 1, true); setTimeout(function () { isAnim = false; }, 500); } }
            function prev() { if (!isAnim) { isAnim = true; goTo(idx - 1, true); setTimeout(function () { isAnim = false; }, 500); } }

            function updateDots() {
                if (!newsDotsEl) return;
                newsDotsEl.querySelectorAll('.news-dot').forEach(function (d, i) {
                    d.classList.toggle('active', i === idx);
                });
            }

            if (newsDotsEl) {
                newsDotsEl.innerHTML = '';
                for (var i = 0; i < totalCards; i++) {
                    (function (n) {
                        var d = document.createElement('button');
                        d.className = 'news-dot' + (n === 0 ? ' active' : '');
                        d.setAttribute('aria-label', 'Новость ' + (n + 1));
                        d.addEventListener('click', function () { if (!isAnim) { isAnim = true; goTo(n, true); setTimeout(function () { isAnim = false; }, 500); } });
                        newsDotsEl.appendChild(d);
                    })(i);
                }
            }

            newsArrows.forEach(function (a) {
                if (a.classList.contains('news-arrow') && a.textContent.trim() === '‹') a.addEventListener('click', prev);
                else if (a.classList.contains('news-arrow')) a.addEventListener('click', next);
            });

            // Touch swipe
            var tX = 0;
            newsTrack.addEventListener('touchstart', function (e) { tX = e.touches[0].clientX; }, { passive: true });
            newsTrack.addEventListener('touchend', function (e) {
                var d = tX - e.changedTouches[0].clientX;
                if (Math.abs(d) > 40) d > 0 ? next() : prev();
            });

            setSizes();
            goTo(0, false);

            var rt;
            window.addEventListener('resize', function () {
                clearTimeout(rt);
                rt = setTimeout(function () { setSizes(); goTo(idx, false); }, 150);
            });

            // Autoplay
            var autoplay = setInterval(function () {
                if (!document.hidden && !isAnim) next();
            }, 8000);

            newsTrack.parentElement.addEventListener('mouseenter', function () { clearInterval(autoplay); });
        } else {
            newsArrows.forEach(function (a) { a.style.display = 'none'; });
            if (newsDotsEl) newsDotsEl.style.display = 'none';
        }

        // News modal
        var newsModal = document.getElementById('newsModal');
        if (newsModal) {
            var newsData = {
                0: { title: 'Требуются разработчики!', image: 'assets/images/news/news-devs.png', body: 'NULLER Studio ищет талантливых разработчиков и геймдизайнеров! Если вы хотите создавать игры вместе с нами — заполните заявку на странице «Стать разработчиком».' },
                1: { title: 'Движок GECKO', image: 'assets/images/news/news-gecko.png', body: 'Наш собственный игровой движок GECKO находится в активной разработке. Он будет работать и в браузере, и на ПК, с поддержкой мультиплеера. Скоро — публичный релиз!' },
                2: { title: 'Мы заботимся о безопасности', image: 'assets/images/news/news-safety.png', body: 'Все приложения на нашем сайте проходят проверку. Мы публикуем только безопасные программы. За вашу безопасность мы отвечаем!' }
            };

            var nMT = document.getElementById('newsModalTitle');
            var nMB = document.getElementById('newsModalBody');
            var nMI = document.getElementById('newsModalImage');

            originalCards.forEach(function (card) {
                card.addEventListener('click', function () {
                    var i = parseInt(card.getAttribute('data-news'), 10);
                    var d = newsData[i];
                    if (!d) return;
                    nMT.textContent = d.title;
                    nMB.textContent = d.body;
                    nMI.innerHTML = '<img src="' + d.image + '" alt="' + d.title + '">';
                    newsModal.classList.add('open');
                    document.body.style.overflow = 'hidden';
                });
            });

            function closeNews() { newsModal.classList.remove('open'); document.body.style.overflow = ''; }
            newsModal.querySelector('.modal-close').addEventListener('click', closeNews);
            newsModal.querySelector('.modal-overlay').addEventListener('click', closeNews);
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && newsModal.classList.contains('open')) closeNews();
            });
        }
    }

    // ===== TEAM MODAL =====
    var memberModal = document.getElementById('memberModal');
    if (memberModal) {
        var members = {
            'vak5037': {
                name: 'Vak5037', role: 'Основатель',
                avatar: 'assets/images/vak5037.png',
                cover: 'assets/images/covers/vak5037-cover.png',
                bio: 'Основатель NULLER Studio. Ведёт разработку игр и управляет проектами студии.',
                gallery: ['assets/images/gallery/vak5037-1.png', 'assets/images/gallery/vak5037-2.png', 'assets/images/gallery/vak5037-3.png'],
                socials: [{ name: 'Telegram', url: 'https://t.me/+1vhGt7PhYGo1OThi' }]
            },
            'redmik03': {
                name: 'redmik03', role: 'Рекламист',
                avatar: 'assets/images/redmik03.png',
                cover: 'assets/images/covers/redmik03-cover.png',
                bio: 'Рекламист NULLER Studio. Отвечает за продвижение и рост аудитории.',
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
                var d = members[card.getAttribute('data-member')];
                if (!d) return;

                mN.textContent = d.name;
                mR.textContent = d.role;
                mA.innerHTML = '<img src="' + d.avatar + '" alt="' + d.name + '">';
                mB.textContent = d.bio;

                if (d.cover) {
                    mC.innerHTML = '<img src="' + d.cover + '" alt="">';
                } else {
                    mC.innerHTML = '';
                }

                mG.innerHTML = '';
                if (d.gallery && d.gallery.length) {
                    d.gallery.forEach(function (img, gI) {
                        var div = document.createElement('div');
                        div.className = 'member-gallery-img';
                        div.innerHTML = '<img src="' + img + '" alt="" loading="lazy">';
                        div.addEventListener('click', function (e) { e.stopPropagation(); openImg(d.gallery, gI); });
                        mG.appendChild(div);
                    });
                }

                mS.innerHTML = '';
                if (d.socials) {
                    d.socials.forEach(function (s) {
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

        function closeMem() { memberModal.classList.remove('open'); document.body.style.overflow = ''; }
        memberModal.querySelector('.modal-close').addEventListener('click', closeMem);
        memberModal.querySelector('.modal-overlay').addEventListener('click', closeMem);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && memberModal.classList.contains('open')) closeMem();
        });
    }

    // ===== JOIN FORM =====
    var joinForm = document.getElementById('joinForm');
    if (joinForm) {
        var fStat = document.getElementById('formStatus');
        var jSub = document.getElementById('joinSubmit');

        joinForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (jSub.dataset.loading === 'true') return;
            jSub.dataset.loading = 'true';
            var origText = jSub.textContent;
            jSub.textContent = 'Отправка…';
            jSub.style.opacity = '0.7';

            var fd = new FormData(joinForm);
            var obj = {};
            fd.forEach(function (v, k) { obj[k] = v; });
            obj.timestamp = new Date().toISOString();

            fetch('https://formspree.io/f/' + FORMSPREE_JOIN_ID, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(obj)
            })
            .then(function (r) {
                if (r.ok) {
                    fStat.textContent = '✓ Заявка отправлена!';
                    fStat.className = 'form-status success';
                    joinForm.reset();
                } else throw new Error();
            })
            .catch(function () {
                fStat.textContent = '⚠ Ошибка. Напишите в Telegram.';
                fStat.className = 'form-status error';
            })
            .finally(function () {
                jSub.textContent = origText;
                jSub.style.opacity = '';
                delete jSub.dataset.loading;
            });
        });
    }

    // ===== TYPING EFFECT =====
    var typingEl = document.getElementById('typingText');
    if (typingEl && !prefersReducedMotion) {
        var phrases = [
            'Создаём игры для тебя.',
            'Собственный движок GECKO.',
            'Играм — быть.'
        ];
        var pi = 0, ci = 0, del = false;

        function tick() {
            var cur = phrases[pi];
            if (!del) {
                ci++;
                typingEl.textContent = cur.slice(0, ci);
                if (ci >= cur.length) { setTimeout(function () { del = true; tick(); }, 2200); return; }
                setTimeout(tick, 55);
            } else {
                ci--;
                typingEl.textContent = cur.slice(0, ci);
                if (ci <= 0) { del = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 300); return; }
                setTimeout(tick, 25);
            }
        }
        setTimeout(tick, 900);
    } else if (typingEl) {
        typingEl.textContent = 'Играм — быть.';
    }

});
