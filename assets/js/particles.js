(function() {
    console.log("Sect Atmosphere Script Loaded");

    function init() {
        console.log("Sect Atmosphere Initialized");
        const canvas = document.getElementById('sect-atmosphere');

        if (!canvas) {
            console.error("Canvas element 'sect-atmosphere' not found!");
            return;
        }

        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        // Configuration
        const particleCount = 60;
        const colors = ['rgba(138, 0, 0,', 'rgba(212, 175, 55,']; // Blood Red, Imperial Gold

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        class Petal {
            constructor() {
                this.reset(true);
            }

            reset(initial = false) {
                this.x = Math.random() * width;
                this.y = initial ? Math.random() * height : -10;
                this.size = Math.random() * 3 + 2; // 2px to 5px
                this.speedY = Math.random() * 1 + 0.5; // 0.5 to 1.5
                this.swayAmplitude = Math.random() * 20 + 10;
                this.swayFrequency = Math.random() * 0.02 + 0.01;
                this.time = Math.random() * 100;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.02;

                // Color selection
                const colorBase = colors[Math.floor(Math.random() * colors.length)];
                const opacity = Math.random() * 0.4 + 0.4; // 0.4 to 0.8
                this.color = colorBase + opacity + ')';
            }

            update() {
                this.y += this.speedY;
                this.time += this.swayFrequency;
                this.x += Math.sin(this.time) * 0.5; // Gentle sway
                this.rotation += this.rotationSpeed;

                if (this.y > height) {
                    this.reset();
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.fillStyle = this.color;
                ctx.beginPath();
                // Draw an oval/petal shape
                ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }

        // Setup
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Petal());
        }

        animate();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
