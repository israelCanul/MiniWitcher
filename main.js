// --- LÓGICA PRINCIPAL DEL JUEGO ---

window.startGame = function () {
    if (isRunning) return;
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('ui-layer').style.display = 'block';
    mapCanvas = document.getElementById('minimap');
    mapCtx = mapCanvas.getContext('2d');
    document.getElementById('game-container').focus();

    init();
    loadBiome(0, 0);
    updateInventoryUI(); // Initial inventory render
    isRunning = true;
    animate();
};

window.respawnPlayer = function () {
    player.hp = player.maxHp;
    player.mesh.position.set(0, 0, 0);
    loadBiome(0, 0);
    document.getElementById('death-screen').style.display = 'none';
    isRunning = true;
    animate();
};

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 20, 90);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 45, 35);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const container = document.getElementById('game-container');
    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xffeebb, 0.9);
    sun.position.set(50, 100, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048; sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -60; sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60; sun.shadow.camera.bottom = -60;
    scene.add(sun);

    mousePlane = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshBasicMaterial({ visible: false }));
    mousePlane.rotation.x = -Math.PI / 2;
    scene.add(mousePlane);

    worldGroup = new THREE.Group();
    scene.add(worldGroup);

    player = new Player(); // Se crea la instancia del jugador
    clock = new THREE.Clock();

    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', e => handleKey(e, 1));
    window.addEventListener('keyup', e => handleKey(e, 0));
    window.addEventListener('keydown', handleSystemKeys); // Add this for inventory toggle
    window.addEventListener('mousemove', e => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    window.addEventListener('mousedown', e => {
        if (player.hp > 0) {
            if (e.button === 0) player.attack('sword');
            if (e.button === 2) player.attack('igni');
        }
    });
    window.addEventListener('contextmenu', e => e.preventDefault());
}

function handleSystemKeys(e) {
    if (e.key.toLowerCase() === 'i') {
        e.preventDefault(); // Prevent default browser behavior
        const inventoryScreen = document.getElementById('inventory-screen');
        const isVisible = inventoryScreen.style.display === 'flex';

        if (isVisible) {
            inventoryScreen.style.display = 'none';
            isRunning = true; // Resume game
            animate(); // Restart animation loop
        } else {
            inventoryScreen.style.display = 'flex';
            updateDetailedInventoryUI(); // Populate the inventory
            isRunning = false; // Pause game
        }
    }
}

function checkPortals() {
    const limit = SCENARIO_SIZE / 2 - 5;
    const p = player.mesh.position;
    for (let portal of activePortals) {
        if (Math.hypot(p.x - portal.x, p.z - portal.z) < 4) {
            let nextX = currentBiomeCoords.x + portal.target.x;
            let nextY = currentBiomeCoords.y + portal.target.y;
            loadBiome(nextX, nextY);
            if (portal.target.y === -1) player.mesh.position.z = limit - 8;
            else if (portal.target.y === 1) player.mesh.position.z = -limit + 8;
            else if (portal.target.x === 1) player.mesh.position.x = -limit + 8;
            else if (portal.target.x === -1) player.mesh.position.x = limit - 8;
            else player.mesh.position.set(0, 0, 0);
            return;
        }
    }
}

function createFX(pos, col, type) {
    const geo = type === 'slash' ? new THREE.PlaneGeometry(5, 5) : new THREE.SphereGeometry(3, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat); m.position.copy(pos).add(new THREE.Vector3(0, 1, 0));
    if (type === 'slash') { m.rotation.x = -Math.PI / 2; m.rotation.z = player.mesh.rotation.y; }
    scene.add(m); particles.push({ mesh: m, life: 0.3, type });
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i]; p.life -= dt;
        if (p.type === 'exp') p.mesh.scale.multiplyScalar(1.1);
        if (p.life <= 0) { scene.remove(p.mesh); particles.splice(i, 1); }
    }
}

function updateQuest() {
    const questText = document.getElementById('quest-text');
    if (questText) {
        questText.innerHTML = enemies.length > 0 ? `AMENAZAS: ${enemies.length}` : "¡VICTORIA!";
    }
}

