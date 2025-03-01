let scene,
    camera,
    renderer,
    orbitControls,
    particles,
    planeMesh;

const noise = new SimplexNoise();
const textureSize = 64.0;
let particleNum = 5000;
const maxRange = 1000;
const minRange = maxRange / 2;

// Device detection
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
if (isIOS) {
    particleNum = 2000; // Reduce particle count on iOS
}

const drawRadialGradation = (ctx, canvasRadius, canvasW, canvasH) => {
    ctx.clearRect(0, 0, canvasW, canvasH); // Clear canvas first
    ctx.save();
    const gradient = ctx.createRadialGradient(canvasRadius, canvasRadius, 0, canvasRadius, canvasRadius, canvasRadius);
    gradient.addColorStop(0, 'rgba(255,255,255,1.0)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
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

    // Ensure the canvas background is transparent
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    /* gradation circle */
    drawRadialGradation(ctx, canvasRadius, canvas.width, canvas.height);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    // Use default filters for better compatibility
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
        const distance = (noise1 + noise2);
        vertex.z = distance;
    })
    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.normalsNeedUpdate = true;
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeFaceNormals();
}

const render = (timeStamp) => {
    makeRoughGround(planeMesh);

    const posArr = particles.geometry.vertices;
    const velArr = particles.geometry.velocities;

    posArr.forEach((vertex, i) => {
        const velocity = velArr[i];

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
    renderer.setPixelRatio(window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio);
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

// Portfolio scroll event handler
const setupPortfolioScroll = () => {
    // Get the portfolio section, list and title elements
    const portfolioSection = document.getElementById('portfolio');
    const portfolioList = document.getElementById('portfolio-list');
    const portfolioTitle = document.getElementById('skills-title');
    
    if (portfolioSection && portfolioTitle && portfolioList) {
        // Need to listen to the scroll event on the list, not the section
        portfolioList.addEventListener('scroll', function() {
            // Check the scroll position
            if (this.scrollTop > 40) {
                // If scrolled down, hide the title
                portfolioTitle.classList.add('hidden');
            } else {
                // If at the top, show the title
                portfolioTitle.classList.remove('hidden');
            }
        });
        
        // Initial check in case page loads with scroll position
        if (portfolioList.scrollTop > 40) {
            portfolioTitle.classList.add('hidden');
        }
    }
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
        alpha: true,
        preserveDrawingBuffer: false
    });
    renderer.setPixelRatio(window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.setClearAlpha(0);

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
    }

    let pointMaterial;
    
    if (isIOS) {
        // For iOS, use simple circular points without textures
        pointMaterial = new THREE.PointsMaterial({
            size: 3,
            color: 0xffffff,
            opacity: 0.6,
            transparent: true,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });
    } else {
        // For other platforms, use textured particles
        pointMaterial = new THREE.PointsMaterial({
            size: 8,
            color: 0xffffff,
            map: getTexture(),
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
    }

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
    
    // Set up portfolio scroll after WebGL initialization
    setupPortfolioScroll();
}

document.addEventListener('DOMContentLoaded', () => {
    init();
});