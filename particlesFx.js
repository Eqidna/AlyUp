

// particlesFx.js


export function createStars(scene, level) {
    const baseCount = 5000;
    const count = level > 1 ? Math.floor(baseCount * (1 + (level - 1) / 50)) : baseCount;
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.025,
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

export function createLines(scene, level) {
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

export function createStarsAndGasClouds(scene, level) {
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

export function createCometTrail(scene, level) {
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

    const baseVortexCount = 15;
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

export function createBubbles(scene, level) {
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

export function createWireframeCubes(scene, level) {
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

export function createFireworks(scene, level) {
    const group = new THREE.Group();
    scene.add(group);
    const fireworks = [];
    let lastSpawnTime = 0;
    const spawnInterval = 1.2;

    // Star field
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

    // Firework spawning
    const spawnFirework = () => {
        const launchGeometry = new THREE.BufferGeometry();
        const launchMaterial = new THREE.PointsMaterial({
            color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
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

    // Lines
    const baseLineCount = 250;
    const lineCount = level > 8 ? Math.floor(baseLineCount * (1 + (level - 1) / 150)) : baseLineCount;
    const lines = [];
    const lineGeometries = [];
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
        group.add(line);
        lines.push(line);
        lineGeometries.push(lineGeometry);
        lineHueOffsets.push([hue1, hue2]);
    }

    return function updateFireworks(deltaTime) {
        // Update stars
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

        // Update fireworks
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
            fw.obj.geometry.attributes.position.needsUpdate = true;
        }

        // Update lines
        lines.forEach((line, index) => {
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
            }
        });
    };
}

export function createDroneShow(scene, level) {
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