function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.mesh.position.add(p.velocity.clone().multiplyScalar(dt));
        p.life -= dt;

        // Comprobar colisión con el jugador
        if (p.mesh.position.distanceTo(player.mesh.position) < 1.5) {
            player.damage(p.damage); // Llama directamente al método del jugador
            if (player.hp <= 0) player.die(); // Comprobar si el jugador ha muerto
            p.life = 0; // Marcar para eliminar
        }

        // Comprobar colisión con objetos sólidos
        const ray = new THREE.Raycaster(p.mesh.position.clone().sub(p.velocity.clone().multiplyScalar(dt)), p.velocity.clone().normalize());
        const distance = p.velocity.length() * dt;
        const hits = ray.intersectObjects(worldGroup.children, true);

        if (hits.length > 0 && hits[0].distance < distance) {
            // Ignorar colisiones con el propio jugador o con otros proyectiles
            if (hits[0].object !== player.mesh && !projectiles.some(proj => proj.mesh === hits[0].object)) {
                p.life = 0;
            }
        }

        if (p.life <= 0) {
            worldGroup.remove(p.mesh);
            projectiles.splice(i, 1);
        }
    }
}

function drawMinimap() {
    if (!mapCtx) return;
    mapCtx.fillStyle = '#1a1a1a'; mapCtx.fillRect(0, 0, 150, 150);
    const SCALE = 0.5; const CX = 75; const CY = 75; const pPos = player.mesh.position;
    villageCenters.forEach(v => {
        let x = (v.x - pPos.x) * SCALE + CX; let y = (v.z - pPos.z) * SCALE + CY;
        if (x > 0 && x < 150 && y > 0 && y < 150) { mapCtx.fillStyle = '#ffd54f'; mapCtx.fillRect(x - 4, y - 4, 8, 8); }
    });
    mapCtx.fillStyle = '#ff1744';
    enemies.forEach(e => {
        let x = (e.mesh.position.x - pPos.x) * SCALE + CX; let y = (e.mesh.position.z - pPos.z) * SCALE + CY;
        if (x > 0 && x < 150 && y > 0 && y < 150) mapCtx.fillRect(x - 1.5, y - 1.5, 3, 3);
    });
    mapCtx.fillStyle = '#4fc3f7';
    for (let g of guards) {
        let gx = (g.mesh.position.x - pPos.x) * SCALE + CX; let gz = (g.mesh.position.z - pPos.z) * SCALE + CY;
        if (gx > 0 && gx < 150 && gz > 0 && gz < 150) mapCtx.fillRect(gx - 1.5, gz - 1.5, 3, 3);
    }
    mapCtx.fillStyle = '#00e676'; mapCtx.beginPath(); mapCtx.arc(CX, CY, 3, 0, Math.PI * 2); mapCtx.fill();
}

function animate() {
    if (!isRunning) return;
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.1);
    const time = clock.getElapsedTime();

    checkPortals();
    checkBanditCampSpawns();
    checkCaveSpawns(dt);
    updateProjectiles(dt);

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(mousePlane);
    const lookAtPoint = hits.length > 0 ? hits[0].point : null;

    // La actualización del jugador ahora está encapsulada
    player.update(dt, keys, lookAtPoint);

    camera.position.x = player.mesh.position.x;
    camera.position.z = player.mesh.position.z + 30;
    camera.lookAt(player.mesh.position);

    updateEntities(dt, time);
    updateParticles(dt);
    drawMinimap();
    renderer.render(scene, camera);
}

function checkBanditCampSpawns() {
    const spawnDist = 35;
    banditCamps.forEach(camp => {
        if (!camp.spawned && player.mesh.position.distanceTo(new THREE.Vector3(camp.x, 0, camp.z)) < spawnDist) {
            camp.spawned = true; // Marcar como usado para no generar más
            console.log(`Bandit ambush triggered at camp ${camp.x.toFixed(0)}, ${camp.z.toFixed(0)}`);

            camp.huts.forEach(hut => {
                const hutWorldPos = new THREE.Vector3();
                hut.getWorldPosition(hutWorldPos);

                // Vector hacia la derecha de la cabaña
                const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(hut.quaternion);

                createEnemy(hutWorldPos.x + rightVector.x * 1.5, hutWorldPos.z + rightVector.z * 1.5, 'Bandit');
                createEnemy(hutWorldPos.x - rightVector.x * 1.5, hutWorldPos.z - rightVector.z * 1.5, 'Bandit');
            });
        }
    });
}