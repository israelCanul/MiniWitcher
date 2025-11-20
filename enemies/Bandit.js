// enemies/Bandit.js

class Bandit extends Enemy {
    constructor(x, z) {
        super(x, z, 'bandit');

        // Personalizar el mesh
        this.parts.head.children[0].material.color.set(PALETTE.banditSkin);
        this.mesh.children[0].material.color.set(PALETTE.banditLeather); // Torso
        this.parts.armL.children[0].material.color.set(PALETTE.banditLeather);
        this.parts.armR.children[0].material.color.set(PALETTE.banditLeather);
        this.parts.legL.children[0].material.color.set(PALETTE.banditPants);
        this.parts.legR.children[0].material.color.set(PALETTE.banditPants);

        // Detalles: Bandana y Daga
        this.parts.head.add(createCube(0.45, 0.15, 0.45, 0xb71c1c, 0, 0.1, 0));
        const dagger = new THREE.Group();
        dagger.add(createCube(0.1, 0.2, 0.1, PALETTE.wood, 0, -0.4, 0.15));
        dagger.add(createCube(0.05, 0.4, 0.05, PALETTE.rock, 0, -0.7, 0.15));
        this.parts.armR.add(dagger);
    }
}
