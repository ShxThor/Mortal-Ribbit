window.onload = function() {
    var selectedBackground = localStorage.getItem('selectedBackground');
    if (selectedBackground) {
        document.body.style.backgroundImage = `url('${selectedBackground}')`;
    }

    var player1 = document.getElementById('Player1-name');
    var player2 = document.getElementById('Player2-name');

    player1.textContent = localStorage.getItem('player1');
    player2.textContent = localStorage.getItem('player2');
}
function hide(id) {
    if(document.getElementById) {
        var div = document.getElementById(id);
        div.style.display = (div.style.display=='block'?'none':'none'); // Es wird überprüft, ob der aktuelle display-Wert des div-Elements 'block' ist. Wenn div.style.display gleich 'block' ist, wird der Wert auf 'none' gesetzt.
        //Wenn div.style.display nicht 'block' ist (also 'none' oder leer), wird der Wert auf 'none' gesetzt. Dies macht das Element unsichtbar. 
    }
}
function show(id) {
    if(document.getElementById) {
        var div = document.getElementById(id);
        div.style.display = (div.style.display=='block'?'none':'block'); // Es wird überprüft, ob der aktuelle display-Wert des div-Elements 'block' ist. Wenn div.style.display gleich 'block' ist, wird der Wert auf 'none' gesetzt.
        //Wenn div.style.display nicht 'block' ist (also 'none' oder leer), wird der Wert auf 'block' gesetzt. Dies macht das Element sichtbar. 
    }
}


const display = document.getElementById("display"); //Just for tests to see amount of hits, will be deleted later
let isKeydown = false;
let finishhim = true

function updateHealthBar(playerId) {
    const healthBar = document.getElementById(`health${playerId}`);
    const currentHealth = healthBar.value;
    
    if (currentHealth <= 0){
        hide('CanvasContent')
        show('GameOverContent')
        announcer.src = '../audio/game-over.mp3'
        announcer.play()
        pauseGame.pause = true
        
    }
    else if (currentHealth <= 30){
        healthBar.style.setProperty('--progress-color', 'red');
    }else if (currentHealth <= 50) {
        healthBar.style.setProperty('--progress-color', 'orange');
    } else if (currentHealth > 50) {
        healthBar.style.setProperty('--progress-color', '#008000'); // oder die ursprüngliche Farbe
    }
    if(currentHealth <= 10 && currentHealth > 0 && finishhim){
        announcer.src = '../audio/finish-him.mp3'
        announcer.play();
        finishhim = false
    }
}

// create and style canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = screen.width
canvas.height = screen.height - 350
const gravity = 0.7 //value for gravity
let soundTrack = document.getElementById('audio') // Soundtrack of game
let announcer = new Audio('../audio/fight.mp3')


class Pause {
    constructor({pause}){
        this.pause = pause
    }
}

