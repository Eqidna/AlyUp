 import { AudioManager } from './audio.js';
import { 
    createStars, 
    createLines, 
    createStarsAndGasClouds, 
    createCometTrail, 
    createBubbles, 
    createWireframeCubes, 
    createFireworks, 
    createDroneShow 
} from './particlesFx.js';


// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');



// Load assets (including background)
const playerImg1 = new Image(); playerImg1.src = 'assets/ball1.png';
const playerImg2 = new Image(); playerImg2.src = 'assets/ball2.png';
const playerImg3 = new Image(); playerImg3.src = 'assets/ball3.png';
const playerImg4 = new Image(); playerImg4.src = 'assets/ball4.png';
const playerImg5 = new Image(); playerImg5.src = 'assets/ball5.png';
const ballImages = [playerImg1, playerImg2, playerImg3, playerImg4, playerImg5];
let selectedBallIndex = 0;

const platformImg = new Image(); platformImg.src = 'assets/woodPlatform1.png';
const jumpImg = new Image(); jumpImg.src = 'assets/jumpSprite3.png';
const leftGloveImg = new Image(); leftGloveImg.src = 'assets/leftGlove.png';
const rightGloveImg = new Image(); rightGloveImg.src = 'assets/rightGlove.png';
const backgroundImg = new Image(); backgroundImg.src = 'assets/background.jpg';
const background2Img = new Image(); background2Img.src = 'assets/background2.png'; // New background image
const background3Img = new Image(); background3Img.src = 'assets/background3.png'; // New background image
const menuIconImg = new Image(); menuIconImg.src = 'assets/menuIcon.png';
const leftArrowImg = new Image(); leftArrowImg.src = 'assets/leftArrow.png';
const upArrowImg = new Image(); upArrowImg.src = 'assets/upArrow.png';
const rightArrowImg = new Image(); rightArrowImg.src = 'assets/rightArrow.png';
const alyupImg = new Image(); alyupImg.src = 'assets/Alyup.png';
// Initialize AudioManager
const audioManager = new AudioManager();
audioManager.setMusicVolume(parseFloat(localStorage.getItem('musicVolume') || '0.35'));
audioManager.setSfxVolume(parseFloat(localStorage.getItem('sfxVolume') || '1.0'));

// Background2 glow animation
let background2PulseTime = 0; // Track pulse animation for background2Img
let background3PulseTime = 0; // For background3Img animations
let boostUsed = false; // Track if boost has been used
// Game state (example: 'menu' or 'game')
let gameState = 'menu'; // Adjust based on your game's state management
let showControlsOnPC = localStorage.getItem('showControlsOnPC') === 'true' || true;
let elapsedTime = 0; // Current level's elapsed time in seconds
let bestTimes = JSON.parse(localStorage.getItem('bestTimes')) || {};
console.log('Initialized bestTimes:', bestTimes); 
// Object to store best times per level


// Reference to game container
const gameContainer = document.getElementById('game-container');



// Function to update visibility of menu-only elements
function updateMenuElementsVisibility() {
    console.log(`Updating visibility, gameState: ${gameState}`);
    if (gameState === 'menu') {
        gameContainer.classList.add('menu-active');
        console.log('Menu active: Showing canvas-drawn controls');
    } else {
        gameContainer.classList.remove('menu-active');
        console.log('Game active: Hiding canvas-drawn controls');
    }
}

// Audio control state for canvas rendering
const audioControls = {
    musicVolume: {
        x: canvas.width - 150,
        y: 20,
        width: 100,
        height: 10,
        value: audioManager.musicVolume,
        dragging: false
    },
    musicMute: {
        x: canvas.width - 150,
        y: 40,
        width: 50,
        height: 20,
        text: audioManager.isMusicMuted ? 'Unmute' : 'Mute'
    },
    sfxVolume: {
        x: canvas.width - 150,
        y: 70,
        width: 100,
        height: 10,
        value: audioManager.sfxVolume,
        dragging: false
    },
    sfxMute: {
        x: canvas.width - 150,
        y: 90,
        width: 50,
        height: 20,
        text: audioManager.isSfxMuted ? 'Unmute' : 'Mute'
    },
    showControls: {
        x: 10,
        y: canvas.height - 30,
        width: 20,
        height: 20,
        checked: showControlsOnPC
    }
};

// Device volume rocker support
if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('previoustrack', () => {
        const newVolume = Math.max(0, audioManager.musicVolume - 0.1);
        audioManager.setMusicVolume(newVolume);
        audioControls.musicVolume.value = newVolume;
        localStorage.setItem('musicVolume', newVolume);
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
        const newVolume = Math.min(1, audioManager.musicVolume + 0.1);
        audioManager.setMusicVolume(newVolume);
        audioControls.musicVolume.value = newVolume;
        localStorage.setItem('musicVolume', newVolume);
    });
}


// Function to switch game state
function setGameState(newState) {
    gameState = newState;
    updateMenuElementsVisibility();
    if (gameState === 'menu') {
        audioManager.playMenuBgm();
    } else {
        audioManager.playLevelBgm(currentLevel || 1);
    }
}

// Three.js setup
const backgroundDiv = document.getElementById('background');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(canvas.width, canvas.height);
renderer.setPixelRatio(window.devicePixelRatio); // Improve rendering on high-DPI devices
backgroundDiv.appendChild(renderer.domElement);

// Ensure Three.js canvas is styled correctly
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';
renderer.domElement.style.display = 'block';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
camera.position.z = 5;



// Add background2.png as a Three.js mesh
// let background2Mesh = null;
//function setupBackground2() {
    // Ensure background2Img is loaded
   // if (!background2Img.complete || background2Img.naturalWidth === 0) {
  //      background2Img.onload = setupBackground2; // Retry when loaded
  //      return;
  //  }

 // Calculate plane size to match canvas (640x1100)
  //  const aspect = canvas.width / canvas.height; // 640 / 1100 ≈ 0.5818
//    const frustumHeight = 2 * Math.tan(THREE.MathUtils.degToRad(75 / 2)) * camera.position.z; // ≈ 7.673
//    const frustumWidth = frustumHeight * aspect; // ≈ 4.466
  //  const geometry = new THREE.PlaneGeometry(frustumWidth, frustumHeight); // Matches 640x1100 in canvas space

    // Create texture from background2.png
  //  const texture = new THREE.Texture(background2Img);
  //  texture.needsUpdate = true;

    // Create material similar to platforms (MeshBasicMaterial with texture)
    //const material = new THREE.MeshBasicMaterial({
   //     map: texture,
  //      transparent: true, // Allow transparency if background2.png has alpha
   //     side: THREE.DoubleSide // Render both sides
  //  });

    // Create mesh and position it
//    background2Mesh = new THREE.Mesh(geometry, material);
//    background2Mesh.position.z = -5; // Behind game elements, in front of particle effects
//    scene.add(background2Mesh);
//}


// Configuration object for UI elements (responsive values)
const uiConfig = {
    circleSize: 0.0643, // 45px / 700px ≈ 0.0643 of canvas width
    spacing: 0.0071, // 5px / 700px ≈ 0.0071 of canvas width
    startXOffset: 0.0214, // 15px / 700px ≈ 0.0214 (right shift for glove indicators)
    startY: 0.0532, // 50px / 940px ≈ 0.0532 of canvas height
    boostTextFontSize: 0.0286, // 20px / 700px ≈ 0.0286 of canvas width
    boostTextOffsetY: -0.0266, // -25px / 940px ≈ -0.0266 of canvas height
    activateTextFontSize: 0.0214, // 15px / 700px ≈ 0.0214 of canvas width
    activateTextOffsetX: -0.0314, // -22px / 700px ≈ -0.0314 of canvas width
    activateTextOffsetY: 0.0426, // 40px / 940px ≈ 0.0426 of canvas height
    glowBlur: 0.0286, // 20px / 700px ≈ 0.0286 of canvas width
    pulseBase: 0.00286, // 2px / 700px ≈ 0.00286 of canvas width
    pulseAmplitude: 0.00286, // 2px / 700px ≈ 0.00286 of canvas width
    staminaXOffset: -0.1 // Position stamina bar to the left of glove indicators (adjusted)
};

// Configuration object for glove indicators (responsive values)
const gloveIndicatorConfig = {
    circleSize: 0.0643, // 45px / 700px ≈ 0.0643 of canvas width
    spacing: 0.0071, // 5px / 700px ≈ 0.0071 of canvas width
    startXOffset: 0.0214, // 15px / 700px ≈ 0.0214 (right shift)
    startY: 0.0532, // 50px / 940px ≈ 0.0532 of canvas height
    boostTextFontSize: 0.0286, // 20px / 700px ≈ 0.0286 of canvas width
    boostTextOffsetY: -0.0266, // -25px / 940px ≈ -0.0266 of canvas height
    activateTextFontSize: 0.0214, // 15px / 700px ≈ 0.0214 of canvas width
    activateTextOffsetX: -0.0314, // -22px / 700px ≈ -0.0314 of canvas width
    activateTextOffsetY: 0.0426, // 40px / 940px ≈ 0.0426 of canvas height
    glowBlur: 0.0286, // 20px / 700px ≈ 0.0286 of canvas width
    pulseBase: 0.00286, // 2px / 700px ≈ 0.00286 of canvas width
    pulseAmplitude: 0.00286 // 2px / 700px ≈ 0.00286 of canvas width
};

// Define menuButton globally (place after uiConfig and asset loading)
const menuButton = {
    x: canvas.width * 0.005 + (canvas.width * 0.99 / 2) - (canvas.width * uiConfig.circleSize / 2), // Center in scoreboard
    y: canvas.height * 0.0106 + (canvas.height * 0.1064 / 2) - (canvas.width * uiConfig.circleSize / 2), // Center vertically
    size: canvas.width * uiConfig.circleSize, // Match glove indicator size
    img: menuIconImg // Loaded as new Image(); menuIconImg.src = 'assets/menuIcon.png'
};

