// Variables to track state
let attempts = 0;
const maxAttempts = 5;
let currentLayer = 1;

document.addEventListener('DOMContentLoaded', () => {
    const teaseBtn = document.getElementById('tease-btn');

    // Teasing Button Logic
    teaseBtn.addEventListener('mouseover', () => {
        if (attempts < maxAttempts) {
            moveButton();
            updateTeaseText();
            attempts++;
        } else if (introStage === 0) { // Move to sequence after max attempts
            handleIntroSequence();
        }
    });

    // Fallback for mobile (tap)
    teaseBtn.addEventListener('click', (e) => {
        if (attempts < maxAttempts) {
            e.preventDefault();
            moveButton();
            attempts++;
        } else {
            handleIntroSequence();
        }
    });
});

let introStage = 0;
let introSequenceActive = false;

function handleIntroSequence() {
    const btn = document.getElementById('tease-btn');
    const bg = document.getElementById('ambient-background');

    // Prevent multiple clicks during sequence
    if (introSequenceActive) return;
    introSequenceActive = true;
    btn.disabled = true;

    // Move button to a tease position
    moveButton();

    // Stage 1: Ready?
    if (introStage === 0) {
        btn.textContent = "Ready? 😏";
        btn.style.animation = "pulse 0.6s ease-in-out";
        introStage++;
        setTimeout(() => {
            btn.style.animation = "none";
            introSequenceActive = false;
            btn.disabled = false;
        }, 1200);
    }
    // Stage 2: Lights
    else if (introStage === 1) {
        btn.textContent = "Lights... 💡";
        btn.style.animation = "pulse 0.6s ease-in-out";
        bg.style.filter = "brightness(0.3) blur(10px)"; // Dim lights
        document.body.style.backgroundColor = "#000";
        introStage++;
        setTimeout(() => {
            btn.style.animation = "none";
            introSequenceActive = false;
            btn.disabled = false;
        }, 1200);
    }
    // Stage 3: Balloons
    else if (introStage === 2) {
        btn.textContent = "Balloons! 🎈";
        btn.style.animation = "pulse 0.6s ease-in-out";
        createFloatingShapes(); // Release some balloons
        introStage++;
        setTimeout(() => {
            btn.style.animation = "none";
            introSequenceActive = false;
            btn.disabled = false;
        }, 1200);
    }
    // Stage 4: Action!
    else if (introStage === 3) {
        btn.textContent = "Action! 🎬";
        btn.style.animation = "pulse 0.8s ease-in-out";
        bg.style.filter = "brightness(1) blur(30px)"; // Lights back up
        // Small delay then go
        setTimeout(() => {
            showMessages();
        }, 1200);
    }
}

function moveButton() {
    const teaseBtn = document.getElementById('tease-btn');
    const x = Math.random() * (window.innerWidth - teaseBtn.offsetWidth);
    const y = Math.random() * (window.innerHeight - teaseBtn.offsetHeight);

    teaseBtn.style.position = 'absolute';
    teaseBtn.style.left = `${x}px`;
    teaseBtn.style.top = `${y}px`;
}

function showMessages() {
    const introScreen = document.getElementById('intro-screen');
    const messageContainer = document.getElementById('message-container');

    introScreen.style.display = 'none';
    messageContainer.classList.remove('hidden');
    messageContainer.style.display = 'block';

    showLayer(1);
}