//player Object
class Player {
    constructor({position, scale ,imageSrc ,maxFrame = 1 ,frames, orientation, foldersrc,imageOffset, velocity, color}) {

        this.position = position // Player position top left corner
        this.scale = scale // Scalefactor to scale frame up or down
        this.imageSrc = imageSrc // Source of the displayed image
        this.maxFrame = maxFrame // Number of frames inside of one png
        this.frames = frames // Collection of animated images
        this.image = new Image() // Displayed image
        this.currentFrame = 0 // Current Frame of animation
        this.frameCount = 0 // Count of every frame ever displayed (Infinite hight number)
        this.fpc = 3 // Frames per count 
        this.orientation = orientation // Direction player is facing part of the image path
        this.foldersrc = foldersrc // Folder in which the images are being stored
        this.imageOffset = imageOffset 

        for (const frame in this.frames) // Initializes the image for every object in frames collection
        {
            frames[frame].image = new Image() // Creates an Image object at position of frame in frames
            frames[frame].image.src = this.foldersrc + this.orientation + frames[frame].imageSrc // Sets Image source for frame in frames
        }

        this.velocity = velocity;
        this.width = 60 // Player hitbox size
        this.height = -170
        this.lastKey
        this.PunchBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            punchOffset: {
                x: 0,
                y: -140
            },
            width: 160,
            height: 20
        }
        this.KickBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            kickOffset: {
                x: 0,
                y: -145
            },
            width: 220,
            height: 20
        }
        this.color = color; // Color of the Hitbox for debugging
        this.isCrouching = false
        this.isKickFalling = false
        this.isAttacking = false
        this.isJabing = false
        this.isKicking = false
        this.isHitting = false
        this.delay = 100

        this.image = this.frames.idle.image
        this.maxFrame = this.frames.idle.maxFrame

        this.sound = new Audio()
        //The vars to make an input delay
        this.allowedToPunch = true;
        this.allowedToKick = true;
    }
    

    //player and attack Animations
    draw() { // printet den Rect (Player)

        ctx.drawImage( 
            this.image,
            this.currentFrame * (this.image.width / this.maxFrame), // calculates the beginning left corner of the image to display the current frame
            0, // image staring point in y direction
            this.image.width / this.maxFrame, // calculates the width of one single frame by deafault in my character it is 128px
            this.image.height, // bottom side of image by deafault it should be 128px
            this.position.x - this.imageOffset.x, // X- position, were the image is displayed in canvas NOTE: Without offset correction
            this.position.y - this.imageOffset.y, // Y- position, were the image is displayed in canvas NOTE: Without offset correction
            (this.image.width / this.maxFrame) * this.scale,
            this.image.height * this.scale
        )

        // // Draws Player Hitboxes
        // ctx.fillStyle = this.color
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    
        // //attackBox
        // if (this.isJabing === true){
        // ctx.fillStyle = 'green'
        // ctx.fillRect(this.PunchBox.position.x, this.PunchBox.position.y, this.PunchBox.width, this.PunchBox.height)
        // }
        // if(this.isHitting){
        //     ctx.fillStyle = 'red'
        // ctx.fillRect(this.PunchBox.position.x, this.PunchBox.position.y, this.PunchBox.width, this.PunchBox.height)
        // }

        // if (this.isKicking === true){
        // //attackKickBox
        // ctx.fillStyle = 'orange'
        // ctx.fillRect(this.KickBox.position.x, this.KickBox.position.y, this.KickBox.width, this.KickBox.height)
        // }
    
    }

    animateFrames() // This method updates the frames to rotate them (It simulates a capped fps to slow the animations down)
    {
        this.frameCount++ // counts one universal frame up

        if(this.frameCount % this.fpc  === 0) // if framecount % is equalt to zero than a new frame will be displayed
        {
            if(this.currentFrame < this.maxFrame -1) // If current frame is smaller than max frame it counts up and moves to the next frame 
            {
                this.currentFrame++
            }
            else // if max frame is reached the animation will loop from the beginning
            {
                this.currentFrame = 0
            }
        }
    }

    //update the player and the attacks
    update(){ // ruft die draw Methode auf und verändert die Position mit der Zeit
        this.draw();
        this.animateFrames();
        
        //now the box follows the player or enemie player
        this.PunchBox.position.x = this.position.x + this.PunchBox.punchOffset.x
        this.PunchBox.position.y = this. position.y + this.PunchBox.punchOffset.y

        this.KickBox.position.x = this.position.x + this.KickBox.kickOffset.x
        this.KickBox.position.y = this. position.y + this.KickBox.kickOffset.y

        // Movement R L
        if (this.position.x <= 0){
        	this.position.x = 1;
        }
        if (this.position.x >= screen.width - 60){
        	this.position.x = this.position.x - 1;
        }
        else{
            this.position.x += this.velocity.x
        }
        this.position.y += this.velocity.y;


        //sorgt dafür, dass der Rect (Player) nicht durch den Boden des Canvas fällt und dass er am Boden anliegt (Colisation Abfrage)
        if (this.position.y +this.velocity.y >= canvas.height){ 
            this.velocity.y = 0;
        } else {
            this.velocity.y += gravity
        }
    }

    attackJab(){ //the attack Jab method
        this.isAttacking = true
        this.PunchBox.width = 160
        if(this.velocity.y !==0)
        {
            this.isAttacking = false
        }
        else {
        if(this.isCrouching)
        {
            this.PunchBox.punchOffset.y = -90
            this.switchframe('crouchJab', this.orientation)
            this.delay = 120
        }
        else
        {
            this.height = -170
            this.PunchBox.punchOffset.y = -140
            this.switchframe('jab', this.orientation)
            this.delay = 70
        }
        setTimeout(() => {
            this.isJabing = true
        }, this.delay);

        }
    }  
    
    attackHit(){
        this.isAttacking = true
        if(this.velocity.y !== 0)
        {
            this.isAttacking = false
        }
        else{
            this.height = -170
            this.PunchBox.punchOffset.y = -140
            this.PunchBox.width = 180
            this.isHitting = true
            this.switchframe('hit', this.orientation)
            this.delay = 70
        }
       
    }      
        
    attackKick(){ //is the attack Kick method
        this.isAttacking = true
        if(this.velocity.y !==0)
        {   
            this.isKickFalling = true
            this.KickBox.kickOffset.y = -85
            this.KickBox.width = 150
            this.switchframe('fallingKick', this.orientation)
            this.delay = 0
        }
        else if(this.isCrouching)
        {
            this.KickBox.kickOffset.y = -25
            this.KickBox.width = 160
            this.switchframe('lowKick', this.orientation)
            this.delay = 300
        }
        else 
        {
            this.height = -170
            this.KickBox.kickOffset.y = -145
            this.KickBox.width = 220
            this.switchframe('kick', this.orientation)
            this.delay = 220
        }
        setTimeout(() => {
            this.isKicking = true 
        }, this.delay);
    }

    AttackDelayKick(){
        if(this.allowedToKick === true){
            this.allowedToKick = false;
            setTimeout(() => {
                this.allowedToKick = true;
            }, 700);
        }
    }

    AttackDelayPunch(){
            if (this.allowedToPunch === true){
            this.allowedToPunch = false;
            setTimeout(() => {
                this.allowedToPunch = true;
            },200);
        }
    }
    

    switchframe(frame, orientation){ // this Method switches the image which is displayed if a certain case comes in action
        

        this.orientation = orientation

        for (const pos in this.frames) // Changes the target file to match the orientation
        {
            this.frames[pos].image.src = this.foldersrc + this.orientation + this.frames[pos].imageSrc 
        }

        switch (this.orientation){ // Changes Hitbox in x direction offset according to the player orientation
            case 'right':
                this.PunchBox.punchOffset.x = 0
                this.KickBox.kickOffset.x = 0
                this.imageOffset.x = 260
            break
            case 'left':
                if(this.isHitting)
                {
                    this.PunchBox.punchOffset.x = -120
                }else    this.PunchBox.punchOffset.x = -100
               
                if(this.isKickFalling)
                {
                    this.KickBox.kickOffset.x = -90
                }
                else if(this.isCrouching)
                {
                    this.KickBox.kickOffset.x = -100
                }
                else this.KickBox.kickOffset.x = -160
                this.imageOffset.x = 280
            break
        }

        // Overrides animations with attack animation
        if(this.image === this.frames.jab.image && this.currentFrame < this.frames.jab.maxFrame -1) return
        if(this.image === this.frames.hit.image && this.currentFrame < this.frames.hit.maxFrame -1) return
        if(this.image === this.frames.kick.image && this.currentFrame < this.frames.kick.maxFrame -1) return


        switch (frame) { // takes the inserted frame and changes image source and max frames to the inserted parameters
            case 'idle':
                if(this.image !== this.frames.idle.image) // Checks if animation is already played
                {
                    this.image = this.frames.idle.image // Overrides the current image with the inserted object
                    this.maxFrame = this.frames.idle.maxFrame // Ovverrides the max Frame count with the count of the inserted object
                    this.currentFrame = 0 // sets the current frame to 0 to start the animation from the beginning
                }
                break

            case 'step':
                if(this.image !== this.frames.step.image)
                {
                    this.image = this.frames.step.image
                    this.maxFrame = this.frames.step.maxFrame
                    this.currentFrame = 0
                }
                break

            case 'jump':
                if(this.image !== this.frames.jump.image)
                {
                    this.image = this.frames.jump.image
                    this.maxFrame = this.frames.jump.maxFrame
                    this.currentFrame = 0
                }
                break
                
            case 'crouch':
                if(this.image !== this.frames.crouch.image)
                {
                    this.image = this.frames.crouch.image
                    this.maxFrame = this.frames.crouch.maxFrame
                    this.currentFrame = 0
                }
                break
                   
            case 'blockstanding':
                if(this.image !== this.frames.blockstanding.image)
                {
                    this.image = this.frames.blockstanding.image
                    this.maxFrame = this.frames.blockstanding.maxFrame
                    this.currentFrame = 0
                }
                break
                   
            case 'blockcrouching':
                if(this.image !== this.frames.blockcrouching.image)
                {
                    this.image = this.frames.blockcrouching.image
                    this.maxFrame = this.frames.blockcrouching.maxFrame
                    this.currentFrame = 0
                }
                break
                
            case 'jab':
                if(this.image !== this.frames.jab.image)
                {
                    this.image = this.frames.jab.image
                    this.maxFrame = this.frames.jab.maxFrame
                    this.currentFrame = 0
                }
                break
            case 'hit':
                if(this.image !== this.frames.hit.image)
                {
                    this.image = this.frames.hit.image
                    this.maxFrame = this.frames.hit.maxFrame
                    this.currentFrame = 0
                }
                break
                     
            case 'kick':
                if(this.image !== this.frames.kick.image)
                {
                    this.image = this.frames.kick.image
                    this.maxFrame = this.frames.kick.maxFrame
                    this.currentFrame = 0
                }
                break
            case 'crouchJab':
                if(this.image !== this.frames.crouchJab.image)
                {
                    this.image = this.frames.crouchJab.image
                    this.maxFrame = this.frames.crouchJab.maxFrame
                    this.currentFrame = 0
                }
            break
            case 'lowKick':
                if(this.image !== this.frames.lowKick.image)
                {
                    this.image = this.frames.lowKick.image
                    this.maxFrame = this.frames.lowKick.maxFrame
                    this.currentFrame = 0
                }
            break
            case 'fallingKick':
                if(this.image !== this.frames.fallingKick.image)
                {
                    this.image = this.frames.fallingKick.image
                    this.maxFrame = this.frames.fallingKick.maxFrame
                    this.currentFrame = 0
                }
            break      
        }

    }
}

