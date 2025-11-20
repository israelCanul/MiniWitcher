// enemies/GoblinKing.js

class GoblinKing extends Enemy {
    constructor(x, z, portalData) {
        super(x, z, 'goblin_king');
        this.portalData = portalData;
        this.mesh.scale.set(1.6, 1.6, 1.6);

        // Personalizar el mesh
        this.parts.head.children[0].material.color.set(PALETTE.goblinSkin);
        const goldColor = 0xffd700;
        this.parts.armL.children[0].material.color.set(goldColor);
        this.parts.armR.children[0].material.color.set(goldColor);
        this.mesh.children[0].material.color.set(goldColor);

        // Detalles faciales
        const head = this.parts.head;
        head.children = head.children.filter(c => c.geometry.parameters.width !== 0.1);
        head.add(createCube(0.1, 0.1, 0.05, PALETTE.flowers[0], 0.1, 0.05, 0.2));
        head.add(createCube(0.1, 0.1, 0.05, PALETTE.flowers[0], -0.1, 0.05, 0.2));
        head.add(createCube(0.1, 0.3, 0.1, PALETTE.goblinSkin, 0.25, 0.1, 0));
        head.add(createCube(0.1, 0.3, 0.1, PALETTE.goblinSkin, -0.25, 0.1, 0));
        head.add(createCube(0.1, 0.1, 0.1, PALETTE.goblinSkin, 0, -0.1, 0.2));

        // Corona y Espada
        const crown = new THREE.Group();
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            crown.add(createCube(0.1, 0.2, 0.1, PALETTE.flowers[0], Math.cos(angle) * 0.2, 0.25, Math.sin(angle) * 0.2));
        }
        this.parts.head.add(crown);

        const greatsword = new THREE.Group();
        greatsword.add(createCube(0.15, 2.0, 0.1, 0x424242, 0, -1.2, 0.15));
        greatsword.add(createCube(0.3, 0.3, 0.15, goldColor, 0, -0.3, 0.15));
        this.parts.armR.add(greatsword);
    }

    attack() {
        this.attacking = true;
        this.cooldown = this.attackSpeed;
        this.attackPhase = 'charging';

        const circleFX = createCircleAttackFX(this.mesh.position, this.attackRange);

        setTimeout(() => {
            worldGroup.remove(circleFX);
            this.attackPhase = 'spinning';
            this.spinStartTime = undefined; // Reiniciar para la animación
            this.startSpinRotation = this.mesh.rotation.y; // Guardar rotación inicial

            if (this.hp > 0 && player.mesh.position.distanceTo(this.mesh.position) < this.attackRange) {
                damageEntity(player, this.attackDamage, true);
            }

            setTimeout(() => {
                this.attacking = false;
                this.attackPhase = 'none';
            }, ENEMY_STATS.goblin_king.spinTime * 1000);
        }, ENEMY_STATS.goblin_king.chargeTime * 1000);
    }
}
