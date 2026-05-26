/* 
   script.js — Стимпанк-портфолио. Анимации, меню,
   форма, появление при скролле
    */
// Генерация 3D-шестерёнок
function init3DGears() {
    const container = document.getElementById('gearsContainer');
    if (!container) return;
    const gearsCount = window.innerWidth < 768 ? 12 : 28;
    for (let i = 0; i < gearsCount; i++) {
        const gear = document.createElement('div');
        gear.className = 'gear-3d';
        const size = 60 + Math.random() * 180;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = 6 + Math.random() * 12;
        const delay = Math.random() * -20;
        const drift = (Math.random() - 0.5) * 300;
        gear.style.setProperty('--x', x + '%');
        gear.style.setProperty('--y', y + '%');
        gear.style.setProperty('--size', size + 'px');
        gear.style.setProperty('--duration', duration + 's');
        gear.style.setProperty('--delay', delay + 's');
        gear.style.setProperty('--drift', drift + 'px');
        gear.innerHTML = `<svg viewBox="0 0 100 100"><path d="M50 5 L55 20 L70 10 L75 26 L90 22 L85 38 L98 45 L85 55 L90 72 L75 68 L70 84 L55 74 L50 90 L45 74 L30 84 L25 68 L10 72 L15 55 L2 45 L15 38 L10 22 L25 26 L30 10 L45 20 Z" fill="currentColor"/><circle cx="50" cy="47" r="18" fill="var(--bg-main)"/></svg>`;
        container.appendChild(gear);
    }
}

// 3D-эффект стекла с трещинами в перспективе
function initGlass3D() {
    const glass = document.getElementById('glass3d');
    const surface = document.getElementById('glassSurface');
    const cracksContainer = document.getElementById('glassCracks3d');
    if (!glass || !surface) return;
    let active = false;
    let mouseX = 0, mouseY = 0;
    let targetRotateX = 0, targetRotateY = 0;
    let currentRotateX = 0, currentRotateY = 0;

    // Генерация 3D-трещин
    function generateCracks3D() {
        cracksContainer.innerHTML = '';
        const numCracks = 12 + Math.floor(Math.random() * 9);
        for (let i = 0; i < numCracks; i++) {
            const crack = document.createElement('div');
            crack.className = 'crack-3d';
            const x1 = 20 + Math.random() * 60;
            const y1 = 20 + Math.random() * 60;
            const angle = Math.random() * 360;
            const length = 30 + Math.random() * 120;
            const width = 1 + Math.random() * 2;
            const depth = -20 + Math.random() * 40;
            crack.style.left = x1 + '%';
            crack.style.top = y1 + '%';
            crack.style.width = length + 'px';
            crack.style.height = width + 'px';
            crack.style.transform = `rotate(${angle}deg) translateZ(${depth}px)`;
            cracksContainer.appendChild(crack);

            // ответвления
            if (Math.random() > 0.6) {
                const branch = document.createElement('div');
                branch.className = 'crack-3d';
                const subLen = length * (0.3 + Math.random() * 0.5);
                const subAngle = angle + (Math.random() - 0.5) * 70;
                branch.style.left = (x1 + (length * Math.cos(angle * Math.PI/180) / window.innerWidth * 100)) + '%';
                branch.style.top = (y1 + (length * Math.sin(angle * Math.PI/180) / window.innerHeight * 100)) + '%';
                branch.style.width = subLen + 'px';
                branch.style.height = (width * 0.7) + 'px';
                branch.style.transform = `rotate(${subAngle}deg) translateZ(${depth + 10}px)`;
                cracksContainer.appendChild(branch);
            }
        }
    }

    // Активация при наведении на hero
    const hero = document.getElementById('hero');
    hero.addEventListener('mouseenter', (e) => {
        active = true;
        glass.classList.add('active');
        generateCracks3D();
        requestAnimationFrame(animate);
    });
    hero.addEventListener('mousemove', (e) => {
        if (!active) return;
        const rect = hero.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        targetRotateX = mouseY * 12;
        targetRotateY = mouseX * 12;
    });
    hero.addEventListener('mouseleave', () => {
        active = false;
        glass.classList.remove('active');
        targetRotateX = 0; targetRotateY = 0;
    });

    function animate() {
        currentRotateX += (targetRotateX - currentRotateX) * 0.12;
        currentRotateY += (targetRotateY - currentRotateY) * 0.12;
        surface.style.transform = `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) translateZ(5px)`;
        requestAnimationFrame(animate);
    }
}