function showLayer(layerNum) {
    const currentActive = document.querySelector('.message-layer.active-layer');
    const nextLayer = document.getElementById(`layer-${layerNum}`);

    if (!nextLayer) return;

    // Helper to activate the new layer
    const activateNext = () => {
        // Reset scroll or position if needed
        nextLayer.style.display = 'block';

        // Force reflow
        void nextLayer.offsetWidth;

        nextLayer.classList.add('active-layer');
        currentLayer = layerNum;

        updateAmbientBackground(nextLayer);

        // Handle video playback for layer 4
        if (layerNum === 4) {
            const video = nextLayer.querySelector('video');
            if (video) {
                video.load(); // Reload video
                
                // Add error handler
                video.addEventListener('error', function() {
                    console.log('Video failed to load');
                }, { once: true });
                
                // Try to play after a small delay
                setTimeout(() => {
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(err => {
                            console.log('Video autoplay prevented - user must click play:', err);
                            // This is normal - browsers block autoplay without user interaction
                        });
                    }
                }, 300);
            }
        }

        // Final Layer Logic
        if (layerNum === 7) {
            const msgContainer = document.getElementById("message-container");
            msgContainer.style.background = "transparent";
            msgContainer.style.boxShadow = "none";

            document.getElementById("final-note").innerHTML = ""; // Clear for typewriter
            i = 0; // Reset typewriter index

            // Initialize GitHub Tree Animation (Canvas) - starts first
            if (!document.getElementById("canvas").getAttribute("data-initialized")) {
                initLoveTree();
                document.getElementById("canvas").setAttribute("data-initialized", "true");
            }

            // Start text animation immediately - no delay
            typeWriter();

            createFloatingShapes(); // Floating shapes and stars
            createTwinklingStars(); // Add twinkling stars to final page
            
            // NEW: Initialize creative effects
            setTimeout(() => {
                initializeFireflies(); // Start fireflies
                startFallingPetals(); // Start falling petals
                createConstellation(); // Create constellation effect
                makeTreeInteractive(); // Make tree respond to mouse
            }, 500);
        }
    };

    if (currentActive) {
        // Exit data
        currentActive.classList.remove('active-layer');
        currentActive.classList.add('exit-layer');

        setTimeout(() => {
            currentActive.classList.remove('exit-layer');
            currentActive.style.display = 'none';
            activateNext();
        }, 600); // Wait for CSS transition (0.6s)
    } else {
        // First load (or intro to layer 1)
        activateNext();
    }
}

function createFloatingShapes() {
    const symbols = ['❤️', '⭐', '🎈', '✨', '🎂'];
    const container = document.body;

    const shapeInterval = setInterval(() => {
        // Create emoji shapes
        const shape = document.createElement('div');
        shape.classList.add('floating-shape');
        shape.innerText = symbols[Math.floor(Math.random() * symbols.length)];

        // Randomize properties
        const left = Math.random() * 100;
        const size = Math.random() * 30 + 20; // 20px to 50px
        const duration = Math.random() * 5 + 5; // 5s to 10s

        shape.style.left = `${left}vw`;
        shape.style.fontSize = `${size}px`;
        shape.style.animationDuration = `${duration}s`;

        container.appendChild(shape);

        // Remove after animation
        setTimeout(() => {
            shape.remove();
        }, duration * 1000);
    }, 500); // Create new shape every 500ms

    // Stop creating shapes after 30 seconds
    setTimeout(() => {
        clearInterval(shapeInterval);
    }, 30000);

    // Also create twinkling stars in final page
    if (document.getElementById("layer-7") && document.getElementById("layer-7").classList.contains("active-layer")) {
        createTwinklingStars();
    }
}

function createTwinklingStars() {
    const container = document.body;

    // Create scattered stars across the screen
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.classList.add('star-animation');

        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const delay = Math.random() * 2;

        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
        star.style.animationDelay = `${delay}s`;

        container.appendChild(star);
    }
}

function updateAmbientBackground(layerElement) {
    const bgContainer = document.getElementById('ambient-background');

    // Reset zoom to re-trigger it
    bgContainer.classList.remove('zoomed-bg');

    // Force reflow to allow re-triggering animation if we want
    void bgContainer.offsetWidth;

    // Add zoom class to start the slow scale
    bgContainer.classList.add('zoomed-bg');

    // Try to find an image or video in this layer
    const img = layerElement.querySelector('img');
    const video = layerElement.querySelector('video source');

    if (img) {
        bgContainer.style.backgroundImage = `url('${img.src}')`;
    } else if (video) {
        bgContainer.style.backgroundImage = `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`;
    } else {
        // Default background for text-only layers (like Layer 6)
        bgContainer.style.backgroundImage = "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)";
    }
}

function nextLayer(current) {
    showLayer(current + 1);
}