// Resize handler
function handleResize() {
    const container = document.getElementById('game-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;


   // Update Three.js renderer
    renderer.setSize(width, height, false); // Avoid updating CSS
    renderer.setPixelRatio(window.devicePixelRatio); // Update for high-DPI screens
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

  // Update menu button position (centered in scoreboard)
    menuButton.x = canvas.width * 0.24 + (canvas.width * 0.99 / 2) - (canvas.width * uiConfig.circleSize / 2);
    menuButton.y = canvas.height * 0.0006 + (canvas.height * 0.1064 / 2) - (canvas.width * uiConfig.circleSize / 2);
    menuButton.size = canvas.width * uiConfig.circleSize;

     // Update audio controls positions
     audioControls.musicVolume.x = canvas.width - (canvas.width * 0.2143); // 150px / 700px
    audioControls.musicMute.x = canvas.width - (canvas.width * 0.2143);
    audioControls.sfxVolume.x = canvas.width - (canvas.width * 0.2143);
    audioControls.sfxMute.x = canvas.width - (canvas.width * 0.2143);
    audioControls.showControls.x = canvas.width * 0.0143; // 10px / 700px
    audioControls.showControls.y = canvas.height - (canvas.height * 0.0319); // 30px / 940px
   // Trigger button position recalculation
    const drawButtons = setupTouchControls(); // Reinitialize to update buttons
    drawButtons(); // Call immediately to redraw buttons
}
// Global or module-level variables to store buttons and draw function
let buttons = [];
let drawButtonsFn = () => {};

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
});

let currentEffectUpdate = null;

// Animation state for background opacity
let opacityTime = 0; // Time accumulator for animation
const OPACITY_DURATION = 500; // 2 seconds for transition and hold
let currentOpacity = 0.1; // Starting opacity
let animationState = 'rising'; // States: 'rising', 'highHold', 'falling', 'lowHold'

function updateOpacityAnimation(deltaTime) {
    opacityTime += deltaTime * 1000; // Convert to milliseconds

    if (animationState === 'rising') {
        currentOpacity = 0.1 + (0.25 * (opacityTime / OPACITY_DURATION)); // Linear rise from 0.1 to 0.35
        if (opacityTime >= OPACITY_DURATION) {
            currentOpacity = 0.5;
            animationState = 'highHold';
            opacityTime = 0;
        }
    } else if (animationState === 'highHold') {
        currentOpacity = 0.5;
        if (opacityTime >= OPACITY_DURATION) {
            animationState = 'falling';
            opacityTime = 0;
        }
    } else if (animationState === 'falling') {
        currentOpacity = 0.5 - (0.25 * (opacityTime / OPACITY_DURATION)); // Linear fall from 0.35 to 0.1
        if (opacityTime >= OPACITY_DURATION) {
            currentOpacity = 0.1;
            animationState = 'lowHold';
            opacityTime = 0;
        }
    } else if (animationState === 'lowHold') {
        currentOpacity = 0.1;
        if (opacityTime >= OPACITY_DURATION) {
            animationState = 'rising';
            opacityTime = 0;
        }
    }
}



// Level effect management
function setupLevelEffect(level) {
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
      // Re-add background2Mesh after clearing scene
   // if (background2Mesh) {
   //     scene.add(background2Mesh);
   // }

    let effectLevel = level;
    if (level > 2) {
        effectLevel = (level - 1) % 8 + 1;
    }
    switch (effectLevel) {
         case 1: currentEffectUpdate = createStars(scene, level); break;
        case 2: currentEffectUpdate = createLines(scene, level); break;
        case 3: currentEffectUpdate = createStarsAndGasClouds(scene, level); break;
        case 4: currentEffectUpdate = createCometTrail(scene, level); break;
        case 5: currentEffectUpdate = createBubbles(scene, level); break;
        case 6: currentEffectUpdate = createWireframeCubes(scene, level); break;
        case 7: currentEffectUpdate = createFireworks(scene, level); break;
        case 8: currentEffectUpdate = createDroneShow(scene, level); break;
    }
}

// Adjustable effect parameters
const playerSpinSpeedBounce = 25; // Fast spin when bouncing (radians/second)
const playerSpinSpeedFall = 15; // Slower spin when falling (radians/second)
const playerMotionBlurAmount = 0; // Motion blur intensity (0 to 1)
const platformPulseSpeed = 0.5; // Pulse speed for platform glow (cycles/second)
const jumpPulseSpeed = 1.5; // Faster pulse speed for jump glow (cycles/second)
const gloveParticleCount = 300; // Number of particles per glove
const gloveParticleSpeed = 50; // Particle movement speed

// Game classes with effects
class Platform {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.pulseTime = 0;
    }
    draw() {
        const screenY = this.y - scrollY;
        if (screenY > -this.height && screenY < canvas.height) {
            const img = this.type === 'jump' ? jumpImg : platformImg;

            this.pulseTime += platformPulseSpeed / 60; // Sync with frame rate
            const pulse = Math.sin(this.pulseTime * Math.PI * 2) * 0.3 + 0.7;
            ctx.save();
            ctx.shadowBlur = 10 * pulse;
            ctx.shadowColor = 'rgba(0, 255, 0, 0.5)';
            ctx.drawImage(img, this.x - this.width / 2, screenY - this.height / 2, this.width, this.height);
            ctx.restore();
        }
    }
}

class JumpPlatform extends Platform {
    draw() {
        const screenY = this.y - scrollY;
        if (screenY > -this.height && screenY < canvas.height) {
            this.pulseTime += jumpPulseSpeed / 60;
            const pulse = Math.sin(this.pulseTime * Math.PI * 2) * 0.3 + 0.7;
            ctx.save();
            const r = Math.sin(this.pulseTime * Math.PI * 2) * 127 + 128;
            const g = Math.sin(this.pulseTime * Math.PI * 2 + 2) * 127 + 128;
            const b = Math.sin(this.pulseTime * Math.PI * 2 + 4) * 127 + 128;
            ctx.shadowBlur = 10 * pulse;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
            ctx.drawImage(jumpImg, this.x - this.width / 2, screenY - this.height / 2, this.width, this.height);
            ctx.restore();
        }
    }
}

class MovingPlatform extends Platform {
    constructor(x, y, width, height, vx) {
        super(x, y, width, height, 'moving');
        this.vx = vx;
    }
    update(deltaTime) {
        this.x += this.vx * deltaTime;
        if (this.x < this.width / 2 || this.x > canvas.width - this.width / 2) this.vx *= -1;
    }
}

class Glove {
    constructor(x, y, vx) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.vx = vx;
        this.img = vx > 0 ? leftGloveImg : rightGloveImg;
        this.particles = []; // Dynamic particle list
        this.lastParticleTime = 0;
        this.particleSpawnInterval = 0.025; // Spawn a particle every 20ms (adjust for density)
        this.trailLength = 150; // Distance in pixels for particles to fade out (approx. a few inches)
        this.spreadAngle = Math.PI / 10; // Spread angle in radians (30 degrees, adjustable)
        audioManager.playSfx('gloveFly'); // Play glove fly sound on spawn
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;

        // Spawn new particles with spread behind the image
        this.lastParticleTime += deltaTime;
        if (this.lastParticleTime >= this.particleSpawnInterval) {
            for (let i = 0; i < 2; i++) { // Spawn 2 particles per interval for denser spray
                const angle = (Math.random() - 0.5) * this.spreadAngle; // Random angle within spread
                const speed = Math.abs(this.vx) * 0.5; // Base speed
                const vxOffset = speed * Math.cos(angle) * (this.vx > 0 ? 1 : -1); // Direction based on glove movement
                const vyOffset = speed * Math.sin(angle); // Vertical spread

                // Offset spawn position to behind the glove (opposite direction of vx)
                const spawnXOffset = this.vx > 0 ? -this.width / 2 : this.width / 2; // Reversed logic
                this.particles.push({
                    x: this.x + spawnXOffset,
                    y: this.y,
                    vx: vxOffset,
                    vy: vyOffset,
                    life: 1,
                    maxLife: this.trailLength / speed // Life based on distance and speed
                });
            }
            this.lastParticleTime = 0;
        }