// Скролл-контроль скорости шестерёнок
function initScrollSpeedControl() {
    const gears = document.querySelectorAll('.gear-3d');
    let lastScrollY = window.scrollY;
    let speedFactor = 1;
    window.addEventListener('scroll', () => {
        const delta = Math.abs(window.scrollY - lastScrollY);
        speedFactor = 1 + Math.min(delta / 200, 1.5);
        gears.forEach(gear => {
            let anim = gear.style.animation;
            let duration = parseFloat(gear.style.getPropertyValue('--duration'));
            if (duration) {
                let newDuration = duration / speedFactor;
                gear.style.animationDuration = newDuration + 's';
            }
        });
        lastScrollY = window.scrollY;
    });
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    init3DGears();
    initGlass3D();
    initScrollSpeedControl();
    // остальные инициализации (рендер навыков, проектов, галереи) остаются
    renderSkills();
    renderProjects();
    renderGallery();
    // … существующие вызовы handleScroll, initHeroMouseParallax и т.д.
});
// БУРГЕР-МЕНЮ 
function toggleMenu() {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('burger');
    const overlay = document.getElementById('mobileOverlay');
    nav.classList.toggle('open');
    burger.classList.toggle('active');
    overlay.classList.toggle('show');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
}

function closeMenu() {
    document.getElementById('nav').classList.remove('open');
    document.getElementById('burger').classList.remove('active');
    document.getElementById('mobileOverlay').classList.remove('show');
    document.body.style.overflow = '';
}

// ПЛАВНАЯ ПРОКРУТКА К СЕКЦИЯМ 
function scrollToSection(id) {
    closeMenu();
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// КНОПКА НАВЕРХ
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ОБРАБОТКА СКРОЛЛА
function handleScroll() {
    // Кнопка наверх
    const btn = document.getElementById('scrollTop');
    if (btn) {
        btn.classList.toggle('visible', window.scrollY > 300);
    }

    // Анимация скилл-баров
    document.querySelectorAll('.skill-bar-fill').forEach(bar => {
        const rect = bar.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50 && !bar.classList.contains('animated')) {
            bar.classList.add('animated');
            bar.style.width = bar.dataset.percent + '%';
        }
    });

    // Анимация появления секций
    document.querySelectorAll('.reveal').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 60) {
            el.classList.add('visible');
        }
    });
}

// ВАЛИДАЦИЯ ФОРМЫ
function validateForm(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('[name="name"]');
    const email = form.querySelector('[name="email"]');
    const message = form.querySelector('[name="message"]');
    let valid = true;

    form.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));

    if (!name.value.trim()) {
        document.getElementById('nameError').classList.add('show');
        valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailRegex.test(email.value)) {
        document.getElementById('emailError').classList.add('show');
        valid = false;
    }

    if (!message.value.trim()) {
        document.getElementById('messageError').classList.add('show');
        valid = false;
    }

    if (valid) {
        const success = form.querySelector('.form-success');
        success.classList.add('show');
        success.textContent = '✔ Сообщение отправлено! (Это демонстрация — backend не подключён)';
        form.reset();
        setTimeout(() => success.classList.remove('show'), 4000);
    }
}

