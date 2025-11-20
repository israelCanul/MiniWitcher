// enemies/Werewolf.js

class Werewolf extends Enemy {
    constructor(x, z) {
        super(x, z, 'werewolf');

        // Personalizar el mesh
        this.parts.head.children[0].material.color.set(PALETTE.werewolfSkin);
        this.mesh.children[0].material.color.set(PALETTE.werewolfSkin); // Torso de piel
        this.parts.armL.children[0].material.color.set(PALETTE.werewolfSkin);
        this.parts.armR.children[0].material.color.set(PALETTE.werewolfSkin);
        this.parts.legL.children[0].material.color.set(PALETTE.civPants[0]); // Pantalones rotos
        this.parts.legR.children[0].material.color.set(PALETTE.civPants[0]);

        // Detalles: Hocico, orejas y garras
        this.parts.head.add(createCube(0.2, 0.2, 0.3, PALETTE.werewolfFur, 0, -0.1, 0.25));
        this.parts.head.add(createCube(0.1, 0.2, 0.1, PALETTE.werewolfFur, 0.2, 0.25, 0));
        this.parts.head.add(createCube(0.1, 0.2, 0.1, PALETTE.werewolfFur, -0.2, 0.25, 0));
        this.parts.armL.add(createCube(0.25, 0.1, 0.25, PALETTE.werewolfFur, 0, 0.1, 0));
        this.parts.armR.add(createCube(0.25, 0.1, 0.25, PALETTE.werewolfFur, 0, 0.1, 0));
        this.parts.armL.add(createCube(0.05, 0.15, 0.05, 0xffffff, 0.08, -0.5, 0.08));
        this.parts.armR.add(createCube(0.05, 0.15, 0.05, 0xffffff, -0.08, -0.5, 0.08));
    }
}