const pauseGame = new Pause({pause: true})
//Player1
const player1 = new Player({ // Creates a new Player

    position: {
        x: 100,
        y: 0
    },
    velocity:{
        x: 0,
        y: 0
    },
    color: 'blue',

    orientation: 'right',
    scale: 3, 
    imageSrc: 'Idle.png',
    maxFrame: 4,
    foldersrc: '../images/animations/player1/',

    imageOffset: {
        x: 160,
        y: 380
    },

    frames: {
        idle: {
            imageSrc: '/Idle.png',
            maxFrame: 4
        },
        step: {
            imageSrc: '/Step.png',
            maxFrame: 4
        },
        jump: {
            imageSrc: '/Jump.png',
            maxFrame: 1
        },
        crouch: {
            imageSrc: '/Crouch.png',
            maxFrame: 1
        },
        blockstanding: {
            imageSrc: '/Block-Standing.png',
            maxFrame: 1
        },
        blockcrouching: {
            imageSrc: '/Block-Crouching.png',
            maxFrame: 1
        },
        jab: {
            imageSrc: '/Jab-1.png',
            maxFrame: 4
        },
        hit: {
            imageSrc: '/Hit-1.png',
            maxFrame: 9
        },
        kick: {
            imageSrc: '/Kick.png',
            maxFrame: 9
        },
        crouchJab: {
            imageSrc: '/Jab-Crouch.png',
            maxFrame: 5
        },
        lowKick: {
            imageSrc: '/Low-Kick.png',
            maxFrame: 8
        },
        fallingKick: {
            imageSrc: '/Falling-Kick.png',
            maxFrame: 1
        },
    }
})

