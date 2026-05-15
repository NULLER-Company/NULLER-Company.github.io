document.addEventListener('DOMContentLoaded', function () {

    // Определение мобильного устройства
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // ===== MATRIX RAIN =====
    const canvas = document.getElementById('matrixCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const chars = 'NULLER01アカサタナハマヤラワ{}[]<>/\\';
        const fontSize = window.innerWidth < 600 ? 11 : 14;
        let drops = Array(Math.floor(window.innerWidth / fontSize)).fill(1);

        function drawMatrix() {
            ctx.fillStyle = 'rgba(13, 61, 13, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00ff00';
            ctx.font = fontSize + 'px JetBrains Mono';
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }

        // На мобильных реже обновляем для экономии батареи
        setInterval(drawMatrix, isTouch ? 80 : 50);
    }

    // ===== PARTICLES =====
    const particlesEl = document.getElementById('particles');
    if (particlesEl) {
        const count = isTouch ? 15 : 30; // меньше частиц на мобильных
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDelay = (Math.random() * 8) + 's';
            p.style.animationDuration = (6 + Math.random() * 6) + 's';
            const size = (1 + Math.random() * 2) + 'px';
            p.style.width = size;
            p.style.height = size;
            particlesEl.appendChild(p);
        }
    }

    // ===== CURSOR GLOW (исправленный, плавный) =====
    if (!isTouch) {
        // Создаём элемент свечения
        let cursorGlow = document.querySelector('.cursor-glow');
        if (!cursorGlow) {
            cursorGlow = document.createElement('div');
            cursorGlow.className = 'cursor-glow';
            document.body.appendChild(cursorGlow);
        }

        // Текущая позиция курсора (моментальная)
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;

        // Текущая позиция свечения (плавно догоняет)
        let glowX = mouseX;
        let glowY = mouseY;

        let isVisible = false;

        // Слушаем мышь
        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!isVisible) {
                cursorGlow.classList.add('active');
                isVisible = true;
            }
        });

        // Скрываем когда курсор уходит из окна
        document.addEventListener('mouseleave', function () {
            cursorGlow.classList.remove('active');
            isVisible = false;
        });

        document.addEventListener('mouseenter', function () {
            cursorGlow.classList.add('active');
            isVisible = true;
        });

        // Плавная анимация через requestAnimationFrame
        function animateGlow() {
            // Интерполяция (плавное приближение)
            const speed = 0.18; // чем больше, тем быстрее догоняет
            glowX += (mouseX - glowX) * speed;
            glowY += (mouseY - glowY) * speed;

            // Используем translate3d для аппаратного ускорения
            cursorGlow.style.transform = 
                'translate3d(' + glowX + 'px, ' + glowY + 'px, 0) translate(-50%, -50%)';

            requestAnimationFrame(animateGlow);
        }
        animateGlow();
    }

    // ===== NAVBAR SCROLL =====
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ===== MOBILE TOGGLE =====
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            mobileToggle.classList.toggle('open');
        });

        // Закрываем меню при клике на ссылку
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('open');
                mobileToggle.classList.remove('open');
            });
        });

        // Закрываем меню при клике вне его
        document.addEventListener('click', function (e) {
            if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
                navLinks.classList.remove('open');
                mobileToggle.classList.remove('open');
            }
        });
    }

    // ===== TYPING EFFECT =====
    const typingEl = document.getElementById('typingText');
    if (typingEl) {
        const phrases = [
            'Инициализация системы...',
            'Загрузка...',
            'Соединение с сервером...',
            'Вход разрешён!',
            'Добро пожаловать!'
        ];
        let phraseIdx = 0, charIdx = 0, isDeleting = false;

        function typeEffect() {
            const current = phrases[phraseIdx];
            typingEl.textContent = isDeleting
                ? current.substring(0, charIdx--)
                : current.substring(0, charIdx++);

            let speed = isDeleting ? 30 : 60;

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
        typeEffect();
    }

    // ===== FADE IN ON SCROLL =====
    const fadeEls = document.querySelectorAll('.fade-in');
    if (fadeEls.length) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.1 });
        fadeEls.forEach(function (el) { observer.observe(el); });
    }

    // ===== COUNTER ANIMATION =====
    const counters = document.querySelectorAll('.stat-number');
    if (counters.length) {
        const counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const target = +entry.target.getAttribute('data-target');
                    let current = 0;
                    const increment = target / 60;
                    const timer = setInterval(function () {
                        current += increment;
                        if (current >= target) {
                            entry.target.textContent = target + '+';
                            clearInterval(timer);
                        } else {
                            entry.target.textContent = Math.floor(current);
                        }
                    }, 25);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(function (c) { counterObserver.observe(c); });
    }

    // ===== DOWNLOAD BUTTON =====
    const dlBtn = document.getElementById('downloadBtn');
    if (dlBtn) {
        dlBtn.addEventListener('click', function (e) {
            const originalText = this.innerHTML;
            this.innerHTML = '⏳ Загрузка начинается...';
            this.style.opacity = '0.7';
            setTimeout(() => {
                this.innerHTML = '✓ Загрузка началась!';
                this.style.background = '#009900';
                this.style.color = '#fff';
                this.style.opacity = '1';
            }, 1000);
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.background = '';
                this.style.color = '';
            }, 4000);
        });
    }

    // ===== APP SEARCH =====
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const q = this.value.toLowerCase();
            document.querySelectorAll('.app-card').forEach(function (card) {
                const name = card.querySelector('.app-name').textContent.toLowerCase();
                const desc = card.querySelector('.app-desc').textContent.toLowerCase();
                card.style.display = (name.includes(q) || desc.includes(q)) ? '' : 'none';
            });
        });
    }

        // ===== МОДАЛЬНОЕ ОКНО ДЛЯ СКРИНШОТОВ =====
    const screenshots = document.querySelectorAll('.screenshot');
    if (screenshots.length) {
        // Создаём модалку
        const modal = document.createElement('div');
        modal.className = 'screenshot-modal';
        modal.innerHTML = `
            <button class="screenshot-modal-close" aria-label="Закрыть">✕</button>
            <img src="" alt="Скриншот">
        `;
        document.body.appendChild(modal);

        const modalImg = modal.querySelector('img');
        const modalClose = modal.querySelector('.screenshot-modal-close');

        // Открытие при клике на скриншот
        screenshots.forEach(function (item) {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const fullSrc = this.getAttribute('href');
                modalImg.src = fullSrc;
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        });

        // Закрытие по клику на крестик
        modalClose.addEventListener('click', function (e) {
            e.stopPropagation();
            modal.classList.remove('open');
            document.body.style.overflow = '';
        });

        // Закрытие по клику на фон
        modal.addEventListener('click', function () {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        });

        // Закрытие по Esc
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                modal.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }
});
