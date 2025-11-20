// enemies/Goblin.js

class Goblin extends Enemy {
    constructor(x, z) {
        super(x, z, 'goblin');
        this.mesh.scale.set(0.8, 0.8, 0.8);

        // Personalizar el mesh
        this.parts.head.children[0].material.color.set(PALETTE.goblinSkin);
        this.mesh.children[0].material.color.set(0xffffff); // Camisa blanca
        this.parts.armL.children[0].material.color.set(0xffffff);
        this.parts.armR.children[0].material.color.set(0xffffff);
        this.parts.legL.children[0].material.color.set(0x212121); // Pantalones negros
        this.parts.legR.children[0].material.color.set(0x212121);

        // Detalles faciales
        const head = this.parts.head;
        head.children = head.children.filter(c => c.geometry.parameters.width !== 0.1); // Quitar ojos genéricos
        head.add(createCube(0.1, 0.1, 0.05, PALETTE.flowers[0], 0.1, 0.05, 0.2));
        head.add(createCube(0.1, 0.1, 0.05, PALETTE.flowers[0], -0.1, 0.05, 0.2));
        head.add(createCube(0.1, 0.3, 0.1, PALETTE.goblinSkin, 0.25, 0.1, 0));
        head.add(createCube(0.1, 0.3, 0.1, PALETTE.goblinSkin, -0.25, 0.1, 0));
        head.add(createCube(0.1, 0.1, 0.1, PALETTE.goblinSkin, 0, -0.1, 0.2));

        // Equipamiento
        this.parts.legL.add(createCube(0.3, 0.2, 0.3, PALETTE.banditLeather, 0, -0.9, 0));
        this.parts.legR.add(createCube(0.3, 0.2, 0.3, PALETTE.banditLeather, 0, -0.9, 0));
        this.mesh.add(createCube(0.65, 0.15, 0.35, PALETTE.banditLeather, 0, 0.7, 0));
        this.mesh.add(createCube(0.7, 0.4, 0.4, 0xffffff, 0, 0.5, 0));
        this.parts.armL.add(createCube(0.3, 0.3, 0.3, PALETTE.soldierArmor, 0, 0.2, 0));

        // Arco
        const bow = new THREE.Group();
        bow.add(createCube(0.05, 0.8, 0.1, PALETTE.wood, 0, 0, 0));
        bow.children[0].scale.y = 1.5;
        this.parts.armL.add(bow);
    }

    handleChase(dt, playerDist) {
        // Lógica de ataque a distancia
        if (this.attacking) return;

        this.mesh.lookAt(player.mesh.position);
        const idealDist = this.attackRange;

        if (playerDist > idealDist) { this.mesh.translateZ(this.speed * dt); }
        else if (playerDist < idealDist - 3) { this.mesh.translateZ(-this.speed * dt * 0.5); }

        this.cooldown = (this.cooldown || 0) - dt;
        if (this.cooldown <= 0) {
            this.attack();
        }

        if (playerDist >= this.chaseRange) {
            this.state = this.home ? 'patrol' : 'idle';
        }
    }

    attack() {
        this.attacking = true;
        this.cooldown = this.attackSpeed;

        const targetPosition = player.mesh.position.clone().setY(1);
        showTrajectory(this.mesh.position.clone().setY(1.5), targetPosition, 40);

        setTimeout(() => {
            if (this.hp > 0) {
                createProjectile(this.mesh.position.clone().setY(1.5), targetPosition, 40, this.attackDamage, ENEMY_STATS.goblin.projectileLife);
            }
            this.attacking = false;
        }, 1500);
    }
}