        // Update and remove particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.life -= deltaTime / p.maxLife; // Fade out over trail length
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        const screenY = this.y - scrollY;
        if (screenY > -this.height && screenY < canvas.height) {
            ctx.drawImage(this.img, this.x - this.width / 2, screenY - this.height / 2, this.width, this.height);

            ctx.fillStyle = 'rgba(173, 216, 230, 0.8)'; // Light blue for ice-like particles
            this.particles.forEach(p => {
                const alpha = p.life; // Fade from 1 to 0
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(p.x, screenY + (this.y - p.y), 2, 0, Math.PI * 2); // Small particle size
                ctx.fill();
            });
            ctx.globalAlpha = 1; // Reset alpha
        }
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 569;
        this.rotation = 0;
        this.boostActive = false;
        this.gloveCount = 0; // Track collected gloves
    }
    update(deltaTime) {
        if (this.boostActive) {
            this.vy += this.gravity * deltaTime / 2; // Reduced gravity for higher jump
        } else {
            this.vy += this.gravity * deltaTime;
        }
        this.x += this.vx * deltaTime * (this.boostActive ? 1.5 : 1); // 1.5x speed when boosted
        this.y += this.vy * deltaTime;
        if (this.x < 0) this.x = canvas.width;
        else if (this.x > canvas.width) this.x = 0;

        const spinSpeed = Math.abs(this.vy) > 100 ? playerSpinSpeedFall : playerSpinSpeedBounce;
        this.rotation += spinSpeed * deltaTime * (this.vy > 0 ? 1 : -1);

        // Activate boost with up arrow
        if (keys.has('ArrowUp') && this.gloveCount >= 3 && !this.boostActive) {
            this.boostActive = true;
            this.gloveCount = 0; // Reset glove count
            audioManager.playSfx('boost'); // Play boost sound
        }
        if (this.boostActive && this.vy < 0 && Math.abs(this.vy) < 100) {
            this.boostActive = false; // Deactivate after peak jump
        }
    }
    draw() {
        const screenY = this.y - scrollY;
        ctx.save();
        ctx.translate(this.x, screenY);
        ctx.rotate(this.rotation);
        ctx.drawImage(ballImages[selectedBallIndex], -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
    handleInput() {
        if (keys.has('ArrowLeft')) this.vx = -160;
        else if (keys.has('ArrowRight')) this.vx = 160;
        else this.vx = 0;
    }
    applyBoost() {
        if (this.boostActive) {
            this.vy = -1100; // 2x jump height (-550 * 2)
        }
    }
}

// Game state
let scrollY = 0;
let lastPlatformY = canvas.height - 70;
let platforms = [];
let fakePlatforms = [];
let movingPlatforms = [];
let gloves = [];
let player;
let lastGloveScore = 0;
let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
let currentLevel = 0;
let levelComplete = false;
let levelPauseTime = 0;
const LEVEL_DURATION = 5000;
const keys = new Set();
const MAX_GLOVES = 5;
const MAX_PLATFORMS = 100;
let highestLevelCompleted = localStorage.getItem('highestLevelCompleted') ? parseInt(localStorage.getItem('highestLevelCompleted')) : 0; // Track completed levels
let isMenuOpen = false; // Track menu state
let isPaused = false; // Track pause state
let allLevelsUnlocked = false; // Dev unlock toggle

// Touch control setup (on-canvas buttons)
function setupTouchControls() {
    // Detect if the device is mobile
    function isMobileDevice() {
        return ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth <= 768;
    }

    // Calculate button positions (responsive)
    function calculateButtonPositions() {
        const buttonSize = canvas.width * 0.175; // 10% of canvas width
        const buttonSpacing = canvas.width * 0.2; // 5% of canvas width
        const bottomMargin = canvas.width * 0.05; // 3% of canvas width
        const totalWidth = 3 * buttonSize + 2 * buttonSpacing;
        const startX = (canvas.width - totalWidth) / 2; // Center buttons
        return [
            { id: 'left', x: startX, y: canvas.height - buttonSize - bottomMargin, size: buttonSize, key: 'ArrowLeft', img: leftArrowImg },
            { id: 'jump', x: startX + buttonSize + buttonSpacing, y: canvas.height - buttonSize - bottomMargin, size: buttonSize, key: 'ArrowUp', img: upArrowImg },
            { id: 'right', x: startX + 2 * (buttonSize + buttonSpacing), y: canvas.height - buttonSize - bottomMargin, size: buttonSize, key: 'ArrowRight', img: rightArrowImg }
        ];
    }

    // Store buttons globally for drawing and event handling
    buttons = calculateButtonPositions();

    // Function to check if a touch is within a button (circular hitbox)
    function isPointInButton(x, y, button) {
        const cx = button.x + button.size / 2;
        const cy = button.y + button.size / 2;
        const radius = button.size / 2;
        return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) <= radius;
    }

    // Track active touches for multitouch support
    const activeTouches = new Map();

    // Touch event handlers for canvas buttons
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling
        const rect = canvas.getBoundingClientRect();
        const touch = e.changedTouches[0];
        const canvasX = touch.clientX - rect.left;
        const canvasY = touch.clientY - rect.top;

        buttons.forEach(button => {
            if (isPointInButton(canvasX, canvasY, button)) {
                keys.add(button.key);
                activeTouches.set(touch.identifier, button.key);
                if (button.id === 'jump' && lastGloveScore > 0) {
                    boostUsed = true; // Mark boost as used
                }
                console.log(`Touch started on ${button.id} button`);
            }
        });
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Prevent scrolling
        const rect = canvas.getBoundingClientRect();
        const touch = e.changedTouches[0];
        const canvasX = touch.clientX - rect.left;
        const canvasY = touch.clientY - rect.top;

        // Update keys based on current touch position
        buttons.forEach(button => {
            const wasActive = activeTouches.get(touch.identifier) === button.key;
            const isNowActive = isPointInButton(canvasX, canvasY, button);
            if (wasActive && !isNowActive) {
                keys.delete(button.key);
                activeTouches.delete(touch.identifier);
            } else if (!wasActive && isNowActive) {
                keys.add(button.key);
                activeTouches.set(touch.identifier, button.key);
            }
        });
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault(); // Prevent scrolling
        for (const touch of e.changedTouches) {
            const key = activeTouches.get(touch.identifier);
            if (key) {
                keys.delete(key);
                activeTouches.delete(touch.identifier);
            }
        }
    }, { passive: false });

    // Mouse event handlers for PC testing (optional, disable if not needed)
    if (!isMobileDevice() && showControlsOnPC) {
        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            const canvasX = e.clientX - rect.left;
            const canvasY = e.clientY - rect.top;
            buttons.forEach(button => {
                if (isPointInButton(canvasX, canvasY, button)) {
                    keys.add(button.key);
                    if (button.id === 'jump' && lastGloveScore > 0) {
                        boostUsed = true; // Mark boost as used
                    }
                }
            });
        });

        canvas.addEventListener('mouseup', (e) => {
            const rect = canvas.getBoundingClientRect();
            const canvasX = e.clientX - rect.left;
            const canvasY = e.clientY - rect.top;
            buttons.forEach(button => {
                if (isPointInButton(canvasX, canvasY, button)) {
                    keys.delete(button.key);
                }
            });
        });
    }

    // Reset boostUsed when gloves are collected
    function checkBoostReset() {
        if (lastGloveScore === 0) {
            boostUsed = false; // Reset when no gloves are active
        }
    }

    // Draw buttons with PNG images, circular shape, and glow effects
   function drawButtons() {
        if (!isMobileDevice() && !showControlsOnPC) return;
        ctx.save();
        checkBoostReset(); // This now works since boostUsed is defined
        buttons.forEach(button => {
            const cx = button.x + button.size / 2;
            const cy = button.y + button.size / 2;
            const radius = keys.has(button.key) ? (button.size / 2) * 0.9 : button.size / 2; // Shrink 10% when pressed

            // Draw glow effect
            if (button.id === 'left' || button.id === 'right') {
                const pulse = Math.sin(performance.now() / 500) * 2 + 2; // Pulse radius 5-10px
                ctx.beginPath();
                ctx.arc(cx, cy, radius + pulse, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
                ctx.fill();
            } else if (button.id === 'jump') {
                ctx.beginPath();
                ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
                ctx.fillStyle = (lastGloveScore > 0 && !boostUsed)
                    ? `hsl(${(performance.now() / 50) % 360}, 60%, 40%)` // RGB flash
                    : 'rgba(255, 255, 255, 0.69)'; // Steady white
                ctx.fill();
            }


            // Draw circular button background
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = keys.has(button.key) ? '#000' : '#000'; // Darker when pressed
            ctx.fill();

            // Draw button border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 0.65;
            ctx.stroke();

            // Draw button image
            if (button.img.complete && button.img.naturalHeight !== 0) {
                const imgSize = keys.has(button.key) ? button.size * 0.8 : button.size * 0.85;
                const imgX = cx - imgSize / 2;
                const imgY = cy - imgSize / 2;
                ctx.drawImage(button.img, imgX, imgY, imgSize, imgSize);
            }
        });
        ctx.restore();
    }

    // Update button positions on resize
    window.addEventListener('resize', () => {
        buttons = calculateButtonPositions();
    });

    return drawButtons;
}

// Initialize touch controls and update global draw function
const drawTouchButtons = setupTouchControls();
drawButtonsFn = drawTouchButtons;



// Clear any existing listeners
canvas.onclick = null;
canvas.removeEventListener('click', handleInputEvent);
canvas.removeEventListener('touchstart', handleInputEvent);

// Add unified click and touch listeners
canvas.addEventListener('click', (e) => {
    console.log('Canvas click event triggered');
    handleInputEvent(e, false);
});

canvas.addEventListener('touchstart', (e) => {
    console.log('Canvas touchstart event triggered');
    const rect = canvas.getBoundingClientRect();
    const canvasX = (e.changedTouches[0].clientX - rect.left) * (canvas.width / rect.width);
    const canvasY = (e.changedTouches[0].clientY - rect.top) * (canvas.height / rect.height);
    const buttons = [
        { x: (canvas.width - 270) / 2, y: canvas.height - 90, size: 70 },
        { x: (canvas.width - 270) / 2 + 100, y: canvas.height - 90, size: 70 },
        { x: (canvas.width - 270) / 2 + 200, y: canvas.height - 90, size: 70 }
    ];
    const isInTouchButton = buttons.some(button => {
        const cx = button.x + button.size / 2;
        const cy = button.y + button.size / 2;
        const radius = button.size / 2;
        return Math.sqrt((canvasX - cx) ** 2 + (canvasY - cy) ** 2) <= radius;
    });
    if (!isInTouchButton) {
        console.log('Canvas touchstart, processing input');
        handleInputEvent(e, true);
    }
}, { passive: false });

// Ball selection popup
function showBallSelectionPopup() {
    console.log('showBallSelectionPopup called');
    audioManager.playSfx('ballSelect');
    const popup = document.createElement('div');
    popup.id = 'ball-selection-popup';
    popup.style.position = 'absolute';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.background = 'rgba(0, 0, 0, 0.8)';
    popup.style.color = 'white';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.zIndex = '1000';
    popup.innerHTML = '<h2>Select Your Ball</h2>';
    const ballContainer = document.createElement('div');
    ballContainer.style.display = 'flex';
    ballContainer.style.flexWrap = 'wrap';
    ballContainer.style.justifyContent = 'center';
    for (let i = 0; i < ballImages.length; i++) {
        const ballOption = document.createElement('div');
        ballOption.style.margin = '10px';
        ballOption.style.cursor = 'pointer';
        const img = document.createElement('img');
        img.src = ballImages[i].src;
        img.width = 50;
        img.height = 50;
        img.dataset.index = i;
        ballOption.appendChild(img);
        ballContainer.appendChild(ballOption);
    }
    popup.appendChild(ballContainer);
    const closeButton = document.createElement('div');
    closeButton.id = 'ball-selection-close';
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.textAlign = 'center';
    closeButton.style.padding = '10px';
    closeButton.style.background = '#080816ff';
    closeButton.style.borderRadius = '5px';
    closeButton.dataset.action = 'close';
    popup.appendChild(closeButton);
    document.body.appendChild(popup);
    isMenuOpen = true;
    isPaused = true;

    // Handle click and touch for ball selection and close button
    popup.addEventListener('click', (e) => {
        const target = e.target;
        if (target.dataset.index) {
            console.log(`Ball ${target.dataset.index} selected`);
            selectBall(parseInt(target.dataset.index));
        } else if (target.dataset.action === 'close') {
            console.log('Popup close button clicked');
            document.body.removeChild(popup);
            isMenuOpen = true;
            isPaused = true;
            audioManager.playSfx('ballSelect');
        }
    });

    popup.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target.dataset.index) {
            console.log(`Ball ${target.dataset.index} selected (touch)`);
            selectBall(parseInt(target.dataset.index));
        } else if (target.dataset.action === 'close') {
            console.log('Popup close button clicked (touch)');
            document.body.removeChild(popup);
            isMenuOpen = true;
            isPaused = true;
            audioManager.playSfx('ballSelect');
        }
    }, { passive: false });
}

