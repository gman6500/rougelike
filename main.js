window.onerror = function(msg, url, linenumber) {
    alert('Error message: ' + msg + '\nURL: ' + url + '\nLine Number: ' + linenumber);
    return true;
}
var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 30;
canvas.height = window.innerHeight - 30;
var TILE_SIZE = 25;
var map = [];
var passableMap=[];
var rotMap=new ROT.Map.Digger();
var ALL_ENEMY = [];
var ALL_ENTITY=[];
var easyStar= new EasyStar.js();
var DEBUG=true;
var cameraWidth=37;
var cameraHeight=25;
//player object
var Player = {
    x: cameraWidth,
    y: cameraHeight,
    //change later but just placeholder
    maxHp:40,
    hp:40,
    //is a placeholder, switch to weapon class
    weapon:"",
    draw: function() {
        ctx.fillStyle = "blue";
        ctx.fillRect((this.x-camera.x) * TILE_SIZE + TILE_SIZE / 4, (this.y-camera.y) * TILE_SIZE + TILE_SIZE / 4, TILE_SIZE / 2, TILE_SIZE / 2)
    },
    attack:function(target){
        var damage= Math.floor(Math.random() * (this.weapon.dmgSprd - (0-this.weapon.dmgSprd))) + (0-this.weapon.dmgSprd);
        damage+=this.weapon.dmg;
        target.hp-=damage;
        NEXT_TURN();
    }
    
}

ALL_ENTITY[0]=Player;
//Camera size needs to be odd
var camera={
    x:Player.x-Math.ceil(cameraWidth/2)+1,
    y:Player.y-Math.ceil(cameraHeight/2)+1,
    width:cameraWidth,
    height:cameraHeight,
    update:function(){
        this.x=Player.x-Math.ceil(cameraWidth/2)+1;
        this.y=Player.y-Math.ceil(cameraHeight/2)+1;
    }
};

function DRAW_HUD(){
    
    ctx.fillStyle="red"
    ctx.fillRect(canvas.width/4*3,70,300,50);
    ctx.fillStyle="green"
    ctx.fillRect(canvas.width/4*3,70,300/Player.maxHp*Player.hp,50)
    ctx.fillStyle="grey";
    ctx.fillText("Health: "+Player.hp+"/"+Player.maxHp, canvas.width/4*3,100)
    
}

function generateMap(width, height) {
    
    var temp2=Math.ceil(camera.width/2);
    var temp3=Math.ceil(camera.height/2)
    for(i = 0; i < height; i++) {
        map[i] = [];
        passableMap[i]=[];
        for(e = 0; e < width; e++) {
            var temp = Math.random();
            if(i+1 <= temp3 || e+1 <= temp2 || e >= width - temp2-1 || i >= height -temp3) {
                map[i][e] = "wall";
                passableMap[i][e]=1;
            } else if(true) {
                map[i][e] = "floor";
                passableMap[i][e]=0;
            } else {
                map[i][e] = "wall";
                passableMap[i][e]=1;
            }
        }
    }
}


//This clears the board
//ONLY PUT THIS FUNCION FIRST IN DRAWING LOOP! 
//OTHERWISE, REMOVE CLEAR RECT AND PUT ELSEWHERE

