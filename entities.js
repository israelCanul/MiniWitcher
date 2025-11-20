function spawnCitizen(x, z) {
    const shirt = PALETTE.civShirts[Math.floor(Math.random() * PALETTE.civShirts.length)];
    const grp = createCharacterMesh(shirt, PALETTE.skin, PALETTE.civPants[0]);
    grp.position.set(x, 0, z); worldGroup.add(grp);
    citizens.push({ mesh: grp, parts: grp.userData.parts, home: { x, z }, state: 'idle', timer: 0, target: new THREE.Vector3(), speed: 2 });
}

function spawnGuards(x, z) {
    for (let i = 0; i < 3; i++) {
        let a = Math.random() * 6.28, r = 6;
        let gx = x + Math.cos(a) * r, gz = z + Math.sin(a) * r;
        const grp = createCharacterMesh(PALETTE.soldierArmor, PALETTE.skin, PALETTE.soldierDetail);
        grp.userData.parts.head.add(createCube(0.42, 0.3, 0.42, PALETTE.soldierDetail, 0, 0.1, 0));
        grp.userData.parts.armR.add(createCube(0.05, 2.5, 0.05, 0x5d4037, 0, -0.5, 0.15));
        grp.position.set(gx, 0, gz);
        worldGroup.add(grp);
        guards.push({ mesh: grp, parts: grp.userData.parts, hp: ENEMY_STATS.guard.hp, speed: ENEMY_STATS.guard.speed, attacking: false, home: { x, z } });
    }
}

function createCharacterMesh(ac, sc, pc) {
    // Esta función ahora solo es usada por el jugador y los ciudadanos/guardias
    // y podría ser movida a utils.js en el futuro.
    const grp = new THREE.Group();
    grp.add(createCube(0.6, 0.8, 0.3, ac, 0, 1.1, 0));
    const head = new THREE.Group(); head.position.set(0, 1.8, 0);
    head.add(createCube(0.4, 0.4, 0.4, sc, 0, 0, 0));
    head.add(createCube(0.1, 0.05, 0.05, 0x000, 0.1, 0, 0.2));
    head.add(createCube(0.1, 0.05, 0.05, 0x000, -0.1, 0, 0.2));
    grp.add(head);
    const armL = new THREE.Group(); armL.position.set(0.45, 1.3, 0); armL.add(createCube(0.2, 0.6, 0.2, ac, 0, -0.2, 0)); grp.add(armL);
    const armR = new THREE.Group(); armR.position.set(-0.45, 1.3, 0); armR.add(createCube(0.2, 0.6, 0.2, ac, 0, -0.2, 0)); grp.add(armR);
    const legL = new THREE.Group(); legL.position.set(0.2, 0.8, 0); legL.add(createCube(0.25, 0.8, 0.25, pc, 0, -0.4, 0)); grp.add(legL);
    const legR = new THREE.Group(); legR.position.set(-0.2, 0.8, 0); legR.add(createCube(0.25, 0.8, 0.25, pc, 0, -0.4, 0)); grp.add(legR);
    grp.userData.parts = { head, armL, armR, legL, legR };
    return grp;
}

function createEnemy(x, z, type) {
    switch (type) {
        case 'Bandit': return new Bandit(x, z);
        case 'Goblin': return new Goblin(x, z);
        case 'Ogre': return new Ogre(x, z);
        case 'Werewolf': return new Werewolf(x, z);
        case 'Crocodile': return new Crocodile(x, z);
        case 'Plant': return new Plant(x, z);
        // case 'GoblinKing': return new GoblinKing(x, z, null);
        default: console.error(`Tipo de enemigo desconocido: ${type}`); return null;
    }
}