function selectBall(index) {
    console.log(`selectBall called with index ${index}`);
    selectedBallIndex = index;
    audioManager.playBallSound(index);
    if (player) {
        player.playerImg = ballImages[selectedBallIndex];
    }
    const popup = document.getElementById('ball-selection-popup');
    if (popup) {
        document.body.removeChild(popup);
    }
    isMenuOpen = true;
    isPaused = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (currentLevel === 0 || isMenuOpen) {
        drawMenu();
    } else {
        if (backgroundImg.complete && backgroundImg.naturalHeight !== 0) {
            ctx.save();
            ctx.globalAlpha = currentOpacity;
            ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
        platforms.forEach(p => p.draw());
        movingPlatforms.forEach(p => p.draw());
        gloves.forEach(g => g.draw());
        player.draw();
        drawScoreboard();
        drawGloveIndicators();
        drawTouchButtons();
    }
}
// Input handling with mute toggle
window.addEventListener('keydown', (e) => {
    keys.add(e.key);
    if (e.key === 'm') {
        audioManager.toggleMute();
    }
});

let lastMenuClick = 0;
const MENU_CLICK_DEBOUNCE = 200; // 200ms debounce


// Unified input handler for click and touch events
function handleInputEvent(e, isTouch = false) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let canvasX, canvasY;
    if (isTouch) {
        const touch = e.changedTouches[0];
        canvasX = (touch.clientX - rect.left) * scaleX;
        canvasY = (touch.clientY - rect.top) * scaleY;
    } else {
        canvasX = (e.clientX - rect.left) * scaleX;
        canvasY = (e.clientY - rect.top) * scaleY;
    }
    console.log(`Input at (${canvasX.toFixed(2)}, ${canvasY.toFixed(2)}), gameState=${gameState}, isMenuOpen=${isMenuOpen}, currentLevel=${currentLevel}`);

    // Menu button during gameplay
    if (
        !isMenuOpen &&
        !isPaused &&
        currentLevel !== 0 &&
        Math.sqrt((canvasX - (menuButton.x + menuButton.size / 2)) ** 2 + (canvasY - (menuButton.y + menuButton.size / 2)) ** 2) <= menuButton.size / 2
    ) {
        console.log('Menu button clicked');
        toggleMenu(true);
        return true;
    }

    // Menu interactions
    if (isMenuOpen || currentLevel === 0) {
        const ballButton = { x: canvas.width / 2 - 85, y: canvas.height / 2 - 300, width: 170, height: 40 };
        console.log(`Checking ball button: x[${ballButton.x}, ${ballButton.x + ballButton.width}], y[${ballButton.y}, ${ballButton.y + ballButton.height}]`);
        if (
            canvasX >= ballButton.x &&
            canvasX <= ballButton.x + ballButton.width &&
            canvasY >= ballButton.y &&
            canvasY <= ballButton.y + ballButton.height
        ) {
            console.log('Ball selection button clicked, calling showBallSelectionPopup');
            showBallSelectionPopup();
            audioManager.playSfx('ballSelect');
            return true;
        }

        // Level selection grid
        for (let level = 1; level <= 100; level++) {
            if (level > highestLevelCompleted + 1 && !allLevelsUnlocked) continue;
            const row = Math.floor((level - 1) / LEVELS_PER_ROW);
            const col = (level - 1) % LEVELS_PER_ROW;
            const x = GRID_START_X + col * (BUTTON_WIDTH + BUTTON_SPACING);
            const y = GRID_START_Y + row * (BUTTON_HEIGHT + BUTTON_SPACING);
            if (
                canvasX >= x &&
                canvasX <= x + BUTTON_WIDTH &&
                canvasY >= y &&
                canvasY <= y + BUTTON_HEIGHT
            ) {
                resetLevel(level);
                isPaused = false;
                audioManager.playSfx('levelSelect');
                return true;
            }
        }

        // Close button
        const closeButton = { x: canvas.width / 2 - 50, y: canvas.height / 2 + 360, width: 100, height: 40 };
        if (
            canvasX >= closeButton.x &&
            canvasX <= closeButton.x + closeButton.width &&
            canvasY >= closeButton.y &&
            canvasY <= closeButton.y + closeButton.height &&
            currentLevel !== 0
        ) {
            console.log(`Close button clicked at (${canvasX.toFixed(2)}, ${canvasY.toFixed(2)})`);
            toggleMenu(false);
            return true;
        }

        // Audio controls
        if (
            canvasX >= audioControls.musicVolume.x &&
            canvasX <= audioControls.musicVolume.x + audioControls.musicVolume.width &&
            canvasY >= audioControls.musicVolume.y &&
            canvasY <= audioControls.musicVolume.y + audioControls.musicVolume.height
        ) {
            audioControls.musicVolume.dragging = true;
            const value = (canvasX - audioControls.musicVolume.x) / audioControls.musicVolume.width;
            audioManager.setMusicVolume(Math.max(0, Math.min(1, value)));
            audioControls.musicVolume.value = audioManager.musicVolume;
            localStorage.setItem('musicVolume', audioManager.musicVolume);
            return true;
        }

        if (
            canvasX >= audioControls.musicMute.x &&
            canvasX <= audioControls.musicMute.x + audioControls.musicMute.width &&
            canvasY >= audioControls.musicMute.y &&
            canvasY <= audioControls.musicMute.y + audioControls.musicMute.height
        ) {
            audioManager.toggleMusicMute();
            audioControls.musicMute.text = audioManager.isMusicMuted ? 'Unmute' : 'Mute';
            return true;
        }

        if (
            canvasX >= audioControls.sfxVolume.x &&
            canvasX <= audioControls.sfxVolume.x + audioControls.sfxVolume.width &&
            canvasY >= audioControls.sfxVolume.y &&
            canvasY <= audioControls.sfxVolume.y + audioControls.sfxVolume.height
        ) {
            audioControls.sfxVolume.dragging = true;
            const value = (canvasX - audioControls.sfxVolume.x) / audioControls.sfxVolume.width;
            audioManager.setSfxVolume(Math.max(0, Math.min(1, value)));
            audioControls.sfxVolume.value = audioManager.sfxVolume;
            localStorage.setItem('sfxVolume', audioManager.sfxVolume);
            return true;
        }

        if (
            canvasX >= audioControls.sfxMute.x &&
            canvasX <= audioControls.sfxMute.x + audioControls.sfxMute.width &&
            canvasY >= audioControls.sfxMute.y &&
            canvasY <= audioControls.sfxMute.y + audioControls.sfxMute.height
        ) {
            audioManager.toggleSfxMute();
            audioControls.sfxMute.text = audioManager.isSfxMuted ? 'Unmute' : 'Mute';
            return true;
        }

        if (
            canvasX >= audioControls.showControls.x &&
            canvasX <= audioControls.showControls.x + audioControls.showControls.width &&
            canvasY >= audioControls.showControls.y &&
            canvasY <= audioControls.showControls.y + audioControls.showControls.height
        ) {
            showControlsOnPC = !showControlsOnPC;
            audioControls.showControls.checked = showControlsOnPC;
            localStorage.setItem('showControlsOnPC', showControlsOnPC);
            const touchControls = document.getElementById('touch-controls');
            if (!isMobileDevice()) {
                touchControls.style.display = showControlsOnPC ? 'flex' : 'none';
            }
            return true;
        }

        // Unlock all levels (dev mode)
        const unlockButton = { x: 10, y: 10, width: 50, height: 50 };
        if (
            keys.has('UnlockDev') &&
            canvasX >= unlockButton.x &&
            canvasX <= unlockButton.x + unlockButton.width &&
            canvasY >= unlockButton.y &&
            canvasY <= unlockButton.y + unlockButton.height
        ) {
            allLevelsUnlocked = true;
            audioManager.playSfx('levelSelect');
            return true;
        }
    }

    // Level completion screen
    if (levelComplete) {
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = canvas.width / 2 - buttonWidth / 2;
        const buttonY = canvas.height / 2 + 50;
        if (
            canvasX >= buttonX &&
            canvasX <= buttonX + buttonWidth &&
            canvasY >= buttonY &&
            canvasY <= buttonY + buttonHeight
        ) {
            if (currentLevel > highestLevelCompleted) {
                highestLevelCompleted = currentLevel;
                localStorage.setItem('highestLevelCompleted', highestLevelCompleted);
            }
            resetLevel(currentLevel + 1);
            isPaused = false;
            audioManager.playSfx('levelSelect');
            return true;
        }
    }

    return false;
}
//Dedicated Menu Toggle Function

function toggleMenu(open) {
    isMenuOpen = open;
    isPaused = open;
    gameState = open ? 'menu' : 'game';
    updateMenuElementsVisibility();
    console.log(`Menu toggled: isMenuOpen=${isMenuOpen}, isPaused=${isPaused}, gameState=${gameState}`);
    if (isMenuOpen) {
        audioManager.playMenuBgm();
    } else {
        audioManager.playLevelBgm(currentLevel);
    }
    audioManager.playSfx('ballSelect');
}

// Handle slider dragging
canvas.addEventListener('mousemove', (e) => {
    if (audioControls.musicVolume.dragging || audioControls.sfxVolume.dragging) {
        const rect = canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        if (audioControls.musicVolume.dragging) {
            const value = (canvasX - audioControls.musicVolume.x) / audioControls.musicVolume.width;
            audioManager.setMusicVolume(Math.max(0, Math.min(1, value)));
            audioControls.musicVolume.value = audioManager.musicVolume;
            localStorage.setItem('musicVolume', audioManager.musicVolume);
        }
        if (audioControls.sfxVolume.dragging) {
            const value = (canvasX - audioControls.sfxVolume.x) / audioControls.sfxVolume.width;
            audioManager.setSfxVolume(Math.max(0, Math.min(1, value)));
            audioControls.sfxVolume.value = audioManager.sfxVolume;
            localStorage.setItem('sfxVolume', audioManager.sfxVolume);
        }
    }
});

canvas.addEventListener('mouseup', () => {
    audioControls.musicVolume.dragging = false;
    audioControls.sfxVolume.dragging = false;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const canvasX = touch.clientX - rect.left;
    if (audioControls.musicVolume.dragging) {
        const value = (canvasX - audioControls.musicVolume.x) / audioControls.musicVolume.width;
        audioManager.setMusicVolume(Math.max(0, Math.min(1, value)));
        audioControls.musicVolume.value = audioManager.musicVolume;
        localStorage.setItem('musicVolume', audioManager.musicVolume);
    }
    if (audioControls.sfxVolume.dragging) {
        const value = (canvasX - audioControls.sfxVolume.x) / audioControls.sfxVolume.width;
        audioManager.setSfxVolume(Math.max(0, Math.min(1, value)));
        audioControls.sfxVolume.value = audioManager.sfxVolume;
        localStorage.setItem('sfxVolume', audioManager.sfxVolume);
    }
}, { passive: false });

