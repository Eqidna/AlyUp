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
const leftGloveImg = new Image(); leftGloveImg.src = 'assets/leftglove.png';
const rightGloveImg = new Image(); rightGloveImg.src = 'assets/rightglove.png';
const backgroundImg = new Image(); backgroundImg.src = 'assets/background.jpg';

// Three.js setup
const backgroundDiv = document.getElementById('background');
const renderer = new THREE.WebGLRenderer();
renderer.setSize(canvas.width, canvas.height);
backgroundDiv.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
camera.position.z = 5;

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

// Particle effect functions
function createStars(level) {
    const baseCount = 5000;
    const count = level > 1 ? Math.floor(baseCount * (1 + (level - 1) / 50)) : baseCount;
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.051,
        transparent: true,
        vertexColors: true
    });
    const starsPositions = [];
    const starsOpacities = [];
    const starsColors = [];
    const hueOffsets = [];
    for (let i = 0; i < count; i++) {
        starsPositions.push((Math.random() - 0.5) * 10);
        starsPositions.push((Math.random() - 0.5) * 450);
        starsPositions.push((Math.random() - 0.5) * 5);
        starsOpacities.push(Math.random());
        hueOffsets.push(Math.random());
        const hslColor = new THREE.Color().setHSL(hueOffsets[i], 1, 0.5);
        starsColors.push(hslColor.r, hslColor.g, hslColor.b);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute('opacity', new THREE.Float32BufferAttribute(starsOpacities, 1));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    return function updateStars(deltaTime) {
        const opacities = starsGeometry.attributes.opacity.array;
        const colors = starsGeometry.attributes.color.array;
        for (let i = 0; i < count; i++) {
            opacities[i] += (Math.random() - 0.02) * 0.1;
            opacities[i] = Math.max(0, Math.min(1, opacities[i]));
            hueOffsets[i] += deltaTime * 0.1;
            if (hueOffsets[i] > 1) hueOffsets[i] -= 1;
            const hslColor = new THREE.Color().setHSL(hueOffsets[i], 1, 0.5);
            colors[i * 3] = hslColor.r;
            colors[i * 3 + 1] = hslColor.g;
            colors[i * 3 + 2] = hslColor.b;
        }
        starsGeometry.attributes.opacity.needsUpdate = true;
        starsGeometry.attributes.color.needsUpdate = true;
    };
}

