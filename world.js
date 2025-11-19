// --- 4. ESTRUCTURAS Y GENERACIÓN DE MUNDO ---

function createSpecialBuilding(x, z, type) {
    const grp = new THREE.Group(); grp.position.set(x, 0, z);
    let col = { w: 0x8d6e63, r: 0xd84315 };
    if (type === 'fort') col = { w: 0x757575, r: 0x424242 };
    let w = 4, h = 3; if (type === 'gob') { w = 6; h = 5; }

    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), new THREE.MeshStandardMaterial({ color: col.w }));
    wall.position.y = h / 2; wall.castShadow = true; grp.add(wall);
    if (type !== 'fort') {
        const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.8, 2, 4), new THREE.MeshStandardMaterial({ color: col.r }));
        roof.position.y = h + 1; roof.rotation.y = Math.PI / 4; grp.add(roof);
    }
    worldGroup.add(grp); addCollider(x, z, w);
}

function createHouse(x, z) {
    const grp = new THREE.Group(); grp.position.set(x, 0, z);
    const w = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 3), new THREE.MeshStandardMaterial({ color: 0x8d6e63 }));
    w.position.y = 1.25; w.castShadow = true; grp.add(w);
    const r = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.5, 4), new THREE.MeshStandardMaterial({ color: 0xd84315 }));
    r.position.y = 3.25; r.rotation.y = Math.PI / 4; grp.add(r);
    worldGroup.add(grp); addCollider(x, z, 3);
}

function createParcel(x, z) {
    const grp = new THREE.Group(); grp.position.set(x, 0.05, z);
    const dirt = new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 6), new THREE.MeshStandardMaterial({ color: PALETTE.crop }));
    grp.add(dirt);
    for (let i = -2; i <= 2; i += 1.5) for (let j = -2; j <= 2; j += 1.5) {
        const plant = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.4), new THREE.MeshStandardMaterial({ color: PALETTE.cropPlant }));
        plant.position.set(i, 0.3, j); grp.add(plant);
    }
    worldGroup.add(grp);
}

function spawnVillage(x, z) {
    villageCenters.push({ x: x, z: z });
    createSpecialBuilding(x, z, 'gob');
    createSpecialBuilding(x, z - 10, 'mkt');
    createSpecialBuilding(x + 10, z, 'inn');
    createSpecialBuilding(x - 10, z, 'fort');
    createHouse(x + 8, z + 8); createHouse(x - 8, z + 8); createHouse(x + 8, z - 8);
    createParcel(x + 18, z); createParcel(x - 18, z); createParcel(x, z + 18);
    spawnGuards(x, z);
    for (let i = 0; i < 5; i++) spawnCitizen(x + (Math.random() - 0.5) * 20, z + (Math.random() - 0.5) * 20);
}

function createBanditCamp(x, z) {
    const grp = new THREE.Group();
    grp.position.set(x, 0.1, z);

    // Hoguera
    const firePit = new THREE.Group(); grp.add(firePit);
    firePit.add(createCube(0.2, 0.2, 1.0, PALETTE.wood, 0, 0.1, 0)); // Leño
    firePit.add(createCube(0.2, 0.2, 1.0, PALETTE.wood, 0, 0.1, 0)).rotation.y = Math.PI / 2; // Leño
    // Rocas alrededor de la hoguera
    for (let i = 0; i < 5; i++) {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), new THREE.MeshStandardMaterial({ color: PALETTE.rock }));
        rock.position.set(Math.cos(i * 1.25) * 0.8, 0.1, Math.sin(i * 1.25) * 0.8);
        firePit.add(rock);
    }
    const fireLight = new THREE.PointLight(0xffaa33, 0.8, 10);
    fireLight.position.y = 0.5;
    firePit.add(fireLight);

    // Props y desorden del campamento
    addCampProps(grp);

    const huts = [];
    // Cabañas alrededor de la hoguera
    const numHuts = 2 + Math.floor(Math.random() * 2); // 2 o 3 cabañas
    const radius = 6;
    for (let i = 0; i < numHuts; i++) {
        const angle = (i / numHuts) * Math.PI * 2 + Math.random() * 0.5;
        const hutX = Math.cos(angle) * radius;
        const hutZ = Math.sin(angle) * radius;
        const hut = createBanditHut(hutX, hutZ, -angle - Math.PI / 2);
        grp.add(hut);
        huts.push(hut);
    }

    worldGroup.add(grp);
    banditCamps.push({ x, z, spawned: false, group: grp, huts: huts });
}