//Player2
const player2 = new Player({ // Creates a new Player

    position: {
        x: 1200,
        y: 0
    },
    velocity:{
        x: 0,
        y: 0
    },
    color: 'blue',

    orientation: 'left',
    scale: 3, 
    imageSrc: 'Idle.png',
    maxFrame: 4,
    foldersrc: '../images/animations/player2/',

    imageOffset: {
        x: 280,
        y: 380
    },

    frames: {
        idle: {
            imageSrc: '/Idle.png',
            maxFrame: 4
        },
        step: {
            imageSrc: '/Step.png',
            maxFrame: 4
        },
        jump: {
            imageSrc: '/Jump.png',
            maxFrame: 1
        },
        crouch: {
            imageSrc: '/Crouch.png',
            maxFrame: 1
        },
        blockstanding: {
            imageSrc: '/Block-Standing.png',
            maxFrame: 1
        },
        blockcrouching: {
            imageSrc: '/Block-Crouching.png',
            maxFrame: 1
        },
        jab: {
            imageSrc: '/Jab-1.png',
            maxFrame: 4
        },
        hit: {
            imageSrc: '/Hit-1.png',
            maxFrame: 9
        },
        kick: {
            imageSrc: '/Kick.png',
            maxFrame: 9
        },
        crouchJab: {
            imageSrc: '/Jab-Crouch.png',
            maxFrame: 5
        },
        lowKick: {
            imageSrc: '/Low-Kick.png',
            maxFrame: 8
        },
        fallingKick: {
            imageSrc: '/Falling-Kick.png',
            maxFrame: 1
        },
    }
})