const text = "Happy Birthday to the most wonderful lady of my life,\nMay your day be wrapped in laughter, warmed by love, and filled with the little joys that make your beautiful smile shine.\nWill be always there for you, Your Highness";
let i = 0;

function typeWriter() {
    if (i === 0) {
        // Reset for fresh start
        document.getElementById("final-note").innerHTML = "";
    }
    if (i < text.length) {
        const char = text.charAt(i);
        const noteElement = document.getElementById("final-note");
        
        // Handle newlines
        if (char === '\n') {
            const br = document.createElement('br');
            noteElement.appendChild(br);
        } else {
            // Use textContent to avoid encoding issues
            const span = document.createElement('span');
            span.textContent = char;
            noteElement.appendChild(span);
        }
        i++;
        setTimeout(typeWriter, 35); // Slightly faster for longer text
    }
}

// Simple Confetti Implementation
function startConfetti() {
    // Create a canvas element if it doesn't exist
    const container = document.querySelector('.final-wish');
    let canvas = document.getElementById('confetti');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'confetti';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        // Append to body or a specific container
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const numberOfPieces = 200;
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#fff'];

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        pieces.forEach(p => {
            p.y += p.velocity;
            p.rotation += p.rotationSpeed;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;
            ctx.fillRect(-5, -5, 10, 10);
            ctx.restore();

            if (p.y > canvas.height) {
                p.y = -20;
                p.x = Math.random() * canvas.width;
            }
        });

        requestAnimationFrame(update);
    }

    // Initialize pieces
    for (let i = 0; i < numberOfPieces; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            velocity: Math.random() * 3 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        });
    }

    update();
}

// Particle System for Background
function initParticles() {
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 100;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.color = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.size > 0.2) this.size -= 0.01; // Twinkle effect
            if (this.size <= 0.2) this.size = Math.random() * 3;

            // Wrap around screen
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}

// Run particles on load
if (document.getElementById('background-canvas')) {
    initParticles();
}

// Create Simple CSS Tree
function createTree() {
    const container = document.getElementById('tree-container');
    if (!container) return;

    container.innerHTML = ''; // Clear

    const trunk = document.createElement('div');
    trunk.classList.add('tree-trunk');

    const leaves = document.createElement('div');
    leaves.classList.add('tree-leaves');

    // Add some "fruits" or hearts to the tree
    for (let i = 0; i < 10; i++) {
        const heart = document.createElement('div');
        heart.innerText = '❤️';
        heart.style.position = 'absolute';
        heart.style.left = Math.random() * 80 + 10 + '%';
        heart.style.top = Math.random() * 80 + 10 + '%';
        heart.style.fontSize = Math.random() * 10 + 10 + 'px';
        heart.style.animation = `fadeIn 1s ${3.5 + Math.random()}s forwards`; // Show after leaves grow
        heart.style.opacity = '0';
        leaves.appendChild(heart);
    }

    trunk.appendChild(leaves);
    container.appendChild(trunk);
}

// Update teaser text logic
const teasePhrases = [
    "Aww, missed! 🙈", "Not quite! 🤭", "Catch me! ❤️", "Over here! ✨", "Too slow! 🐢"
];

let lastPhraseIndex = -1;
function updateTeaseText() {
    const btn = document.getElementById('tease-btn');
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * teasePhrases.length);
    } while (newIndex === lastPhraseIndex);

    lastPhraseIndex = newIndex;
    btn.textContent = teasePhrases[newIndex];
}

