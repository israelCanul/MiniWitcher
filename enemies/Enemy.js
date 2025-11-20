// enemies/Enemy.js

class Enemy {
    constructor(x, z, type) {
        const stats = ENEMY_STATS[type];
        if (!stats) {
            console.error(`No stats found for enemy type: ${type}`);
            return;
        }

        this.hp = stats.hp;
        this.speed = stats.speed;
        this.attackDamage = stats.damage; // Renombrado para evitar colisión con el método damage()
        this.attackSpeed = stats.attackSpeed;
        this.attackRange = stats.attackRange;
        this.aggroRange = stats.aggroRange;
        this.chaseRange = stats.chaseRange;
        this.type = type;

        this.state = 'idle';
        this.attacking = false;
        this.cooldown = 0;
        this.timer = 0;
        this.target = new THREE.Vector3();
        this.home = null;
        this.attackPhase = 'none';

        // Crear el mesh base (se personalizará en las subclases)
        this.mesh = this.createBaseMesh(stats);
        this.parts = this.mesh.userData.parts;
        this.mesh.position.set(x, 0, z);

        worldGroup.add(this.mesh);
        enemies.push(this);
    }

    createBaseMesh(stats) {
        // Esta función es una versión del createCharacterMesh original
        const grp = new THREE.Group();
        grp.add(createCube(0.6, 0.8, 0.3, 0x888888, 0, 1.1, 0)); // Torso genérico
        const head = new THREE.Group(); head.position.set(0, 1.8, 0);
        head.add(createCube(0.4, 0.4, 0.4, 0xcccccc, 0, 0, 0)); // Cabeza genérica
        head.add(createCube(0.1, 0.05, 0.05, 0x000, 0.1, 0, 0.2));
        head.add(createCube(0.1, 0.05, 0.05, 0x000, -0.1, 0, 0.2));
        grp.add(head);
        const armL = new THREE.Group(); armL.position.set(0.45, 1.3, 0); armL.add(createCube(0.2, 0.6, 0.2, 0x888888, 0, -0.2, 0)); grp.add(armL);
        const armR = new THREE.Group(); armR.position.set(-0.45, 1.3, 0); armR.add(createCube(0.2, 0.6, 0.2, 0x888888, 0, -0.2, 0)); grp.add(armR);
        const legL = new THREE.Group(); legL.position.set(0.2, 0.8, 0); legL.add(createCube(0.25, 0.8, 0.25, 0x555555, 0, -0.4, 0)); grp.add(legL);
        const legR = new THREE.Group(); legR.position.set(-0.2, 0.8, 0); legR.add(createCube(0.25, 0.8, 0.25, 0x555555, 0, -0.4, 0)); grp.add(legR);
        grp.userData.parts = { head, armL, armR, legL, legR };
        return grp;
    }

    update(dt, player, time) {
        if (this.hp <= 0) return;

        let move = false;
        const playerDist = player.mesh.position.distanceTo(this.mesh.position);

        // Lógica de IA
        if (this.state === 'idle') {
            if (this.home) {
                this.state = 'patrol';
                this.timer = 0;
            } else if (playerDist < this.aggroRange) {
                this.state = 'chase';
            }
        } else if (this.state === 'patrol') {
            if (playerDist < this.aggroRange) { this.state = 'chase'; }
            else {
                this.timer -= dt;
                if (this.timer <= 0) {
                    const patrolRadius = 15;
                    const angle = Math.random() * Math.PI * 2;
                    this.target.set(this.home.x + Math.cos(angle) * patrolRadius, 0, this.home.z + Math.sin(angle) * patrolRadius);
                    this.timer = 5 + Math.random() * 5;
                }
                if (this.mesh.position.distanceTo(this.target) > 1) {
                    this.mesh.lookAt(this.target); this.mesh.translateZ(this.speed * dt * 0.5); move = true;
                }
            }
        }

        if (this.state === 'chase') {
            move = this.handleChase(dt, playerDist);
        }

        animateChar(this, move, time);
    }

    handleChase(dt, playerDist) {
        let isMoving = false;
        // Lógica de persecución genérica (cuerpo a cuerpo)
        if (this.attacking) return isMoving; // Si ya está en una secuencia de ataque, no hacer nada más

        this.mesh.lookAt(player.mesh.position);

        if (playerDist > this.attackRange) {
            this.mesh.translateZ(this.speed * dt);
            isMoving = true;
        }

        this.cooldown = (this.cooldown || 0) - dt;
        if (playerDist < this.attackRange && this.cooldown <= 0) {
            this.attack();
        }

        if (playerDist >= this.chaseRange) {
            this.state = this.home ? 'patrol' : 'idle';
        }
        return isMoving;
    }

    attack() {
        // Ataque cuerpo a cuerpo genérico
        this.attacking = true;
        this.cooldown = this.attackSpeed;
        setTimeout(() => {
            if (this.hp > 0 && player.mesh.position.distanceTo(this.mesh.position) < this.attackRange) {
                damageEntity(player, this.attackDamage);
            }
            this.attacking = false;
        }, 500);
    }

    damage(amount) {
        this.hp -= amount;
        createFloatText(this.mesh.position, "-" + amount);
        this.mesh.traverse(o => { if (o.material && o.material.emissive) { o.material.emissive.setHex(0xff0000); setTimeout(() => o.material.emissive.setHex(0), 100); } });

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        // Lógica de muerte (loot, portal, etc.)
        if (this.type === 'goblin_king' && this.portalData) {
            console.log(`Portal a ${this.portalData.name} ha sido desbloqueado!`);
            activePortals.push(this.portalData);
            createPortalVisual(this.portalData.x, this.portalData.z);
        }

        const stats = ENEMY_STATS[this.type];
        if (stats && stats.goldDrop) {
            addGold(stats.goldDrop.min + Math.floor(Math.random() * (stats.goldDrop.max - stats.goldDrop.min + 1)));
        }
        if (stats && Math.random() < stats.itemDropChance) {
            addItemToInventory({ name: this.type + " part", quantity: 1 });
        }

        worldGroup.remove(this.mesh);
        let idx = enemies.indexOf(this);
        if (idx > -1) enemies.splice(idx, 1);
        updateQuest();
    }
}