function createLines(level) {
    const linesGroup = new THREE.Group();
    
    const baseLineCount = 250;
    const lineCount = level > 8 ? Math.floor(baseLineCount * (1 + (level - 1) / 150)) : baseLineCount;
    const lineLengths = [];
    const lineHueOffsets = [];
    for (let i = 0; i < lineCount; i++) {
        const y = (Math.random() - 0.5) * 1000;
        const z = (Math.random() - 0.5) * 10;
        const length = Math.random() * 18 + 2;
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({ vertexColors: true });
        const positions = [-length / 2, 0, 0, length / 2, 0, 0];
        const colors = [];
        const hue1 = Math.random();
        const hue2 = (hue1 + 0.3) % 1;
        const color1 = new THREE.Color().setHSL(hue1, 1, 0.5);
        const color2 = new THREE.Color().setHSL(hue2, 1, 0.5);
        colors.push(color1.r, color1.g, color1.b, color2.r, color2.g, color2.b);
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.position.set(-10, y, z);
        linesGroup.add(line);
        lineLengths.push(length);
        lineHueOffsets.push([hue1, hue2]);
    }

    const baseStarCount = 6000;
    const starCount = level > 8 ? Math.floor(baseStarCount * (1 + (level - 1) / 50)) : baseStarCount;
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.051,
        transparent: true,
        vertexColors: true
    });
    const starsPositions = [];
    const starsOpacities = [];
    const starsColors = [];
    const starsHueOffsets = [];
    for (let i = 0; i < starCount; i++) {
        starsPositions.push((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 10);
        starsOpacities.push(Math.random());
        starsHueOffsets.push(Math.random());
        const hslColor = new THREE.Color().setHSL(starsHueOffsets[i], 1, 0.5);
        starsColors.push(hslColor.r, hslColor.g, hslColor.b);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute('opacity', new THREE.Float32BufferAttribute(starsOpacities, 1));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    linesGroup.add(stars);

    scene.add(linesGroup);

    return function updateLines(deltaTime) {
        linesGroup.children.forEach((line, index) => {
            if (index < lineCount) {
                line.position.x += 2 * deltaTime;
                if (line.position.x > 10) line.position.x = -10;
                const colors = line.geometry.attributes.color.array;
                lineHueOffsets[index][0] += deltaTime * 0.2;
                lineHueOffsets[index][1] = (lineHueOffsets[index][0] + 0.3) % 1;
                if (lineHueOffsets[index][0] > 1) lineHueOffsets[index][0] -= 1;
                const color1 = new THREE.Color().setHSL(lineHueOffsets[index][0], 1, 0.5);
                const color2 = new THREE.Color().setHSL(lineHueOffsets[index][1], 1, 0.5);
                colors[0] = color1.r; colors[1] = color1.g; colors[2] = color1.b;
                colors[3] = color2.r; colors[4] = color2.g; colors[5] = color2.b;
                line.geometry.attributes.color.needsUpdate = true;
            } else {
                const opacities = starsGeometry.attributes.opacity.array;
                const colors = starsGeometry.attributes.color.array;
                for (let i = 0; i < starCount; i++) {
                    opacities[i] += (Math.random() - 0.5) * 0.1;
                    opacities[i] = Math.max(0, Math.min(1, opacities[i]));
                    starsHueOffsets[i] += deltaTime * 0.2;
                    if (starsHueOffsets[i] > 1) starsHueOffsets[i] -= 1;
                    const hslColor = new THREE.Color().setHSL(starsHueOffsets[i], 1, 0.5);
                    colors[i * 3] = hslColor.r;
                    colors[i * 3 + 1] = hslColor.g;
                    colors[i * 3 + 2] = hslColor.b;
                }
                starsGeometry.attributes.opacity.needsUpdate = true;
                starsGeometry.attributes.color.needsUpdate = true;
            }
        });
    };
}

function createStarsAndGasClouds(level) {
    const group = new THREE.Group();
    scene.add(group);

    const baseStarCount = 5000;
    const starCount = level > 8 ? Math.floor(baseStarCount * (1 + (level - 1) / 50)) : baseStarCount;
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.051,
        transparent: true,
        vertexColors: true
    });
    const starsPositions = [];
    const starsOpacities = [];
    const starsColors = [];
    const starsHueOffsets = [];
    for (let i = 0; i < starCount; i++) {
        starsPositions.push((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 10);
        starsOpacities.push(Math.random());
        starsHueOffsets.push(Math.random());
        const hslColor = new THREE.Color().setHSL(starsHueOffsets[i], 1, 0.5);
        starsColors.push(hslColor.r, hslColor.g, hslColor.b);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute('opacity', new THREE.Float32BufferAttribute(starsOpacities, 1));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    group.add(stars);

    const baseSphereCount = 250;
    const sphereCount = level > 8 ? Math.floor(baseSphereCount * (1 + (level - 1) / 50)) : baseSphereCount;
    const spheres = [];
    const sphereHueOffsets = [];
    for (let i = 0; i < sphereCount; i++) {
        const geometry = new THREE.DodecahedronGeometry(0.5, 1);
        const hue = Math.random();
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(hue, 1, 0.5),
            wireframe: true
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 1000,
            (Math.random() - 0.5) * 10
        );
        group.add(sphere);
        spheres.push(sphere);
        sphereHueOffsets.push(hue);
    }

    const baseCubeCount = 100;
    const cloudCount = level > 8 ? Math.floor(baseCubeCount * (1 + (level - 1) / 50)) : baseCubeCount;
    const clouds = [];
    const cloudHueOffsets = [];
    const spawnInterval = 2;
    let timeSinceLastSpawn = 0;
    const maxClouds = 200;

    function spawnCloud() {
        if (clouds.length >= maxClouds) return;
        const geometry = (clouds.length % 2 === 0) 
            ? new THREE.TetrahedronGeometry(1, 1)
            : new THREE.DodecahedronGeometry(1, 1);
        const hue = Math.random();
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(hue, 1, 0.5),
            wireframe: true
        });
        const cloud = new THREE.Mesh(geometry, material);
        cloud.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 10);
        group.add(cloud);
        clouds.push(cloud);
        cloudHueOffsets.push(hue);
    }

    for (let i = 0; i < cloudCount; i++) {
        spawnCloud();
    }

    return function updateStarsAndGasClouds(deltaTime) {
        const starOpacities = starsGeometry.attributes.opacity.array;
        const starColors = starsGeometry.attributes.color.array;
        for (let i = 0; i < starCount; i++) {
            starOpacities[i] += (Math.random() - 0.5) * 0.1;
            starOpacities[i] = Math.max(0, Math.min(1, starOpacities[i]));
            starsHueOffsets[i] += deltaTime * 0.2;
            if (starsHueOffsets[i] > 1) starsHueOffsets[i] -= 1;
            const hslColor = new THREE.Color().setHSL(starsHueOffsets[i], 1, 0.5);
            starColors[i * 3] = hslColor.r;
            starColors[i * 3 + 1] = hslColor.g;
            starColors[i * 3 + 2] = hslColor.b;
        }
        starsGeometry.attributes.opacity.needsUpdate = true;
        starsGeometry.attributes.color.needsUpdate = true;

        spheres.forEach((sphere, index) => {
            sphere.position.y += 1 * deltaTime;
            if (sphere.position.y > 500) sphere.position.y = -500;
            sphereHueOffsets[index] += deltaTime * 0.2;
            if (sphereHueOffsets[index] > 1) sphereHueOffsets[index] -= 1;
            sphere.material.color.setHSL(sphereHueOffsets[index], 1, 0.5);
        });

        clouds.forEach((cloud, index) => {
            cloud.rotation.x += 0.5 * deltaTime;
            cloud.rotation.y += 0.5 * deltaTime;
            cloudHueOffsets[index] += deltaTime * 0.2;
            if (cloudHueOffsets[index] > 1) cloudHueOffsets[index] -= 1;
            cloud.material.color.setHSL(cloudHueOffsets[index], 1, 0.5);
        });

        timeSinceLastSpawn += deltaTime;
        if (timeSinceLastSpawn >= spawnInterval && clouds.length < maxClouds) {
            spawnCloud();
            timeSinceLastSpawn = 0;
        }
    };
}

