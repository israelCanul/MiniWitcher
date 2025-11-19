// --- 3. FACTORY DE PERSONAJES Y ENTIDADES ---
function createCharacterMesh(ac, sc, pc) {
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

function createPlayer() {
    player = { mesh: createCharacterMesh(PALETTE.armor, PALETTE.skin, PALETTE.banditPants), hp: 100, maxHp: 100, stam: 100, attacking: false };
    player.mesh.userData.parts.head.add(createCube(0.45, 0.1, 0.45, PALETTE.hair, 0, 0.25, 0));
    player.mesh.userData.parts.armR.add(createCube(0.08, 1.4, 0.05, 0xffffff, 0, -1.0, 0.15));
    player.parts = player.mesh.userData.parts;
    scene.add(player.mesh);
}

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
        grp.position.set(gx, 0, gz); worldGroup.add(grp);
        guards.push({ mesh: grp, parts: grp.userData.parts, hp: 50, speed: 3.5, attacking: false, home: { x, z } });
    }
}

function createEnemy(x, z, type) {
    // Bandido
    const grp = createCharacterMesh(PALETTE.banditLeather, PALETTE.banditSkin, PALETTE.banditPants);
    const parts = grp.userData.parts;

    // Detalles: Bandana y Daga
    parts.head.add(createCube(0.45, 0.15, 0.45, 0xb71c1c, 0, 0.1, 0)); // Bandana roja
    const dagger = new THREE.Group();
    dagger.add(createCube(0.1, 0.2, 0.1, PALETTE.wood, 0, -0.4, 0.15)); // Mango
    dagger.add(createCube(0.05, 0.4, 0.05, PALETTE.rock, 0, -0.7, 0.15)); // Hoja
    parts.armR.add(dagger);
    grp.position.set(x, 0, z); worldGroup.add(grp);
    enemies.push({ mesh: grp, parts: grp.userData.parts, type: 'bandit', hp: 30, speed: 2.5, attacking: false, cooldown: 0, state: 'idle', timer: 0, target: new THREE.Vector3() });
}

function createGoblin(x, z) {
    // Usamos blanco para la camisa y negro para los pantalones.
    const shirtColor = 0xffffff; // Blanco
    const pantsColor = 0x212121; // Un negro no tan puro
    const grp = createCharacterMesh(shirtColor, PALETTE.goblinSkin, pantsColor);
    grp.scale.set(0.8, 0.8, 0.8); // Goblins are smaller
    const parts = grp.userData.parts;

    // --- Añadir detalles al Goblin ---
    const head = parts.head;
    // Limpiamos los ojos genéricos para poner unos nuevos
    const originalEyes = head.children.filter(c => c.geometry.parameters.width === 0.1 && c.geometry.parameters.height === 0.05);
    originalEyes.forEach(eye => head.remove(eye));

    // Ojos nuevos, más grandes y amarillos
    head.add(createCube(0.1, 0.1, 0.05, PALETTE.flowers[0], 0.1, 0.05, 0.2));
    head.add(createCube(0.1, 0.1, 0.05, PALETTE.flowers[0], -0.1, 0.05, 0.2));
    // Orejas puntiagudas
    head.add(createCube(0.1, 0.3, 0.1, PALETTE.goblinSkin, 0.25, 0.1, 0));
    head.add(createCube(0.1, 0.3, 0.1, PALETTE.goblinSkin, -0.25, 0.1, 0));
    // Nariz
    head.add(createCube(0.1, 0.1, 0.1, PALETTE.goblinSkin, 0, -0.1, 0.2));

    // --- Equipamiento ---
    // Zapatos
    parts.legL.add(createCube(0.3, 0.2, 0.3, PALETTE.banditLeather, 0, -0.9, 0));
    parts.legR.add(createCube(0.3, 0.2, 0.3, PALETTE.banditLeather, 0, -0.9, 0));
    // Cinturón
    grp.add(createCube(0.65, 0.15, 0.35, PALETTE.banditLeather, 0, 0.7, 0));
    // Túnica/Falda andrajosa
    grp.add(createCube(0.7, 0.4, 0.4, shirtColor, 0, 0.5, 0));


    // Hombrera de armadura
    parts.armL.add(createCube(0.3, 0.3, 0.3, PALETTE.soldierArmor, 0, 0.2, 0));
    // Hacha simple en lugar de garrote
    const weapon = new THREE.Group();
    weapon.add(createCube(0.05, 0.7, 0.05, PALETTE.wood, 0, -0.6, 0.15)); // Mango
    weapon.add(createCube(0.1, 0.3, 0.2, PALETTE.rock, 0, -0.9, 0.15)); // Cabeza del hacha
    parts.armR.add(weapon);

    grp.position.set(x, 0, z); worldGroup.add(grp);
    const goblinData = { mesh: grp, parts: grp.userData.parts, type: 'goblin', hp: 20, speed: 3, attacking: false, cooldown: 0, state: 'idle', timer: 0, target: new THREE.Vector3() };
    enemies.push(goblinData);
    return goblinData; // Devolvemos los datos para poder añadirle un home
}