function animateChar(c, move, t) {
    if (!c.parts) return;

    // --- Lógica de Animación ---
    // Si es el Rey Goblin y está en una fase de ataque, tiene prioridad
    if (c.type === 'goblin_king' && (c.attackPhase === 'charging' || c.attackPhase === 'spinning')) {
        if (c.attackPhase === 'charging') {
            // Fase 1: Levantar y mantener la espada en alto
            c.parts.armR.rotation.x = -Math.PI / 2;
        } else if (c.attackPhase === 'spinning') {
            // Fase 2: Giro rápido
            if (c.spinStartTime === undefined) c.spinStartTime = clock.getElapsedTime();
            const spinProgress = (clock.getElapsedTime() - c.spinStartTime) / ENEMY_STATS.goblin_king.spinTime;
            c.mesh.rotation.y = c.startSpinRotation + (Math.PI * 2 * spinProgress);
            c.parts.armR.rotation.x = -Math.PI / 2; // Mantener la espada levantada
        }
    } else if (move) {
        // Animación de caminar para todos los demás casos
        if (c.parts.legL) c.parts.legL.rotation.x = Math.sin(t * 15) * 0.8;
        if (c.parts.legR) c.parts.legR.rotation.x = Math.sin(t * 15 + Math.PI) * 0.8;
        if (c.parts.armL) c.parts.armL.rotation.x = Math.sin(t * 15 + Math.PI) * 0.8;
        if (c.parts.armR) c.parts.armR.rotation.x = Math.sin(t * 15) * 0.8;
    } else {
        // Estado de reposo para todos los personajes
        if (c.type === 'goblin_king' && c.attackPhase !== 'spinning') {
            c.parts.armR.rotation.x = 0; // Asegurarse de que la espada del rey vuelva a su sitio
        } else if (c.parts.legL) c.parts.legL.rotation.x = 0; if (c.parts.legR) c.parts.legR.rotation.x = 0;
        if (c.parts.armL) c.parts.armL.rotation.x = 0;
        if (c.parts.armR) c.parts.armR.rotation.x = 0;
    }
}

function showTrajectory(startPos, targetPos, speed) {
    const points = [];
    const direction = new THREE.Vector3().subVectors(targetPos, startPos).normalize();
    const step = direction.multiplyScalar(speed * 0.1); // Simular 10% de la distancia por paso

    let currentPos = startPos.clone();
    for (let i = 0; i < 10; i++) {
        points.push(currentPos.clone());
        currentPos.add(step);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.7 });
    const line = new THREE.Line(geometry, material);
    worldGroup.add(line);

    // La línea se autodestruirá
    setTimeout(() => {
        worldGroup.remove(line);
    }, 1500); // La línea dura 1.5 segundos

    return line;
}

function createProjectile(startPos, targetPos, speed, damage, life) {
    const arrow = createCube(0.05, 0.5, 0.05, PALETTE.deadWood, 0, 0, 0);
    arrow.position.copy(startPos);

    const direction = new THREE.Vector3().subVectors(targetPos, startPos).normalize();
    const velocity = direction.multiplyScalar(speed);

    projectiles.push({ mesh: arrow, velocity: velocity, life: life || 3, damage: damage });
    worldGroup.add(arrow);
}

function createCircleAttackFX(position, range) {
    // Crea un círculo rojo en el suelo
    const geometry = new THREE.RingGeometry(range - 0.2, range, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const circleFX = new THREE.Mesh(geometry, material);

    // Posiciona el efecto en el suelo y lo pone plano
    circleFX.position.copy(position).setY(0.3); // Un poco elevado para evitar z-fighting
    circleFX.rotation.x = -Math.PI / 2;

    worldGroup.add(circleFX);
    return circleFX;
}

function updateEntities(dt, t) {
    // La lógica de los ciudadanos y guardias se mantiene igual...
    // ... (código de ciudadanos y guardias)

    // Lógica de actualización para los enemigos basada en clases
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        // Cada enemigo ahora se actualiza a sí mismo, gestionando su propio movimiento y animación.
        e.update(dt, player, t);
    }
}