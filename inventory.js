// --- 5. INVENTORY SYSTEM ---

let inventory = {
    items: [ // Example items
        { name: "Health Potion", quantity: 3 },
        { name: "Monster Bone", quantity: 12 },
        { name: "Herb", quantity: 5 }
    ],
    gold: 150
};

function addItemToInventory(item) {
    let existingItem = inventory.items.find(i => i.name === item.name);
    if (existingItem) {
        existingItem.quantity += item.quantity;
    } else {
        inventory.items.push(item);
    }
    updateInventoryUI();
}

function addGold(amount) {
    inventory.gold += amount;
    updateInventoryUI();
}

function updateInventoryUI() {
    const inventoryUI = document.getElementById('inventory-ui');
    if (!inventoryUI) return;

    // Clear previous inventory render
    inventoryUI.innerHTML = `<strong>Gold: ${inventory.gold}</strong><hr style="border-color: #8d6e63;">`;

    const slotsContainer = document.createElement('div');
    slotsContainer.className = 'inventory-slots-container';

    // Create a slot for each item in the inventory
    for (const item of inventory.items) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.title = `${item.name} x${item.quantity}`; // Show item name on hover

        // Use an abbreviation for the item name
        slot.innerText = item.name.substring(0, 3);

        if (item.quantity > 1) {
            const countLabel = document.createElement('span');
            countLabel.className = 'item-count';
            countLabel.innerText = item.quantity;
            slot.appendChild(countLabel);
        }

        slotsContainer.appendChild(slot);
    }

    inventoryUI.appendChild(slotsContainer);
}

function updateDetailedInventoryUI() {
    const inventoryGrid = document.getElementById('inventory-grid');
    if (!inventoryGrid) return;

    inventoryGrid.innerHTML = ''; // Clear previous content

    // Define icons for items
    const ITEM_ICONS = {
        "goblin part": "icon-goblin-face",
        "bandit part": "icon-goblin-face", // Placeholder, you can create more icons
        "ogre part": "icon-goblin-face", // Placeholder
        "werewolf part": "icon-goblin-face", // Placeholder
        "Health Potion": "icon-potion",
        "Monster Bone": "icon-bone",
        "Herb": "icon-potion" // Placeholder
    };

    for (const item of inventory.items) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot-large';
        slot.title = `${item.name} x${item.quantity}`;

        const icon = document.createElement('div');
        icon.className = 'item-icon';
        // Assign a specific icon class or a default one
        const iconClass = ITEM_ICONS[item.name] || 'icon-bone'; // Default to bone icon
        icon.classList.add(iconClass);

        const quantityLabel = document.createElement('span');
        quantityLabel.className = 'item-quantity';
        quantityLabel.innerText = item.quantity;

        slot.appendChild(icon);
        slot.appendChild(quantityLabel);
        inventoryGrid.appendChild(slot);
    }
}