function createGoblinKingdom(x, z, portalData) {
    const kingdomGroup = new THREE.Group();
    kingdomGroup.position.set(x, 0.1, z);

    // Trono del Rey
    const throne = new THREE.Group();
    throne.add(createCube(1.5, 0.5, 1.5, PALETTE.rock, 0, 0.25, 0)); // Base
    throne.add(createCube(0.4, 2.0, 0.4, PALETTE.rock, 0.6, 1.0, 0.6)); // Pilar
    throne.add(createCube(0.4, 2.0, 0.4, PALETTE.rock, -0.6, 1.0, 0.6)); // Pilar
    kingdomGroup.add(throne);

    // Generar Rey Goblin en el trono
    createGoblinKing(x, z, portalData); // Pasamos la info del portal al rey

    // Generar chozas y goblins guardianes
    const numHuts = 4 + Math.floor(Math.random() * 3); // 4 a 6 chozas
    const radius = 12;
    for (let i = 0; i < numHuts; i++) {
        const angle = (i / numHuts) * Math.PI * 2;
        const hutX = Math.cos(angle) * radius;
        const hutZ = Math.sin(angle) * radius;
        kingdomGroup.add(createBanditHut(hutX, hutZ, -angle - Math.PI / 2));
        const goblin = createGoblin(x + hutX, z + hutZ);
        goblin.home = { x: x, z: z }; // Asignar el centro del reino como su hogar
    }
    worldGroup.add(kingdomGroup);
}

function createCave(x, z) {
    const grp = new THREE.Group(); grp.position.set(x, 0, z);
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(2.5, 0), new THREE.MeshStandardMaterial({ color: 0x212121 }));
    m.scale.set(1.5, 0.6, 1.5); m.castShadow = true; grp.add(m);
    worldGroup.add(grp);
    addCollider(x, z, 3);
}

function createBanditHut(x, z, rotation) {
    const hut = new THREE.Group();
    hut.position.set(x, 0, z);
    hut.rotation.y = rotation;

    // Estructura simple de madera
    hut.add(createCube(0.2, 1.5, 0.2, PALETTE.wood, 1.2, 0.75, 0)); // Poste
    hut.add(createCube(0.2, 1.5, 0.2, PALETTE.wood, -1.2, 0.75, 0)); // Poste
    const roof = createCube(2.5, 0.2, 2.5, PALETTE.banditLeather, 0, 1.5, 0);
    roof.rotation.x = -0.3; // Techo inclinado
    hut.add(roof);
    addCollider(x, z, 2);
    return hut;
}

function addCampProps(campGroup) {
    // Añade barriles, cajas, etc.
    for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 2 + Math.random() * 2;
        const prop = createCube(0.6, 0.8, 0.6, PALETTE.wood, Math.cos(angle) * radius, 0.4, Math.sin(angle) * radius);
        if (Math.random() > 0.5) prop.scale.set(0.8, 1.2, 0.8); // Barril
        campGroup.add(prop);
    }
}

function createPortalVisual(x, z) {
    const geo = new THREE.SphereGeometry(2, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.6 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 2, z);
    const glow = new THREE.PointLight(0xff0000, 1, 20);
    glow.castShadow = false;
    glow.position.set(x, 2, z);
    worldGroup.add(mesh);
    worldGroup.add(glow);
}

