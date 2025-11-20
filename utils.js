// --- 2. FUNCIONES DE UTILIDAD ---
window.handleKey = function (e, val) {
    if (e.key === 'w' || e.code === 'ArrowUp') keys.w = val;
    if (e.key === 's' || e.code === 'ArrowDown') keys.s = val;
    if (e.key === 'a' || e.code === 'ArrowLeft') keys.a = val;
    if (e.key === 'd' || e.code === 'ArrowRight') keys.d = val;
};

window.onResize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

function addCollider(x, z, size) {
    if (Math.abs(x) < 2 && Math.abs(z) < 2) return;
    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 2, z), new THREE.Vector3(size * 0.8, 10, size * 0.8));
    solidColliders.push(box);
}

function createCube(w, h, d, c, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: c }));
    m.position.set(x, y, z); m.castShadow = true; return m;
}

function getVillageColors(type) {
    const styles = [
        { wall: 0x8d6e63, roof: 0xd84315 }, { wall: 0x90a4ae, roof: 0x37474f },
        { wall: 0xffcc80, roof: 0xe65100 }, { wall: 0x558b2f, roof: 0x33691e }, { wall: 0xeeeeee, roof: 0x212121 }
    ];
    return styles[type % styles.length];
}

function createFloatText(pos, txt) {
    const textElement = document.createElement('div');
    textElement.className = 'damage-text';
    textElement.innerText = txt;

    const uiLayer = document.getElementById('ui-layer');
    uiLayer.appendChild(textElement);

    const screenPos = pos.clone().project(camera);
    textElement.style.left = `${(screenPos.x * 0.5 + 0.5) * window.innerWidth}px`;
    textElement.style.top = `${(-screenPos.y * 0.5 + 0.5) * window.innerHeight}px`;

    setTimeout(() => {
        textElement.remove();
    }, 1000); // El texto desaparece después de 1 segundo (la duración de la animación)
}

function updateUI() {
    if (player) {
        document.getElementById('hp-bar').style.width = player.hp + '%';
        document.getElementById('stam-bar').style.width = player.stam + '%';
    }
}

function handleDeath() {
    document.getElementById('death-screen').style.display = 'flex';
    isRunning = false;
}