// --- 6. CRAFTING SYSTEM ---

const recipes = [
    {
        name: "Health Potion",
        materials: [
            { name: "goblin part", quantity: 2 },
            { name: "bandit part", quantity: 1 }
        ],
        result: { name: "Health Potion", quantity: 1 }
    },
    {
        name: "Strength Potion",
        materials: [
            { name: "ogre part", quantity: 1 },
            { name: "werewolf part", quantity: 1 }
        ],
        result: { name: "Strength Potion", quantity: 1 }
    }
];

function craftItem(recipeName) {
    const recipe = recipes.find(r => r.name === recipeName);
    if (!recipe) {
        console.log("Recipe not found");
        return;
    }

    // Check if player has enough materials
    let hasMaterials = true;
    recipe.materials.forEach(material => {
        const itemInInventory = inventory.items.find(i => i.name === material.name);
        if (!itemInInventory || itemInInventory.quantity < material.quantity) {
            hasMaterials = false;
        }
    });

    if (hasMaterials) {
        // Remove materials from inventory
        recipe.materials.forEach(material => {
            const itemInInventory = inventory.items.find(i => i.name === material.name);
            itemInInventory.quantity -= material.quantity;
        });

        // Add crafted item to inventory
        addItemToInventory(recipe.result);
        console.log(`Crafted ${recipe.result.name}`);
    } else {
        console.log("Not enough materials");
    }
}
