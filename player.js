// player.js

class Player {
    constructor() {
        const stats = PLAYER_STATS;
        this.hp = stats.maxHp;
        this.maxHp = stats.maxHp;
        this.stam = stats.maxStam;
        this.maxStam = stats.maxStam;
        this.speed = stats.speed;
        this.attacking = false;

        this.mesh = this.createMesh();
        this.parts = this.mesh.userData.parts;

        scene.add(this.mesh);
    }

    createMesh() {
        const mesh = createCharacterMesh(PALETTE.armor, PALETTE.skin, PALETTE.banditPants);
        mesh.userData.parts.head.add(createCube(0.45, 0.1, 0.45, PALETTE.hair, 0, 0.25, 0));
        mesh.userData.parts.armR.add(createCube(0.08, 1.4, 0.05, 0xffffff, 0, -1.0, 0.15));
        return mesh;
    }

    update(dt, keys, lookAtPoint) {
        if (this.hp <= 0) return;

        // --- Lógica de Movimiento ---
        let dx = 0, dz = 0;
        if (keys.w) dz -= 1; if (keys.s) dz += 1; if (keys.a) dx -= 1; if (keys.d) dx += 1;
        const moving = (dx !== 0 || dz !== 0);

        if (moving) {
            if (dx !== 0 && dz !== 0) { dx *= 0.707; dz *= 0.707; }
            const s = this.speed * dt;
            if (!this.checkCollision(dx * s, 0)) this.mesh.position.x += dx * s;
            if (!this.checkCollision(0, dz * s)) this.mesh.position.z += dz * s;
        }

        // --- Lógica de Rotación ---
        if (lookAtPoint) {
            this.mesh.lookAt(lookAtPoint.x, this.mesh.position.y, lookAtPoint.z);
        }

        // --- Regeneración de Stamina ---
        if (this.stam < this.maxStam) {
            this.stam += PLAYER_STATS.stamRegen * dt;
            updateUI();
        }

        // --- Animación ---
        this.animate(moving, clock.getElapsedTime());
    }

    attack(type) {
        if (this.hp <= 0 || this.attacking) return;

        const swordCost = PLAYER_STATS.attacks.sword.stamCost;
        const igniCost = PLAYER_STATS.attacks.igni.stamCost;

        if (type === 'sword' && this.stam >= swordCost) {
            this.stam -= swordCost;
            this.attacking = true;
            updateUI();

            const arm = this.parts.armR;
            let p = 0;
            const iv = setInterval(() => {
                p += 0.2;
                arm.rotation.x = -Math.PI / 2 * Math.sin(p * Math.PI);
                if (p >= 1) {
                    clearInterval(iv);
                    arm.rotation.x = 0;
                    this.attacking = false;
                }
            }, 16);

            createFX(this.mesh.position, 0xffffff, 'slash');
            this.checkHit(PLAYER_STATS.attacks.sword.range, PLAYER_STATS.attacks.sword.angle, PLAYER_STATS.attacks.sword.damage);

        } else if (type === 'igni' && this.stam >= igniCost) {
            this.stam -= igniCost;
            this.attacking = true;
            updateUI();

            this.parts.armL.rotation.x = -3;
            setTimeout(() => {
                this.parts.armL.rotation.x = 0;
                this.attacking = false;
            }, 500);

            createFX(this.mesh.position, 0xff6d00, 'exp');
            this.checkHit(PLAYER_STATS.attacks.igni.range, PLAYER_STATS.attacks.igni.angle, PLAYER_STATS.attacks.igni.damage);
        }
    }

    checkHit(r, a, dmg) {
        const pDir = new THREE.Vector3();
        this.mesh.getWorldDirection(pDir);
        enemies.forEach(e => {
            const dir = new THREE.Vector3().subVectors(e.mesh.position, this.mesh.position);
            if (dir.length() < r && pDir.angleTo(dir) < a) {
                e.damage(dmg); // Llama directamente al método del enemigo
            }
        });
    }

    checkCollision(dx, dz) {
        const np = this.mesh.position.clone().add(new THREE.Vector3(dx, 0, dz));
        const box = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(np.x, 1, np.z), new THREE.Vector3(0.5, 5, 0.5));
        for (let c of solidColliders) {
            if (box.intersectsBox(c)) return true;
        }
        return false;
    }

    damage(amount) {
        this.hp -= amount;
        createFloatText(this.mesh.position, "-" + amount);
        this.mesh.traverse(o => {
            if (o.isMesh && o.material.emissive) {
                o.material.emissive.setHex(0xff0000);
                setTimeout(() => o.material.emissive.setHex(0), 100);
            }
        });
        updateUI();
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        handleDeath();
    }

    animate(move, t) {
        if (!this.parts) return;

        if (move) {
            this.parts.legL.rotation.x = Math.sin(t * 15) * 0.8;
            this.parts.legR.rotation.x = Math.sin(t * 15 + Math.PI) * 0.8;
            this.parts.armL.rotation.x = Math.sin(t * 15 + Math.PI) * 0.8;
            // No animar el brazo derecho si está atacando
            if (!this.attacking) {
                this.parts.armR.rotation.x = Math.sin(t * 15) * 0.8;
            }
        } else {
            this.parts.legL.rotation.x = 0; this.parts.legR.rotation.x = 0;
            this.parts.armL.rotation.x = 0;
            // No resetear el brazo derecho si está en medio de un ataque
            if (!this.attacking) {
                this.parts.armR.rotation.x = 0;
            }
        }
    }
}