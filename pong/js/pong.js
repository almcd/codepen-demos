(function () {
  // Canvas setup
  var canvas = document.getElementById('canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext('2d');
  var last = 0;

  // Game state
  var gameState = {
    roundOver: true,
    gameMode: 1,        // 0 = player vs player. 1 = player vs computer
    debugMode: false,   // true = show invisible ball that AI tracks
    playerAScore: 0,
    playerBScore: 0,
    lastScored: 'playerA',  

    start: function () {
      ball.init();
      this.roundOver = false;
    }
  };

  // Ball
  var ball = {
    x: null,
    y: null,
    radius: 6,
    xspeed: null,
    yspeed: null,
    color: 'black',
    clonedBall: null,

    init: function() {
      // Whoever scored last, serves
      this.x = gameState.lastScored === 'playerA' ? 100 : canvas.width - 100;
      this.y = gameState.lastScored === 'playerA' ? paddleLeft.top + (paddleLeft.height / 2) : paddleRight.top + (paddleRight.height / 2); // serve from current location of paddle
      this.xspeed = gameState.lastScored === 'playerA' ? 4.7 : -4.7;
      this.yspeed = (Math.floor(Math.random() * 2) == 0) ? 5 : -5; // direction of ball is somewhat random

      if (gameState.lastScored === 'playerA') {
        this.clone();
      }
    },

    move: function() {
      this.x = this.x + this.xspeed;
      this.y = this.y + this.yspeed;
    },
    
    reverse: function() {
      this.xspeed = this.xspeed * -1;
    },

    // Handle bouncing off top and bottom of window
    bounce: function() {
      if ((this.y > canvas.height - this.radius) || (this.y < 0 + this.radius)) {
        this.yspeed = this.yspeed * -1;
      }
    },

    draw: function() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();
    },

    // Clone ball and increase speed. Used for AI, to provide more naturalistic opposition
    clone: function() {
      this.clonedBall = Object.assign({}, ball); 
      this.clonedBall.xspeed = this.clonedBall.xspeed * 1.05;
      this.clonedBall.yspeed = this.clonedBall.yspeed * 1.05;
      this.clonedBall.color = 'red';
    }
  };

  // Paddle 'class'
  var paddle  = {
    side: null,
    color: null,
    height: 80,
    width: 10,
    speed: 0,
    top: (canvas.height / 2) - 80,

    updateSpeed: function(num) {
      this.speed = num;
    },

    move: function() {
      this.top += this.speed;
    },

    checkForBounce: function() {
      if (this.side === 'left') {
        if (ball.x <= this.width + ball.radius) {
          if (ball.y > this.top && ball.y < (this.top + this.height)) {
            // Paddle Left Hit
            ball.reverse();
            if (gameState.gameMode === 1) {
              ball.clone();
            }
          } else {
            // Player One Lost
            gameState.playerBScore ++;
            gameState.lastScored = 'playerB';
            gameState.roundOver = true;
            updateScores();
            gameState.start();
          }
        }
      } else if (this.side === 'right') {
        if (ball.x >= canvas.width - this.width - ball.radius) {
          if (ball.y > this.top && ball.y < (this.top + this.height)) {
            // Paddle Right Hit
            ball.reverse();
            if (gameState.gameMode === 1) {
              ball.clonedBall = null;
            }
          } else {
            // Player Two Lost
            gameState.playerAScore ++;
            gameState.lastScored = 'playerA';
            gameState.roundOver = true;
            updateScores();
            gameState.start();
          }
        }   
      }
    },
    
    // Ensure paddles can't leave the screen
    limitBounds: function() {
      if (this.top < 0) {
        this.top = 0;
      } else if (this.top + this.height > canvas.height) {
        this.top = canvas.height - this.height;
      }   
    },
    
    draw: function() {
        ctx.beginPath();
    
        if (this.side === 'left') {
          ctx.rect(0, this.top, this.width, this.height);
        } else if (this.side === 'right') {
          ctx.rect(canvas.width - this.width, this.top, this.width, this.height);
        }
        
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
  };

  // Instantiate paddles
  var paddleLeft = Object.create(paddle,
  {
    side: { value: 'left' },
    color: { value: 'black' },
  });

  var paddleRight = Object.create(paddle,
  {
    side: { value: 'right' },
    color: { value: 'black' }
  });

  // Listen for user input
  window.addEventListener('keydown', function(evt) {
    var keyCode = evt.keyCode;

    if (keyCode === 87) {
      paddleLeft.updateSpeed(-5);
    } else if (keyCode === 83) {
      paddleLeft.updateSpeed(5);
    }

    if (gameState.gameMode !== 1) {
      if (keyCode === 38) {
        paddleRight.updateSpeed(-5);
      } else if (keyCode === 40) {
        paddleRight.updateSpeed(5);
      }   
    }
  });

  // Stop paddle movement when keydown ends
  window.addEventListener('keyup', function(evt) {
    var keyCode = evt.keyCode;

    if (keyCode === 87) {
      paddleLeft.updateSpeed(0);
    } else if (keyCode === 83) {
      paddleLeft.updateSpeed(0);
    }

    if (gameState.gameMode !== 1) {
      if (keyCode === 38) {
        paddleRight.updateSpeed(0);
      } else if (keyCode === 40) {
        paddleRight.updateSpeed(0);
      }
    }
  });

  // Move paddleRight according to cloned ball
  function aiPlayer() {
    var impactDistance, impactTime, targetY;

    if (ball.xspeed < 0) {
      // Ball is moving away, rest paddle at center of screen
      targetY = canvas.height / 2;
    } else {
      // Ball approaching
      impactDistance = canvas.width - ball.radius - paddleRight.width - ball.clonedBall.x;
      impactTime = impactDistance / (ball.clonedBall.xspeed * .25 * 1000);
      targetY = ball.clonedBall.y + (ball.clonedBall.yspeed * .25 * 1000) * impactTime;
    }

    if (Math.abs(targetY - (paddleRight.top + paddleRight.height/2)) < 20) {
      // AI doesn't need to move
      paddleRight.speed = 0;
      return;
    }

    if (targetY > paddleRight.top + (paddleRight.height / 2)) {
      // Move the paddle down
      paddleRight.speed = 4;
    }

    if (targetY < paddleRight.top + (paddleRight.height / 2)) {
      // Move the paddle up
      paddleRight.speed = -4;
    }
  }

  // Update DOM to reflect latest scores
  function updateScores() {
    document.querySelector('.playerAScore').innerHTML = gameState.playerAScore;
    document.querySelector('.playerBScore').innerHTML = gameState.playerBScore;
  }

  // Game loop
  function animate(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ball.move();

    if(ball.clonedBall) {
      ball.clonedBall.move();    
    }

    paddleLeft.move();
    paddleRight.move();

    paddleLeft.limitBounds();
    paddleRight.limitBounds();

    paddleLeft.checkForBounce();
    paddleRight.checkForBounce();

    ball.bounce();

    if(ball.clonedBall) {
      ball.clonedBall.bounce();    
    }

    paddleLeft.draw();
    paddleRight.draw();

    ball.draw();

    if(ball.clonedBall && gameState.debugMode === true) {
      ball.clonedBall.draw();    
    }

    if (gameState.gameMode === 1) {
      // Throttle call to aiPlayer
      if(!last || now - last >= 100) {
        last = now;
        aiPlayer();
      }
    }
    
    // Call recursively, if game isn't over
    if (!gameState.roundOver) {
      requestAnimationFrame(animate);
    }   
  }

  gameState.start();
  requestAnimationFrame(animate);
})();