function createCometTrail(level) {
    const group = new THREE.Group();
    
    const baseCometCount = 250;
    const cometCount = level > 8 ? Math.floor(baseCometCount * (1 + (level - 1) / 50)) : baseCometCount;
    const baseCometLength = 2;
    const comets = [];
    const cometHueOffsets = [];
    for (let i = 0; i < cometCount; i++) {
        const y = (Math.random() - 0.5) * 1000;
        const z = (Math.random() - 0.5) * 10;
        const length = baseCometLength * (0.5 + Math.random());
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({ vertexColors: true });
        const positions = [0, 0, 0, length, length, 0];
        const colors = [];
        const hue1 = Math.random();
        const hue2 = (hue1 + 0.3) % 1;
        const color1 = new THREE.Color().setHSL(hue1, 1, 0.5);
        const color2 = new THREE.Color().setHSL(hue2, 1, 0.5);
        colors.push(color1.r, color1.g, color1.b, color2.r, color2.g, color2.b);
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        const comet = new THREE.Line(lineGeometry, lineMaterial);
        comet.position.set(-10, y, z);
        group.add(comet);
        comets.push(comet);
        cometHueOffsets.push([hue1, hue2]);
    }

    const baseStarCount = 5000;
    const starCount = level > 8 ? Math.floor(baseStarCount * (1 + (level - 1) / 50)) : baseStarCount;
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.051,
        transparent: true,
        vertexColors: true
    });
    const starsPositions = [];
    const starsOpacities = [];
    const starsColors = [];
    const starsHueOffsets = [];
    for (let i = 0; i < starCount; i++) {
        starsPositions.push((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 10);
        starsOpacities.push(Math.random());
        starsHueOffsets.push(Math.random());
        const hslColor = new THREE.Color().setHSL(starsHueOffsets[i], 1, 0.5);
        starsColors.push(hslColor.r, hslColor.g, hslColor.b);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute('opacity', new THREE.Float32BufferAttribute(starsOpacities, 1));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    group.add(stars);

    const baseVortexCount = 5;
    const vortexCount = level > 8 ? Math.floor(baseVortexCount * (1 + (level - 1) / 50)) : baseVortexCount;
    const vortices = [];
    const vortexHueOffsets = [];
    for (let i = 0; i < vortexCount; i++) {
        const geometry = new THREE.SphereGeometry(2, 16, 16);
        const hue = Math.random();
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(hue, 1, 0.5),
            wireframe: true
        });
        const vortex = new THREE.Mesh(geometry, material);
        vortex.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 1000,
            10 + Math.random() * 5
        );
        group.add(vortex);
        vortices.push(vortex);
        vortexHueOffsets.push(hue);
    }

    scene.add(group);

    return function updateCometTrail(deltaTime) {
        comets.forEach((comet, index) => {
            comet.position.x += 2 * deltaTime;
            comet.position.y += 2 * deltaTime;
            if (comet.position.x > 10 || comet.position.y > 500) {
                comet.position.x = -10;
                comet.position.y = (Math.random() - 0.5) * 1000;
                comet.position.z = (Math.random() - 0.5) * 10;
            }
            const colors = comet.geometry.attributes.color.array;
            cometHueOffsets[index][0] += deltaTime * 0.2;
            cometHueOffsets[index][1] = (cometHueOffsets[index][0] + 0.3) % 1;
            if (cometHueOffsets[index][0] > 1) cometHueOffsets[index][0] -= 1;
            const color1 = new THREE.Color().setHSL(cometHueOffsets[index][0], 1, 0.5);
            const color2 = new THREE.Color().setHSL(cometHueOffsets[index][1], 1, 0.5);
            colors[0] = color1.r; colors[1] = color1.g; colors[2] = color1.b;
            colors[3] = color2.r; colors[4] = color2.g; colors[5] = color2.b;
            comet.geometry.attributes.color.needsUpdate = true;
        });

        const opacities = starsGeometry.attributes.opacity.array;
        const colors = starsGeometry.attributes.color.array;
        for (let i = 0; i < starCount; i++) {
            opacities[i] += (Math.random() - 0.5) * 0.1;
            opacities[i] = Math.max(0, Math.min(1, opacities[i]));
            starsHueOffsets[i] += deltaTime * 0.2;
            if (starsHueOffsets[i] > 1) starsHueOffsets[i] -= 1;
            const hslColor = new THREE.Color().setHSL(starsHueOffsets[i], 1, 0.5);
            colors[i * 3] = hslColor.r;
            colors[i * 3 + 1] = hslColor.g;
            colors[i * 3 + 2] = hslColor.b;
        }
        starsGeometry.attributes.opacity.needsUpdate = true;
        starsGeometry.attributes.color.needsUpdate = true;

        vortices.forEach((vortex, index) => {
            vortex.rotation.x += 0.3 * deltaTime;
            vortex.rotation.y += 0.3 * deltaTime;
            vortexHueOffsets[index] += deltaTime * 0.2;
            if (vortexHueOffsets[index] > 1) vortexHueOffsets[index] -= 1;
            vortex.material.color.setHSL(vortexHueOffsets[index], 1, 0.5);
        });
    };
}

