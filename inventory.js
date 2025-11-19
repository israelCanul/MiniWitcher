// --- 5. INVENTORY SYSTEM ---

let inventory = {
    items: [],
    gold: 0
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

    inventoryUI.style.display = 'block';
    inventoryUI.innerHTML = `<strong>Gold: ${inventory.gold}</strong><hr>`;

    if (inventory.items.length > 0) {
        let itemsHTML = '<ul>';
        inventory.items.forEach(item => {
            itemsHTML += `<li>${item.name} x${item.quantity}</li>`;
        });
        itemsHTML += '</ul>';
        inventoryUI.innerHTML += itemsHTML;
    } else {
        inventoryUI.innerHTML += '<p>No items</p>';
    }
}
