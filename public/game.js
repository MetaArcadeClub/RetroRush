let player; // Define player in the outer scope
let interval; // Define interval here to clear it later when needed
let gravity = 0.9;
let obstacles = [];
let frames = 0;

// Game initialization and modal control
document.getElementById('start-game-button').onclick = function() {
    document.getElementById('game-modal').style.display = 'block';
    if (!interval) {
        startGame();
    }
};

document.getElementsByClassName('close-button')[0].onclick = function() {
    document.getElementById('game-modal').style.display = 'none';
    clearInterval(interval); // Clear the game loop interval
    interval = null; // Make sure to set this to null after clearing
};

window.onclick = function(event) {
    let modal = document.getElementById('game-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
        clearInterval(interval); // Clear the game loop interval
        interval = null; // Make sure to set this to null after clearing
    }
};

function startGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 200;

    player = { x: 50, y: 170, width: 30, height: 30, gravity: 0, jump: 5, jumping: false };
    obstacles = []; // Reset obstacles
    frames = 0; // Reset frames

    function updateGameArea() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white'; // Set the fill color to white

    if (player.jumping) {
        player.gravity -= player.jump;
    }
    player.gravity += gravity;
    player.y += player.gravity;
    if (player.y >= 170) {
        player.y = 170;
        player.gravity = 0;
        player.jumping = false;
    }

    ctx.fillRect(player.x, player.y, player.width, player.height); // Draw player

    obstacles.forEach(function(obstacle, index) {
        obstacle.x -= 5;
        ctx.fillRect(obstacle.x, canvas.height - obstacle.height, obstacle.width, obstacle.height); // Draw obstacles
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
        }
    });

    if (frames % 60 === 0) {
        let minHeight = 20;
        let maxHeight = 100;
        let height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        obstacles.push({ x: canvas.width, height: height, width: 20 });
    }

    frames++;
}

    // Start the game loop
    interval = setInterval(updateGameArea, 20);
}

// Keydown event listener for jumping
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && player && player.y >= 170) {
        player.jumping = true;
    }
});

// Fetch and update user profile
function fetchProfileAndUpdateUI() {
    // ... Your fetchProfileAndUpdateUI function logic
}

// Once the DOM is fully loaded, fetch the profile
document.addEventListener('DOMContentLoaded', function() {
    fetchProfileAndUpdateUI();
});