function drawBaseTiles() {
    var camMaxX=camera.width+camera.x
    var camMaxY=camera.height+camera.y
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(i = camera.y; i < camMaxY; i++) {
        for(e = camera.x; e < camMaxX; e++) {
            ctx.fillStyle = "black";
            
            if(passableMap[i][e] === 1) {
                ctx.fillStyle = "black"
            } else if(passableMap[i][e]===0){
                ctx.fillStyle = "grey"
            }else{
                ctx.fillStyle = "grey"
            }
            if(DEBUG){
                
                ctx.strokeStyle="white";
                ctx.beginPath();
                
                ctx.rect((e-camera.x) * TILE_SIZE, (i-camera.y) * TILE_SIZE, TILE_SIZE, TILE_SIZE)
                ctx.stroke();
            }
            
            ctx.fillRect((e-camera.x) * TILE_SIZE, (i-camera.y) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.fill();
        }
    }
}


//starts game by gen map, spawning enemies and drawing

var mapWidth=50;
var mapHeight=50;
function START_GAME() {
    ctx.font="30px Verdana"
    generateMap(mapWidth+camera.width, mapHeight+camera.height)
    createMap(10,10,10);
    easyStar.setGrid(passableMap);
    easyStar.setAcceptableTiles([0]);
    easyStar.enableDiagonals();
    SpawnEnemy(18, 18,10,2,1)
    SpawnEnemy(30, 18,10,2,1)
    SpawnEnemy(50, 18,10,2,1)
    SpawnEnemy(50, 18,10,2,1)
    NEXT_TURN();
    Player.draw();
}



//this draws the map including the base tiles(floor and walls) as
//well as enemies and player, add things you need to be drawn here
//in order from top to bottom, top being farthest back layer

function drawEntities() {
    drawBaseTiles();
    Player.draw();
}


//moves enemies and takes next turn, also start the drawing of wall and entities

function NEXT_TURN() {   
    camera.update();
    var spliceEntity=[];
    var spliceEnemy=[];
    if(ALL_ENEMY.length===0){
        for(i = 0; i < ALL_ENEMY.length; i++) {
            if(typeof ALL_ENEMY[i] !== 'undefined') {
                if(ALL_ENEMY[i].hp<=1){
                    passableMap[ALL_ENEMY[i].y][ALL_ENEMY[i].x]=0;
                    var temp=ALL_ENTITY.findIndex(function(elem,index){
                        if(elem.x===ALL_ENTITY[index].x&&elem.y===ALL_ENTITY[index].y){
                            return index;
                        }
                    })

                    spliceEnemy.push(i);
                    spliceEntity.push(temp);

                }else{
                    ALL_ENEMY[i].move();
                }

            }
        }
        for(i=0;i<spliceEnemy.length;i++){
            ALL_ENEMY.splice(spliceEnemy[i],1)
        }
        for(i=0;i<spliceEntity.length;i++){
            ALL_ENTITY.splice(spliceEntity[i],1)
        }
    }
    drawEntities();
    DRAW_HUD();
}






//enemy constructor and functions in prototype
//THIS IS FOR EXAMPLE ENEMY, USE THIS AS TEMPLATE
//CHANGE FOR OTHER ENEMIES

function Enemy(x, y,hp,dmg,dmgV) {
    this.x = x;
    this.y = y;
    this.dmg=dmg;
    this.dmgSprd=dmgV
    this.hp=hp;
    var self=this;
    this.healthBar={
        x:this.x,
        y:this.y,
        width:TILE_SIZE,
        hpInc:TILE_SIZE/self.hp,
        height:TILE_SIZE/5,
        draw:function(){
            ctx.fillStyle="red";
            ctx.fillRect((this.x-camera.x) * TILE_SIZE,(this.y-camera.y) * TILE_SIZE+TILE_SIZE-TILE_SIZE/5,this.width,this.height);
            ctx.fillStyle="green";
            ctx.fillRect((this.x-camera.x) * TILE_SIZE,(this.y-camera.y) * TILE_SIZE+TILE_SIZE-TILE_SIZE/5,this.hpInc*self.hp,this.height);
        }
    };
    ALL_ENEMY.push(this);
    ALL_ENTITY.push(this);
}
Enemy.prototype.draw = function() {
    ctx.fillStyle = "orange";
    if(!(this.x-camera.x>=camera.width)&&!(this.y-camera.y>=camera.height)){
        ctx.fillRect((this.x-camera.x) * TILE_SIZE + TILE_SIZE / 4, (this.y-camera.y) * TILE_SIZE + TILE_SIZE / 4, TILE_SIZE / 2, TILE_SIZE / 2)
    }
}

Enemy.prototype.move = function() {
    var temp=this;
    easyStar.findPath(this.x,this.y,Player.x,Player.y,function(path){
        if(path===null){
//             alert("no path found")
        }else{
            if(isEntityHere(path[1].x,path[1].y,ALL_ENTITY)){
                if(Player.x===path[1].x&&Player.y===path[1].y){
                    temp.attack();
                }
            }else{
                passableMap[temp.y][temp.x]=0;
                temp.x=path[1].x;
                temp.y=path[1].y;
                
                passableMap[temp.y][temp.x]=2;
                
            }
        }
        temp.healthBar.x=temp.x
        temp.healthBar.y=temp.y
        temp.healthBar.draw();
        temp.draw();
    })
    easyStar.calculate();
}
Enemy.prototype.attack=function(){
    var damage= this.dmg+Math.floor(Math.random() * (this.dmgSprd - (0-this.dmgSprd))) + (0-this.dmgSprd);
    Player.hp-=damage;
}


//use type for future types of enemy, make sure constructor has new term when adding in
//also change drawing when this happens to differentiate.

function SpawnEnemy(x, y, hp,dmg,dmgV) {
    var temp = new Enemy(x, y,hp,dmg,dmgV);
    temp.draw();
    return temp;
}

function Weapon(damage,damageSpread,name){
    this.dmg=damage;
    this.dmgSprd=damageSpread;
    this.name=name;
}
var tempWeapon=new Weapon(3,2,"Sword");

Player.weapon=tempWeapon;

//tx and ty are the x and y co-ords that you are checking at
//target is what you are scanning for(player, enemy, item, etc)
//target should be parent array of thing searching
//ex: ALL_ENEMY
//returns the thing that is there, if nothing is there, returns false
function isEntityHere(tx,ty,target){
    for(i=0;i<target.length;i++){
        if(target[i].x===tx&&target[i].y===ty){
            return true;
        }
        
        if(i===target.length-1){
            return false;
        }
    }
    
}

function findEntityHere(tx,ty,target){
    for(i=0;i<target.length;i++){
        if(target[i].x===tx&&target[i].y===ty){
            return target[i];
        }
    }
    
}


document.addEventListener("keydown", function(e) {
    switch(e.key) {
        case "d":
            if(passableMap[Player.y][Player.x + 1] === 0&&!isEntityHere(Player.x + 1,Player.y,ALL_ENEMY)) {
                
                Player.x++;
                NEXT_TURN();
            }else{
                if(map[Player.y][Player.x + 1] != "floor"){
                    var temp=findEntityHere(Player.x + 1,Player.y,ALL_ENEMY)
                    Player.attack(temp);
                }
            }
            break;
        case "s":
            if(passableMap[Player.y + 1][Player.x] === 0&&!isEntityHere(Player.x,Player.y+1,ALL_ENEMY)) {
                Player.y++;
                NEXT_TURN();
            }else{
                if(map[Player.y + 1][Player.x] != "floor"){
                    var temp=findEntityHere(Player.x,Player.y+1,ALL_ENEMY)
                    Player.attack(temp);
                }
            }
            break;
        case "a":
            if(passableMap[Player.y][Player.x - 1] === 0&&!isEntityHere(Player.x-1,Player.y,ALL_ENEMY)) {
                Player.x--;
                NEXT_TURN();
            }else{
                if(map[Player.y][Player.x - 1] != "floor"){
                    var temp=findEntityHere(Player.x - 1,Player.y,ALL_ENEMY)
                    Player.attack(temp);
                }
            }
            break;
        case "w":
            if(passableMap[Player.y - 1][Player.x] === 0&&!isEntityHere(Player.x,Player.y-1,ALL_ENEMY)) {
                Player.y--;
                NEXT_TURN();
            }else{
                if(map[Player.y - 1][Player.x] != "floor"){
                    var temp=findEntityHere(Player.x,Player.y-1,ALL_ENEMY)
                    Player.attack(temp);
                }
            }
            
            break;
        case "c":
            if(passableMap[Player.y + 1][Player.x + 1] === 0&&!isEntityHere(Player.x+1,Player.y+1,ALL_ENEMY)) {
                Player.y++;
                Player.x++;
                NEXT_TURN();
            }else{
                if(map[Player.y + 1][Player.x + 1] != "floor"){
                    var temp=findEntityHere(Player.x + 1,Player.y+1,ALL_ENEMY)
                    Player.attack(temp);
                }
            }
            break;
        case "z":
            if(passableMap[Player.y + 1][Player.x - 1] === 0&&!isEntityHere(Player.x-1,Player.y+1,ALL_ENEMY)) {
                Player.y++;
                Player.x--;
                NEXT_TURN();
            }else{
                if(map[Player.y + 1][Player.x - 1] != "floor"){
                    var temp=findEntityHere(Player.x - 1,Player.y+1,ALL_ENEMY)
                    Player.attack(temp);
                }
            }
            break;
        case "e":
            if(passableMap[Player.y - 1][Player.x + 1] === 0&&!isEntityHere(Player.x + 1,Player.y-1,ALL_ENEMY)) {
                Player.y--;
                Player.x++;
                NEXT_TURN();
            }else{
                if(map[Player.y - 1][Player.x + 1] != "floor"){
                    var temp=findEntityHere(Player.x + 1,Player.y-1,ALL_ENEMY)
                    Player.attack(temp);
                }
            }
            break;
        case "q":
            if(passableMap[Player.y - 1][Player.x - 1] === 0&&!isEntityHere(Player.x-1,Player.y-1,ALL_ENEMY)) {
                Player.y--;
                Player.x--;
                NEXT_TURN();
            }else{
                if(map[Player.y - 1][Player.x - 1] != "floor"){
                    var temp=findEntityHere(Player.x - 1,Player.y-1,ALL_ENEMY)
                    Player.attack(temp);
                }
            }
            break;
        case ".":
            NEXT_TURN();
        break;
    }
})

function createMap(roomNum,maxWidth,maxHeight){
    var rooms=[];
    var halfCamWidth=Math.ceil(camera.width/2);
    var halfCamHeight=Math.ceil(camera.height/2);
    var outerLim=map[0].length-halfCamWidth;
    var bottomLim=map.length-halfCamHeight;
    //just to put something in the array

    while(rooms.length<=roomNum){
        var genW=Math.floor(Math.random() * (maxWidth - 3)) + 3
        var genH=Math.floor(Math.random() * (maxWidth - 3)) + 3
        var genX=Math.floor(Math.random() * ((outerLim-genW) - halfCamWidth)) + halfCamWidth
        var genY=Math.floor(Math.random() * ((bottomLim-genH) - halfCamHeight)) + halfCamHeight
        var valid=true;
        var newRoom={
            x:genX,
            y:genY,
            width:genW,
            height:genH
        }
        if(rooms.length!==0){
            for(e=0;e<rooms.length;e++){
                var collision=colCheck(newRoom,rooms[e])
                if(collision!=null){
                    alert("collision")
                    valid=false;
                    alert("continue did not work")
                }
            }
        }
        alert("doing a room")
        if(valid){
            rooms.push({x:genX,y:genY,width:genW,height:genH})
        }
    }
    for(i=0;i<rooms.length;i++){
        for(e=0;e<=rooms[i].height;e++){
            for(o=0;o<=rooms[i].width;o++){
                if(e===0||e===rooms[i].height||o===0||o===rooms[i].width){
                    var temp1=e+rooms[i].y,
                        temp2=o+rooms[i].x;
                    passableMap[temp1][temp2]=1;
                }else{
                    var temp1=e+rooms[i].y,
                        temp2=o+rooms[i].x;
                    passableMap[temp1][temp2]=0;
                }
            }
        }
    }
}


function colCheck(shapeA, shapeB) {
    // get the vectors to check against
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
        // add the half widths and half heights of the objects
        hWidths = Math.ceil((shapeA.width / 2) + (shapeB.width / 2)),
        hHeights = Math.ceil((shapeA.height / 2) + (shapeB.height / 2)),
        colDir = null;
 
    // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {         
        // figures out on which side we are colliding (top, bottom, left, or right)
        var oX = hWidths - Math.abs(vX),
            oY = hHeights - Math.abs(vY);
        if (oX >= oY) {
            if (vY > 0) {
                alert("t")
                colDir = "t";
                shapeA.y += oY;
            } else {
                alert("b")
                colDir = "b";
                shapeA.y -= oY;
            }
        } else {
            if (vX > 0) {
                alert("l")
                colDir = "l";
                shapeA.x += oX;
            } else {
                alert("r")
                colDir = "r";
                shapeA.x -= oX;
            }
        }
    }
//     console.log(colDir)
    return colDir;
}



START_GAME();