// GitHub Love Tree Animation Logic
function initLoveTree() {
    var canvas = $('#canvas');
    if (!canvas[0] || !canvas[0].getContext) {
        return false;
    }

    // Get canvas dimensions from the element attributes
    var width = parseInt(canvas.attr("width")) || 1100;
    var height = parseInt(canvas.attr("height")) || 680;

    // Ensure canvas native dimensions are set
    canvas[0].width = width;
    canvas[0].height = height;

    // Also set CSS dimensions appropriately
    canvas.css({
        "width": "100%",
        "height": "auto",
        "max-width": "100%"
    });

    var opts = {
        seed: {
            x: width / 2 - 20,
            color: "rgb(190, 26, 37)",
            scale: 2
        },
        branch: [
            [535, 680, 570, 250, 500, 200, 30, 100, [
                [540, 500, 455, 417, 340, 400, 13, 100, [
                    [450, 435, 434, 430, 394, 395, 2, 40]
                ]],
                [550, 445, 600, 356, 680, 345, 12, 100, [
                    [578, 400, 648, 409, 661, 426, 3, 80]
                ]],
                [539, 281, 537, 248, 534, 217, 3, 40],
                [546, 397, 413, 247, 328, 244, 9, 80, [
                    [427, 286, 383, 253, 371, 205, 2, 40],
                    [498, 345, 435, 315, 395, 330, 4, 60]
                ]],
                [546, 357, 608, 252, 678, 221, 6, 100, [
                    [590, 293, 646, 277, 648, 271, 2, 80]
                ]]
            ]]
        ],
        bloom: {
            num: 700,
            width: 1080,
            height: 650,
        },
        footer: {
            width: 1200,
            height: 5,
            speed: 10,
        }
    }

    var tree = new Tree(canvas[0], width, height, opts);
    var seed = tree.seed;
    var foot = tree.footer;
    var hold = 1;

    // Auto-start animation without click
    var seedAnimate = eval(Jscex.compile("async", function () {
        seed.draw();
        while (hold) {
            $await(Jscex.Async.sleep(1)); // Even faster
        }
        while (seed.canScale()) {
            seed.scale(0.95);
            $await(Jscex.Async.sleep(1));
        }
        while (seed.canMove()) {
            seed.move(0, 2);
            foot.draw();
            $await(Jscex.Async.sleep(1));
        }
    }));

    var growAnimate = eval(Jscex.compile("async", function () {
        do {
            // Grow multiple steps per frame for much faster animation
            for (var i = 0; i < 5; i++) {
                if (tree.canGrow()) tree.grow();
            }
            $await(Jscex.Async.sleep(1));
        } while (tree.canGrow());
    }));

    var flowAnimate = eval(Jscex.compile("async", function () {
        do {
            // Flower multiple times per frame
            tree.flower(10); // Increased to 10 for super fast bloom
            $await(Jscex.Async.sleep(1));
        } while (tree.canFlower());
    }));

    var moveAnimate = eval(Jscex.compile("async", function () {
        tree.snapshot("p1", 240, 0, 610, 680);
        while (tree.move("p1", 500, 0)) {
            foot.draw();
            $await(Jscex.Async.sleep(10));
        }
        foot.draw();
        tree.snapshot("p2", 500, 0, 610, 680);

        // canvas.parent().css("background", "url(" + tree.toDataURL('image/png') + ")");
        $await(Jscex.Async.sleep(300));
    }));

    // var textAnimate = eval(Jscex.compile("async", function () {
    //    $("#code").show().typewriter();
    // }));

    var runAsync = eval(Jscex.compile("async", function () {
        // Skip the 'wait for click' part
        hold = 0;

        $await(seedAnimate());
        $await(growAnimate());
        $await(flowAnimate());
        $await(moveAnimate());
        // textAnimate().start(); // DISABLE Github typewriter

        // Trigger OUR typewriter here if needed, or it handles itself in showLayer
    }));

    runAsync().start();
}

// ========== CREATIVE EFFECTS FOR FINAL PAGE ==========

// Initialize Fireflies
function initializeFireflies() {
    const container = document.body;
    const firefliesCount = 15;
    
    for (let i = 0; i < firefliesCount; i++) {
        const firefly = document.createElement('div');
        firefly.classList.add('firefly');
        
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        firefly.style.left = `${x}px`;
        firefly.style.top = `${y}px`;
        
        container.appendChild(firefly);
        
        // Animate firefly movement
        animateFirefly(firefly);
    }
}

function animateFirefly(firefly) {
    let x = parseFloat(firefly.style.left);
    let y = parseFloat(firefly.style.top);
    let vx = (Math.random() - 0.5) * 2;
    let vy = (Math.random() - 0.5) * 2;
    
    const animate = () => {
        x += vx;
        y += vy;
        
        // Bounce off edges
        if (x < 0 || x > window.innerWidth - 6) vx *= -1;
        if (y < 0 || y > window.innerHeight - 6) vy *= -1;
        
        // Keep in bounds
        x = Math.max(0, Math.min(x, window.innerWidth - 6));
        y = Math.max(0, Math.min(y, window.innerHeight - 6));
        
        firefly.style.left = `${x}px`;
        firefly.style.top = `${y}px`;
        
        requestAnimationFrame(animate);
    };
    animate();
}

