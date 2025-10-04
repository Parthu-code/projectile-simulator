class ProjectileSimulator {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isAnimating = false;
        this.animationId = null;
        
        // Physics parameters
        this.angle = 45;
        this.velocity = 50;
        this.gravity = 9.8;
        this.initialHeight = 0;
        
        // Animation parameters
        this.time = 0;
        this.trajectoryPoints = [];
        this.maxTime = 0;
        
        this.initializeControls();
        this.updateDisplay();
    }
    
    initializeControls() {
        // Angle control
        const angleSlider = document.getElementById('angle');
        const angleValue = document.getElementById('angle-value');
        angleSlider.addEventListener('input', (e) => {
            this.angle = parseFloat(e.target.value);
            angleValue.textContent = `${this.angle}°`;
            this.updateDisplay();
        });
        
        // Velocity control
        const velocitySlider = document.getElementById('velocity');
        const velocityValue = document.getElementById('velocity-value');
        velocitySlider.addEventListener('input', (e) => {
            this.velocity = parseFloat(e.target.value);
            velocityValue.textContent = `${this.velocity} m/s`;
            this.updateDisplay();
        });
        
        // Gravity control
        const gravitySlider = document.getElementById('gravity');
        const gravityValue = document.getElementById('gravity-value');
        gravitySlider.addEventListener('input', (e) => {
            this.gravity = parseFloat(e.target.value);
            gravityValue.textContent = `${this.gravity} m/s²`;
            this.updateDisplay();
        });
        
        // Height control
        const heightSlider = document.getElementById('height');
        const heightValue = document.getElementById('height-value');
        heightSlider.addEventListener('input', (e) => {
            this.initialHeight = parseFloat(e.target.value);
            heightValue.textContent = `${this.initialHeight} m`;
            this.updateDisplay();
        });
        
        // Launch button
        document.getElementById('launch').addEventListener('click', () => {
            this.launch();
        });
        
        // Reset button
        document.getElementById('reset').addEventListener('click', () => {
            this.reset();
        });
    }
    
    calculateTrajectory() {
        const angleRad = (this.angle * Math.PI) / 180;
        const vx = this.velocity * Math.cos(angleRad);
        const vy = this.velocity * Math.sin(angleRad);
        
        // Calculate time of flight
        const discriminant = vy * vy + 2 * this.gravity * this.initialHeight;
        const timeOfFlight = (vy + Math.sqrt(discriminant)) / this.gravity;
        
        // Calculate range
        const range = vx * timeOfFlight;
        
        // Calculate max height
        const maxHeight = this.initialHeight + (vy * vy) / (2 * this.gravity);
        
        return {
            vx,
            vy,
            timeOfFlight,
            range,
            maxHeight
        };
    }
    
    updateDisplay() {
        const results = this.calculateTrajectory();
        
        document.getElementById('range-value').textContent = `${results.range.toFixed(2)} m`;
        document.getElementById('max-height-value').textContent = `${results.maxHeight.toFixed(2)} m`;
        document.getElementById('time-value').textContent = `${results.timeOfFlight.toFixed(2)} s`;
        
        // Generate trajectory points for preview
        this.generateTrajectoryPoints();
        this.drawTrajectory();
    }
    
    generateTrajectoryPoints() {
        const results = this.calculateTrajectory();
        this.trajectoryPoints = [];
        this.maxTime = results.timeOfFlight;
        
        const steps = 100;
        for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * results.timeOfFlight;
            const x = results.vx * t;
            const y = this.initialHeight + results.vy * t - 0.5 * this.gravity * t * t;
            this.trajectoryPoints.push({ x, y, t });
        }
    }
    
    drawTrajectory() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw axes
        this.drawAxes();
        
        // Draw trajectory
        if (this.trajectoryPoints.length > 0) {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            const scale = this.getScale();
            const offsetY = this.canvas.height - 50;
            
            this.trajectoryPoints.forEach((point, index) => {
                const x = point.x * scale + 50;
                const y = offsetY - point.y * scale;
                
                if (index === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            });
            
            this.ctx.stroke();
            
            // Draw start point
            this.ctx.fillStyle = '#00ff00';
            this.ctx.beginPath();
            this.ctx.arc(50, offsetY - this.initialHeight * scale, 6, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw end point
            const lastPoint = this.trajectoryPoints[this.trajectoryPoints.length - 1];
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.beginPath();
            this.ctx.arc(lastPoint.x * scale + 50, offsetY - lastPoint.y * scale, 6, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        const scale = this.getScale();
        
        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawAxes() {
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        
        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height - 50);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 50);
        this.ctx.stroke();
        
        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(50, 0);
        this.ctx.lineTo(50, this.canvas.height);
        this.ctx.stroke();
    }
    
    getScale() {
        const results = this.calculateTrajectory();
        const maxX = results.range;
        const maxY = Math.max(results.maxHeight, this.initialHeight);
        
        const scaleX = (this.canvas.width - 100) / maxX;
        const scaleY = (this.canvas.height - 100) / (maxY + 10);
        
        return Math.min(scaleX, scaleY, 5); // Cap scale for very large values
    }
    
    launch() {
        if (this.isAnimating) {
            return;
        }
        
        this.isAnimating = true;
        this.time = 0;
        this.generateTrajectoryPoints();
        
        this.animate();
    }
    
    animate() {
        if (!this.isAnimating) {
            return;
        }
        
        const results = this.calculateTrajectory();
        const scale = this.getScale();
        const offsetY = this.canvas.height - 50;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid and axes
        this.drawGrid();
        this.drawAxes();
        
        // Draw trajectory up to current time
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        let currentPoint = null;
        for (let i = 0; i < this.trajectoryPoints.length; i++) {
            const point = this.trajectoryPoints[i];
            
            if (point.t <= this.time) {
                const x = point.x * scale + 50;
                const y = offsetY - point.y * scale;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
                
                currentPoint = point;
            } else {
                break;
            }
        }
        
        this.ctx.stroke();
        
        // Draw projectile
        if (currentPoint) {
            const projectileX = currentPoint.x * scale + 50;
            const projectileY = offsetY - currentPoint.y * scale;
            
            // Projectile
            this.ctx.fillStyle = '#ffff00';
            this.ctx.beginPath();
            this.ctx.arc(projectileX, projectileY, 5, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        
        // Draw start point
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.arc(50, offsetY - this.initialHeight * scale, 6, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Update time
        this.time += 0.02;
        
        if (this.time >= results.timeOfFlight) {
            this.isAnimating = false;
            // Draw end point
            const lastPoint = this.trajectoryPoints[this.trajectoryPoints.length - 1];
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.beginPath();
            this.ctx.arc(lastPoint.x * scale + 50, offsetY - lastPoint.y * scale, 6, 0, 2 * Math.PI);
            this.ctx.fill();
            return;
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    reset() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.time = 0;
        this.updateDisplay();
    }
}

// Initialize the simulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ProjectileSimulator();
});
