var game = new Phaser.Game(window.screen.availWidth, window.screen.availHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var CIRCLE_RADIUS = 240;//default 200
var CIRCLE_CHANGE_RATE = 35;//The speed of circle after speed become 6, the highest the slowest, default 30
var MAXSHOWSCOREBOARD = 5;//default 5
var COLOUR_POWER = 70;//The "colour depth" of, default 70
var BACKGROUNDCHANGE_RATE = 3;//The rate of changing of background colour, default 4
var score = 0;
var score_history_text = new Array(0);
var score_history = new Array(0);
var scoreboard_text;
var score_text;
var arrow;
var cursors;
var curr_direction;
var effect_radius = CIRCLE_RADIUS;
var radius = CIRCLE_RADIUS;
var circle;
var counter = 0;
var cats;
var JustPressed;
var timer;
var bonus = false; // at the first, it is true, but when time out, it become false
var speed;
var bonus_time;
var number_play = 0;
var button;
var press_effect;
var speed_text;
var showing_message = false;
var won = false;


// Main Function
function preload() {
    game.load.image('uparrow','assets/uparrow.png');
    game.load.image('downarrow','assets/downarrow.png');
    game.load.image('leftarrow','assets/leftarrow.png');
    game.load.image('rightarrow','assets/rightarrow.png');
    game.load.image('cat1', 'assets/cat1.png');
    game.load.image('cat2', 'assets/cat2.png');
    game.load.image('cat3', 'assets/cat3.png');
    //Due to some unkown reason, cannot change the "display" using jqeury.css after set the porperty in css, so i set it at here
    InitialLossMessageBox();
}
function create() {
    // We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Change background colour
    game.stage.backgroundColor = "#4488AA";

    // Draw the circle inside
    circle = game.add.graphics(0, 0);
    circle.beginFill(0xFFFFFF);
    circle.drawCircle(game.world.centerX, window.screen.height / 2, radius);

    // Draw the effect when pressed
    press_effect = game.add.graphics(0,0);
    press_effect.lineStyle(0, 0xCCCCCC, 1);
    press_effect.drawCircle(game.world.centerX, window.screen.height / 2, radius);
    
    // Load resources
    arrow = game.add.sprite(game.world.centerX, window.screen.height / 2, 'uparrow');
    arrow.anchor.setTo(0.5, 0.5);
    curr_direction = 1;

    // Finally some cats to collect
    cats = game.add.group();

    // We will enable physics for any cat that is created in this group
    cats.enableBody = true;

    // Create our Timer
    timer = game.time.create(false);

    // Draw Text
    score_text = game.add.text(16, 16, 'Score : 0', { font: '38px VT323', fill: '#ffffff' });
    speed_text = game.add.text(16, 48, 'Speed : 0', { font: '38px VT323', fill: '#ffffff' });
    scoreboard_text = game.add.text(window.screen.availWidth - 250, 16, 'Scoreboard', { font: '38px VT323', fill: '#ffffff' });
    // bonus_text = game.add.text(16, 80, 'Bonus : 0', { font: '38px VT323', fill: '#ffffff' });
    // bonus2_text = game.add.text(16, 112, 'Bonus Time : 0', { font: '38px VT323', fill: '#ffffff' });

    // Process key input
    upkey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    upkey.onDown.add(UpKeyEvent, this);
    
    downkey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    downkey.onDown.add(DownKeyEvent, this);
    
    leftkey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    leftkey.onDown.add(LeftKeyEvent, this);

    rightkey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    rightkey.onDown.add(RightKeyEvent, this);
}
function update() {
    // To process the circle middle and check winner
    Process();
}
function Game_Loss(){
    counter = 0;
    radius = CIRCLE_RADIUS;
    UpdateCircle(circle,0xFFFFFF,game.world.centerX, window.screen.height / 2, radius);
    score_history.push(score + "");
    score = 0;
    number_play += 1;
    InitialScoreBoard(number_play);
    UpdateScoreBoard();
    ShowLossMessageBox();
}
function Process(){
    //process the timer cicle
    if(counter <= 81)
    {
       speed = Math.sqrt(counter) / 3 * 2;
    }
    else if(counter <= 100)
    {
        speed = 6;
    }
    else
    {
        speed = (counter - 100) / CIRCLE_CHANGE_RATE + 6;
    }
    //write the speed down
    speed_text.text = "Speed : " + speed;
    radius -= speed;
    UpdateCircle(circle,0xFFFFFF,game.world.centerX, window.screen.height / 2, radius);
    if(radius <= 0)
    {
        Game_Loss();
    }
    //PressEffect
    PressEffect();

    if(score >= 1024 && won == false){
        Bonus();
        won = true;
    }
}


// Make Easy function
function InitialScoreBoard(index){
    //index -1 since it start from 0 for array
    //index + 1 to make the text below a bit
    //push '' is to add a blank element so that can change the object to text
    score_history_text.push('');
    score_history_text[index-1] = game.add.text(window.screen.availWidth - 250,(index+1) * 32, '',
     { font: '38px VT323', fill: '#ffffff' });
}
function UpdateScore(addmark){
    score += addmark;
    score_text.text = "Score : " + score;
}
function UpdateScoreBoard(){
    score_history.sort(SortNumberDescending);
    //prevent it show too many score
    var length = score_history.length;
    if(length > MAXSHOWSCOREBOARD)
    {
        length = MAXSHOWSCOREBOARD;
    }
    for (var i = 0; i < length; i++) {
        score_history_text[i].text = score_history[i];
    }
}
function UpdateCircle(object,color,x,y,r){
    object.clear();
    object.beginFill(color);
    object.drawCircle(x, y, r);
}
function SortNumberDescending(a,b) {
    return b - a;
}
function RandomColour(){
    var letters = '123456789ABCDEF';
    var color = '#';
    var rand;
    var sum;
    do
    {
        sum = 0;
        for (var i = 0; i < 6; i++ ) 
        {
            rand = Math.floor(Math.random() * 15) + 1;
            color += letters[rand];
            sum += rand;
        }

    }while(sum > COLOUR_POWER);
    return color;
}
function PressEffect(){
    //if you just press the button
    if(JustPressed == 1)
    {
        press_effect.clear();
        //if effect_radius is exceed limit, turn off it and reset it
        if(effect_radius >= CIRCLE_RADIUS + 60)
        {
            JustPressed = 0;
            effect_radius = CIRCLE_RADIUS;
            press_effect.lineStyle(0, 0xCCCCCC, 1);
            press_effect.clear();
        }
        //if not then continue draw it
        else
        {
            effect_radius += 4;
            press_effect.lineStyle(2, 0xCCCCCC, 1);
            press_effect.drawCircle(game.world.centerX, window.screen.height / 2, effect_radius);
        }
    }
}
function ChangeBackgroundColour(rate){
    // Random change background colour
    var rand =  Math.floor((Math.random() * rate) + 1);
    if(rand == 1)
    {
        game.stage.backgroundColor = RandomColour();
    }
}
function ChangeArrow(){
    //kill the arrow
    arrow.kill();
    var rand =  Math.floor((Math.random() * 4) + 1);
    while(rand == curr_direction)
    {
        var rand =  Math.floor((Math.random() * 4) + 1);
    }
    //set the curr_direction
    curr_direction = rand;
    //change sprite
    if (rand == 1)
        arrow = game.add.sprite(game.world.centerX, window.screen.height / 2, 'uparrow');
    else if(rand == 2)
        arrow = game.add.sprite(game.world.centerX, window.screen.height / 2, 'downarrow');
    else if(rand == 3)
        arrow = game.add.sprite(game.world.centerX, window.screen.height / 2, 'leftarrow');
    else if(rand == 4)
        arrow = game.add.sprite(game.world.centerX, window.screen.height / 2, 'rightarrow');
    arrow.anchor.setTo(0.5, 0.5);
}



// Process Input Function
function ProcessInput(direction){
    //only when no showing the message only check the input
    if(showing_message == false)
    {
        if(curr_direction == direction)
        {
            //stop the timer
            timer.stop();
            //  Set a TimerEvent to occur after 1 seconds and start it
            timer.loop(CalBonustime(CIRCLE_RADIUS,speed,0.0165) * 1000, CloseBonus, this);
            timer.start();

            UpdateScore(Math.floor(Math.random() * 5) + 9);//random plus 8-13
            ChangeArrow();
            ChangeBackgroundColour(BACKGROUNDCHANGE_RATE);
            radius = CIRCLE_RADIUS;
            counter++;
            JustPressed = 1;
            // if(bonus == true)
            //     Bonus();
            // else
            //     bonus = true;
        }
        else
            Game_Loss();
    }
}
function UpKeyEvent(){
    ProcessInput(1);
}
function DownKeyEvent(){
    ProcessInput(2);
}
function LeftKeyEvent(){
    ProcessInput(3);
}
function RightKeyEvent(){
    ProcessInput(4);
}



// About Bonus
function Bonus(){
    //random choose a cat image
    var x = Math.floor(Math.random() * 3) + 1;
    var img = "cat" + x;
    //  Here we'll create 14 of them evenly spaced apart
    for (var i = 0; i < 14; i++)
    {
        //  Create a star inside of the 'stars' group
        var cat = cats.create(i * 100, -160 + (Math.floor(Math.random() * 100)), img);
        //  Let gravity do its thing
        cat.body.gravity.y = Math.floor(Math.random() * 300) + 300;
    }
    // Second round of cat to make it more
    for (var i = 0; i < 14; i++)
    {
        //  Create a star inside of the 'stars' group
        var cat = cats.create(i * 100, -460 + (Math.floor(Math.random() * 100)), img);
        //  Let gravity do its thing
        cat.body.gravity.y = Math.floor(Math.random() * 300) + 300;
    }
    bonus = true;
}
function CloseBonus(){
    bonus = false;
}
function CalBonustime(radius,speed,timeofcode){
    var total_time_taken = radius/speed * timeofcode;
    bonus_time = total_time_taken/4;
    return bonus_time;
}



// Message Box 
function InitialLossMessageBox(){
    $(".message-box").css("display","none");
    $(".layer").css("display","none");
}
function ShowLossMessageBox(){
    $(".message-box").css("display","inline");
    $(".layer").css("display","inline")
    $(".button")[0].focus();
    showing_message = true;
}
function RemoveLossMessageBox(){
    $(".message-box").css("display","none");
    $(".layer").css("display","none");
    showing_message = false;
}


