// Game constants
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const giftsLeftElement = document.getElementById('gifts-left');
const restartBtn = document.getElementById('restartBtn');
const TOTAL_GIFTS = 10;

// Game state
let score = 0;
let giftsRemaining = TOTAL_GIFTS;
let gameOver = false;

// Gift physics
let gift = null;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragEndX = 0;
let dragEndY = 0;

// Sleigh position (target)
const sleigh = {
    x: 600,
    y: 450,
    width: 150,
    height: 80
};

// Gift class
class Gift {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = 25;
        this.gravity = 0.5;
        this.active = true;
        this.inSleigh = false;
    }

    update() {
        if (!this.active) return;

        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Check if gift lands in sleigh
        if (!this.inSleigh && 
            this.x > sleigh.x && 
            this.x < sleigh.x + sleigh.width &&
            this.y > sleigh.y && 
            this.y < sleigh.y + sleigh.height) {
            this.inSleigh = true;
            this.active = false;
            score++;
            scoreElement.textContent = score;
        }

        // Check if gift is out of bounds
        if (this.y > canvas.height || this.x < 0 || this.x > canvas.width) {
            this.active = false;
        }
    }

    draw() {
        ctx.save();
        
        // Draw gift box
        if (this.inSleigh) {
            ctx.globalAlpha = 0.5;
        }
        
        // Gift box
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Ribbon vertical
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(this.x - 3, this.y - this.size/2, 6, this.size);
        
        // Ribbon horizontal
        ctx.fillRect(this.x - this.size/2, this.y - 3, this.size, 6);
        
        // Bow
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.size/2, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Draw Santa's sleigh
function drawSleigh() {
    ctx.save();
    
    // Sleigh body
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(sleigh.x, sleigh.y + 40);
    ctx.lineTo(sleigh.x + 20, sleigh.y + sleigh.height);
    ctx.lineTo(sleigh.x + sleigh.width - 20, sleigh.y + sleigh.height);
    ctx.lineTo(sleigh.x + sleigh.width, sleigh.y + 40);
    ctx.lineTo(sleigh.x + sleigh.width, sleigh.y);
    ctx.lineTo(sleigh.x, sleigh.y);
    ctx.closePath();
    ctx.fill();
    
    // Sleigh runners
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(sleigh.x + 10, sleigh.y + sleigh.height);
    ctx.quadraticCurveTo(sleigh.x - 10, sleigh.y + sleigh.height + 10, sleigh.x - 20, sleigh.y + sleigh.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(sleigh.x + sleigh.width - 10, sleigh.y + sleigh.height);
    ctx.quadraticCurveTo(sleigh.x + sleigh.width + 10, sleigh.y + sleigh.height + 10, sleigh.x + sleigh.width + 20, sleigh.y + sleigh.height);
    ctx.stroke();
    
    // Decorative red trim
    ctx.fillStyle = '#c41e3a';
    ctx.fillRect(sleigh.x, sleigh.y, sleigh.width, 10);
    
    ctx.restore();
}

// Draw ground
function drawGround() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 550, canvas.width, 50);
    
    // Snow details
    ctx.fillStyle = '#f0f8ff';
    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(i * 80 + 20, 560, 15, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw launch area
function drawLaunchArea() {
    ctx.save();
    ctx.fillStyle = 'rgba(196, 30, 58, 0.3)';
    ctx.fillRect(50, 500, 100, 50);
    ctx.strokeStyle = '#c41e3a';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 500, 100, 50);
    
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.fillText('Launch', 70, 530);
    ctx.restore();
}

// Draw aim line when dragging
function drawAimLine() {
    if (isDragging) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(dragStartX, dragStartY);
        ctx.lineTo(dragEndX, dragEndY);
        ctx.stroke();
        ctx.restore();
        
        // Draw power indicator
        const distance = Math.sqrt(
            Math.pow(dragEndX - dragStartX, 2) + 
            Math.pow(dragEndY - dragStartY, 2)
        );
        const power = Math.min(distance / 2, 100);
        
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText(`Power: ${Math.round(power)}%`, 10, 30);
    }
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snow clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(100, 80, 40, 0, Math.PI * 2);
    ctx.arc(140, 70, 50, 0, Math.PI * 2);
    ctx.arc(180, 80, 40, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(500, 100, 50, 0, Math.PI * 2);
    ctx.arc(550, 90, 60, 0, Math.PI * 2);
    ctx.arc(610, 100, 50, 0, Math.PI * 2);
    ctx.fill();
    
    drawGround();
    drawSleigh();
    drawLaunchArea();
    
    // Draw gift if it exists
    if (gift) {
        gift.draw();
    }
    
    drawAimLine();
    
    // Draw game over message
    if (gameOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.font = '32px Arial';
        ctx.fillText(`Final Score: ${score} / ${TOTAL_GIFTS}`, canvas.width / 2, canvas.height / 2 + 10);
        
        const percentage = (score / TOTAL_GIFTS) * 100;
        let message = '';
        if (percentage === 100) message = '🎅 Perfect! Santa is impressed! 🎅';
        else if (percentage >= 70) message = '🎁 Great job! 🎁';
        else if (percentage >= 40) message = '⛄ Not bad! ⛄';
        else message = '🎄 Keep practicing! 🎄';
        
        ctx.font = '24px Arial';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 60);
        
        ctx.restore();
    }
}