function placeProp(x, z, h, mt, ml, idx, isPine) {
    const dum = new THREE.Object3D();
    dum.position.set(x, 1.5 + h, z); dum.rotation.y = Math.random() * Math.PI; dum.scale.set(1, 1 + Math.random() * 0.5, 1);
    dum.updateMatrix(); mt.setMatrixAt(idx, dum.matrix);
    dum.position.y = (isPine ? 3 : 2.5) + h + dum.scale.y; dum.scale.set(1, 1, 1);
    dum.updateMatrix(); ml.setMatrixAt(idx, dum.matrix);
    addCollider(x, z, 0.6);
}

function generateTerrain(type) {
    const size = SCENARIO_SIZE / TILE_SIZE;
    const offset = SCENARIO_SIZE / 2;

    let c = { grass: 0, dirt: 0, water: 0, snow: 0, ice: 0, swampG: 0, swampW: 0, tree: 0, pine: 0, dead: 0, rock: 0, weed: 0, flower: 0 };
    let grid = [];

    for (let x = 0; x < size; x++) {
        for (let z = 0; z < size; z++) {
            let wx = x * 2 - offset; let wz = z * 2 - offset;
            let cell = { x: wx, z: wz, type: 'ground', prop: null };

            let isEdge = (Math.abs(wx) > SCENARIO_SIZE / 2 - 4 || Math.abs(wz) > SCENARIO_SIZE / 2 - 4);
            if (isEdge) {
                let nearPortal = false;
                for (let p of activePortals) if (Math.hypot(wx - p.x, wz - p.z) < 8) nearPortal = true;
                if (!nearPortal) addCollider(wx, wz, 4);
            }

            let noise = Math.sin(x / 10) * Math.cos(z / 10);
            if (type === 'swamp' && noise > 0.5) { cell.type = 'swampWater'; c.swampW++; }
            else if (type === 'snow' && noise > 0.8) { cell.type = 'ice'; c.ice++; }
            else if (type === 'desert' && noise > 0.85) { cell.type = 'water'; c.water++; }
            else {
                if (type === 'snow') c.snow++; else if (type === 'swamp') c.swampG++; else c.grass++;
                if (!isEdge && Math.random() > 0.85) {
                    let r = Math.random();
                    if (type === 'snow') {
                        if (r > 0.96) { cell.prop = 'pine'; c.pine++; } else if (r > 0.94) { cell.prop = 'rock'; c.rock++; }
                    } else if (type === 'swamp') {
                        if (r > 0.97) { cell.prop = 'dead'; c.dead++; } else if (r > 0.6) { cell.prop = 'weed'; c.weed++; }
                    } else if (type === 'desert') {
                        if (r > 0.98) { cell.prop = 'rock'; c.rock++; }
                    } else {
                        if (r > 0.95) { cell.prop = 'tree'; c.tree++; } else if (r > 0.93) { cell.prop = 'rock'; c.rock++; }
                        else if (r > 0.85) { cell.prop = 'flower'; c.flower++; } else if (r > 0.50) { cell.prop = 'weed'; c.weed++; }
                    }
                }
            }
            grid.push(cell);
        }
    }

    const gb = new THREE.BoxGeometry(2, 0.2, 2);
    const mGrass = new THREE.InstancedMesh(gb, new THREE.MeshStandardMaterial({ color: PALETTE.grass }), c.grass);
    const mDirt = new THREE.InstancedMesh(gb, new THREE.MeshStandardMaterial({ color: PALETTE.dirt }), c.dirt);
    const mWater = new THREE.InstancedMesh(gb, new THREE.MeshStandardMaterial({ color: PALETTE.water, transparent: true, opacity: 0.7 }), c.water);
    const mSnow = new THREE.InstancedMesh(gb, new THREE.MeshStandardMaterial({ color: PALETTE.snow }), c.snow);
    const mIce = new THREE.InstancedMesh(gb, new THREE.MeshStandardMaterial({ color: PALETTE.ice, transparent: true, opacity: 0.9 }), c.ice);
    const mSwampG = new THREE.InstancedMesh(gb, new THREE.MeshStandardMaterial({ color: PALETTE.swampGrass }), c.swampG);
    const mSwampW = new THREE.InstancedMesh(gb, new THREE.MeshStandardMaterial({ color: PALETTE.swampWater, transparent: true, opacity: 0.8 }), c.swampW);
    [mGrass, mSnow, mSwampG].forEach(m => m.receiveShadow = true);

    const mTreeT = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 2, 0.5), new THREE.MeshStandardMaterial({ color: PALETTE.wood }), c.tree);
    const mTreeL = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), new THREE.MeshStandardMaterial({ color: PALETTE.leaves }), c.tree);
    const mPineT = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 2, 0.5), new THREE.MeshStandardMaterial({ color: PALETTE.pineWood }), c.pine);
    const mPineL = new THREE.InstancedMesh(new THREE.ConeGeometry(1.5, 4, 4), new THREE.MeshStandardMaterial({ color: PALETTE.pineLeaves }), c.pine);
    const mDead = new THREE.InstancedMesh(new THREE.BoxGeometry(0.4, 2.5, 0.4), new THREE.MeshStandardMaterial({ color: PALETTE.deadWood }), c.dead);
    const mRock = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.7, 0), new THREE.MeshStandardMaterial({ color: PALETTE.rock }), c.rock);
    const mFlower = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 0.3, 0.2), new THREE.MeshStandardMaterial({ color: 0xffffff }), c.flower);
    const mWeed = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), new THREE.MeshStandardMaterial({ color: PALETTE.weed }), c.weed * 3);
    [mTreeT, mTreeL, mPineT, mPineL, mDead, mRock].forEach(m => { m.receiveShadow = true; m.castShadow = true; });

    let idx = { g: 0, w: 0, s: 0, i: 0, sg: 0, sw: 0, t: 0, p: 0, d: 0, r: 0, f: 0, wd: 0 };
    const dum = new THREE.Object3D();
    const col = new THREE.Color();

    grid.forEach(cell => {
        dum.rotation.set(0, 0, 0); dum.scale.set(1, 1, 1);
        if (cell.type === 'path') {
            dum.position.set(cell.x, -0.1, cell.z); dum.updateMatrix(); mDirt.setMatrixAt(idx.d++, dum.matrix);
        } else if (cell.type.includes('water') || cell.type === 'ice') {
            dum.position.set(cell.x, -0.3, cell.z); dum.updateMatrix();
            if (cell.type === 'ice') mIce.setMatrixAt(idx.i++, dum.matrix);
            else if (cell.type === 'swampWater') mSwampW.setMatrixAt(idx.sw++, dum.matrix);
            else mWater.setMatrixAt(idx.w++, dum.matrix);
            addCollider(cell.x, cell.z, 2);
        } else {
            let h = Math.random() * 0.15;
            dum.position.set(cell.x, h, cell.z); dum.updateMatrix();
            if (type === 'snow') mSnow.setMatrixAt(idx.s++, dum.matrix);
            else if (type === 'swamp') mSwampG.setMatrixAt(idx.sg++, dum.matrix);
            else {
                mGrass.setMatrixAt(idx.g, dum.matrix);
                if (type === 'desert') mGrass.setColorAt(idx.g++, col.setHex(PALETTE.sand));
                else if (type === 'jungle') mGrass.setColorAt(idx.g++, col.setHex(PALETTE.jungleGrass));
                else idx.g++;
            }

            if (cell.prop) {
                let inVillage = villageCenters.some(v => Math.hypot(cell.x - v.x, cell.z - v.z) < 18);
                if (!inVillage) {
                    if (cell.prop === 'tree') {
                        placeProp(cell.x, cell.z, h, mTreeT, mTreeL, idx.t++, false);
                    } else if (cell.prop === 'pine') {
                        placeProp(cell.x, cell.z, h, mPineT, mPineL, idx.p++, true);
                    } else if (cell.prop === 'dead') {
                        dum.position.set(cell.x, 1.25 + h, cell.z); dum.rotation.set(Math.random() * 0.2, Math.random() * 3, Math.random() * 0.2);
                        dum.updateMatrix(); mDead.setMatrixAt(idx.d++, dum.matrix); addCollider(cell.x, cell.z, 0.4);
                    } else if (cell.prop === 'rock') {
                        dum.position.set(cell.x, 0.5 + h, cell.z); dum.rotation.set(Math.random(), Math.random(), Math.random());
                        dum.scale.setScalar(0.6 + Math.random()); dum.updateMatrix(); mRock.setMatrixAt(idx.r, dum.matrix);
                        if (type === 'snow') mRock.setColorAt(idx.r - 1, col.setHex(0xeeeeee)); else mRock.setColorAt(idx.r - 1, col.setHex(PALETTE.rock));
                        addCollider(cell.x, cell.z, 0.8);
                    } else if (cell.prop === 'flower') {
                        dum.position.set(cell.x + (Math.random() - .5), 0.25 + h, cell.z + (Math.random() - .5));
                        dum.rotation.set(0, Math.random(), 0); dum.scale.set(1, 1, 1);
                        dum.updateMatrix(); mFlower.setMatrixAt(idx.f, dum.matrix);
                        mFlower.setColorAt(idx.f++, col.setHex(PALETTE.flowers[Math.floor(Math.random() * PALETTE.flowers.length)]));
                    } else if (cell.prop === 'weed') {
                        for (let k = 0; k < 3; k++) {
                            dum.position.set(cell.x + (Math.random() - .5), 0.3 + h, cell.z + (Math.random() - .5));
                            dum.rotation.y = Math.random() * 3; dum.scale.y = 0.5 + Math.random();
                            dum.updateMatrix(); mWeed.setMatrixAt(idx.wd, dum.matrix);
                            if (type === 'swamp') mWeed.setColorAt(idx.wd++, col.setHex(0x2e3b20)); else idx.wd++;
                        }
                    }
                }
            }
        }
    });

    worldGroup.add(mGrass, mDirt, mWater, mSnow, mIce, mSwampG, mSwampW);
    worldGroup.add(mTreeT, mTreeL, mPineT, mPineL, mDead, mRock, mFlower, mWeed);
}

