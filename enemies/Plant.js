// enemies/Plant.js

class Plant extends Enemy {
    constructor(x, z) {
        super(x, z, 'plant');
        worldGroup.remove(this.mesh); // Eliminamos el mesh genérico

        // Creamos el mesh personalizado de la planta
        this.mesh = new THREE.Group();
        this.mesh.add(createCube(0.2, 1.5, 0.2, PALETTE.plantStem, 0, 0.75, 0));
        const head = new THREE.Group(); head.position.set(0, 1.5, 0);
        const mouth = createCube(0.8, 0.6, 0.8, PALETTE.plantHead, 0, 0, 0);
        mouth.add(createCube(0.1, 0.2, 0.1, 0xffffff, 0.2, -0.2, 0.35));
        mouth.add(createCube(0.1, 0.2, 0.1, 0xffffff, -0.2, -0.2, 0.35));
        this.mesh.add(createCube(0.8, 0.1, 0.2, PALETTE.leaves, 0, 1, 0.2));
        this.mesh.add(createCube(0.2, 0.1, 0.8, PALETTE.leaves, 0.2, 0.7, 0));
        head.add(mouth);
        this.mesh.add(head);

        this.parts = { head };
        this.mesh.position.set(x, 0, z);
        worldGroup.add(this.mesh);
    }

    update(dt, player, time) {
        // Lógica de IA y animación de la planta
        const playerDist = player.mesh.position.distanceTo(this.mesh.position);
        if (playerDist < this.aggroRange) {
            this.attacking = true;
        } else {
            this.attacking = false;
        }

        this.parts.head.position.y = 1.5 + Math.sin(time * 2) * 0.1;
        if (this.attacking) {
            this.parts.head.rotation.x = Math.sin(time * 20) * 0.5;
        } else {
            this.parts.head.rotation.x = 0;
        }
    }
}