// Update game
function update() {
    if (gift && gift.active) {
        gift.update();
    } else if (gift && !gift.active && !gameOver) {
        // Gift has landed, check if we have more gifts
        if (giftsRemaining <= 0) {
            gameOver = true;
            restartBtn.style.display = 'block';
        } else {
            gift = null;
        }
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Mouse event handlers
canvas.addEventListener('mousedown', (e) => {
    if (gameOver || isDragging || (gift && gift.active)) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is in launch area
    if (x >= 50 && x <= 150 && y >= 500 && y <= 550) {
        isDragging = true;
        dragStartX = 100;
        dragStartY = 525;
        dragEndX = x;
        dragEndY = y;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const rect = canvas.getBoundingClientRect();
    dragEndX = e.clientX - rect.left;
    dragEndY = e.clientY - rect.top;
});

canvas.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    
    isDragging = false;
    
    // Calculate velocity based on drag
    const dx = dragStartX - dragEndX;
    const dy = dragStartY - dragEndY;
    
    const velocityScale = 0.15;
    const vx = dx * velocityScale;
    const vy = dy * velocityScale;
    
    // Create and launch gift
    gift = new Gift(dragStartX, dragStartY, vx, vy);
    giftsRemaining--;
    giftsLeftElement.textContent = giftsRemaining;
});

// Touch event handlers for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameOver || isDragging || (gift && gift.active)) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (x >= 50 && x <= 150 && y >= 500 && y <= 550) {
        isDragging = true;
        dragStartX = 100;
        dragStartY = 525;
        dragEndX = x;
        dragEndY = y;
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDragging) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    dragEndX = touch.clientX - rect.left;
    dragEndY = touch.clientY - rect.top;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!isDragging) return;
    
    isDragging = false;
    
    const dx = dragStartX - dragEndX;
    const dy = dragStartY - dragEndY;
    
    const velocityScale = 0.15;
    const vx = dx * velocityScale;
    const vy = dy * velocityScale;
    
    gift = new Gift(dragStartX, dragStartY, vx, vy);
    giftsRemaining--;
    giftsLeftElement.textContent = giftsRemaining;
});

// Restart button
restartBtn.addEventListener('click', () => {
    score = 0;
    giftsRemaining = TOTAL_GIFTS;
    gameOver = false;
    gift = null;
    isDragging = false;
    
    scoreElement.textContent = score;
    giftsLeftElement.textContent = giftsRemaining;
    restartBtn.style.display = 'none';
});

// Start game loop
gameLoop();