// ДАННЫЕ ДЛЯ НАВЫКОВ 
const skillsData = [
    { name: 'HTML5 / CSS3', percent: 90, icon: '🌐' },
    { name: 'JavaScript', percent: 80, icon: '⚡' },
    { name: 'Адаптивная вёрстка', percent: 85, icon: '📱' },
    { name: 'Git / GitHub', percent: 70, icon: '🔧' },
    { name: 'UI/UX дизайн', percent: 65, icon: '🎨' },
    { name: 'Python (основы)', percent: 60, icon: '🐍' },
];

// ДАННЫЕ ДЛЯ ПРОЕКТОВ 
const projectsData = [
    {
        title: 'Интернет-магазин CosmoRing',
        desc: 'Разработка статического сайта ювелирного магазина с корзиной на localStorage, фильтрацией и адаптивным дизайном.',
        tags: ['HTML', 'CSS', 'JavaScript'],
        icon: '💍',
    },
    {
        title: 'Стимпанк-портфолио',
        desc: 'Персональный сайт-портфолио в стиле стимпанк с анимированными шестерёнками, плавной прокруткой и формой обратной связи.',
        tags: ['HTML', 'CSS', 'JavaScript', 'Анимации'],
        icon: '⚙️',
    },
    {
        title: 'Android приложения',
        desc: 'Автокликер на java, календарь, список покупок/задач',
        tags: ['Java, Android Studio'],
        icon: '🧮',
    },
    {
        title: 'To-Do список',
        desc: 'Приложение для управления задачами с сохранением в localStorage, категориями и фильтрацией.',
        tags: ['HTML', 'CSS', 'JavaScript', 'localStorage'],
        icon: '📋',
    },
];

// ДАННЫЕ ДЛЯ ГАЛЕРЕИ
const galleryData = [
    { label: 'Сертификат HTML Academy', icon: '📜' },
    { label: 'Диплом олимпиады по веб-дизайну', icon: '🏆' },
    { label: 'Проект «Интернет-магазин»', icon: '🖥️' },
    { label: 'Курс по JavaScript', icon: '📘' },
    { label: 'Хакатон 2025', icon: '🎯' },
    { label: 'Дизайн-конкурс', icon: '🎨' },
];

// РЕНДЕР НАВЫКОВ 
function renderSkills() {
    const grid = document.getElementById('skillsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    skillsData.forEach(s => {
        const card = document.createElement('div');
        card.className = 'skill-card reveal';
        card.innerHTML = `
            <div class="skill-header">
                <span class="skill-icon">${s.icon}</span>
                <h3>${s.name}</h3>
            </div>
            <div class="skill-bar">
                <div class="skill-bar-fill" data-percent="${s.percent}" style="width:0"></div>
            </div>
            <div class="skill-percent">${s.percent}%</div>
        `;
        grid.appendChild(card);
    });
}