function createGoblinKing(x, z, portalData) {
    // Creamos un goblin, pero lo eliminamos de la lista general de enemigos
    // porque lo gestionaremos como el rey.
    const kingData = createGoblin(x, z);
    enemies.pop(); // Elimina el último goblin añadido, que es nuestro futuro rey.
    const king = kingData.mesh;

    king.scale.set(1.1, 1.1, 1.1); // Más grande que un goblin normal
    kingData.hp = 80; // Mucha más vida
    kingData.type = 'goblin_king';
    kingData.portalData = portalData; // Guardamos la info del portal

    // Corona de oro
    const crown = new THREE.Group();
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        crown.add(createCube(0.1, 0.2, 0.1, PALETTE.flowers[0], Math.cos(angle) * 0.2, 0.25, Math.sin(angle) * 0.2));
    }
    kingData.parts.head.add(crown);
    enemies.push(kingData); // Volvemos a añadirlo a la lista, ya como rey.
}

function createOgre(x, z) {
    const grp = createCharacterMesh(PALETTE.ogreClothes, PALETTE.ogreSkin, PALETTE.ogreClothes);
    const parts = grp.userData.parts;
    grp.scale.set(1.5, 1.5, 1.5); // Ogres are bigger

    // Detalles: Cara y Taparrabos
    parts.head.add(createCube(0.1, 0.1, 0.1, 0xffffff, -0.1, -0.2, 0.2)); // Colmillo
    grp.add(createCube(0.7, 0.4, 0.4, PALETTE.banditLeather, 0, 0.5, 0)); // Taparrabos de cuero

    // Garrote con pinchos
    const club = new THREE.Group();
    club.add(createCube(0.15, 1.0, 0.15, PALETTE.wood, 0, -0.8, 0.2)); // Mango
    club.add(createCube(0.25, 0.4, 0.25, PALETTE.rock, 0, -1.3, 0.2)); // Cabeza del garrote
    parts.armR.add(club);

    grp.position.set(x, 0, z); worldGroup.add(grp);
    enemies.push({ mesh: grp, parts: grp.userData.parts, type: 'ogre', hp: 100, speed: 1.5, attacking: false, cooldown: 0, state: 'idle', timer: 0, target: new THREE.Vector3() });
}

function createWerewolf(x, z) {
    // Usamos piel para el torso y pantalones rotos
    const grp = createCharacterMesh(PALETTE.werewolfSkin, PALETTE.werewolfSkin, PALETTE.civPants[0]);
    const parts = grp.userData.parts;

    // Detalles: Hocico, orejas y garras
    parts.head.add(createCube(0.2, 0.2, 0.3, PALETTE.werewolfFur, 0, -0.1, 0.25)); // Hocico
    parts.head.add(createCube(0.1, 0.2, 0.1, PALETTE.werewolfFur, 0.2, 0.25, 0)); // Oreja
    parts.head.add(createCube(0.1, 0.2, 0.1, PALETTE.werewolfFur, -0.2, 0.25, 0)); // Oreja
    parts.armL.add(createCube(0.25, 0.1, 0.25, PALETTE.werewolfFur, 0, 0.1, 0)); // Pelo en hombros
    parts.armR.add(createCube(0.25, 0.1, 0.25, PALETTE.werewolfFur, 0, 0.1, 0)); // Pelo en hombros
    parts.armL.add(createCube(0.05, 0.15, 0.05, 0xffffff, 0.08, -0.5, 0.08)); // Garra
    parts.armR.add(createCube(0.05, 0.15, 0.05, 0xffffff, -0.08, -0.5, 0.08)); // Garra

    grp.position.set(x, 0, z); worldGroup.add(grp);
    enemies.push({ mesh: grp, parts: grp.userData.parts, type: 'werewolf', hp: 80, speed: 5, attacking: false, cooldown: 0, state: 'idle', timer: 0, target: new THREE.Vector3() });
}