function createBubbles(level) {
    const group = new THREE.Group();
    const spheres = [];
    
    const baseSphereCount = 250;
    const sphereCount = level > 8 ? Math.floor(baseSphereCount * (1 + (level - 1) / 50)) : baseSphereCount;
    const sphereHueOffsets = [];

    for (let i = 0; i < sphereCount; i++) {
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const hue = Math.random();
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(hue, 1, 0.5),
            wireframe: true
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 1000,
            (Math.random() - 0.5) * 10
        );
        group.add(sphere);
        spheres.push(sphere);
        sphereHueOffsets.push(hue);
    }

    const baseStarCount = 5000;
    const starCount = level > 8 ? Math.floor(baseStarCount * (1 + (level - 1) / 50)) : baseStarCount;
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.051,
        transparent: true,
        vertexColors: true
    });
    const starsPositions = [];
    const starsOpacities = [];
    const starsColors = [];
    const starsHueOffsets = [];
    for (let i = 0; i < starCount; i++) {
        starsPositions.push((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 10);
        starsOpacities.push(Math.random());
        starsHueOffsets.push(Math.random());
        const hslColor = new THREE.Color().setHSL(starsHueOffsets[i], 1, 0.5);
        starsColors.push(hslColor.r, hslColor.g, hslColor.b);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute('opacity', new THREE.Float32BufferAttribute(starsOpacities, 1));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    group.add(stars);

    scene.add(group);

    return function updateBubbles(deltaTime) {
        spheres.forEach((sphere, index) => {
            sphere.position.y += 1 * deltaTime;
            if (sphere.position.y > 500) sphere.position.y = -500;
            sphereHueOffsets[index] += deltaTime * 0.2;
            if (sphereHueOffsets[index] > 1) sphereHueOffsets[index] -= 1;
            sphere.material.color.setHSL(sphereHueOffsets[index], 1, 0.5);
        });

        const opacities = starsGeometry.attributes.opacity.array;
        const colors = starsGeometry.attributes.color.array;
        for (let i = 0; i < starCount; i++) {
            opacities[i] += (Math.random() - 0.5) * 0.1;
            opacities[i] = Math.max(0, Math.min(1, opacities[i]));
            starsHueOffsets[i] += deltaTime * 0.2;
            if (starsHueOffsets[i] > 1) starsHueOffsets[i] -= 1;
            const hslColor = new THREE.Color().setHSL(starsHueOffsets[i], 1, 0.5);
            colors[i * 3] = hslColor.r;
            colors[i * 3 + 1] = hslColor.g;
            colors[i * 3 + 2] = hslColor.b;
        }
        starsGeometry.attributes.opacity.needsUpdate = true;
        starsGeometry.attributes.color.needsUpdate = true;
    };
}

function createWireframeCubes(level) {
    const group = new THREE.Group();
    const cubes = [];
    
    const baseCubeCount = 100;
    const cubeCount = level > 8 ? Math.floor(baseCubeCount * (1 + (level - 1) / 50)) : baseCubeCount;
    const spawnInterval = 2;
    let timeSinceLastSpawn = 0;
    const maxCubes = 200;
    const cubeHueOffsets = [];

    function spawnCube() {
        if (cubes.length >= maxCubes) return;
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const hue = Math.random();
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(hue, 1, 0.5),
            wireframe: true
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 10);
        group.add(cube);
        cubes.push(cube);
        cubeHueOffsets.push(hue);
    }

    for (let i = 0; i < cubeCount; i++) {
        spawnCube();
    }

    const baseStarCount = 5000;
    const starCount = level > 8 ? Math.floor(baseStarCount * (1 + (level - 1) / 50)) : baseStarCount;
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.051,
        transparent: true,
        vertexColors: true
    });
    const starsPositions = [];
    const starsOpacities = [];
    const starsColors = [];
    const starsHueOffsets = [];
    for (let i = 0; i < starCount; i++) {
        starsPositions.push((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 10);
        starsOpacities.push(Math.random());
        starsHueOffsets.push(Math.random());
        const hslColor = new THREE.Color().setHSL(starsHueOffsets[i], 1, 0.5);
        starsColors.push(hslColor.r, hslColor.g, hslColor.b);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute('opacity', new THREE.Float32BufferAttribute(starsOpacities, 1));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    group.add(stars);

    scene.add(group);

    return function updateWireframeCubes(deltaTime) {
        cubes.forEach((cube, index) => {
            cube.rotation.x += 0.5 * deltaTime;
            cube.rotation.y += 0.5 * deltaTime;
            cubeHueOffsets[index] += deltaTime * 0.2;
            if (cubeHueOffsets[index] > 1) cubeHueOffsets[index] -= 1;
            cube.material.color.setHSL(cubeHueOffsets[index], 1, 0.5);
        });

        timeSinceLastSpawn += deltaTime;
        if (timeSinceLastSpawn >= spawnInterval && cubes.length < maxCubes) {
            spawnCube();
            timeSinceLastSpawn = 0;
        }

        const opacities = starsGeometry.attributes.opacity.array;
        const colors = starsGeometry.attributes.color.array;
        for (let i = 0; i < starCount; i++) {
            opacities[i] += (Math.random() - 0.5) * 0.1;
            opacities[i] = Math.max(0, Math.min(1, opacities[i]));
            starsHueOffsets[i] += deltaTime * 0.2;
            if (starsHueOffsets[i] > 1) starsHueOffsets[i] -= 1;
            const hslColor = new THREE.Color().setHSL(starsHueOffsets[i], 1, 0.5);
            colors[i * 3] = hslColor.r;
            colors[i * 3 + 1] = hslColor.g;
            colors[i * 3 + 2] = hslColor.b;
        }
        starsGeometry.attributes.opacity.needsUpdate = true;
        starsGeometry.attributes.color.needsUpdate = true;
    };
}

function createFireworks(level) {
    const group = new THREE.Group();
    scene.add(group);
    const fireworks = [];
    let lastSpawnTime = 0;
    const spawnInterval = 1.2;

    const baseStarCount = 6000;
    const starCount = level > 8 ? Math.floor(baseStarCount * (1 + (level - 1) / 50)) : baseStarCount;
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.051,
        transparent: true,
        vertexColors: true
    });
    const starsPositions = [];
    const starsOpacities = [];
    const starsColors = [];
    const starsHueOffsets = [];
    for (let i = 0; i < starCount; i++) {
        starsPositions.push((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 10);
        starsOpacities.push(Math.random());
        starsHueOffsets.push(Math.random());
        const hslColor = new THREE.Color().setHSL(starsHueOffsets[i], 1, 0.5);
        starsColors.push(hslColor.r, hslColor.g, hslColor.b);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute('opacity', new THREE.Float32BufferAttribute(starsOpacities, 1));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    group.add(stars);

    const spawnFirework = () => {
        const launchGeometry = new THREE.BufferGeometry();
        const launchMaterial = new THREE.PointsMaterial({
            color: new THREE.Color().setHSL(0, 1, 0.5),
            size: 0.5,
            transparent: true,
            opacity: 1.0
        });
        const launchPosition = [0, -500, (Math.random() - 0.5) * 10];
        launchGeometry.setAttribute('position', new THREE.Float32BufferAttribute(launchPosition, 3));
        const launchPoint = new THREE.Points(launchGeometry, launchMaterial);
        group.add(launchPoint);
        fireworks.push({ obj: launchPoint, time: 0, state: 'launch' });
    };

    for (let i = 0; i < 3; i++) spawnFirework();

    return function updateFireworks(deltaTime) {
        const starOpacities = starsGeometry.attributes.opacity.array;
        const starColors = starsGeometry.attributes.color.array;
        for (let i = 0; i < starCount; i++) {
            starOpacities[i] += (Math.random() - 0.5) * 0.1;
            starOpacities[i] = Math.max(0, Math.min(1, starOpacities[i]));
            starsHueOffsets[i] += deltaTime * 0.2;
            if (starsHueOffsets[i] > 1) starsHueOffsets[i] -= 1;
            const hslColor = new THREE.Color().setHSL(starsHueOffsets[i], 1, 0.5);
            starColors[i * 3] = hslColor.r;
            starColors[i * 3 + 1] = hslColor.g;
            starColors[i * 3 + 2] = hslColor.b;
        }
        starsGeometry.attributes.opacity.needsUpdate = true;
        starsGeometry.attributes.color.needsUpdate = true;

        lastSpawnTime += deltaTime;
        if (lastSpawnTime >= spawnInterval) {
            spawnFirework();
            lastSpawnTime = 0;
        }

        for (let i = fireworks.length - 1; i >= 0; i--) {
            const fw = fireworks[i];
            const pos = fw.obj.geometry.attributes.position.array;
            fw.time += deltaTime;

            if (fw.state === 'launch') {
                pos[1] += 15 * deltaTime;
                if (pos[1] >= 400) {
                    fw.state = 'ready';
                }
            }
        }
    };
}

function createDroneShow(level) {
    const group = new THREE.Group();
    scene.add(group);

    const baseStarCount = 5000;
    const starCount = level > 8 ? Math.floor(baseStarCount * (1 + (level - 1) / 50)) : baseStarCount;
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.051,
        transparent: true,
        vertexColors: true
    });
    const starsPositions = [];
    const starsOpacities = [];
    const starsColors = [];
    const starsHueOffsets = [];
    for (let i = 0; i < starCount; i++) {
        starsPositions.push((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 10);
        starsOpacities.push(Math.random());
        starsHueOffsets.push(Math.random());
        const hslColor = new THREE.Color().setHSL(starsHueOffsets[i], 1, 0.5);
        starsColors.push(hslColor.r, hslColor.g, hslColor.b);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute('opacity', new THREE.Float32BufferAttribute(starsOpacities, 1));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    group.add(stars);

    const baseSphereCount = 250;
    const sphereCount = level > 8 ? Math.floor(baseSphereCount * (1 + (level - 1) / 50)) : baseSphereCount;
    const spheres = [];
    const sphereHueOffsets = [];
    for (let i = 0; i < sphereCount; i++) {
        const geometry = new THREE.IcosahedronGeometry(0.5, 1);
        const hue = Math.random();
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(hue, 1, 0.5),
            wireframe: true
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 1000,
            (Math.random() - 0.5) * 10
        );
        group.add(sphere);
        spheres.push(sphere);
        sphereHueOffsets.push(hue);
    }

    const baseCubeCount = 100;
    const cloudCount = level > 8 ? Math.floor(baseCubeCount * (1 + (level - 1) / 50)) : baseCubeCount;
    const clouds = [];
    const cloudHueOffsets = [];
    const spawnInterval = 2;
    let timeSinceLastSpawn = 0;
    const maxClouds = 200;

    function spawnCloud() {
        if (clouds.length >= maxClouds) return;
        const geometry = new THREE.OctahedronGeometry(1, 1);
        geometry.scale(1, 1.5, 1);
        const hue = Math.random();
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(hue, 1, 0.5),
            wireframe: true
        });
        const cloud = new THREE.Mesh(geometry, material);
        cloud.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 10);
        group.add(cloud);
        clouds.push(cloud);
        cloudHueOffsets.push(hue);
    }

    for (let i = 0; i < cloudCount; i++) {
        spawnCloud();
    }

    return function updateDroneShow(deltaTime) {
        const starOpacities = starsGeometry.attributes.opacity.array;
        const starColors = starsGeometry.attributes.color.array;
        for (let i = 0; i < starCount; i++) {
            starOpacities[i] += (Math.random() - 0.5) * 0.1;
            starOpacities[i] = Math.max(0, Math.min(1, starOpacities[i]));
            starsHueOffsets[i] += deltaTime * 0.2;
            if (starsHueOffsets[i] > 1) starsHueOffsets[i] -= 1;
            const hslColor = new THREE.Color().setHSL(starsHueOffsets[i], 1, 0.5);
            starColors[i * 3] = hslColor.r;
            starColors[i * 3 + 1] = hslColor.g;
            starColors[i * 3 + 2] = hslColor.b;
        }
        starsGeometry.attributes.opacity.needsUpdate = true;
        starsGeometry.attributes.color.needsUpdate = true;

        spheres.forEach((sphere, index) => {
            sphere.position.y += 1 * deltaTime;
            if (sphere.position.y > 500) sphere.position.y = -500;
            sphereHueOffsets[index] += deltaTime * 0.2;
            if (sphereHueOffsets[index] > 1) sphereHueOffsets[index] -= 1;
            sphere.material.color.setHSL(sphereHueOffsets[index], 1, 0.5);
        });

        clouds.forEach((cloud, index) => {
            cloud.rotation.x += 0.5 * deltaTime;
            cloud.rotation.y += 0.5 * deltaTime;
            cloudHueOffsets[index] += deltaTime * 0.2;
            if (cloudHueOffsets[index] > 1) cloudHueOffsets[index] -= 1;
            cloud.material.color.setHSL(cloudHueOffsets[index], 1, 0.5);
        });

        timeSinceLastSpawn += deltaTime;
        if (timeSinceLastSpawn >= spawnInterval && clouds.length < maxClouds) {
            spawnCloud();
            timeSinceLastSpawn = 0;
        }
    };
}

