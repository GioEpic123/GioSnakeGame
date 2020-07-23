/*********SNAKE GAME JAVA SCRIPT*****************/

/***INITIALIZING VARIABLES AND OBJECTS***/
//

//Canvas is the space we draw onto
//Context specifies in which orientation to animate
//Grid is the # of pixels between every space on the grid
var canvas = document.getElementById('game');
var context = canvas.getContext('2d');
var grid = 40;

//Count serves as an animation timer, For use with "frames" below.
//Frames is the default # of frames before frame update. Scales to the score to increase the speed
var count = 0; 
var frames = 16;

//A Boolean to decide whether or not to pause game in case of game over
var gameOver = false;

//# of Snake tiles painted, as to help alternate coloring 
var numOfTail = 4;

//PowerCount serves as a powerup timer in snakeSquadLoop, starts at 12 so that player won't power down untill necessary
//PoweredUp decides whether or not to make player immune to tail
var powerCount = 12;
var poweredUp = false;

/**
//
//-----------Bitmoji Variables are located in "Bitmoji Functionality" in the Draw Functions
//
**/

//Player Object, storing player's head location, velocity, and an array (cells) which holds the location of the snake's tail blocks
var snake = {
  x: 160,
  y: 160,
  x_step: grid, //snake velocity. moves one grid length every frame in either the x or y direction
  y_step: 0,
  cells: [],  //an array that keeps track of all grids the snake body occupies
  currentLength: 4, //current length of the snake. grows when eating an apple. 
  color: "white"
}

//Apple Object, never really dissapears, just gets relocated after contact
var apple = {
  x: 80,
  y: 80,
  color: "gold"
}

//Powerup Object, works similarly to Apple but has different functionality
var power = {
  x: 280,
  y: 200,
  color: "green"
  
}

/**DRAW FUNCTIONS---------------------------------------------------------------***/
//
//Draws the apple at it's location, in it's color
function drawApple(){
  context.fillStyle = apple.color;
  context.fillRect(apple.x + 2, apple.y + 2,36,36);
}
//Draws power up at it's location, in it's color
function drawPower(){
  context.fillStyle = power.color;
  context.fillRect(power.x + 2, power.y + 2,36,36);
}

//Draws each cell of the snake, and uses numOfTail var to change the color of each tail segment depending on order.
//First cell of Snake is drawn as bitmoji using function below
function drawSnake(){
  drawCellWithBitmoji(snake)
  for(let i = 1; i < snake.cells.length; i++){
    if(numOfTail % 4 === 0){
      context.fillStyle = "#E30C00";  
    }else if(numOfTail % 2 != 0){
      context.fillStyle = "#F0600C";
    }else{
      context.fillStyle = "#D68F0B";
    }
    context.fillRect(snake.cells[i].x + 5, snake.cells[i].y + 5, 30, 30);
    numOfTail++;
  }
}

/**BITMOJI FUNCTIONALITY***/
//
//Size is the default size for the Bitmoji
var size = 60;
//Pixels to Offset both x & y Positions for bitmoji icon
var YOffSet = 2;
var XOffSet = 4;

//drawCellWithBitmoji
//Takes a cell (with an x and y property) and fills the cell with a bitmoji instead of a square
function drawCellWithBitmoji(cell){
  var avatar_url = localStorage.getItem('avatarurl');
  document.getElementById('avatar').src = avatar_url;
  context.drawImage(document.getElementById('avatar'),0, 0, 200, 200, cell.x - XOffSet, cell.y - YOffSet, size, size);
}

//Takes in offset coordinates from x,y, and then a new size to resize the bitmoji (for powerup Functionality)
function resizeBitmoji(xoff, yoff, newsize){ //Takes in 2 offset directions and a new size and resizes Bitmoji (For use w powerup)
  size = newsize;
  YOffSet = yoff;
  XOffSet = xoff;
}

/***MAIN FUNCTIONS----------------------------------------------------------------------------***/
//

/* start the game */
requestAnimationFrame(snakeSquadLoop);

/* Listen to keyboard events to move the snake */
document.addEventListener('keydown', function(e) {
  // prevent snake from backtracking on itself by checking that it's 
  // not already moving on the same axis (pressing left while moving
  // left won't do anything, and pressing right while moving left
  // shouldn't let you collide with your own body)

  // left arrow key
  if ((e.which === 37 || e.which === 65) && snake.x_step === 0) {
    snake.x_step = -grid;
    snake.y_step = 0;
  }
  // up arrow key
  else if ((e.which === 38 || e.which === 87) && snake.y_step === 0) {
    snake.y_step = -grid;
    snake.x_step = 0;
  }
  // right arrow key
  else if ((e.which === 39 || e.which === 68) && snake.x_step === 0) {
    snake.x_step = grid;
    snake.y_step = 0;
  }
  // down arrow key
  else if ((e.which === 40 || e.which === 83) && snake.y_step === 0) {
    snake.y_step = grid;
    snake.x_step = 0;
  }
});


