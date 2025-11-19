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
    const grp = createCharacterMesh(PALETTE.banditLeather, PALETTE.banditSkin, PALETTE.banditPants);
    grp.userData.parts.armR.add(createCube(0.05, 0.6, 0.05, 0x999, 0, -0.6, 0.15));
    grp.position.set(x, 0, z); worldGroup.add(grp);
    enemies.push({ mesh: grp, parts: grp.userData.parts, type: 'bandit', hp: 30, speed: 2.5, attacking: false, cooldown: 0, state: 'idle', timer: 0, target: new THREE.Vector3() });
}

function createGoblin(x, z) {
    const grp = createCharacterMesh(PALETTE.goblinClothes, PALETTE.goblinSkin, PALETTE.goblinClothes);
    grp.scale.set(0.8, 0.8, 0.8); // Goblins are smaller
    grp.userData.parts.armR.add(createCube(0.05, 0.5, 0.05, 0x795548, 0, -0.5, 0.15)); // Smaller club
    grp.position.set(x, 0, z); worldGroup.add(grp);
    enemies.push({ mesh: grp, parts: grp.userData.parts, type: 'goblin', hp: 20, speed: 3, attacking: false, cooldown: 0, state: 'idle', timer: 0, target: new THREE.Vector3() });
}

function createOgre(x, z) {
    const grp = createCharacterMesh(PALETTE.ogreClothes, PALETTE.ogreSkin, PALETTE.ogreClothes);
    grp.scale.set(1.5, 1.5, 1.5); // Ogres are bigger
    grp.userData.parts.armR.add(createCube(0.1, 1.0, 0.1, 0x795548, 0, -0.8, 0.2)); // Bigger club
    grp.position.set(x, 0, z); worldGroup.add(grp);
    enemies.push({ mesh: grp, parts: grp.userData.parts, type: 'ogre', hp: 100, speed: 1.5, attacking: false, cooldown: 0, state: 'idle', timer: 0, target: new THREE.Vector3() });
}

function createWerewolf(x, z) {
    const grp = createCharacterMesh(PALETTE.werewolfFur, PALETTE.werewolfSkin, PALETTE.werewolfFur);
    grp.position.set(x, 0, z); worldGroup.add(grp);
    enemies.push({ mesh: grp, parts: grp.userData.parts, type: 'werewolf', hp: 80, speed: 5, attacking: false, cooldown: 0, state: 'idle', timer: 0, target: new THREE.Vector3() });
}

function createCrocodile(x, z) {
    const grp = new THREE.Group(); grp.add(createCube(0.8, 0.4, 2.0, PALETTE.crocSkin, 0, 0.3, 0));
    const tail = new THREE.Group(); tail.position.set(0, 0.3, -1); grp.add(tail); tail.add(createCube(0.4, 0.3, 1.5, PALETTE.crocSkin, 0, 0, -0.75));
    const l1 = createCube(0.2, 0.3, 0.2, PALETTE.crocSkin, 0.5, 0.15, 0.8); grp.add(l1);
    const l2 = createCube(0.2, 0.3, 0.2, PALETTE.crocSkin, -0.5, 0.15, 0.8); grp.add(l2);
    const l3 = createCube(0.2, 0.3, 0.2, PALETTE.crocSkin, 0.5, 0.15, -0.8); grp.add(l3);
    const l4 = createCube(0.2, 0.3, 0.2, PALETTE.crocSkin, -0.5, 0.15, -0.8); grp.add(l4);
    grp.position.set(x, 0, z); worldGroup.add(grp);
    enemies.push({ mesh: grp, parts: { tail, l1, l2, l3, l4 }, type: 'crocodile', hp: 120, speed: 1.5, attacking: false, cooldown: 0, state: 'idle', timer: 0, target: new THREE.Vector3() });
}

function createPlant(x, z) {
    const grp = new THREE.Group(); grp.add(createCube(0.2, 1.5, 0.2, PALETTE.plantStem, 0, 0.75, 0));
    const head = new THREE.Group(); head.position.set(0, 1.5, 0);
    head.add(createCube(0.8, 0.6, 0.8, PALETTE.plantHead, 0, 0, 0));
    grp.add(head);
    grp.position.set(x, 0, z); worldGroup.add(grp);
    enemies.push({ mesh: grp, parts: { head }, type: 'plant', hp: 150, speed: 0, attacking: false, cooldown: 0 });
}

function damageEntity(e, dmg) {
    e.hp -= dmg; createFloatText(e.mesh.position, "-" + dmg);
    e.mesh.traverse(o => { if (o.material && o.material.emissive) { o.material.emissive.setHex(0xff0000); setTimeout(() => o.material.emissive.setHex(0), 100); } });
    if (e.hp <= 0) {
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
                const d = player.mesh.position.distanceTo(e.mesh.position);
                if (d < 25 && d > 1.5) {
                    e.mesh.lookAt(player.mesh.position); e.mesh.translateZ(e.speed * dt); move = true;
                    if (d < 2 && !e.attacking) { e.attacking = true; setTimeout(() => { damageEntity(player, 5); e.attacking = false; updateUI(); if (player.hp <= 0) handleDeath(); }, 500); }
                }
            }
            if (e.type === 'crocodile' || e.type === 'plant') animateMonster(e, move, t);
            else animateChar(e, move, t);
        }
    });
}