// Falling Petals Effect
function startFallingPetals() {
    const container = document.body;
    
    const createPetal = () => {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        
        const x = Math.random() * window.innerWidth;
        const duration = Math.random() * 8 + 12; // 12-20 seconds
        const delay = Math.random() * 2;
        
        petal.style.left = `${x}px`;
        petal.style.top = '-20px';
        petal.style.animationDuration = `${duration}s`;
        petal.style.animationDelay = `${delay}s`;
        
        container.appendChild(petal);
        
        // Remove after animation
        setTimeout(() => {
            petal.remove();
        }, (duration + delay) * 1000);
    };
    
    // Create petals continuously
    const petalInterval = setInterval(() => {
        createPetal();
    }, 1500);
    
    // Stop after 45 seconds
    setTimeout(() => {
        clearInterval(petalInterval);
    }, 45000);
}

// Animated Constellation
function createConstellation() {
    const layer7 = document.getElementById('layer-7');
    if (!layer7) return;
    
    // Create canvas for constellation
    const canvas = document.createElement('canvas');
    canvas.id = 'constellation-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '25';
    
    layer7.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let time = 0;
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Define constellation points (heart shape)
    const points = [
        { x: centerX - 80, y: centerY - 60 },
        { x: centerX - 120, y: centerY - 40 },
        { x: centerX - 140, y: centerY },
        { x: centerX - 120, y: centerY + 40 },
        { x: centerX - 60, y: centerY + 80 },
        { x: centerX, y: centerY + 120 },
        { x: centerX + 60, y: centerY + 80 },
        { x: centerX + 120, y: centerY + 40 },
        { x: centerX + 140, y: centerY },
        { x: centerX + 120, y: centerY - 40 },
        { x: centerX + 80, y: centerY - 60 }
    ];
    
    const animate = () => {
        time += 0.02;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw connecting lines
        ctx.strokeStyle = `rgba(255, 105, 180, ${0.3 + 0.2 * Math.sin(time)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        }
        ctx.stroke();
        
        // Draw stars
        points.forEach((point, index) => {
            const scale = 0.5 + 0.5 * Math.sin(time + index * 0.3);
            const radius = 4 * scale;
            
            // Star glow
            ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + 0.4 * Math.sin(time + index)})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius + 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Star core
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    };
    
    animate();
}

// Make Tree Interactive
function makeTreeInteractive() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Calculate angle from canvas center to mouse
        const rect = canvas.getBoundingClientRect();
        const canvasCenterX = rect.left + rect.width / 2;
        const canvasCenterY = rect.top + rect.height / 2;
        
        const angleX = (mouseY - canvasCenterY) / window.innerHeight * 3;
        const angleY = (mouseX - canvasCenterX) / window.innerWidth * 3;
        
        // Apply subtle rotation/skew effect
        canvas.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1)`;
    });
    
    // Reset on mouse leave
    document.addEventListener('mouseleave', () => {
        canvas.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
    
    // Particle burst on click
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        burstParticles(e.clientX, e.clientY);
    });
}

function burstParticles(x, y) {
    const symbols = ['✨', '💖', '⭐', '🌸'];
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('floating-shape');
        particle.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        
        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = 5;
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.fontSize = '24px';
        particle.style.animation = 'none';
        
        document.body.appendChild(particle);
        
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let px = x;
        let py = y;
        
        const burstAnimate = () => {
            px += vx;
            py += vy;
            
            particle.style.left = `${px}px`;
            particle.style.top = `${py}px`;
            
            if (px > -50 && px < window.innerWidth + 50 && py > -50 && py < window.innerHeight + 50) {
                requestAnimationFrame(burstAnimate);
            } else {
                particle.remove();
            }
        };
        
        burstAnimate();
    }
}
