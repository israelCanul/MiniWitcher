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
    player.hp = 100;
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

    createPlayer();
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
            if (e.button === 0) attack('sword');
            if (e.button === 2) attack('igni');
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

function checkCol(dx, dz) {
    const np = player.mesh.position.clone().add(new THREE.Vector3(dx, 0, dz));
    const box = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(np.x, 1, np.z), new THREE.Vector3(0.5, 5, 0.5));
    for (let c of solidColliders) if (box.intersectsBox(c)) return true;
    return false;
}

function attack(type) {
    if (player.hp <= 0) return;
    if (type === 'sword' && player.stam >= 15 && !player.attacking) {
        player.stam -= 15; player.attacking = true; updateUI();
        const arm = player.parts.armR; let p = 0;
        const iv = setInterval(() => { p += 0.2; arm.rotation.x = -Math.PI / 2 * Math.sin(p * Math.PI); if (p >= 1) { clearInterval(iv); arm.rotation.x = 0; player.attacking = false; } }, 16);
        createFX(player.mesh.position, 0xffffff, 'slash');
        checkHit(5, 2.0, 25);
    }
    if (type === 'igni' && player.stam >= 30 && !player.attacking) {
        player.stam -= 30; player.attacking = true; updateUI();
        player.parts.armL.rotation.x = -3; setTimeout(() => { player.parts.armL.rotation.x = 0; player.attacking = false }, 500);
        createFX(player.mesh.position, 0xff6d00, 'exp');
        checkHit(8, 6.0, 40);
    }
}

function checkHit(r, a, dmg) {
    const pDir = new THREE.Vector3(); player.mesh.getWorldDirection(pDir);
    enemies.forEach((e, idx) => {
        const dir = new THREE.Vector3().subVectors(e.mesh.position, player.mesh.position);
        if (dir.length() < r && pDir.angleTo(dir) < a) {
            damageEntity(e, dmg);
        }
    });
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

    let dx = 0, dz = 0;
    if (keys.w) dz -= 1; if (keys.s) dz += 1; if (keys.a) dx -= 1; if (keys.d) dx += 1;
    let moving = (dx !== 0 || dz !== 0);
    if (moving) {
        if (dx !== 0 && dz !== 0) { dx *= 0.707; dz *= 0.707; }
        const s = 10 * dt;
        if (!checkCol(dx * s, 0)) player.mesh.position.x += dx * s;
        if (!checkCol(0, dz * s)) player.mesh.position.z += dz * s;
    }

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(mousePlane);
    if (hits.length > 0) player.mesh.lookAt(hits[0].point.x, player.mesh.position.y, hits[0].point.z);

    camera.position.x = player.mesh.position.x;
    camera.position.z = player.mesh.position.z + 30;
    camera.lookAt(player.mesh.position);

    animateChar(player, moving, time);
    updateEntities(dt, time);
    updateParticles(dt);
    drawMinimap();

    if (player.stam < 100) { player.stam += 10 * dt; updateUI(); }
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