//Calls update methods for players and checks if a player hit another  

function animate() { 
    window.requestAnimationFrame(animate);
    if(!pauseGame.pause){

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        CheckIfPlayerCrossed();
        player1.update();
        player2.update();
        
        player1.velocity.x = 0;
        player2.velocity.x = 0;
        let damage = 0;
        
        //Player 1 Animations
        if(!player1.isAttacking)
        {
        if (keys.a.pressed && player1.lastKey === 'a') {    // Walking
            player1.velocity.x = -7;
            player1.switchframe('step', player1.orientation)
        } else if (keys.d.pressed && player1.lastKey === 'd') { 
            player1.velocity.x = 7;
            player1.switchframe('step', player1.orientation)
        }
        else if(keys.b.pressed && player1.lastKey === 'b'){ // Blocking
            
            player1.switchframe('blockstanding', player1.orientation)
            player1.height = -100
        }
        else if(keys.s.pressed && player1.lastKey === 's'){ // Crocuning
            
            player1.switchframe('crouch', player1.orientation)
            player1.height = -100;
        }
        else{
            player1.switchframe('idle', player1.orientation)  // Idle
            player1.height = -170
        }
        
        if(player1.velocity.y !== 0){  
            player1.height = -170                       // Jumping
            player1.switchframe('jump', player1.orientation)
        }
    }
    if(!keys.s.pressed) 
        {
            player1.isCrouching = false
        }
        
        
        // Player 2 Animations
        
        if(!player2.isAttacking)
            {
                if (keys.ArrowLeft.pressed && player2.lastKey === 'ArrowLeft') {  // Walking
                    player2.velocity.x = -7;
                    player2.switchframe('step', player2.orientation)
                } else if (keys.ArrowRight.pressed && player2.lastKey === 'ArrowRight') {  
                    player2.velocity.x = 7;
                    player2.switchframe('step', player2.orientation)
                }
                else if(keys.o.pressed && player2.lastKey === 'o'){ // Blocking
                    
                    player2.switchframe('blockstanding', player2.orientation)
                    player2.height = -100
                }
                else if(keys.ArrowDown.pressed && player2.lastKey === 'ArrowDown'){ // Chrouching
                    
                    player2.switchframe('crouch', player2.orientation)
                    player2.height = -100
                }
                else {
                    player2.switchframe('idle', player2.orientation) // Idle
                    player2.height = -170
                }
                
                if(player2.velocity.y !== 0){     
                    player2.height = -170                        // Jumping
            player2.switchframe('jump', player2.orientation)
        }
        
    }
    
    if(!keys.ArrowDown.pressed)
        {
            player2.isCrouching = false
        }
        
        
        //Checks if a kick or jab is hitting the enemy
        function CheckifPlayerHits({rectangle1, rectangle2}){
            
            if(rectangle1.isJabing || rectangle1.isHitting){   
                return (
                rectangle1.PunchBox.position.x + rectangle1.PunchBox.width >= rectangle2.position.x &&
                rectangle1.PunchBox.position.x <= rectangle2.position.x + rectangle2.width &&
                
                rectangle1.PunchBox.position.y + rectangle1.PunchBox.height >= rectangle2.position.y + rectangle2.height &&
                rectangle1.PunchBox.position.y <= rectangle2.position.y
            )
        }
        else if(rectangle1.isKicking){
            return (
                rectangle1.KickBox.position.x + rectangle1.KickBox.width >= rectangle2.position.x &&
                rectangle1.KickBox.position.x <= rectangle2.position.x + rectangle2.width &&
                
                rectangle1.KickBox.position.y + rectangle1.KickBox.height >= rectangle2.position.y + rectangle2.height &&
                rectangle1.KickBox.position.y <= rectangle2.position.y
            )
        }

    }
    //Checks if player 1 hit his enemy and changes health accordingly
    if(CheckifPlayerHits({rectangle1: player1, rectangle2: player2}) && player1.isJabing){
        player1.isJabing = false
        player1.isAttacking = false
        console.log('Player Hit');
        damage = 3
        player1.sound.src = '../audio/kick.wav'
        player1.sound.play();
        const healthBar = document.getElementById(`health${2}`);
        healthBar.value = Math.max(0, Math.min(100, healthBar.value - damage));
        updateHealthBar(2);
    }
    if (CheckifPlayerHits({rectangle1: player1, rectangle2: player2}) && player1.isKicking){
        player1.isKicking = false
        player1.isAttacking = false
        console.log('Player Kick');
        if(player1.velocity.y !== 0)
            {
                player1.isKickFalling= false
                player1.sound.src = '../audio/fall-kick.wav'
                damage = 10
            } else {
                damage = 6;
                player1.sound.src = '../audio/kick.mp3';
            }
            player1.sound.play();
            const healthBar = document.getElementById(`health${2}`);
            healthBar.value = Math.max(0, Math.min(100, healthBar.value - damage));
            updateHealthBar(2);
        }
        
    if(CheckifPlayerHits({rectangle1: player1, rectangle2: player2}) && player1.isHitting)
    {
        console.log('Player Hit')
        
        if(player1.currentFrame === 2 || player1.currentFrame == 3){
            damage = 0.5
        }
        else if(player1.currentFrame >= 6 && player1.currentFrame < 8){
            damage = 1
        }
        else if(player1.currentFrame === 8){
            player1.isHitting = false
            player1.isAttacking = false
            
        }
        else damage = 0
        const healthBar = document.getElementById(`health${2}`);
            healthBar.value = Math.max(0, Math.min(100, healthBar.value - damage));
            updateHealthBar(2);
    }



        //Checks if player 2 hit his enemy and changes health accordingly
        if(CheckifPlayerHits({rectangle1: player2, rectangle2: player1}) && player2.isJabing){
            player2.isJabing = false
            player2.isAttacking = false
            console.log('Player Hit');
            damage = 3
            player2.sound.src = '../audio/kick.wav'
            player2.sound.play();
        const healthBar = document.getElementById(`health${1}`);
        healthBar.value = Math.max(0, Math.min(100, healthBar.value - damage));
        updateHealthBar(1); 
    }
    if (CheckifPlayerHits({rectangle1: player2, rectangle2: player1}) && player2.isKicking){
        player2.isKicking = false
        player2.isAttacking = false
        console.log('Player Kick');
        if(player2.velocity.y)
        {
            player2.isKickFalling = false
            player2.sound.src = '../audio/fall-kick.wav'
            damage = 10
        }else 
        {
            damage = 6;
            player1.sound.src = '../audio/kick.mp3';
        }
            player2.sound.src = '../audio/kick.mp3'
            player2.sound.play();
        const healthBar = document.getElementById(`health${1}`);
        healthBar.value = Math.max(0, Math.min(100, healthBar.value - 6));
        updateHealthBar(1);
        }
        if(CheckifPlayerHits({rectangle1: player2, rectangle2: player1}) && player2.isHitting)
            {
                console.log('Player Hit')
                if(player2.currentFrame == 2 || player2.currentFrame == 3){
                    damage = 0.5
                }
                else if(player2.currentFrame >= 6 && player2.currentFrame < 8){
                    damage = 1
                    
                }
                else if(player2.currentFrame === 8){
                    player2.isHitting = false
                    player2.isAttacking = false
                }
                else damage = 0
                    
        
                const healthBar = document.getElementById(`health${1}`);
                    healthBar.value = Math.max(0, Math.min(100, healthBar.value - damage));
                    updateHealthBar(1);
            }
            CheckIfPlayerMisses();
    }
   
}