// Level effect management
function setupLevelEffect(level) {
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    let effectLevel = level;
    if (level > 2) {
        effectLevel = (level - 1) % 8 + 1;
    }
    switch (effectLevel) {
        case 1: currentEffectUpdate = createStars(); break;
        case 2: currentEffectUpdate = createLines(); break;
        case 3: currentEffectUpdate = createStarsAndGasClouds(level); break;
        case 4: currentEffectUpdate = createCometTrail(); break;
        case 5: currentEffectUpdate = createBubbles(); break;
        case 6: currentEffectUpdate = createWireframeCubes(); break;
        case 7: currentEffectUpdate = createFireworks(); break;
        case 8: currentEffectUpdate = createDroneShow(); break;
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

// Touch control setup (on-canvas buttons)
function setupTouchControls() {
    // Detect if the device is mobile
    function isMobileDevice() {
        return ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth <= 768;
    }

    // Button definitions
    const buttonWidth = 70;
    const buttonHeight = 50;
    const buttonSpacing = 30;
    const bottomMargin = 20;
    const totalWidth = 3 * buttonWidth + 2 * buttonSpacing; // 270px
    const startX = (canvas.width - totalWidth) / 2; // Center: (700 - 270) / 2 = 215
    const buttons = [
        { id: 'left', x: startX, y: canvas.height - buttonHeight - bottomMargin, width: buttonWidth, height: buttonHeight, key: 'ArrowLeft' },
        { id: 'jump', x: startX + buttonWidth + buttonSpacing, y: canvas.height - buttonHeight - bottomMargin, width: buttonWidth, height: buttonHeight, key: 'ArrowUp' },
        { id: 'right', x: startX + 2 * (buttonWidth + buttonSpacing), y: canvas.height - buttonHeight - bottomMargin, width: buttonWidth, height: buttonHeight, key: 'ArrowRight' }
    ];

    // Toggle visibility state
    let showControlsOnPC = true;
    const showControlsToggle = document.getElementById('show-controls');
    if (showControlsToggle) {
        showControlsToggle.addEventListener('change', () => {
            showControlsOnPC = showControlsToggle.checked;
        });
    }

    // Function to check if a point is within a button
    function isPointInButton(x, y, button) {
        return x >= button.x && x <= button.x + button.width &&
               y >= button.y && y <= button.y + button.height;
    }

    // Store active touches to handle multitouch
    const activeTouches = new Map();

    // Touch event handlers
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        for (const touch of e.changedTouches) {
            const canvasX = touch.clientX - rect.left;
            const canvasY = touch.clientY - rect.top;
            for (const button of buttons) {
                if (isPointInButton(canvasX, canvasY, button) && (isMobileDevice() || showControlsOnPC)) {
                    keys.add(button.key);
                    activeTouches.set(touch.identifier, button.key);
                }
            }
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            const key = activeTouches.get(touch.identifier);
            if (key) {
                keys.delete(key);
                activeTouches.delete(touch.identifier);
            }
        }
    }, { passive: false });

    // Mouse event handlers for PC testing
    canvas.addEventListener('mousedown', (e) => {
        if (!isMobileDevice() && !showControlsOnPC) return;
        const rect = canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        for (const button of buttons) {
            if (isPointInButton(canvasX, canvasY, button)) {
                keys.add(button.key);
            }
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (!isMobileDevice() && !showControlsOnPC) return;
        const rect = canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        for (const button of buttons) {
            if (isPointInButton(canvasX, canvasY, button)) {
                keys.delete(button.key);
            }
        }
    });

    // Draw buttons with wireframe arrows
    function drawButtons() {
        if (!isMobileDevice() && !showControlsOnPC) return;
        ctx.save();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';
        buttons.forEach(button => {
            // Draw button background
            ctx.fillStyle = keys.has(button.key) ? '#0a0' : '#0f0'; // Darker when pressed
            ctx.fillRect(button.x, button.y, button.width, button.height);
            // Draw button border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(button.x, button.y, button.width, button.height);
            // Draw wireframe arrow
            ctx.beginPath();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            const cx = button.x + button.width / 2;
            const cy = button.y + button.height / 2;
            const size = 20; // Arrow size
            if (button.id === 'left') {
                // Left arrow: horizontal line with triangle at left end
                ctx.moveTo(cx + size / 2, cy);
                ctx.lineTo(cx - size / 2, cy);
                ctx.moveTo(cx - size / 2, cy);
                ctx.lineTo(cx - size / 4, cy - size / 4);
                ctx.moveTo(cx - size / 2, cy);
                ctx.lineTo(cx - size / 4, cy + size / 4);
            } else if (button.id === 'jump') {
                // Up arrow: vertical line with triangle at top
                ctx.moveTo(cx, cy + size / 2);
                ctx.lineTo(cx, cy - size / 2);
                ctx.moveTo(cx, cy - size / 2);
                ctx.lineTo(cx - size / 4, cy - size / 4);
                ctx.moveTo(cx, cy - size / 2);
                ctx.lineTo(cx + size / 4, cy - size / 4);
            } else if (button.id === 'right') {
                // Right arrow: horizontal line with triangle at right end
                ctx.moveTo(cx - size / 2, cy);
                ctx.lineTo(cx + size / 2, cy);
                ctx.moveTo(cx + size / 2, cy);
                ctx.lineTo(cx + size / 4, cy - size / 4);
                ctx.moveTo(cx + size / 2, cy);
                ctx.lineTo(cx + size / 4, cy + size / 4);
            }
            ctx.stroke();
        });
        ctx.restore();
    }

    // Return draw function to be called in the main draw loop
    return drawButtons;
}
// Initialize touch controls and get draw function
const drawTouchButtons = setupTouchControls();



// Ball selection popup
function showBallSelectionPopup() {
    const popup = document.createElement('div');
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
    for (let i = 0; i < ballImages.length; i++) {
        const ballOption = document.createElement('div');
        ballOption.style.display = 'inline-block';
        ballOption.style.margin = '10px';
        ballOption.style.cursor = 'pointer';
        ballOption.innerHTML = `<img src="${ballImages[i].src}" width="50" height="50" onclick="selectBall(${i})">`;
        popup.appendChild(ballOption);
    }
    const closeButton = document.createElement('div');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.textAlign = 'center';
    closeButton.style.padding = '10px';
    closeButton.style.background = '#080816ff';
    closeButton.style.borderRadius = '5px';
    closeButton.onclick = () => document.body.removeChild(popup);
    popup.appendChild(closeButton);
    document.body.appendChild(popup);
}

function selectBall(index) {
    selectedBallIndex = index;
    document.body.removeChild(document.querySelector('div[style*="z-index: 1000"]'));
    if (player) player.playerImg = ballImages[selectedBallIndex];
}

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
    gloves.push(new Glove(x, y, vx));
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
    setupLevelEffect(level);
    checkNewPlatform();
}

