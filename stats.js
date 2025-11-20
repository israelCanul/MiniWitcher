const ENEMY_STATS = {
    bandit: {
        hp: 30,
        speed: 2.5,
        damage: 8,
        attackSpeed: 1.8, // segundos
        attackRange: 2.0,
        aggroRange: 18,
        chaseRange: 25,
        goldDrop: { min: 3, max: 8 },
        itemDropChance: 0.6, // 60%
        xpValue: 10
    },
    goblin: {
        hp: 20,
        speed: 3,
        damage: 0.1, // Daño de flecha
        attackSpeed: 3.0, // segundos
        projectileLife: 3, // segundos de vida de la flecha, controla el alcance
        attackRange: 18, // Distancia ideal de disparo
        aggroRange: 22,
        chaseRange: 30,
        goldDrop: { min: 1, max: 5 },
        itemDropChance: 0.7, // 70%
        xpValue: 8
    },
    goblin_king: {
        hp: 120,
        speed: 2.8,
        damage: 1, // Daño de espada
        attackSpeed: 2.0, // segundos
        attackRange: 4.0, // Aumentado para el ataque de cono
        chargeTime: 1, // segundos de carga del ataque
        spinTime: 0.3, // segundos que dura el giro
        aggroRange: 25,
        chaseRange: 40,
        goldDrop: { min: 50, max: 100 },
        itemDropChance: 1.0, // 100%
        xpValue: 100
    },
    ogre: {
        hp: 100,
        speed: 1.5,
        damage: 20,
        attackSpeed: 3.5, // segundos
        attackRange: 2.2,
        aggroRange: 15,
        chaseRange: 22,
        goldDrop: { min: 10, max: 25 },
        itemDropChance: 0.4, // 40%
        xpValue: 30
    },
    werewolf: {
        hp: 80,
        speed: 5,
        damage: 15,
        attackSpeed: 1.2, // segundos
        attackRange: 1.8,
        aggroRange: 20,
        chaseRange: 35,
        goldDrop: { min: 15, max: 30 },
        itemDropChance: 0.5, // 50%
        xpValue: 40
    },
    crocodile: {
        hp: 120,
        speed: 1.5,
        damage: 18,
        attackSpeed: 2.8, // segundos
        attackRange: 3.0,
        aggroRange: 12,
        chaseRange: 20,
        goldDrop: { min: 5, max: 15 },
        itemDropChance: 0.3, // 30%
        xpValue: 25
    },
    plant: {
        hp: 150,
        speed: 0,
        damage: 10,
        attackSpeed: 2.0, // segundos
        attackRange: 4.0,
        aggroRange: 10,
        chaseRange: 10, // No se mueve
        goldDrop: { min: 1, max: 3 },
        itemDropChance: 0.1, // 10%
        xpValue: 15
    },
    guard: {
        hp: 50,
        speed: 3.5,
        damage: 10, // No ataca al jugador, pero se define por si acaso
        attackSpeed: 2.2, // segundos
        attackRange: 2.0,
        aggroRange: 10,
        chaseRange: 15,
        goldDrop: { min: 0, max: 0 },
        itemDropChance: 0,
        xpValue: 0
    }
};