function CheckIfPlayerMisses(){

    // If player1 misses
    if(!player1.isKickFalling && player1.isAttacking && player1.currentFrame === player1.maxFrame -1)
    {
        if(player1.isHitting){
            player1.sound.src = '../audio/air-punch.mp3'
        }else player1.sound.src = '../audio/air-punch.mp3'

        player1.isJabing = false
        player1.isKicking = false
        player1.isHitting = false
        player1.isAttacking = false
        
        player1.sound.play();
    }
    else if(player1.isKickFalling && player1.velocity.y === 0)
    {
        player1.isKickFalling = false
        player1.isKicking = false
        player1.isAttacking = false
        player1.sound.src = '../audio/air-punch.mp3'
        player1.sound.play();
    }

    // If player2 misses

    if(!player2.isKickFalling && player2.isAttacking && player2.currentFrame === player2.maxFrame -1)
        {
            if(player2.isHitting){
                player2.sound.src = '../audio/air-punch.mp3'
            } else player2.sound.src = '../audio/air-punch.mp3'

            player2.isJabing = false
            player2.isHitting = false
            player2.isKicking = false
            player2.isAttacking = false
            player2.sound.play();
        }
        else if(player2.isKickFalling && player2.velocity.y === 0)
        {
            player2.isKickFalling = false
            player2.isKicking = false
            player2.isAttacking = false
            player2.sound.src = '../audio/air-punch.mp3'
            player2.sound.play();
        }

}

