// enemies/Crocodile.js

class Crocodile extends Enemy {
    constructor(x, z) {
        // Llamamos al constructor de Enemy, pero no usaremos su mesh base
        super(x, z, 'crocodile');
        worldGroup.remove(this.mesh); // Eliminamos el mesh genérico

        // Creamos el mesh personalizado del cocodrilo
        this.mesh = new THREE.Group();
        const body = createCube(0.8, 0.4, 2.0, PALETTE.crocSkin, 0, 0.3, 0);
        this.mesh.add(body);
        body.add(createCube(0.1, 0.1, 0.1, 0xffffff, 0.2, -0.1, 0.9));
        body.add(createCube(0.1, 0.1, 0.1, 0xffffff, -0.2, -0.1, 0.9));
        body.add(createCube(0.2, 0.1, 0.2, PALETTE.crocDetail, 0, 0.25, 0.5));
        body.add(createCube(0.2, 0.1, 0.2, PALETTE.crocDetail, 0, 0.25, 0));
        body.add(createCube(0.2, 0.1, 0.2, PALETTE.crocDetail, 0, 0.25, -0.5));

        const tail = new THREE.Group(); tail.position.set(0, 0.3, -1); this.mesh.add(tail);
        tail.add(createCube(0.4, 0.3, 1.5, PALETTE.crocSkin, 0, 0, -0.75));
        const l1 = createCube(0.2, 0.3, 0.2, PALETTE.crocSkin, 0.5, 0.15, 0.8); this.mesh.add(l1);
        const l2 = createCube(0.2, 0.3, 0.2, PALETTE.crocSkin, -0.5, 0.15, 0.8); this.mesh.add(l2);
        const l3 = createCube(0.2, 0.3, 0.2, PALETTE.crocSkin, 0.5, 0.15, -0.8); this.mesh.add(l3);
        const l4 = createCube(0.2, 0.3, 0.2, PALETTE.crocSkin, -0.5, 0.15, -0.8); this.mesh.add(l4);

        this.parts = { body, tail, l1, l2, l3, l4 };
        this.mesh.position.set(x, 0, z);
        worldGroup.add(this.mesh);
    }

    update(dt, player, time) {
        // Lógica de IA y movimiento del cocodrilo
        let moving = false;
        const playerDist = player.mesh.position.distanceTo(this.mesh.position);
        if (playerDist < this.aggroRange) {
            this.mesh.lookAt(player.mesh.position);
            if (playerDist > this.attackRange) {
                this.mesh.translateZ(this.speed * dt);
                moving = true;
            }
        }

        // Animación específica del cocodrilo
        if (moving) {
            this.parts.l1.rotation.x = Math.sin(time * 10) * 0.5;
            this.parts.l2.rotation.x = Math.sin(time * 10 + Math.PI) * 0.5;
            this.parts.l3.rotation.x = Math.sin(time * 10 + Math.PI) * 0.5;
            this.parts.l4.rotation.x = Math.sin(time * 10) * 0.5;
            this.parts.tail.rotation.y = Math.sin(time * 10) * 0.3;
        }
    }
}