function createCrocodile(x, z) {
    const grp = new THREE.Group();
    const body = createCube(0.8, 0.4, 2.0, PALETTE.crocSkin, 0, 0.3, 0);
    grp.add(body);
    // Detalles: Dientes y crestas
    body.add(createCube(0.1, 0.1, 0.1, 0xffffff, 0.2, -0.1, 0.9)); // Diente
    body.add(createCube(0.1, 0.1, 0.1, 0xffffff, -0.2, -0.1, 0.9)); // Diente
    body.add(createCube(0.2, 0.1, 0.2, PALETTE.crocDetail, 0, 0.25, 0.5)); // Cresta
    body.add(createCube(0.2, 0.1, 0.2, PALETTE.crocDetail, 0, 0.25, 0)); // Cresta
    body.add(createCube(0.2, 0.1, 0.2, PALETTE.crocDetail, 0, 0.25, -0.5)); // Cresta

    const tail = new THREE.Group(); tail.position.set(0, 0.3, -1); grp.add(tail); tail.add(createCube(0.4, 0.3, 1.5, PALETTE.crocSkin, 0, 0, -0.75));
    const l1 = createCube(0.2, 0.3, 0.2, PALETTE.crocSkin, 0.5, 0.15, 0.8); grp.add(l1);
    const l2 = createCube(0.2, 0.3, 0.2, PALETTE.crocSkin, -0.5, 0.15, 0.8); grp.add(l2);
    const l3 = createCube(0.2, 0.3, 0.2, PALETTE.crocSkin, 0.5, 0.15, -0.8); grp.add(l3);
    const l4 = createCube(0.2, 0.3, 0.2, PALETTE.crocSkin, -0.5, 0.15, -0.8); grp.add(l4);
    grp.position.set(x, 0, z); worldGroup.add(grp);
    enemies.push({ mesh: grp, parts: { body, tail, l1, l2, l3, l4 }, type: 'crocodile', hp: 120, speed: 1.5, attacking: false, cooldown: 0, state: 'idle', timer: 0, target: new THREE.Vector3() });
}

function createPlant(x, z) {
    const grp = new THREE.Group(); grp.add(createCube(0.2, 1.5, 0.2, PALETTE.plantStem, 0, 0.75, 0));
    const head = new THREE.Group(); head.position.set(0, 1.5, 0);
    const mouth = createCube(0.8, 0.6, 0.8, PALETTE.plantHead, 0, 0, 0);
    // Detalles: Dientes y hojas
    mouth.add(createCube(0.1, 0.2, 0.1, 0xffffff, 0.2, -0.2, 0.35)); // Diente
    mouth.add(createCube(0.1, 0.2, 0.1, 0xffffff, -0.2, -0.2, 0.35)); // Diente
    grp.add(createCube(0.8, 0.1, 0.2, PALETTE.leaves, 0, 1, 0.2)); // Hoja
    grp.add(createCube(0.2, 0.1, 0.8, PALETTE.leaves, 0.2, 0.7, 0)); // Hoja
    head.add(mouth);
    grp.add(head);
    grp.position.set(x, 0, z); worldGroup.add(grp);
    enemies.push({ mesh: grp, parts: { head }, type: 'plant', hp: 150, speed: 0, attacking: false, cooldown: 0 });
}

function damageEntity(e, dmg) {
    e.hp -= dmg; createFloatText(e.mesh.position, "-" + dmg);
    e.mesh.traverse(o => { if (o.material && o.material.emissive) { o.material.emissive.setHex(0xff0000); setTimeout(() => o.material.emissive.setHex(0), 100); } });
    if (e.hp <= 0) {
        // --- LÓGICA DE APARICIÓN DE PORTAL ---
        if (e.type === 'goblin_king' && e.portalData) {
            console.log(`Portal a ${e.portalData.name} ha sido desbloqueado!`);
            activePortals.push(e.portalData);
            createPortalVisual(e.portalData.x, e.portalData.z);
        }

        // --- LOOT DROPS ---
        addGold(Math.floor(Math.random() * 5) + 1);
        if (Math.random() < 0.5) {
            let itemName = e.type + " part";
            addItemToInventory({ name: itemName, quantity: 1 });
        }
        // --- END LOOT DROPS ---

        worldGroup.remove(e.mesh);
        let idx = enemies.indexOf(e);
        if (idx > -1) enemies.splice(idx, 1);
        updateQuest();
    }
}