//  РЕНДЕР ПРОЕКТОВ 
function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    projectsData.forEach(p => {
        const card = document.createElement('div');
        card.className = 'project-card reveal';
        card.innerHTML = `
            <div class="project-image">
                <span class="gear-decor">⚙</span>
                <span class="gear-decor gear-decor-2">⚙</span>
                <span style="font-size:56px">${p.icon}</span>
            </div>
            <div class="project-info">
                <h3>${p.title}</h3>
                <p>${p.desc}</p>
                <div class="project-tags">
                    ${p.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
                </div>
                <button class="btn btn-outline" style="padding:8px 20px;font-size:13px" onclick="showModal('${p.title}')">Подробнее</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

//  РЕНДЕР ГАЛЕРЕИ 
function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    grid.innerHTML = '';
    galleryData.forEach(g => {
        const item = document.createElement('div');
        item.className = 'gallery-item reveal';
        item.innerHTML = `
            <span>${g.icon}</span>
            <div class="gallery-label">${g.label}</div>
        `;
        grid.appendChild(item);
    });
}

// МОДАЛЬНОЕ ОКНО ДЛЯ ПРОЕКТОВ
function showModal(projectName) {
    const modal = document.getElementById('projectModal');
    const title = document.getElementById('modalTitle');
    if (modal && title) {
        title.textContent = projectName;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ПАР/ДЫМ (ЧАСТИЦЫ)
function createSteamParticles() {
    const container = document.getElementById('steamContainer');
    if (!container) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    const count = prefersReduced || isMobile ? 6 : 18;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'steam-particle';
        const size = 30 + Math.random() * 80;
        const left = 5 + Math.random() * 90;
        const delay = Math.random() * 12;
        const duration = 18 + Math.random() * 22;
        p.style.cssText = `
            width:${size}px; height:${size}px;
            left:${left}%;
            bottom:-10%;
            animation-delay:${delay}s;
            animation-duration:${duration}s;
            opacity:${0.02 + Math.random() * 0.04};
        `;
        container.appendChild(p);
    }
}

// ПАРАЛЛАКС ПРИ СКРОЛЛЕ 
function handleBgParallax() {
    const scrolled = window.scrollY;
    document.querySelectorAll('.bg-gear').forEach(gear => {
        const depth = parseFloat(gear.dataset.depth || '0.1');
        const y = scrolled * depth;
        gear.style.transform = `translateY(${y}px)`;
    });
}

// MOUSE-ПАРАЛЛАКС В HERO 
function initHeroMouseParallax() {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;
    hero.addEventListener('mousemove', function (e) {
        const rect = hero.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        const gears = hero.querySelectorAll('.gear');
        gears.forEach((gear, i) => {
            const factor = (i + 1) * 3;
            gear.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
    });
    hero.addEventListener('mouseleave', function () {
        hero.querySelectorAll('.gear').forEach(gear => {
            gear.style.transform = '';
        });
    });
}

//  MOUSE-СЛЕЖЕНИЕ ДЛЯ CARD-ЭФФЕКТОВ 
function initCardMouseTracking() {
    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            this.style.setProperty('--mouse-x', x + '%');
            this.style.setProperty('--mouse-y', y + '%');
        });
    });
}

//  ЭФФЕКТ РАЗБИТОГО СТЕКЛА (BROKEN GLASS) 
function initGlassEffect() {
    const hero = document.getElementById('hero');
    const overlay = document.getElementById('glassOverlay');
    const lens = document.getElementById('glassLens');
    const cracks = document.getElementById('glassCracks');
    const reflections = document.getElementById('glassReflections');
    const perspective = document.getElementById('glassPerspective');

    if (!hero || !overlay || window.innerWidth < 768) return;

    let isActive = false;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let lastCrackTime = 0;
    let crackGenId = 0;
    let rafId = null;

    // Создание лучей блика
    for (let i = 0; i < 3; i++) {
        const ray = document.createElement('div');
        ray.className = 'glass-reflection-ray';
        ray.style.transform = 'rotate(' + (i * 60 + 15) + 'deg)';
        ray.style.opacity = String(0.3 + Math.random() * 0.3);
        reflections.appendChild(ray);
    }

    // Генерация случайного пути трещины
    function createCrackPath(x, y, angle, length, branched) {
        var path = 'M' + x + ',' + y;
        var curX = x, curY = y;
        var segments = 6 + Math.floor(Math.random() * 5);
        var baseAngle = angle;

        for (var i = 1; i <= segments; i++) {
            var segLen = length / segments * (0.8 + Math.random() * 0.4);
            var jitter = (Math.random() - 0.5) * 12;
            var segAngle = baseAngle + jitter * (i / segments);
            curX += Math.cos(segAngle * Math.PI / 180) * segLen;
            curY += Math.sin(segAngle * Math.PI / 180) * segLen;
            path += ' L' + curX + ',' + curY;

            if (branched && Math.random() < 0.35 && i > 2) {
                var brAngle = segAngle + (Math.random() > 0.5 ? 70 : -70) * (0.3 + Math.random() * 0.7);
                var brLen = segLen * (0.3 + Math.random() * 0.4);
                var bx = curX + Math.cos(brAngle * Math.PI / 180) * brLen;
                var by = curY + Math.sin(brAngle * Math.PI / 180) * brLen;
                path += ' M' + curX + ',' + curY + ' L' + bx + ',' + by;

                if (Math.random() < 0.3) {
                    var subAngle = brAngle + (Math.random() > 0.5 ? 45 : -45);
                    var subLen = brLen * (0.3 + Math.random() * 0.3);
                    var sx = bx + Math.cos(subAngle * Math.PI / 180) * subLen;
                    var sy = by + Math.sin(subAngle * Math.PI / 180) * subLen;
                    path += ' M' + bx + ',' + by + ' L' + sx + ',' + sy;
                }
            }
        }
        return path;
    }

    // Генерация нового набора трещин
    function generateCracks(cx, cy) {
        var gen = ++crackGenId;
        var container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        container.setAttribute('data-gen', gen);
        container.setAttribute('data-origin-x', cx);
        container.setAttribute('data-origin-y', cy);
        container.style.opacity = '0';
        container.style.transition = 'opacity 0.6s ease';

        var filterId = 'cg-' + Date.now();
        var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        var filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', filterId);
        var blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        blur.setAttribute('stdDeviation', '0.8');
        blur.setAttribute('result', 'blur');
        filter.appendChild(blur);
        var merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        var mn1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        mn1.setAttribute('in', 'blur');
        merge.appendChild(mn1);
        var mn2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        mn2.setAttribute('in', 'SourceGraphic');
        merge.appendChild(mn2);
        filter.appendChild(merge);
        defs.appendChild(filter);
        container.appendChild(defs);

        // Основные трещины (5-7 шт)
        var numMain = 5 + Math.floor(Math.random() * 3);
        for (var i = 0; i < numMain; i++) {
            var angle = (i / numMain) * 360 + (Math.random() - 0.5) * 15;
            var length = 80 + Math.random() * 120;
            var path = createCrackPath(cx, cy, angle, length, true);
            var el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            el.setAttribute('d', path);
            el.setAttribute('stroke', 'rgba(230,210,180,0.12)');
            el.setAttribute('stroke-width', '0.6');
            el.setAttribute('filter', 'url(#' + filterId + ')');
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.8s ease';
            container.appendChild(el);
            setTimeout(function (e) { e.style.opacity = '1'; }, 100 * i, el);
        }

        // Мелкие осколки (8-14 шт)
        var numDebris = 8 + Math.floor(Math.random() * 7);
        for (var i = 0; i < numDebris; i++) {
            var angle = Math.random() * 360;
            var dist = 15 + Math.random() * 50;
            var x = cx + Math.cos(angle * Math.PI / 180) * dist;
            var y = cy + Math.sin(angle * Math.PI / 180) * dist;
            var len = 8 + Math.random() * 25;
            var angle2 = angle + (Math.random() - 0.5) * 50;
            var x2 = x + Math.cos(angle2 * Math.PI / 180) * len;
            var y2 = y + Math.sin(angle2 * Math.PI / 180) * len;
            var el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            el.setAttribute('d', 'M' + x + ',' + y + ' L' + x2 + ',' + y2);
            el.setAttribute('stroke', 'rgba(230,210,180,0.04)');
            el.setAttribute('stroke-width', '0.25');
            container.appendChild(el);
        }

        // Точка удара (микросвечение)
        var impact = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        impact.setAttribute('cx', cx);
        impact.setAttribute('cy', cy);
        impact.setAttribute('r', '3');
        impact.setAttribute('fill', 'rgba(255,255,255,0.03)');
        impact.setAttribute('filter', 'url(#' + filterId + ')');
        container.appendChild(impact);

        cracks.appendChild(container);
        lastCrackTime = Date.now();

        // Fade in
        requestAnimationFrame(function () { container.style.opacity = '1'; });

        // Удаление старых поколений трещин
        setTimeout(function () {
            var oldGens = cracks.querySelectorAll('g[data-gen]:not([data-gen="' + gen + '"])');
            for (var j = 0; j < oldGens.length; j++) {
                oldGens[j].style.transition = 'opacity 0.8s ease';
                oldGens[j].style.opacity = '0';
                (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 800); })(oldGens[j]);
            }
        }, 500);
    }

    function animateGlass() {
        if (!isActive) {
            rafId = requestAnimationFrame(animateGlass);
            return;
        }

        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        lens.style.left = currentX + 'px';
        lens.style.top = currentY + 'px';

        var pX = (currentX / hero.offsetWidth) * 100;
        var pY = (currentY / hero.offsetHeight) * 100;
        perspective.style.setProperty('--persp-x', pX + '%');
        perspective.style.setProperty('--persp-y', pY + '%');

        // Поворот лучей блика к курсору
        var cx = hero.offsetWidth / 2;
        var cy = hero.offsetHeight / 2;
        var angle = Math.atan2(targetY - cy, targetX - cx) * 180 / Math.PI;
        reflections.style.transform = 'rotate(' + angle + 'deg)';

        var now = Date.now();
        var dist = Math.sqrt(
            (targetX - currentX) * (targetX - currentX) +
            (targetY - currentY) * (targetY - currentY)
        );

        if (dist < 15 && now - lastCrackTime > 700) {
            generateCracks(Math.round(targetX), Math.round(targetY));
        }

        rafId = requestAnimationFrame(animateGlass);
    }

    hero.addEventListener('mouseenter', function (e) {
        if (window.innerWidth < 768) return;
        isActive = true;
        overlay.classList.add('active');
        lens.classList.add('active');
        reflections.classList.add('active');
        perspective.classList.add('active');

        var rect = hero.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
        currentX = targetX;
        currentY = targetY;

        lastCrackTime = 0;
        generateCracks(Math.round(targetX), Math.round(targetY));

        if (!rafId) { rafId = requestAnimationFrame(animateGlass); }
    });

    hero.addEventListener('mousemove', function (e) {
        if (!isActive) return;
        var rect = hero.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
    });

    hero.addEventListener('mouseleave', function () {
        isActive = false;
        overlay.classList.remove('active');
        lens.classList.remove('active');
        reflections.classList.remove('active');
        perspective.classList.remove('active');

        var oldGens = cracks.querySelectorAll('g');
        for (var j = 0; j < oldGens.length; j++) {
            oldGens[j].style.transition = 'opacity 0.6s ease';
            oldGens[j].style.opacity = '0';
            (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 700); })(oldGens[j]);
        }

        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    });
}

// ИНИЦИАЛИЗАЦИЯ 
document.addEventListener('DOMContentLoaded', function () {
    renderSkills();
    renderProjects();
    renderGallery();

    // Частицы пара
    createSteamParticles();

    // Обработчик скролла (существующий + параллакс фона)
    function combinedScroll() {
        handleScroll();
        handleBgParallax();
    }
    window.addEventListener('scroll', combinedScroll);
    combinedScroll();

    // Mouse-параллакс в hero
    initHeroMouseParallax();

    // Эффект разбитого стекла
    initGlassEffect();

    // Отслеживание мыши для карточек
    initCardMouseTracking();

    // Добавляем класс reveal для элементов анимации
    document.querySelectorAll('.section:not(.hero)').forEach(section => {
        section.querySelectorAll('h2, .about-grid, .contacts-grid, .resume-grid').forEach(el => {
            el.classList.add('reveal');
        });
    });

    // Закрытие модалки по overlay
    document.getElementById('projectModal')?.addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });

    // Закрытие меню по оверлею
    document.getElementById('mobileOverlay')?.addEventListener('click', closeMenu);

    // ESC — закрытие модалки и меню
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
            closeMenu();
        }
    });
});
