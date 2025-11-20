// enemies/Ogre.js

class Ogre extends Enemy {
    constructor(x, z) {
        super(x, z, 'ogre');
        this.mesh.scale.set(1.5, 1.5, 1.5);

        // Personalizar el mesh
        this.parts.head.children[0].material.color.set(PALETTE.ogreSkin);
        this.mesh.children[0].material.color.set(PALETTE.ogreClothes);
        this.parts.armL.children[0].material.color.set(PALETTE.ogreSkin);
        this.parts.armR.children[0].material.color.set(PALETTE.ogreSkin);
        this.parts.legL.children[0].material.color.set(PALETTE.ogreClothes);
        this.parts.legR.children[0].material.color.set(PALETTE.ogreClothes);

        // Detalles: Cara y Taparrabos
        this.parts.head.add(createCube(0.1, 0.1, 0.1, 0xffffff, -0.1, -0.2, 0.2)); // Colmillo
        this.mesh.add(createCube(0.7, 0.4, 0.4, PALETTE.banditLeather, 0, 0.5, 0)); // Taparrabos

        // Garrote con pinchos
        const club = new THREE.Group();
        club.add(createCube(0.15, 1.0, 0.15, PALETTE.wood, 0, -0.8, 0.2)); // Mango
        club.add(createCube(0.25, 0.4, 0.25, PALETTE.rock, 0, -1.3, 0.2)); // Cabeza
        this.parts.armR.add(club);
    }
}
