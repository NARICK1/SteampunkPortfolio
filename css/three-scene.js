(function () {
    'use strict';

    var scene, camera, renderer;
    var gears = [];
    var particles, glowParticles;
    var mouseX = 0, mouseY = 0;
    var targetMouseX = 0, targetMouseY = 0;
    var scrollSpeed = 0;
    var isLowPerf = false;
    var clock = new THREE.Clock();

    var gearColors = [
        0xb8862b, 0xcd7f32, 0x8a6b2a, 0xdaa850, 0xa0783a,
        0xc49a3c, 0x996515, 0xb8860b, 0x8b7355, 0xbc8f8f
    ];

    function createGearShape(innerR, outerR, teeth, holeR) {
        var shape = new THREE.Shape();
        var step = (Math.PI * 2) / teeth;

        shape.moveTo(Math.cos(0) * innerR, Math.sin(0) * innerR);

        for (var i = 0; i < teeth; i++) {
            var a0 = i * step;
            var a2 = a0 + step * 0.12;
            var a3 = a0 + step * 0.38;
            var a5 = a0 + step * 0.5;

            shape.lineTo(Math.cos(a0) * innerR, Math.sin(a0) * innerR);
            shape.lineTo(Math.cos(a2) * outerR, Math.sin(a2) * outerR);
            shape.lineTo(Math.cos(a3) * outerR, Math.sin(a3) * outerR);
            shape.lineTo(Math.cos(a5) * innerR, Math.sin(a5) * innerR);
        }

        shape.closePath();

        if (holeR > 0) {
            var hole = new THREE.Path();
            for (var j = 0; j <= 24; j++) {
                var ha = (j / 24) * Math.PI * 2;
                if (j === 0) hole.moveTo(Math.cos(ha) * holeR, Math.sin(ha) * holeR);
                else hole.lineTo(Math.cos(ha) * holeR, Math.sin(ha) * holeR);
            }
            shape.holes.push(hole);
        }

        return shape;
    }

    function createGearGeometry(innerR, outerR, teeth, depth, holeR) {
        var shape = createGearShape(innerR, outerR, teeth, holeR);
        return new THREE.ExtrudeGeometry(shape, {
            depth: depth,
            bevelEnabled: true,
            bevelThickness: depth * 0.2,
            bevelSize: depth * 0.08,
            bevelSegments: 2,
        });
    }

    function createParticleTexture() {
        var c = document.createElement('canvas');
        c.width = 32;
        c.height = 32;
        var ctx = c.getContext('2d');
        var g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.2, 'rgba(255,220,180,0.8)');
        g.addColorStop(1, 'rgba(255,220,180,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 32, 32);
        return new THREE.CanvasTexture(c);
    }

    function initScene() {
        var container = document.getElementById('three-canvas-container');
        if (!container) return;

        isLowPerf = window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) < 4;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0d0b0a, 0.028);

        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 60);
        camera.position.set(0, 0, 4);

        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: !isLowPerf,
            powerPreference: 'high-performance',
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowPerf ? 1 : 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(renderer.domElement);

        var ambient = new THREE.AmbientLight(0x443322, 0.4);
        scene.add(ambient);

        var mainLight = new THREE.DirectionalLight(0xdaa850, 2.0);
        mainLight.position.set(6, 10, 4);
        scene.add(mainLight);

        var fillLight = new THREE.DirectionalLight(0x885533, 0.4);
        fillLight.position.set(-4, -2, -6);
        scene.add(fillLight);

        var rimLight = new THREE.DirectionalLight(0xccaa77, 0.6);
        rimLight.position.set(-4, 6, -10);
        scene.add(rimLight);

        createGears();
        createParticles();
        setupEvents();

        animate();
    }

    function createGears() {
        var count = isLowPerf ? 10 : 25;

        for (var i = 0; i < count; i++) {
            var size = 0.3 + Math.random() * 0.8;
            var innerR = size * (0.5 + Math.random() * 0.3);
            var outerR = innerR * (1.35 + Math.random() * 0.25);
            var teeth = 8 + Math.floor(Math.random() * 8);
            var depth = 0.08 + Math.random() * 0.35;
            var holeR = innerR * (0.15 + Math.random() * 0.35);

            var geometry = createGearGeometry(innerR, outerR, teeth, depth, holeR);
            var color = gearColors[Math.floor(Math.random() * gearColors.length)];
            var material = new THREE.MeshStandardMaterial({
                color: color,
                metalness: 0.6 + Math.random() * 0.35,
                roughness: 0.2 + Math.random() * 0.5,
                transparent: true,
            });

            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 7,
                -4 - Math.random() * 35
            );
            mesh.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
            );
            scene.add(mesh);

            var rotAxis = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5,
            ).normalize();

            var opacity = 0.4 + (1 - Math.min(Math.abs(mesh.position.z) / 35, 1)) * 0.6;
            material.opacity = opacity;

            gears.push({
                mesh: mesh,
                material: material,
                rotAxis: rotAxis,
                rotSpeed: (0.2 + Math.random() * 1.2) * (Math.random() > 0.5 ? 1 : -1),
                moveSpeed: 0.15 + Math.random() * 0.7,
                baseOpacity: opacity,
            });
        }
    }

    function createParticles() {
        var tex = createParticleTexture();

        var dustCount = isLowPerf ? 200 : 500;
        var dustGeo = new THREE.BufferGeometry();
        var dustPos = new Float32Array(dustCount * 3);
        for (var i = 0; i < dustCount; i++) {
            dustPos[i * 3] = (Math.random() - 0.5) * 16;
            dustPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
            dustPos[i * 3 + 2] = -4 - Math.random() * 35;
        }
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));

        var dustMat = new THREE.PointsMaterial({
            size: isLowPerf ? 0.06 : 0.09,
            map: tex,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            color: 0xc8a87a,
        });

        particles = new THREE.Points(dustGeo, dustMat);
        scene.add(particles);

        var glowCount = isLowPerf ? 30 : 80;
        var glowGeo = new THREE.BufferGeometry();
        var glowPos = new Float32Array(glowCount * 3);
        var glowSizes = new Float32Array(glowCount);
        for (var j = 0; j < glowCount; j++) {
            glowPos[j * 3] = (Math.random() - 0.5) * 14;
            glowPos[j * 3 + 1] = (Math.random() - 0.5) * 8;
            glowPos[j * 3 + 2] = -4 - Math.random() * 25;
            glowSizes[j] = 0.04 + Math.random() * 0.08;
        }
        glowGeo.setAttribute('position', new THREE.BufferAttribute(glowPos, 3));

        var glowMat = new THREE.PointsMaterial({
            size: isLowPerf ? 0.05 : 0.1,
            map: tex,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            color: 0xdaa850,
        });

        glowParticles = new THREE.Points(glowGeo, glowMat);
        scene.add(glowParticles);
    }

    function setupEvents() {
        document.addEventListener('mousemove', function (e) {
            targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
        }, { passive: true });

        document.addEventListener('touchmove', function (e) {
            if (e.touches.length > 0) {
                var t = e.touches[0];
                targetMouseX = (t.clientX / window.innerWidth) * 2 - 1;
                targetMouseY = (t.clientY / window.innerHeight) * 2 - 1;
            }
        }, { passive: true });

        var st;
        window.addEventListener('scroll', function () {
            var sy = window.scrollY || window.pageYOffset;
            var max = document.documentElement.scrollHeight - window.innerHeight;
            scrollSpeed = max > 0 ? sy / max : 0;
            clearTimeout(st);
            st = setTimeout(function () { scrollSpeed *= 0.5; }, 500);
        }, { passive: true });

        window.addEventListener('resize', function () {
            var w = window.innerWidth, h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            renderer.setPixelRatio(isLowPerf ? 1 : Math.min(window.devicePixelRatio, 2));
        }, { passive: true });
    }

    function animate() {
        requestAnimationFrame(animate);

        var delta = Math.min(clock.getDelta(), 0.05);

        mouseX += (targetMouseX - mouseX) * 0.04;
        mouseY += (targetMouseY - mouseY) * 0.04;

        var speedFactor = 0.5 + scrollSpeed * 1.5;
        var scrollOffset = scrollSpeed * 2;

        for (var i = 0; i < gears.length; i++) {
            var g = gears[i];
            g.mesh.rotateOnWorldAxis(g.rotAxis, g.rotSpeed * delta * 2 * speedFactor);
            g.mesh.position.z += g.moveSpeed * delta * 3 * speedFactor;

            var fade = 1 - Math.max(0, (g.mesh.position.z + 2) / 6);
            g.material.opacity = Math.max(0, Math.min(1, g.baseOpacity * fade));

            if (g.mesh.position.z > 4) {
                g.mesh.position.z = -6 - Math.random() * 30;
                g.mesh.position.x = (Math.random() - 0.5) * 12;
                g.mesh.position.y = (Math.random() - 0.5) * 7;
                g.baseOpacity = 0.4 + Math.random() * 0.6;
                g.material.opacity = g.baseOpacity;
            }
        }

        var cx = mouseX * 0.8;
        var cy = -mouseY * 0.5 + scrollOffset * 0.1;
        camera.position.x += (cx - camera.position.x) * 0.015;
        camera.position.y += (cy - camera.position.y) * 0.015;
        camera.lookAt(0, 0, -3);

        if (particles) {
            var p = particles.geometry.attributes.position.array;
            for (var j = 0; j < p.length; j += 3) {
                p[j + 1] += 0.003 * delta * 30;
                p[j + 2] += 0.008 * delta * 30 * speedFactor;
                if (p[j + 1] > 5) p[j + 1] = -5;
                if (p[j + 2] > 3) {
                    p[j + 2] = -4 - Math.random() * 30;
                    p[j] = (Math.random() - 0.5) * 16;
                }
            }
            particles.geometry.attributes.position.needsUpdate = true;
        }

        if (glowParticles) {
            var gp = glowParticles.geometry.attributes.position.array;
            for (var k = 0; k < gp.length; k += 3) {
                gp[k] += 0.002 * delta * 30 * (Math.random() - 0.5);
                gp[k + 1] += 0.004 * delta * 30;
                gp[k + 2] += 0.01 * delta * 30 * speedFactor;
                if (gp[k + 1] > 4) gp[k + 1] = -4;
                if (gp[k + 2] > 3) {
                    gp[k + 2] = -4 - Math.random() * 25;
                    gp[k] = (Math.random() - 0.5) * 14;
                    gp[k + 1] = (Math.random() - 0.5) * 8;
                }
            }
            glowParticles.geometry.attributes.position.needsUpdate = true;
        }

        renderer.render(scene, camera);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScene);
    } else {
        initScene();
    }
})();
