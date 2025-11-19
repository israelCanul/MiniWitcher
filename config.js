// 1. VARIABLES GLOBALES Y CONFIGURACIÓN
var SCENARIO_SIZE = 200;
var TILE_SIZE = 2;

var scene, camera, renderer, clock, player;
var enemies = [], guards = [], citizens = [], particles = [], solidColliders = [];
var worldGroup;
var projectiles = [];
var mapCtx, mapCanvas;
var isRunning = false;

var currentBiomeCoords = { x: 0, y: 0 };
var banditCamps = [];
var goblinKingdoms = [];
var swampCaves = [];
var villageCenters = [];
var activePortals = [];

var keys = { w: 0, a: 0, s: 0, d: 0 };
var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var mousePlane;

// Datos de Biomas
var BIOME_DATA = {
    '0,0': { name: "Bosque Central (Hub)", type: 'forest', color: 0x2e7d32, sky: 0x87ceeb },
    '0,-1': { name: "Tundra del Norte", type: 'snow', color: 0xe3f2fd, sky: 0xb0bec5 },
    '0,1': { name: "Pantano del Sur", type: 'swamp', color: 0x33691e, sky: 0x455a64 },
    '1,0': { name: "Desierto del Este", type: 'desert', color: 0xffcc80, sky: 0xffe0b2 },
    '-1,0': { name: "Selva del Oeste", type: 'jungle', color: 0x1b5e20, sky: 0x004d40 }
};

var PALETTE = {
    grass: 0x4caf50, dirt: 0x795548, water: 0x29b6f6,
    snow: 0xffffff, ice: 0x81d4fa,
    sand: 0xffcc80, cactus: 0x66bb6a,
    swampGrass: 0x33691e, swampWater: 0x1b5e20, swampDirt: 0x2e3b20,
    jungleGrass: 0x00695c,
    rock: 0x757575, rockSnow: 0xeeeeee,
    wood: 0x5d4037, leaves: 0x2e7d32,
    pineWood: 0x3e2723, pineLeaves: 0x1b5e20,
    deadWood: 0x4e342e, weed: 0x558b2f,
    crop: 0x8d6e63, cropPlant: 0x66bb6a,
    skin: 0xffcc80, armor: 0x37474f, hair: 0xeeeeee,
    banditSkin: 0xd7ccc8, banditLeather: 0x4e342e, banditPants: 0x212121,
    goblinSkin: 0x66bb6a, goblinClothes: 0x5d4037,
    ogreSkin: 0xbcaaa4, ogreClothes: 0x4e342e,
    soldierArmor: 0x90a4ae, soldierDetail: 0x1565c0,
    werewolfFur: 0x3e2723, werewolfSkin: 0x4e342e,
    crocSkin: 0x2e7d32, crocDetail: 0x81c784,
    plantStem: 0x33691e, plantHead: 0xb71c1c,
    flowers: [0xffeb3b, 0xf44336, 0x2196f3, 0xff9800],
    civShirts: [0x795548, 0x5d4037, 0x8d6e63, 0xffcc80, 0xffab91, 0xa1887f],
    civPants: [0x3e2723, 0x4e342e, 0x263238, 0x212121]
};