/*snakeSquadLoop: This is the main code that is run each time the game loops*/
//Will not run unless GameOver is Off
function snakeSquadLoop() {
  if(!gameOver){ 
    
    requestAnimationFrame(snakeSquadLoop);
    
    //Will not animate untill count is equal to frames (frames scales below, at speedIncrease() )
    if (count < frames) {
      count++;
      return;
    }
    
    //Powers down 5 seconds after powerUp is initialized, making use of the Looping function
    if(powerCount == 10){
      powerDown();
    }
    
    //
    if(powerCount < 12){
      powerCount++;
    }
      
    count = 0;
    context.clearRect(0,0,canvas.width,canvas.height);

    calculateSnakeMove();
    drawApple();
    drawPower();
    drawSnake();
    
    if(snakeTouchesApple()){
      randomlyGenerateApple();
      snake.currentLength++;
      speedIncrease(); // Makes the game faster IF the score is a mult. of 8
      updateScore();
    }
    
    if(snakeTouchesPower()){
      randomlyGeneratePower();
      powerUp();
      powerCount = 0;
    }
    
    
    if(checkCrashItself()){
      endGame();
    }
    
    
  }
}

/*END GAME LOGIC ----------
-endGame() halts the game loop and turns on the Game Over Overlay 
-overlayOn() makes the overlay visible & Sets the Overlay text to display final score
-overlayOff() turns the overlay off (on click) and reloads the game to start over
*/
function endGame(){
  gameOver = true;
  overlayOn();
}

function overlayOn(){
  document.getElementById("overlay").style.display = "block";
  document.getElementById('overText').innerHTML = `-=GAME OVER=-
--Final Score: ${snake.currentLength - 4}--

Click Here to Restart`;
}

function overlayOff(){
  document.getElementById("overlay").style.display = "none";
  document.location.reload();
}

/***HELPER FUNCTIONS----------------------------------------------------------------------***/

function calculateSnakeMove(){
  // move snake by its velocity
  snake.x += snake.x_step;
  snake.y += snake.y_step;

  // wrap snake position horizontally on edge of screen
  if (snake.x < 0) {
    snake.x = canvas.width - grid;
  }
  else if (snake.x >= canvas.width) {
    snake.x = 0;
  }
  // wrap snake position vertically on edge of screen
  if (snake.y < 0) {
    snake.y = canvas.height - grid;
  }
  else if (snake.y >= canvas.height) {
    snake.y = 0;
  }
  // keep track of where snake has been. front of the array is always the head
  snake.cells.unshift({x: snake.x, y: snake.y});

  // remove cells as we move away from them
  if (snake.cells.length > snake.currentLength) {
    snake.cells.pop();
  }
}

//Checks if snake collides with apple by looking at the coordinates
function snakeTouchesApple(){
  if((snake.cells[0].x === apple.x) && (snake.cells[0].y === apple.y)){
     return true;
  }
}

//Similar to above, checks for powerup instead of apple
function snakeTouchesPower(){
  
  if(!poweredUp){
    if((snake.cells[0].x === power.x) && (snake.cells[0].y === power.y)){
     return true;
  }
  }
  
}

//Randomly moves the apple when called
function randomlyGenerateApple(){
  apple.x = getRandomInt(0, 15) * grid;
  apple.y = getRandomInt(0, 15) * grid;
}

//Randomly moves the powerup when called
function randomlyGeneratePower(){
  power.x = getRandomInt(0, 15) * grid;
  power.y = getRandomInt(0, 15) * grid;
}

//Power Up Functionaloty--
//--On powerUp()
//-Bitmoji Gets Resized to 100px (instead of 60)
//-Collisions with tail & powerups are ignored
//
//--On powerDown()
//-returns bitmoji to original size,
//-collisions are re-enabled
function powerUp(){
  resizeBitmoji(10, 10, 100);
  console.log("Powering Up");
  poweredUp = true;
  
}
function powerDown(){
  console.log("powering Down");
  resizeBitmoji(4, 2, 60)
  poweredUp = false;
}




//Checks for tail collisions if not powered up.
//Does this by comparing x & y values with every tail segment & the head
function checkCrashItself(){
  if(!poweredUp){
    for (let i = 0; i < snake.cells.length; i++){
      for(let j = i + 1; j < snake.cells.length; j++){
        if((snake.cells[i].x === snake.cells[j].x) && (snake.cells[i].y === snake.cells[j].y)){ 
          return true;
        }  
      }
    }
  }
}

/*getRandomInt
takes a mininum and maximum integer
returns a whole number randomly in that range, inclusive of the mininum and maximum
see https://stackoverflow.com/a/1527820/2124254
*/
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//For use with the scoreboard, updates the score every time user collects an apple
function updateScore(){
  document.getElementById('scoreboard').innerHTML = `Score: ${snake.currentLength - 4}`;
}

//Increases the speed every time score is divisible by 5
function speedIncrease(){
  if((snake.currentLength - 4) % 5 === 0){
    frames = frames * .875;
    console.log("Frame decrease - Zoom!");
  }
}