function CheckIfPlayerCrossed(){ 
    if(player1.position.x < player2.position.x){
        player1.orientation = 'right'
        player2.orientation = 'left'
    }
    else{
        player1.orientation = 'left'
        player2.orientation = 'right'
    }
}


const keys={                    // Collection of boolean values for Keys on the keyboard
    a: { pressed: false },
    d: { pressed: false },
    s: { pressed: false },
    b: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
    ArrowDown: { pressed: false},
    o: { pressed: false },
    Escape: {pressed: false},
};

function handleKeyDown(event) { //Checks if a key on the keyboard is pressed

    switch(event.key) {
        case 'Escape':
            if(pauseGame.pause)
            {   
                hide('PauseContent')
                show('CanvasContent')
                pauseGame.pause = false
            } else {
                pauseGame.pause = true;
                hide('CanvasContent')
                show('PauseContent')
            }
            break;
        case 'Backspace':
            if (pauseGame.pause){

                window.location = '../index.html' 
            }
            break;

        //Player1
        case 'd':
        case 'a':
            if(player1.sound.src !== 'file:///C:/Workspace/HTML/mortal-ribbit/audio/walk.mp3'){
                player1.sound.src = '../audio/walk.mp3';
                player1.sound.play();
                player1.sound.loop = true
            } else player1.sound.play();
            keys[event.key].pressed = true;
            player1.lastKey = event.key;
            break;
        case 's':
        case 'b':
            player1.sound.src = '../audio/crouch.wav'
            player1.sound.play();
            keys[event.key].pressed = true;
            player1.lastKey = event.key;
            break;
        case 'w':
            if(player1.velocity.y === 0){
                player1.sound.src = '../audio/jump.wav'
            player1.sound.play();
                player1.velocity.y = -20
            }
            break;  
        case 'e':
            if(!player1.isAttacking && player1.allowedToPunch === true && isKeydown === false)
            {
                if(keys.s.pressed)
                {
                    player1.isCrouching = true
                }
                player1.attackJab()
                player1.AttackDelayPunch()
                isKeydown = true;
            }
            break
        case 'v':
            if(!player1.isAttacking && player1.allowedToPunch && !isKeydown && player1.velocity.y === 0)
            {
                player1.attackHit()
                player1.sound.src = '../audio/hit.wav'
                player1.sound.play();
                isKeydown = true
            }
            break
        case 'q':
            if(!player1.isAttacking && player1.allowedToKick === true && isKeydown === false)
            {
                if(keys.s.pressed)
                {
                    player1.isCrouching = true
                }
                player1.attackKick()
                player1.AttackDelayKick()
                isKeydown = true;
            }
            break

        //Player2

        case 'ArrowRight':
        case 'ArrowLeft':
            if(player2.sound.src !== 'file:///C:/Workspace/HTML/mortal-ribbit/audio/walk.mp3'){
                player2.sound.src = '../audio/walk.mp3';
                player2.sound.play();
                player2.sound.loop = true
            } else player2.sound.play();
            keys[event.key].pressed = true;
            player2.lastKey = event.key;
            break;
        case 'ArrowDown':
        case 'o':
            player2.sound.src = '../audio/crouch.wav'
            player2.sound.play();
            keys[event.key].pressed = true; 
            player2.lastKey = event.key;
            break;
        case 'ArrowUp':
            if(player2.velocity.y === 0){
                player2.sound.src = '../audio/jump.wav'
                player2.sound.play();
                player2.velocity.y = -20
            }
            break;
        case 'p':
            if(!player2.isKicking && player2.allowedToPunch === true && isKeydown === false)
            {
                if(keys.ArrowDown.pressed)
                {
                    player2.isCrouching = true
                }
                player2.attackJab()
                player2.AttackDelayPunch()
                isKeydown = true;
            }
            break
        case 'i':
            if(!player2.isJabing && player2.allowedToKick === true && isKeydown === false)
            {
                if(keys.ArrowDown.pressed)
                {
                    player2.isCrouching = true
                }
                player2.attackKick()
                player2.AttackDelayKick()
                isKeydown = true;
            }
            break
        case 'ä':
            if(!player2.isAttacking && player2.allowedToPunch && !isKeydown && player2.velocity.y === 0){
                player2.attackHit()
                player2.sound.src = '../audio/hit.wav'
                player2.sound.play();
                isKeydown = true
            }
            break
              
    }
    console.log(event.key);
}

function handleKeyUp(event) { // Checks if a key is no longer pressed and sets its state to false if it's the case
    if (['d', 'a','s','b', 'ArrowRight', 'ArrowLeft','ArrowDown','o', 'Escape'].includes(event.key)) {
        keys[event.key].pressed = false;
        player1.sound.loop = false
        player2.sound.loop = false
        console.log('hat alles functioniert');
    }
}

//For Fighting Key Up
window.addEventListener('keyup', (event) => {
    //Player 
    switch(event.key){
        case 'e':
            isKeydown = false
        break
        case 'q':
            isKeydown = false
        break
        case 'v':
            isKeydown = false
        break
        //Enemy
        case 'p':
            isKeydown = false
        break
        case 'i':
            isKeydown = false
        break
        case 'ä':
            isKeydown = false
        break
            
    }
}) 
const startGame = document.getElementById('btn')
startGame.addEventListener('click', () => StartGame())
function StartGame(){
    pauseGame.pause = false
    soundTrack.play();
    announcer.play();
    player1.sound.play();
    player1.sound.loop = false
    player2.sound.play();
    player2.sound.loop = false
    soundTrack.volume = 0.05

    hide('StartGame')
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

animate();