canvas.addEventListener('touchend', () => {
    audioControls.musicVolume.dragging = false;
    audioControls.sfxVolume.dragging = false;
}, { passive: false });

// Keybinding for music mute
document.addEventListener('keydown', (e) => {
    keys.add(e.key);
    if (e.key.toLowerCase() === 'm' && gameState === 'menu') {
        audioManager.toggleMusicMute();
        audioControls.musicMute.text = audioManager.isMusicMuted ? 'Unmute' : 'Mute';
    }
});

// Input handling
window.addEventListener('keydown', (e) => keys.add(e.key));
window.addEventListener('keyup', (e) => keys.delete(e.key));

// Game functions
function getScrollScore() {
    return -Math.floor(scrollY / 10);
}

function getTotalScore() {
    return score + getScrollScore();
}

function getNextPlatformDistance() {
    const scrollScore = getScrollScore();
    const scoreDistance = (Math.min(scrollScore, 5000) / 5000) * 120;
    return Math.random() * 60 + 180 + scoreDistance;
}

function rectanglesOverlap(rect1, rect2) {
    return (
        rect1.x - rect1.width / 2 < rect2.x + rect2.width / 2 &&
        rect1.x + rect1.width / 2 > rect2.x - rect2.width / 2 &&
        rect1.y - rect1.height / 2 < rect2.y + rect2.height / 2 &&
        rect1.y + rect1.height / 2 > rect2.y - rect2.height / 2
    );
}

function addPlatform(y) {
    if (platforms.length + fakePlatforms.length + movingPlatforms.length >= MAX_PLATFORMS) return;
    const x = Math.random() * (canvas.width - 140) + 70;
    const type = Math.random() < 0.3 && getScrollScore() > 100 ? 'moving' : 'normal';
    let newPlatform;
    if (type === 'moving') {
        newPlatform = new MovingPlatform(x, y, 140, 30, 180);
        movingPlatforms.push(newPlatform);
    } else {
        newPlatform = new Platform(x, y, 140, 30, 'normal');
        platforms.push(newPlatform);
        if (Math.random() < 0.3) {
            let jumpX = canvas.width / 2 + (Math.random() * 100 - 50);
            const jump = new JumpPlatform(jumpX, y - 15, 80, 50, 'jump');
            let attempts = 0;
            while (platforms.some(p => rectanglesOverlap(jump, p)) && attempts < 10) {
                jumpX = canvas.width / 2 + (Math.random() * 100 - 50);
                jump.x = jumpX;
                attempts++;
            }
            if (attempts < 10) platforms.push(jump);
        }
    }
}

function checkNewPlatform() {
    while (lastPlatformY > scrollY - canvas.height / 2 && platforms.length + fakePlatforms.length + movingPlatforms.length < MAX_PLATFORMS) {
        const distance = getNextPlatformDistance();
        lastPlatformY -= distance;
        addPlatform(lastPlatformY);
    }
}

function spawnGlove() {
    if (gloves.length >= MAX_GLOVES) return;
    const side = Math.random() < 0.5 ? 'left' : 'right';
    const x = side === 'left' ? -20 : canvas.width + 20;
    const y = player.y + (Math.random() * 200 - 100);
    const vx = side === 'left' ? 200 : -200;
    gloves.push(new Glove(x, y, vx)); // Glove fly sound played in constructor
}

function resetLevel(level) {
    scrollY = 0;
    lastPlatformY = canvas.height - 70;
    platforms = [new Platform(canvas.width / 2, canvas.height, canvas.width, 70, 'normal')];
    fakePlatforms = [];
    movingPlatforms = [];
    gloves = [];
    player = new Player(canvas.width / 2, canvas.height - 50);
    player.playerImg = ballImages[selectedBallIndex];
    lastGloveScore = 0;
    score = 0;
    player.gloveCount = 0;
    currentLevel = level;
    levelComplete = false;
    levelPauseTime = 0;
    elapsedTime = 0; // Reset timer
    isMenuOpen = false; // Close menu when starting a level
    
    setupLevelEffect(level);
    checkNewPlatform();
    audioManager.playLevelBgm(level); // Play level-specific BGM
    audioManager.playSfx('levelSelect'); // Play level select sound
}

function update(deltaTime) {
    if (currentLevel === 0 || isPaused) return; // Skip updates if in menu or paused
   

    if (levelComplete) {
        levelPauseTime += deltaTime * 1000;
        return;
    }

 // Increment timer
    elapsedTime += deltaTime;

    player.handleInput();
    player.update(deltaTime);

    for (const platform of platforms) {
        if (rectanglesOverlap(player, platform) && player.vy > 0) {
            player.vy = platform.type === 'jump' ? -1000 : -550;
            player.y = platform.y - platform.height / 2 - player.height / 2;
            if (player.boostActive) player.applyBoost();
            audioManager.playSfx(platform.type === 'jump' ? 'jumpSprite' : 'platformBounce');
            break;
        }
    }

    for (const moving of movingPlatforms) {
        moving.update(deltaTime);
        if (rectanglesOverlap(player, moving) && player.vy > 0) {
            player.vy = -550;
            player.y = moving.y - moving.height / 2 - player.height / 2;
            if (player.boostActive) player.applyBoost();
            audioManager.playSfx('platformBounce');
            break;
        }
    }

    for (let i = gloves.length - 1; i >= 0; i--) {
        const glove = gloves[i];
        glove.update(deltaTime);
        if (rectanglesOverlap(player, glove)) {
            player.vx += glove.vx * 2;
            score += 10;
            player.gloveCount++;
            gloves.splice(i, 1);
            audioManager.playSfx('gloveCollect');
        } else if (glove.x < -20 || glove.x > canvas.width + 20) {
            gloves.splice(i, 1);
        }
    }

    const scrollScore = getScrollScore();
    if (scrollScore - lastGloveScore >= 200) {
        lastGloveScore = scrollScore;
        spawnGlove();
    }

    if (player.y < scrollY + canvas.height / 3) scrollY = player.y - canvas.height / 3;
    checkNewPlatform();

    platforms = platforms.filter(p => p.y <= scrollY + canvas.height + 100);
    movingPlatforms = movingPlatforms.filter(p => p.y <= scrollY + canvas.height + 100);
    gloves = gloves.filter(g => g.y <= scrollY + canvas.height + 100);

    const totalScore = getTotalScore();
    if (totalScore >= currentLevel * 1000) {
        levelComplete = true;
        audioManager.playSfx('levelComplete');
    
       // Save best time if better or not set
        if (!bestTimes[currentLevel] || elapsedTime < bestTimes[currentLevel]) {
            bestTimes[currentLevel] = elapsedTime;
            try {
                localStorage.setItem('bestTimes', JSON.stringify(bestTimes));
                console.log(`Saved best time for level ${currentLevel}: ${formatTime(elapsedTime)}`);
            } catch (e) {
                console.error('Error saving bestTimes to localStorage:', e);
            }
        }
        // Update highest level completed
        if (currentLevel > highestLevelCompleted) {
            highestLevelCompleted = currentLevel;
            localStorage.setItem('highestLevelCompleted', highestLevelCompleted);
        }
    }
    if (totalScore > highScore) {
        highScore = totalScore;
        localStorage.setItem('highScore', highScore);
    }

    if (player.y > scrollY + canvas.height + 50) {
        resetLevel(currentLevel);
    }
}

// Level select grid configuration
const LEVELS_PER_ROW = 10;
const BUTTON_WIDTH = 45;
const BUTTON_HEIGHT = 25;
const BUTTON_SPACING = 10;
const GRID_START_X = (canvas.width - (LEVELS_PER_ROW * (BUTTON_WIDTH + BUTTON_SPACING) - BUTTON_SPACING)) / 1.65;
const GRID_START_Y = canvas.height / 2 - 120;