function animateChar(c, move, t) {
    if (!c.parts) return;
    if (move) {
        if (c.parts.legL) c.parts.legL.rotation.x = Math.sin(t * 15) * 0.8;
        if (c.parts.legR) c.parts.legR.rotation.x = Math.sin(t * 15 + Math.PI) * 0.8;
        if (!c.attacking) { if (c.parts.armL) c.parts.armL.rotation.x = Math.sin(t * 15 + Math.PI) * 0.8; if (c.parts.armR) c.parts.armR.rotation.x = Math.sin(t * 15) * 0.8; }
    } else {
        if (c.parts.legL) c.parts.legL.rotation.x = 0; if (c.parts.legR) c.parts.legR.rotation.x = 0;
        if (!c.attacking) { if (c.parts.armL) c.parts.armL.rotation.x = 0; if (c.parts.armR && c !== player) c.parts.armR.rotation.x = 0; }
    }
}

function animateMonster(e, moving, t) {
    if (e.type === 'crocodile') {
        if (moving) {
            e.parts.l1.rotation.x = Math.sin(t * 10) * 0.5; e.parts.l2.rotation.x = Math.sin(t * 10 + Math.PI) * 0.5;
            e.parts.l3.rotation.x = Math.sin(t * 10 + Math.PI) * 0.5; e.parts.l4.rotation.x = Math.sin(t * 10) * 0.5;
            e.parts.tail.rotation.y = Math.sin(t * 10) * 0.3;
        }
    } else if (e.type === 'plant') {
        e.parts.head.position.y = 1.5 + Math.sin(t * 2) * 0.1;
        if (e.attacking) e.parts.head.rotation.x = Math.sin(t * 20) * 0.5;
    }
}

function updateEntities(dt, t) {
    citizens.forEach(c => {
        c.timer -= dt; let moving = false;
        if (c.timer <= 0) {
            if (c.state === 'idle') {
                let a = Math.random() * 6.28, d = Math.random() * 8;
                c.target.set(c.home.x + Math.cos(a) * d, 0, c.home.z + Math.sin(a) * d);
                c.state = 'walk'; c.timer = 3;
            } else { c.state = 'idle'; c.timer = 3; }
        }
        if (c.state === 'walk' && c.mesh.position.distanceTo(c.target) > 0.5) {
            c.mesh.lookAt(c.target.x, 0, c.target.z); c.mesh.translateZ(c.speed * dt); moving = true;
        }
        animateChar(c, moving, t);
    });
    [enemies, guards].flat().forEach(e => {
        if (e.hp > 0) {
            let move = false;
            if (e.type && e.type !== 'plant') {
                const playerDist = player.mesh.position.distanceTo(e.mesh.position);

                // Lógica de IA
                if (e.state === 'idle') {
                    if (e.home) { // Si tiene un hogar (es un goblin de reino)
                        e.state = 'patrol';
                        e.timer = 0;
                    } else if (playerDist < 15) { // Si es un enemigo errante
                        e.state = 'chase';
                    }
                } else if (e.state === 'patrol') {
                    if (playerDist < 20) { e.state = 'chase'; } // Si ve al jugador, lo persigue
                    else {
                        e.timer -= dt;
                        if (e.timer <= 0) { // Elige un nuevo punto de patrulla
                            const patrolRadius = 15;
                            const angle = Math.random() * Math.PI * 2;
                            e.target.set(e.home.x + Math.cos(angle) * patrolRadius, 0, e.home.z + Math.sin(angle) * patrolRadius);
                            e.timer = 5 + Math.random() * 5; // Patrulla por 5-10 segundos
                        }
                        if (e.mesh.position.distanceTo(e.target) > 1) {
                            e.mesh.lookAt(e.target); e.mesh.translateZ(e.speed * dt * 0.5); move = true;
                        }
                    }
                }
                if (e.state === 'chase') {
                    if (playerDist < 25 && playerDist > 1.5) {
                        e.mesh.lookAt(player.mesh.position); e.mesh.translateZ(e.speed * dt); move = true;
                        if (playerDist < 2 && !e.attacking) { e.attacking = true; setTimeout(() => { damageEntity(player, 5); e.attacking = false; updateUI(); if (player.hp <= 0) handleDeath(); }, 500); }
                    } else if (playerDist >= 25) {
                        e.state = e.home ? 'patrol' : 'idle'; // Si tiene hogar vuelve a patrullar, si no, se queda quieto
                    }
                }
            }
            if (e.type === 'crocodile' || e.type === 'plant') animateMonster(e, move, t);
            else animateChar(e, move, t);
        }
    });
}