function spawnRandomEnemies(n) {
    for (let i = 0; i < n; i++) {
        const x = (Math.random() - 0.5) * 150, z = (Math.random() - 0.5) * 150;
        if (Math.hypot(x, z) > 40) { // No generar enemigos cerca del centro
            createOgre(x, z); // Ahora solo genera ogros aleatoriamente
        }
    }
}

function spawnStaticSwampPlants() { swampCaves.forEach(c => createPlant(c.x + 5, c.z)); }

function loadBiome(bx, by) {
    worldGroup.clear();
    goblinKingdoms = [];
    banditCamps.forEach(c => c.group.children.forEach(child => { if (child.isPointLight) c.group.remove(child) }));
    banditCamps = [];
    solidColliders = [];
    enemies = [];
    guards = [];
    citizens = [];
    particles = [];
    swampCaves = [];
    villageCenters = [];
    activePortals = [];
    let portalLocations = [];

    let key = bx + "," + by;
    let data = BIOME_DATA[key];
    if (!data) data = { name: "Tierras Salvajes", type: 'plains', color: 0x8bc34a, sky: 0x87ceeb };

    currentBiomeCoords = { x: bx, y: by };
    scene.background = new THREE.Color(data.sky);
    scene.fog.color.setHex(data.sky);

    const title = document.getElementById('biome-label');
    title.innerText = data.name;
    title.style.opacity = 1;
    setTimeout(() => title.style.opacity = 0, 3000);

    const limit = SCENARIO_SIZE / 2 - 5;
    if (bx === 0 && by === 0) {
        portalLocations.push({ x: 0, z: -limit, target: { x: 0, y: -1 }, name: "Norte" });
        portalLocations.push({ x: 0, z: limit, target: { x: 0, y: 1 }, name: "Sur" });
        portalLocations.push({ x: limit, z: 0, target: { x: 1, y: 0 }, name: "Este" });
        portalLocations.push({ x: -limit, z: 0, target: { x: -1, y: 0 }, name: "Oeste" });
    } else {
        if (by === -1) portalLocations.push({ x: 0, z: limit, target: { x: 0, y: 0 }, name: "Regreso" });
        if (by === 1) portalLocations.push({ x: 0, z: -limit, target: { x: 0, y: 0 }, name: "Regreso" });
        if (bx === 1) portalLocations.push({ x: -limit, z: 0, target: { x: 0, y: 0 }, name: "Regreso" });
        if (bx === -1) portalLocations.push({ x: limit, z: 0, target: { x: 0, y: 0 }, name: "Regreso" });
    }

    generateTerrain(data.type);

    let numVillages = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numVillages; i++) {
        let safe = false;
        let vx, vz;
        let attempts = 0;
        while (!safe && attempts < 100) {
            vx = (Math.random() - 0.5) * (SCENARIO_SIZE * 0.6);
            vz = (Math.random() - 0.5) * (SCENARIO_SIZE * 0.6);
            safe = true;
            if (Math.hypot(vx, vz) < 50) safe = false; // Un poco más lejos del centro
            for (let v of villageCenters) if (Math.hypot(vx - v.x, vz - v.z) < 60) safe = false;
            attempts++;
        }
        if (safe) {
            // Aseguramos que la aldea no se salga por los bordes
            const clampRange = SCENARIO_SIZE / 2 - 25; // 25 es el radio aprox. de una aldea
            spawnVillage(THREE.MathUtils.clamp(vx, -clampRange, clampRange), THREE.MathUtils.clamp(vz, -clampRange, clampRange));
        }
    }

    // --- Generar Reinos Goblin en las ubicaciones de los portales ---
    portalLocations.forEach(portal => {
        // Los portales de regreso siempre están activos y no tienen rey
        if (portal.name === 'Regreso') {
            activePortals.push(portal);
        } else {
            // Movemos el reino hacia adentro para que no se salga del mapa
            const kingdomOffset = 15; // Radio aproximado del reino
            createGoblinKingdom(portal.x * (1 - kingdomOffset / Math.abs(portal.x || 1)), portal.z * (1 - kingdomOffset / Math.abs(portal.z || 1)), portal);
        }
    });

    if (data.type === 'forest') {
        // --- Generar campamentos de bandidos en las esquinas ---
        const cornerOffset = SCENARIO_SIZE / 2 - 20; // A 20 unidades del borde
        createBanditCamp(cornerOffset, cornerOffset); // Sureste
        createBanditCamp(cornerOffset, -cornerOffset); // Noreste
        createBanditCamp(-cornerOffset, cornerOffset); // Suroeste
        createBanditCamp(-cornerOffset, -cornerOffset); // Noroeste
    }

    if (data.type === 'swamp') {
        swampCaves.push({ x: 40, z: 40, cooldown: 0 }, { x: -40, z: -30, cooldown: 0 }, { x: 50, z: -50, cooldown: 0 });
        swampCaves.forEach(c => createCave(c.x, c.z));
        spawnStaticSwampPlants();
    }

    if (data.type !== 'swamp') spawnRandomEnemies(20);

    activePortals.forEach(p => createPortalVisual(p.x, p.z));
}

function checkCaveSpawns(dt) {
    const spawnDist = 25;
    let wChance = enemies.some(e => e.type === 'werewolf') ? 0.001 : 0.02;
    let cChance = enemies.some(e => e.type === 'crocodile') ? 0.001 : 0.02;
    swampCaves.forEach(c => {
        if (c.cooldown > 0) { c.cooldown -= dt; return; }
        if (player.mesh.position.distanceTo(new THREE.Vector3(c.x, 0, c.z)) < spawnDist) {
            if (Math.random() < wChance) createWerewolf(c.x + (Math.random() - .5) * 5, c.z + (Math.random() - .5) * 5);
            if (Math.random() < cChance) createCrocodile(c.x + (Math.random() - .5) * 5, c.z + (Math.random() - .5) * 5);
            c.cooldown = 15;
        }
    });
}