function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${millis.toString().padStart(2, '0')}`;
}


// Function to create three subtle wavy circular gradient glows side by side around Alyup.png
function createGradientBorder(ctx, img, x, y, width, height, time) {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width + 420; // Increased for three circles
    offscreenCanvas.height = height + 440; // Consistent with height
    const offCtx = offscreenCanvas.getContext('2d');

       // Colors (in RGB for interpolation)
    const colors = [
        { r: 173, g: 216, b: 230, hex: '#ADD8E6' }, // babyBlue
        { r: 175, g: 255, b: 172, hex: '#afffacff' }, // babyGreen
        { r: 255, g: 248, b: 156, hex: '#fff89cff' }, // babyYellow
        { r: 255, g: 189, b: 156, hex: '#ffbd9cff' }, // babyOrange
        { r: 255, g: 172, b: 233, hex: '#fface9ff' }, // babyPink
        { r: 173, g: 216, b: 230, hex: '#ADD8E6' } // babyBlue (loop back)
    ];

    // Glow properties
    const glowWidth = 15.9; // Base width of the glow
    const glowOffset = 18; // Distance from image edge
    const waveAmplitude = 10; // Amplitude of the wave effect
    const waveFrequency = 34; // Number of waves around each circle
    const animationSpeed = 0.5; // Speed of the animation
    const blurRadius = 10; // Blur for softness
    const radiusScale = 0.045; // Scale to match current glow size
    const circleSpacing = (Math.max(width, height) / 2 + glowOffset) * radiusScale * 2; // Spacing between circles
    const yOffset = height * 1.5; // Offset to lower glow circles (adjustable)
    // Draw Alyup.png centered in the offscreen canvas
    offCtx.drawImage(img, glowOffset + glowWidth + (offscreenCanvas.width - width) / 2 - glowWidth, glowOffset + glowWidth, width, height);



    
    // Calculate the base radius for each circle
    const radius = (Math.max(width, height) / 1 + glowOffset) * radiusScale;

    // Define centers for three circles (left, center, right)
    const centerY = (height + 3 * (glowOffset + glowWidth)) / 3 + yOffset;
    const centersX = [
         (offscreenCanvas.width / 0.95) - circleSpacing, // Left circle
       
       
        (offscreenCanvas.width / 95) + circleSpacing // Right circle
    ];

        // Determine gradient type and blending factor for smooth transition
    const cycleTime = time % 60; // Cycle every 60 seconds
    const transitionDuration = 4; // 4-second fade for smoother transition
    let linearWeight = 1;
    let radialWeight = 0;
    if (cycleTime < 30) {
        // Linear phase (0–30 seconds)
        if (cycleTime > 26) {
            // Fade to radial over 4 seconds (26–30)
            const t = (cycleTime - 26) / transitionDuration;
            linearWeight = Math.cos(t * Math.PI / 2); // Cosine easing for smoothness
            radialWeight = 1 - linearWeight;
        }
    } else {
        // Radial phase (30–60 seconds)
        if (cycleTime > 56) {
            // Fade to linear over 4 seconds (56–60)
            const t = (cycleTime - 56) / transitionDuration;
            radialWeight = Math.cos(t * Math.PI / 2); // Cosine easing
            linearWeight = 1 - radialWeight;
        } else {
            linearWeight = 0;
            radialWeight = 1;
        }
    }

    // Helper function to normalize color stop positions to [0, 1]
    const normalizeStop = (stop) => {
        return ((stop % 1) + 1) % 1; // Ensures stop is between 0 and 1
    };

    

    // Create wavy circular glow for each circle
    offCtx.shadowBlur = blurRadius;
    offCtx.shadowColor = 'rgba(255, 162, 232, 0.37)'; // Soft white for glow effect

    centersX.forEach((centerX, index) => {
        offCtx.beginPath();
        const segments = 460; // Number of segments for smooth circle
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * 2 * Math.PI; // Angle in radians
            // Calculate wave offset with phase shift for each circle
            const phaseShift = (index * 2 * Math.PI) / 10; // Offset waves for visual variety
            const wave = Math.sin(waveFrequency * angle + time * animationSpeed + phaseShift) * waveAmplitude;
            const currentRadius = radius + wave;

            // Calculate point on circular path
            const glowX = centerX + currentRadius * Math.cos(angle);
            const glowY = centerY + currentRadius * Math.sin(angle);

            if (i === 0) {
                offCtx.moveTo(glowX, glowY);
            } else {
                offCtx.lineTo(glowX, glowY);
            }
        }
        offCtx.closePath();

         // Create gradients with extended range
        const linearGradient = offCtx.createLinearGradient(
            centerX - radius * 1.2, centerY + radius * 1.2, // Bottom left (extended)
            centerX + radius * 1.2, centerY - radius * 1.2 // Top right (extended)
        );
        const radialGradient = offCtx.createRadialGradient(
            centerX, centerY, 0, // Inner circle (zero for full spread)
            centerX, centerY, radius * 1.3 // Outer circle (aligned with linear extent)
        );

        // Generate color stops to ensure middle colors reach edges
        const colorOffset = Math.sin(time * 3.2) * 3.2; // Subtler wave
        const stopPositions = [1, 0.8, 0.6, 0.4, 0.2, 0]; // 6 stops for even distribution
        const colorIndices = [
            0, // babyBlue at start
            1, // babyGreen
            2, // babyYellow
            3, // babyOrange
            4, // babyPink
            0  // babyBlue at end
        ];

        stopPositions.forEach((pos, i) => {
            const stopPos = normalizeStop(pos + colorOffset);
            const colorIndex = colorIndices[i];
            const rgbColor = `rgb(${colors[colorIndex].r}, ${colors[colorIndex].g}, ${colors[colorIndex].b})`;
            
            if (linearWeight > 0) {
                linearGradient.addColorStop(stopPos, rgbColor);
            }
            if (radialWeight > 0) {
                radialGradient.addColorStop(stopPos, rgbColor);
            }
        });

        // Blend gradients if in transition
        offCtx.strokeStyle = linearWeight >= 1 ? linearGradient : radialWeight >= 1 ? radialGradient : (() => {
            const blendedCanvas = document.createElement('canvas');
            blendedCanvas.width = offscreenCanvas.width;
            blendedCanvas.height = offscreenCanvas.height;
            const blendedCtx = blendedCanvas.getContext('2d');
            blendedCtx.globalAlpha = linearWeight;
            blendedCtx.fillStyle = linearGradient;
            blendedCtx.fillRect(0, 0, blendedCanvas.width, blendedCanvas.height);
            blendedCtx.globalAlpha = radialWeight;
            blendedCtx.fillStyle = radialGradient;
            blendedCtx.fillRect(0, 0, blendedCanvas.width, blendedCanvas.height);
            return blendedCtx.createPattern(blendedCanvas, 'no-repeat');
        })();
        
        offCtx.lineWidth = glowWidth * 1.62; // Consistent with your code
        offCtx.globalAlpha = 0.055; // Subtle transparency
        offCtx.stroke();
    });
 

    // Reset context properties
    offCtx.globalAlpha = 0.5;
    offCtx.shadowBlur = 0.5;

    // Draw to main canvas
    ctx.drawImage(offscreenCanvas, x - (glowOffset + glowWidth + (offscreenCanvas.width - width) / 2 - glowWidth), y - (glowOffset + glowWidth));
    return offscreenCanvas; // Return for image export
}

function createGradientBorder2(ctx, img, x, y, width, height, time) {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width + 220; // Increased for three circles
    offscreenCanvas.height = height + 80; // Consistent with height
    const offCtx = offscreenCanvas.getContext('2d');

       // Colors (in RGB for interpolation)
    const colors = [
        { r: 173, g: 216, b: 230, hex: '#ADD8E6' }, // babyBlue
        { r: 175, g: 255, b: 172, hex: '#afffacff' }, // babyGreen
        { r: 255, g: 248, b: 156, hex: '#fff89cff' }, // babyYellow
        { r: 255, g: 189, b: 156, hex: '#ffbd9cff' }, // babyOrange
        { r: 255, g: 172, b: 233, hex: '#fface9ff' }, // babyPink
        { r: 173, g: 216, b: 230, hex: '#ADD8E6' } // babyBlue (loop back)
    ];

    // Glow properties
    const glowWidth = 30; // Base width of the glow
    const glowOffset = 2; // Distance from image edge
    const waveAmplitude = 2; // Amplitude of the wave effect
    const waveFrequency = 20; // Number of waves around each circle
    const animationSpeed = 1; // Speed of the animation
    const blurRadius = 5; // Blur for softness
    const radiusScale = 0.1; // Scale to match current glow size
    const circleSpacing = (Math.max(width, height) / 2 + glowOffset) * radiusScale * 2.5; // Spacing between circles

    

    
    // Calculate the base radius for each circle
    const radius = (Math.max(width, height) / 2 + glowOffset) * radiusScale;

    // Define centers for three circles (left, center, right)
    const centerY = (height + 2 * (glowOffset + glowWidth)) / 2 ;
    const centersX = [
        (offscreenCanvas.width / 3.05) - circleSpacing, // Left circle
        offscreenCanvas.width / 2, // Center circle
        (offscreenCanvas.width / 1.495) + circleSpacing // Right circle
    ];

        // Determine gradient type and blending factor for smooth transition
    const cycleTime = time % 60; // Cycle every 60 seconds
    const transitionDuration = 4; // 4-second fade for smoother transition
    let linearWeight = 1;
    let radialWeight = 0;
    if (cycleTime < 30) {
        // Linear phase (0–30 seconds)
        if (cycleTime > 26) {
            // Fade to radial over 4 seconds (26–30)
            const t = (cycleTime - 26) / transitionDuration;
            linearWeight = Math.cos(t * Math.PI / 2); // Cosine easing for smoothness
            radialWeight = 1 - linearWeight;
        }
    } else {
        // Radial phase (30–60 seconds)
        if (cycleTime > 56) {
            // Fade to linear over 4 seconds (56–60)
            const t = (cycleTime - 56) / transitionDuration;
            radialWeight = Math.cos(t * Math.PI / 2); // Cosine easing
            linearWeight = 1 - radialWeight;
        } else {
            linearWeight = 0;
            radialWeight = 1;
        }
    }

    // Helper function to normalize color stop positions to [0, 1]
    const normalizeStop = (stop) => {
        return ((stop % 1) + 1) % 1; // Ensures stop is between 0 and 1
    };

    

    // Create wavy circular glow for each circle
    offCtx.shadowBlur = blurRadius;
    offCtx.shadowColor = 'rgba(255, 162, 232, 0.37)'; // Soft white for glow effect

    centersX.forEach((centerX, index) => {
        offCtx.beginPath();
        const segments = 360; // Number of segments for smooth circle
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * 2 * Math.PI; // Angle in radians
            // Calculate wave offset with phase shift for each circle
            const phaseShift = (index * 2 * Math.PI) / 8; // Offset waves for visual variety
            const wave = Math.sin(waveFrequency * angle + time * animationSpeed + phaseShift) * waveAmplitude;
            const currentRadius = radius + wave;

            // Calculate point on circular path
            const glowX = centerX + currentRadius * Math.cos(angle);
            const glowY = centerY + currentRadius * Math.sin(angle);

            if (i === 0) {
                offCtx.moveTo(glowX, glowY);
            } else {
                offCtx.lineTo(glowX, glowY);
            }
        }
        offCtx.closePath();

         // Create gradients with extended range
        const linearGradient = offCtx.createLinearGradient(
            centerX - radius * 1.2, centerY + radius * 1.2, // Bottom left (extended)
            centerX + radius * 1.2, centerY - radius * 1.2 // Top right (extended)
        );
        const radialGradient = offCtx.createRadialGradient(
            centerX, centerY, 0, // Inner circle (zero for full spread)
            centerX, centerY, radius * 1.3 // Outer circle (aligned with linear extent)
        );

        // Generate color stops to ensure middle colors reach edges
        const colorOffset = Math.sin(time * 3.2) * 3.2; // Subtler wave
        const stopPositions = [1, 0.8, 0.6, 0.4, 0.2, 0]; // 6 stops for even distribution
        const colorIndices = [
            0, // babyBlue at start
            1, // babyGreen
            2, // babyYellow
            3, // babyOrange
            4, // babyPink
            0  // babyBlue at end
        ];

        stopPositions.forEach((pos, i) => {
            const stopPos = normalizeStop(pos + colorOffset);
            const colorIndex = colorIndices[i];
            const rgbColor = `rgb(${colors[colorIndex].r}, ${colors[colorIndex].g}, ${colors[colorIndex].b})`;
            
            if (linearWeight > 0) {
                linearGradient.addColorStop(stopPos, rgbColor);
            }
            if (radialWeight > 0) {
                radialGradient.addColorStop(stopPos, rgbColor);
            }
        });

        // Blend gradients if in transition
        offCtx.strokeStyle = linearWeight >= 1 ? linearGradient : radialWeight >= 1 ? radialGradient : (() => {
            const blendedCanvas = document.createElement('canvas');
            blendedCanvas.width = offscreenCanvas.width;
            blendedCanvas.height = offscreenCanvas.height;
            const blendedCtx = blendedCanvas.getContext('2d');
            blendedCtx.globalAlpha = linearWeight;
            blendedCtx.fillStyle = linearGradient;
            blendedCtx.fillRect(0, 0, blendedCanvas.width, blendedCanvas.height);
            blendedCtx.globalAlpha = radialWeight;
            blendedCtx.fillStyle = radialGradient;
            blendedCtx.fillRect(0, 0, blendedCanvas.width, blendedCanvas.height);
            return blendedCtx.createPattern(blendedCanvas, 'no-repeat');
        })();
        
        offCtx.lineWidth = glowWidth * 3.16; // Consistent with your code
        offCtx.globalAlpha = 0.15; // Subtle transparency
        offCtx.stroke();
    });
 
    // Draw Alyup.png centered in the offscreen canvas
    offCtx.drawImage(img, glowOffset + glowWidth + (offscreenCanvas.width - width) / 2 - glowWidth, glowOffset + glowWidth, width, height);



    // Reset context properties
    offCtx.globalAlpha = 0.5;
    offCtx.shadowBlur = 0.5;

    // Draw to main canvas
    ctx.drawImage(offscreenCanvas, x - (glowOffset + glowWidth + (offscreenCanvas.width - width) / 2 - glowWidth), y - (glowOffset + glowWidth));
    return offscreenCanvas; // Return for image export
}

// Updated drawMenu function (with fix for 'time' variable)
function drawMenu() {
    const time = performance.now() / 1000; // Define time at the top for all pulsing effects
    audioManager.playMenuBgm();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Alyup.png with animated gradient border
    if (alyupImg.complete && alyupImg.naturalHeight !== 0) {
        const imgWidth = canvas.width * 0.5; // 20% of canvas width for responsiveness
        const imgHeight = alyupImg.naturalHeight * (imgWidth / alyupImg.naturalWidth); // Maintain aspect ratio
        const centerX = canvas.width / 2;
        const y = canvas.height / 2 - 400; // Kept from your code
        const x = centerX - imgWidth / 2;
        createGradientBorder(ctx, alyupImg, x, y, imgWidth, imgHeight, time);
        createGradientBorder2(ctx, alyupImg, x, y, imgWidth, imgHeight, time);
    }
    // Ball selection button
    const ballButton = {
        x: canvas.width / 2 - 85,
        y: canvas.height / 2 - 300,
        width: 170,
        height: 40
    };
    ctx.fillStyle = '#080816ff';
    ctx.fillRect(ballButton.x, ballButton.y, ballButton.width, ballButton.height);
    const outlinePulse = Math.sin(time * 2) * 2 + 3;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time * 2) * 0.2})`;
    ctx.lineWidth = outlinePulse;
    ctx.strokeRect(ballButton.x, ballButton.y, ballButton.width, ballButton.height);
    ctx.font = '22px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('SELECT BALL', canvas.width / 2 - 2, ballButton.y + 28);

    // Level selection grid
     
    
    ctx.font = '30px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL SELECT', canvas.width / 2 + 5, canvas.height / 2 - 180);
    ctx.font = '16px Arial';
    for (let level = 1; level <= 100; level++) {
        const row = Math.floor((level - 1) / LEVELS_PER_ROW);
        const col = (level - 1) % LEVELS_PER_ROW;
        const x = GRID_START_X + col * (BUTTON_WIDTH + BUTTON_SPACING);
        const y = GRID_START_Y + row * (BUTTON_HEIGHT + BUTTON_SPACING);
        ctx.fillStyle = (level <= highestLevelCompleted + 1 || allLevelsUnlocked) ? '#080816ff' : '#555';
        ctx.fillRect(x, y, BUTTON_WIDTH, BUTTON_HEIGHT);
        ctx.fillStyle = '#fff';
       
        ctx.fillText(`${level}`, x + BUTTON_WIDTH / 2 + 0, y + BUTTON_HEIGHT / 2 + 5);
    }

    // Close button
    const closeButton = {
    x: canvas.width / 2 - 50,
    y: canvas.height / 2 + 360,
    width: 100,
    height: 40
};
ctx.fillStyle = '#080816ff';
ctx.fillRect(closeButton.x, closeButton.y, closeButton.width, closeButton.height);
ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time * 2) * 0.2})`;
ctx.lineWidth = outlinePulse;
ctx.strokeRect(closeButton.x, closeButton.y, closeButton.width, closeButton.height);
ctx.fillStyle = '#fff';
ctx.font = '22px Arial';
ctx.fillText('CLOSE', canvas.width / 2 - 1, closeButton.y + 28);


    // Unlock All Levels button
    const unlockButton = { x: 10, y: 10, width: 50, height: 50 };
    if (keys.has('UnlockDev')) {
        ctx.fillStyle = '#f00';
        ctx.fillRect(unlockButton.x, unlockButton.y, unlockButton.width, unlockButton.height);
        ctx.fillStyle = '#fff';
        ctx.fillText('Unlock All', unlockButton.x + unlockButton.width / 2, unlockButton.y + unlockButton.height / 2 + 5);
    }


 // Draw audio controls
    ctx.save();
    ctx.globalAlpha = 0.3; // Base opacity
    const hover = Math.sin(time * 2) * 0.2 + 0.8; // Hover effect

    // Music volume slider
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(audioControls.musicVolume.x, audioControls.musicVolume.y, audioControls.musicVolume.width, audioControls.musicVolume.height);
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(audioControls.musicVolume.x, audioControls.musicVolume.y, audioControls.musicVolume.width, audioControls.musicVolume.height);
    ctx.fillStyle = 'yellow';
    const thumbX = audioControls.musicVolume.x + audioControls.musicVolume.value * audioControls.musicVolume.width - 5;
    ctx.fillRect(thumbX, audioControls.musicVolume.y - 5, 10, audioControls.musicVolume.height + 10);
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 5;
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText('Music', audioControls.musicVolume.x - 50, audioControls.musicVolume.y + 10);

    // Music mute button
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(audioControls.musicMute.x, audioControls.musicMute.y, audioControls.musicMute.width, audioControls.musicMute.height);
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.strokeRect(audioControls.musicMute.x, audioControls.musicMute.y, audioControls.musicMute.width, audioControls.musicMute.height);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(audioControls.musicMute.text, audioControls.musicMute.x + 5, audioControls.musicMute.y + 15);

    // SFX volume slider
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(audioControls.sfxVolume.x, audioControls.sfxVolume.y, audioControls.sfxVolume.width, audioControls.sfxVolume.height);
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.strokeRect(audioControls.sfxVolume.x, audioControls.sfxVolume.y, audioControls.sfxVolume.width, audioControls.sfxVolume.height);
    ctx.fillStyle = 'yellow';
    const sfxThumbX = audioControls.sfxVolume.x + audioControls.sfxVolume.value * audioControls.sfxVolume.width - 5;
    ctx.fillRect(sfxThumbX, audioControls.sfxVolume.y - 5, 10, audioControls.sfxVolume.height + 10);
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText('SFX', audioControls.sfxVolume.x - 50, audioControls.sfxVolume.y + 10);

    // SFX mute button
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(audioControls.sfxMute.x, audioControls.sfxMute.y, audioControls.sfxMute.width, audioControls.sfxMute.height);
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.strokeRect(audioControls.sfxMute.x, audioControls.sfxMute.y, audioControls.sfxMute.width, audioControls.sfxMute.height);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(audioControls.sfxMute.text, audioControls.sfxMute.x + 5, audioControls.sfxMute.y + 15);

    // Show Controls on PC toggle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(audioControls.showControls.x, audioControls.showControls.y, audioControls.showControls.width, audioControls.showControls.height);
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.strokeRect(audioControls.showControls.x, audioControls.showControls.y, audioControls.showControls.width, audioControls.showControls.height);
    if (audioControls.showControls.checked) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(audioControls.showControls.x + 2, audioControls.showControls.y + 2, audioControls.showControls.width - 4, audioControls.showControls.height - 4);
    }
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText('Show Controls on PC', audioControls.showControls.x + 95, audioControls.showControls.y + 15);
    ctx.restore();
}



// Function to export the modified Alyup.png as an image file
function exportAlyupImage() {
    if (!alyupImg.complete || alyupImg.naturalHeight === 0) {
        console.error('Alyup.png not loaded');
        return;
    }
    const imgWidth = alyupImg.naturalWidth;
    const imgHeight = alyupImg.naturalHeight;
    const offscreenCanvas = createGradientBorder(
        ctx,
        alyupImg,
        0,
        0,
        imgWidth,
        imgHeight,
        performance.now() / 1000
    );
    const dataUrl = offscreenCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'Alyup_with_gradient.png';
    link.click();
}

// Add a button or keybinding to trigger export (e.g., press 'E' to export)
document.addEventListener('keydown', (e) => {
    if (e.key === 'e' && (isMenuOpen || currentLevel === 0)) {
        exportAlyupImage();
    }
});

// Helper function to draw a rounded rectangle (place before drawScoreboard)
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}

function drawScoreboard() {
    ctx.save();

    // Responsive rectangle dimensions and position
    const rectX = canvas.width * 0.005; // 10px / 700px ≈ 0.0143
    const rectY = canvas.height * 0.0106; // 10px / 940px ≈ 0.0106
    const rectWidth = canvas.width * 0.99; // 280px / 700px = 0.4
    const rectHeight = canvas.height * 0.1064; // 100px / 940px ≈ 0.1064
     const borderRadius = canvas.width * 0.006; // Responsive corner radius (e.g., 10px at 700px canvas)

   // Draw rounded rectangle with 25% transparency for fill
    drawRoundedRect(ctx, rectX, rectY, rectWidth, rectHeight, borderRadius);
    ctx.fillStyle = '#080816ff'; // Dark blue
    ctx.globalAlpha = 0.50; // 75% opacity (25% transparent)
    ctx.fill();
    ctx.globalAlpha = 1; // Reset to fully opaque for stroke and other drawings
    ctx.strokeStyle = '#fffffeff'; // White border
    ctx.lineWidth = canvas.width * 0.001; // Updated line width
    ctx.stroke();
    

    // Responsive text
    const fontSize = canvas.width * 0.0275; // 20px / 700px ≈ 0.0286
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'left';
    ctx.fillText('ALYUP', rectX + canvas.width * 0.0143, rectY + canvas.height * 0.025); // (20, 40) → (0.0143 * width, 0.0426 * height)
    ctx.fillText(`Level: ${currentLevel}`, rectX + canvas.width * 0.1143, rectY + canvas.height * 0.025); // (150, 70) → (0.2143 * width, 0.0745 * height)
    ctx.fillStyle = '#FFF';
    ctx.fillText(`Time: ${formatTime(elapsedTime)}`, rectX + canvas.width * 0.0143, rectY + canvas.height * 0.0732); // (10, 50) → (0.0143 * width, 0.0532 * height)
    ctx.fillText(`Best: ${bestTimes[currentLevel] ? formatTime(bestTimes[currentLevel]) : '--:--:--'}`, rectX + canvas.width * 0.25, rectY + canvas.height * 0.0732); // (175, 50) → (0.25 * width, 0.0532 * height)
    ctx.fillText(`Score: ${score + getScrollScore()}`, rectX + canvas.width * 0.0143, rectY + canvas.height * 0.095); // (20, 70) → (0.0143 * width, 0.0745 * height)
    ctx.fillText(`High Score: ${highScore}`, rectX + canvas.width * 0.25, rectY + canvas.height * 0.095); // (20, 100) → (0.0143 * width, 0.1064 * height)
    

    // Responsive menu button
   
      // Draw menu button (centered in scoreboard)
    const cx = menuButton.x + menuButton.size / 2; // Center of button
    const cy = menuButton.y + menuButton.size / 2;
    const radius = keys.has('Menu') ? (menuButton.size / 2) * 0.8 : menuButton.size / 2;
    const pulse = (Math.sin(Date.now() / 200) + 1) / 2;

    ctx.beginPath();
    ctx.arc(cx, cy, radius + (pulse * canvas.width * uiConfig.pulseAmplitude + canvas.width * uiConfig.pulseBase), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = keys.has('Menu') ? '#080816ff' : '#0f0f2bcc';
    ctx.fill();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = canvas.width * 0.000714;
    ctx.stroke();

    if (menuButton.img.complete && menuButton.img.naturalHeight !== 0) {
        const imgSize = keys.has('Menu') ? menuButton.size * 0.8 : menuButton.size * 0.9;
        const imgX = cx - imgSize / 2;
        const imgY = cy - imgSize / 2;
        ctx.drawImage(menuButton.img, imgX, imgY, imgSize, imgSize);
    }

    ctx.restore();
}



function drawGloveIndicators() {
    ctx.save();

    // Responsive rectangle dimensions and position (99% canvas width)
    const rectWidth = canvas.width * 0.99; // 99% of canvas width
    const rectX = canvas.width * 0.005; // 0.5% padding on each side
    const rectHeight = canvas.height * 0.1064; // Match scoreboard height
    const rectY = canvas.height * gloveIndicatorConfig.startY - rectHeight / 2; // Center vertically around indicators
    const borderRadius = canvas.width * 0.0143; // Responsive corner radius (~10px at 700px)

  

    // Existing glove indicators code
    const circleSize = canvas.width * gloveIndicatorConfig.circleSize;
    const spacing = Math.max(5, canvas.width * gloveIndicatorConfig.spacing);
    const startX = canvas.width - (circleSize * 3 + spacing * 2) + (canvas.width * gloveIndicatorConfig.startXOffset);
    const startY = canvas.height * gloveIndicatorConfig.startY;

    // Declare pulse once at the top
    const pulse = (Math.sin(Date.now() / 200) + 1) / 2; // Pulse effect (0 to 1)

    // Draw "BOOST" text above the circles with pulsing effect
    ctx.globalAlpha = 0.5 + 0.8 * pulse;
    ctx.font = `${Math.max(12, canvas.width * gloveIndicatorConfig.activateTextFontSize)}px Arial`;
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.fillText('BOOST', startX + (circleSize * 1.5 + spacing) + (canvas.width * gloveIndicatorConfig.activateTextOffsetX), startY + (canvas.height * gloveIndicatorConfig.boostTextOffsetY));
    ctx.globalAlpha = 1;

    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(startX + (circleSize + spacing) * i, startY, circleSize / 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = canvas.width * 0.00143;
        ctx.shadowBlur = canvas.width * gloveIndicatorConfig.glowBlur;
        ctx.shadowColor = 'rgba(0, 255, 0, 0.5)';
        if (player.gloveCount >= 3) {
            ctx.globalAlpha = 0.5 + 0.85 * pulse;
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        if (player.gloveCount > i) {
            ctx.drawImage(leftGloveImg, startX + (circleSize + spacing) * i - circleSize / 2, startY - circleSize / 2, circleSize, circleSize);
            if (player.gloveCount >= 3) {
                ctx.globalAlpha = 0.5 + 0.85 * pulse;
                ctx.drawImage(leftGloveImg, startX + (circleSize + spacing) * i - circleSize / 2, startY - circleSize / 2, circleSize, circleSize);
                ctx.globalAlpha = 1;
            }
        }
    }

    // Draw "Press Up to Activate" text below the circles with pulsing effect
    ctx.globalAlpha = 0.5 + 0.8 * pulse;
    ctx.fillStyle = '#FFF';
    ctx.font = `${Math.max(10, canvas.width * gloveIndicatorConfig.activateTextFontSize)}px Arial`;
    ctx.fillText(
        'Press Up to Activate',
        startX + (circleSize * 1.5 + spacing) + (canvas.width * gloveIndicatorConfig.activateTextOffsetX),
        startY + (canvas.height * gloveIndicatorConfig.activateTextOffsetY)
    );
    ctx.globalAlpha = 1;

    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    

    if (isMenuOpen) {
        drawMenu();
        return;
    }

    if (currentLevel === 0 && !isMenuOpen) {
        drawMenu(); // Initial menu state
        return;
    }

    updateOpacityAnimation((lastTime > 0 ? (performance.now() - lastTime) / 1000 : 0));

    if (backgroundImg.complete && backgroundImg.naturalHeight !== 0) {
        ctx.save();
        ctx.globalAlpha = currentOpacity;
       // Preserve background image aspect ratio
        const imgAspect = backgroundImg.naturalWidth / backgroundImg.naturalHeight;
        const canvasAspect = canvas.width / canvas.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgAspect > canvasAspect) {
            // Image is wider than canvas: fit height, crop width
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgAspect;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        } else {
            // Image is taller than canvas: fit width, crop height
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgAspect;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        }

        ctx.drawImage(backgroundImg, offsetX, offsetY, drawWidth, drawHeight);
         // Draw background2.png just above backgroundImg
     // Draw background2Img with pulsing glow effect
    if (background2Img.complete && background2Img.naturalWidth !== 0) {
        // Update pulse time to match platform animation
        background2PulseTime += platformPulseSpeed / 60; // Sync with frame rate
        const pulse = Math.sin(background2PulseTime * Math.PI * 2) * 0.01235 + 0.005;
        
        // Save context to isolate glow effect
        ctx.save();
        ctx.globalAlpha = 0.50; // Full opacity, no animation
        ctx.shadowBlur = 10 * pulse; // Pulse between ~7 and ~13
        ctx.shadowColor = 'rgba(0, 0, 0, 0.68)'; // Green glow, matching platforms
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.translate(offsetX + drawWidth / 2, offsetY + drawHeight / 2); // Center for rotation
    ctx.rotate(pulse);
    ctx.translate(-drawWidth / 2, -drawHeight / 2); // Adjust for image center
    ctx.drawImage(background2Img, 0, 0, drawWidth, drawHeight);
    
        ctx.restore();
    }
    if (background3Img.complete && background3Img.naturalWidth !== 0) {
    background3PulseTime += platformPulseSpeed / 60;
    const pulse = Math.sin(background3PulseTime * Math.PI * 2) * 0.00125 + 0.125; // Opacity from 0.6 to 1.0
    ctx.save();
    ctx.globalAlpha = pulse; // Animate opacity
    ctx.drawImage(background3Img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();
}
        ctx.restore();
       
    }

    platforms.forEach(p => p.draw());
    movingPlatforms.forEach(p => p.draw());
    gloves.forEach(g => g.draw());
    player.draw();

    
    drawGloveIndicators();
    drawTouchButtons();
    drawScoreboard();

    if (levelComplete) {
        ctx.fillStyle = '#080816ff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
         ctx.font = `${0.0571 * canvas.width}px Arial`; // 40px / 700px
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(`Level ${currentLevel} Complete!`, canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillText(`Score: ${getTotalScore()}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 50); // Added high score
        ctx.fillText(`Time: ${formatTime(elapsedTime)}`, canvas.width / 2, canvas.height / 2 + 110); // Added current time
        ctx.fillText(
            `Best Time: ${bestTimes[currentLevel] ? formatTime(bestTimes[currentLevel]) : '--:--:--'}`,
            canvas.width / 2,
            canvas.height / 2 + 160
        ); // Added best time
        

        
        
        const buttonWidth = 0.2857 * canvas.width; // 200px / 700px
        const buttonHeight = 0.0532 * canvas.height; // 50px / 940px
        const buttonX = canvas.width / 2 - buttonWidth / 2;
        const buttonY = canvas.height / 2 + 50;
        const nextButtonY = canvas.height / 2 + 150; // Adjusted to make space
        const retryButtonY = nextButtonY + buttonHeight + buttonSpacing;
        
        
           // Next Level button
        ctx.fillStyle = '#080816ff';
        ctx.fillRect(buttonX, nextButtonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(performance.now() / 500) * 0.2})`;
        ctx.lineWidth = canvas.width * 0.001;
        ctx.strokeRect(buttonX, nextButtonY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#FFD700';
        ctx.font = `${0.0286 * canvas.width}px Arial`; // 20px / 700px
        ctx.fillText('Next Level', canvas.width / 2, nextButtonY + buttonHeight / 2 - 160);

        // Retry Level button
        ctx.fillStyle = '#080816ff';
        ctx.fillRect(buttonX, retryButtonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(performance.now() / 500) * 0.2})`;
        ctx.lineWidth = canvas.width * 0.001;
        ctx.strokeRect(buttonX, retryButtonY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#FFD700';
        ctx.fillText('Retry Level', canvas.width / 2, retryButtonY + buttonHeight / 2 - 190);
    }

    if (currentEffectUpdate) {
        currentEffectUpdate((lastTime > 0 ? (performance.now() - lastTime) / 1000 : 0));
    }
    renderer.render(scene, camera);
}

// Ensure resize handler is called initially
handleResize();
window.addEventListener('resize', handleResize);

// Game loop
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    update(deltaTime);

    if (currentEffectUpdate) {
        currentEffectUpdate(deltaTime);
    }
    camera.position.y = -scrollY / 100;
    
    renderer.render(scene, camera);

    draw();
    requestAnimationFrame(gameLoop);
}

    // Initialize
handleResize();
// setupBackground2(); // Initialize background2.png
currentLevel = 0;
setGameState('menu');
requestAnimationFrame(gameLoop);