function update(deltaTime) {
    if (currentLevel === 0) return;

    if (levelComplete) {
        levelPauseTime += deltaTime * 1000;
        return;
    }

    player.handleInput();
    player.update(deltaTime);

    for (const platform of platforms) {
        if (rectanglesOverlap(player, platform) && player.vy > 0) {
            player.vy = platform.type === 'jump' ? -1000 : -550;
            player.y = platform.y - platform.height / 2 - player.height / 2;
            if (player.boostActive) player.applyBoost();
            break;
        }
    }

    for (const moving of movingPlatforms) {
        moving.update(deltaTime);
        if (rectanglesOverlap(player, moving) && player.vy > 0) {
            player.vy = -550;
            player.y = moving.y - moving.height / 2 - player.height / 2;
            if (player.boostActive) player.applyBoost();
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
        } else if (glove.x < -20 || glove.x > canvas.width + 20) {
            gloves.splice(i, 1);
        }
    }

    const scrollScore = getScrollScore();
    if (scrollScore - lastGloveScore >= 100) {
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
const BUTTON_WIDTH = 60;
const BUTTON_HEIGHT = 30;
const BUTTON_SPACING = 10;
const GRID_START_X = (canvas.width - (LEVELS_PER_ROW * (BUTTON_WIDTH + BUTTON_SPACING) - BUTTON_SPACING)) / 2;
const GRID_START_Y = canvas.height / 2 - 150;

function drawLevelSelect() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '40px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('AlyUp - Level Select', canvas.width / 2, canvas.height / 2 - 200);

    ctx.font = '16px Arial';
    for (let level = 1; level <= 100; level++) {
        const row = Math.floor((level - 1) / LEVELS_PER_ROW);
        const col = (level - 1) % LEVELS_PER_ROW;
        const x = GRID_START_X + col * (BUTTON_WIDTH + BUTTON_SPACING);
        const y = GRID_START_Y + row * (BUTTON_HEIGHT + BUTTON_SPACING);
        ctx.fillStyle = '#080816ff';
        ctx.fillRect(x, y, BUTTON_WIDTH, BUTTON_HEIGHT);
        ctx.fillStyle = '#fff';
        ctx.fillText(`${level}`, x + BUTTON_WIDTH / 2, y + BUTTON_HEIGHT / 2 + 5);
    }

    // Add ball selection button
    ctx.fillStyle = '#080816ff';
    ctx.fillRect(50, 150, 100, 30);
    ctx.fillStyle = '#fff';
    ctx.fillText('Select Ball', 100, 170);
    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        for (let level = 1; level <= 100; level++) {
            const row = Math.floor((level - 1) / LEVELS_PER_ROW);
            const col = (level - 1) % LEVELS_PER_ROW;
            const x = GRID_START_X + col * (BUTTON_WIDTH + BUTTON_SPACING);
            const y = GRID_START_Y + row * (BUTTON_HEIGHT + BUTTON_SPACING);
            if (mouseX >= x && mouseX <= x + BUTTON_WIDTH && mouseY >= y && mouseY <= y + BUTTON_HEIGHT) {
                resetLevel(level);
                canvas.onclick = null;
                break;
            }
        }
        if (mouseX >= 50 && mouseX <= 150 && mouseY >= 150 && mouseY <= 180) {
            showBallSelectionPopup();
        }
    };
}

