let scene,
    camera,
    renderer,
    orbitControls,
    particles,
    planeMesh;

const noise = new SimplexNoise();
const particleNum = 5000;
const maxRange = 1000;
const minRange = maxRange / 2;
const textureSize = 64.0;

const drawRadialGradation = (ctx, canvasRadius, canvasW, canvasH) => {
    ctx.save();
    const gradient = ctx.createRadialGradient(canvasRadius, canvasRadius, 0, canvasRadius, canvasRadius, canvasRadius);
    gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.5, 'rgba(255,200,200,0.3)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.restore();
}

const getTexture = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const diameter = textureSize;
    canvas.width = diameter;
    canvas.height = diameter;
    const canvasRadius = diameter / 2;

    /* gradation circle
    ------------------------ */
    drawRadialGradation(ctx, canvasRadius, canvas.width, canvas.height);

    /* snow crystal
    ------------------------ */
    // drawSnowCrystal(ctx, canvasRadius);

    const texture = new THREE.Texture(canvas);
    //texture.minFilter = THREE.NearestFilter;
    texture.type = THREE.FloatType;
    texture.needsUpdate = true;
    return texture;
}

const makeRoughGround = (mesh) => {
    const time = Date.now();
    mesh.geometry.vertices.forEach(function (vertex, i) {
        const noise1 = noise.noise2D(
            vertex.x * 0.01 + time * 0.0003,
            vertex.y * 0.01 + time * 0.0003,
            vertex.z * 0.01 + time * 0.0003,
        ) * 5;
        const noise2 = noise.noise2D(
            vertex.x * 0.02 + time * 0.00012,
            vertex.y * 0.02 + time * 0.00015,
            vertex.z * 0.02 + time * 0.00015,
        ) * 4;
        const noise3 = noise.noise2D(
            vertex.x * 0.009 + time * 0.00015,
            vertex.y * 0.012 + time * 0.00009,
            vertex.z * 0.015 + time * 0.00015,
        ) * 4;
        const distance = (noise1 + noise2 );
        vertex.z = distance;
    })
    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.normalsNeedUpdate = true;
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeFaceNormals();
}

const render = (timeStamp) => {

    // orbitControls.update();

    makeRoughGround(planeMesh);

    const posArr = particles.geometry.vertices;
    const velArr = particles.geometry.velocities;

    posArr.forEach((vertex, i) => {
        const velocity = velArr[i];

        const x = i * 3;
        const y = i * 3 + 1;
        const z = i * 3 + 2;

        const velX = Math.sin(timeStamp * 0.001 * velocity.x) * 0.1;
        const velZ = Math.cos(timeStamp * 0.0005 * velocity.z) * 0.1;

        vertex.x += velX;
        vertex.y += velocity.y;
        vertex.z += velZ;

        if (vertex.y < -minRange) {
            vertex.y = minRange;
        }

    })

    particles.geometry.verticesNeedUpdate = true;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}


const init = () => {

    /* scene
    -------------------------------------------------------------*/
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000036, 0, minRange * 3);

    /* camera
    -------------------------------------------------------------*/
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.set(0, -50, 300);
    camera.lookAt(scene.position);

    /* renderer
    -------------------------------------------------------------*/
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setClearColor(new THREE.Color(0x889cae));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.setClearAlpha(0);

    /* OrbitControls
    -------------------------------------------------------------*/
    // orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    // orbitControls.autoRotate = false;
    // orbitControls.enableDamping = true;
    // orbitControls.dampingFactor = 0.2;

    /* AmbientLight
    -------------------------------------------------------------*/
    const ambientLight = new THREE.AmbientLight(0x444444);
    scene.add(ambientLight);

    /* SpotLight
    -------------------------------------------------------------*/
    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.distance = 2000;
    spotLight.position.set(-500, 700, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);

    /* Plane
    --------------------------------------*/
    const planeGeometry = new THREE.PlaneGeometry(500, 500, 100, 100);
    const planeMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
    });
    planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.receiveShadow = true;
    planeMesh.rotation.x = -0.5 * Math.PI;
    planeMesh.position.x = 0;
    planeMesh.position.y = -90;
    planeMesh.position.z = 0;
    scene.add(planeMesh);

    /* Snow Particles
    -------------------------------------------------------------*/
    const pointGeometry = new THREE.Geometry();
    for (let i = 0; i < particleNum; i++) {
        const x = Math.floor(Math.random() * maxRange - minRange);
        const y = Math.floor(Math.random() * maxRange - minRange);
        const z = Math.floor(Math.random() * maxRange - minRange);
        const particle = new THREE.Vector3(x, y, z);
        pointGeometry.vertices.push(particle);
        // const color = new THREE.Color(0xffffff);
        // pointGeometry.colors.push(color);
    }

    const pointMaterial = new THREE.PointsMaterial({
        size: 8,
        color: 0xffffff,
        vertexColors: false,
        map: getTexture(),
        // blending: THREE.AdditiveBlending,
        transparent: true,
        // opacity: 0.8,
        fog: true,
        depthWrite: false
    });

    const velocities = [];
    for (let i = 0; i < particleNum; i++) {
        const x = Math.floor(Math.random() * 6 - 3) * 0.1;
        const y = Math.floor(Math.random() * 10 + 3) * - 0.05;
        const z = Math.floor(Math.random() * 6 - 3) * 0.1;
        const particle = new THREE.Vector3(x, y, z);
        velocities.push(particle);
    }

    particles = new THREE.Points(pointGeometry, pointMaterial);
    particles.geometry.velocities = velocities;
    scene.add(particles);

    /* resize
    -------------------------------------------------------------*/
    window.addEventListener('resize', onResize);

    /* rendering start
    -------------------------------------------------------------*/
    document.getElementById('WebGL-output').appendChild(renderer.domElement);
    requestAnimationFrame(render);
}

document.addEventListener('DOMContentLoaded', () => {
    init();
});