function drawScoreboard() {
    ctx.fillStyle = '#080816ff';
    ctx.fillRect(10, 10, 280, 100);
    ctx.strokeStyle = '#fffffeff';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 280, 100);

    ctx.font = '20px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'left';
    ctx.fillText('ALYUP', 20, 40);
    ctx.fillStyle = '#FFF';
    ctx.fillText(`Score: ${score + getScrollScore()}`, 20, 70);
    ctx.fillText(`High Score: ${highScore}`, 20, 100);
    ctx.fillText(`Level: ${currentLevel}`, 150, 70);
}

function drawGloveIndicators() {
    const circleSize = 45;
    const spacing = 5;
    const startX = canvas.width - (circleSize * 3 + spacing * 2) + 15; // Circles shifted right by 15 pixels
    const startY = 50;

    // Declare pulse once at the top
    const pulse = (Math.sin(Date.now() / 200) + 1) / 2; // Pulse effect (0 to 1)

    // Draw "BOOST" text above the circles with pulsing effect
    ctx.globalAlpha = 0.5 + 0.8 * pulse; // Current: min 0.5, max 1 (moderate intensity)
    // For higher intensity: ctx.globalAlpha = 0.3 + 0.7 * pulse; // min 0.3, max 1
    // For lower intensity: ctx.globalAlpha = 0.7 + 0.3 * pulse; // min 0.7, max 1
    ctx.font = '20px Arial';
    ctx.fillStyle = '#FFD700'; // Yellow from scoreboard
    ctx.textAlign = 'center';
    ctx.fillText('BOOST', startX + (circleSize * 1.5 + spacing) - 15, startY - 25); // Moved left by 10 pixels
    ctx.globalAlpha = 1; // Reset alpha

    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(startX + (circleSize + spacing) * i, startY, circleSize / 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        // Add green glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(0, 255, 0, 0.5)'; // Green glow
        if (player.gloveCount >= 3) {
            ctx.globalAlpha = 0.5 + 0.85 * pulse; // Current: min 0.5, max 1 (moderate intensity)
            // For higher intensity: ctx.globalAlpha = 0.3 + 0.7 * pulse; // min 0.3, max 1
            // For lower intensity: ctx.globalAlpha = 0.7 + 0.3 * pulse; // min 0.7, max 1
        }
        ctx.stroke();
        ctx.globalAlpha = 1; // Reset alpha
        ctx.shadowBlur = 0; // Reset shadow to avoid affecting other drawings
        if (player.gloveCount > i) {
            ctx.drawImage(leftGloveImg, startX + (circleSize + spacing) * i - circleSize / 2, startY - circleSize / 2, circleSize, circleSize);
            if (player.gloveCount >= 3) {
                ctx.globalAlpha = 0.5 + 0.85 * pulse; // Current: min 0.5, max 1 (moderate intensity)
                // For higher intensity: ctx.globalAlpha = 0.3 + 0.7 * pulse; // min 0.3, max 1
                // For lower intensity: ctx.globalAlpha = 0.7 + 0.3 * pulse; // min 0.7, max 1
                ctx.drawImage(leftGloveImg, startX + (circleSize + spacing) * i - circleSize / 2, startY - circleSize / 2, circleSize, circleSize);
                ctx.globalAlpha = 1;
            }
        }
    }

    // Draw "Press Up to Activate" text below the circles with pulsing effect
    ctx.globalAlpha = 0.5 + 0.8 * pulse; // Current: min 0.5, max 1 (moderate intensity)
    // For higher intensity: ctx.globalAlpha = 0.3 + 0.7 * pulse; // min 0.3, max 1
    // For lower intensity: ctx.globalAlpha = 0.7 + 0.3 * pulse; // min 0.7, max 1
    ctx.fillStyle = '#FFF'; // White text
    ctx.font = '15px Arial'; // Changed font size to 15px
    ctx.fillText('Press Up to Activate', startX + (circleSize * 1.5 + spacing) - 22, startY + 40); // Moved left by 22 pixels
    ctx.globalAlpha = 1; // Reset alpha
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentLevel === 0) {
        drawLevelSelect();
        return;
    }

    updateOpacityAnimation((lastTime > 0 ? (performance.now() - lastTime) / 1000 : 0));

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
    drawTouchButtons(); // Add touch button rendering

    if (levelComplete) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '40px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(`Level ${currentLevel} Complete!`, canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillText(`Score: ${getTotalScore()}`, canvas.width / 2, canvas.height / 2);
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = canvas.width / 2 - buttonWidth / 2;
        const buttonY = canvas.height / 2 + 50;
        ctx.fillStyle = '#0f0';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#000';
        ctx.fillText('Next Level', canvas.width / 2, buttonY + buttonHeight / 2 + 5);
        canvas.onclick = (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth && mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
                resetLevel(currentLevel + 1);
                canvas.onclick = null;
            }
        };
    }

    // Render Three.js background
    if (currentEffectUpdate) {
        currentEffectUpdate((lastTime > 0 ? (performance.now() - lastTime) / 1000 : 0));
    }
    renderer.render(scene, camera);
}

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

    currentLevel = 0;
    requestAnimationFrame(gameLoop);

