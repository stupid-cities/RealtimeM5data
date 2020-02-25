var cg;
var mover;

function setup() {
  createCanvas(500,500);
  cg=new ControlGyro(150,50,200,150,10,30);
  mover=new Mover(250,350,50,200);
}

function draw() {
  background(0);
  cg.run();
  cg.show();
  var av=cg.get();
  var la=cg.getA();
  // console.log(av,la);
  mover.run(av,la);
  mover.show();
}

function Particle(x,y,s){
  var pos=createVector(x,y);
  var speed=0.0001;
  var maxSpeed=20;//arbitrary?
  var vel=createVector(1,0);
  var acc=createVector(0,0);
  var trail=[];
  var trailMax=100;
  var friction=1-0.01;
  var lar=0;
  
  this.show=function(){
    fill(0,135,235);
    noStroke();
    ellipse(pos.x, pos.y, s);
    beginShape();
    stroke(0,100,250,80);
    strokeWeight(s/3);
    noFill();
    var px=0, py=0;
    trail.forEach(function(t){
      if(dist(px, py, t.x, t.y)>s*4){
        endShape();
        beginShape();
      }
      vertex(t.x, t.y);
      px=t.x;
      py=t.y;
    });
    endShape();
    push();
    translate(width*0.8,height*0.95);
    textSize(height/20);
    fill(255);
    noStroke();
    textAlign(RIGHT, BOTTOM);
    text(nf(lar*60,3,2),0,0);
    textAlign(LEFT, BOTTOM);
    text(" m/s^2",0,0);
    pop();
  };
  
  this.run=function(a,la){
    lar=la;
    // console.log(pos.x, pos.y);
    speed-=la;
    speed*=friction;
    vel.rotate(-vel.heading()+a);
    vel.setMag(speed);
    // console.log(speed, vel.mag());
    
    // console.log(vel.x, vel.y);
    pos.add(vel);
    trail.unshift({x:pos.x, y:pos.y});
    if(trail.length>trailMax){
      trail.pop();
    }
    edges();
  }
  
  this.getSpeed=function(){
    return speed/maxSpeed;
  };
  
  function edges(){
    pos.x=(pos.x+width)%width;
    pos.y=(pos.y+height)%height;
  }
}

function Mover(x,y,w,h){
  // var pos=createVector(x,y);
  // var vel=createVector(0,0);
  // var acc=createVector(0,0);
  var a=0;
  var avr;
  var lar=0;
  var body=new Particle(width/2, height/2,w);
  
  this.show=function(){
    push();
    translate(x,y);
    rotate(a);
    rectMode(CENTER);
    fill(0,235,130,150);
    stroke(0,235,130);
    strokeWeight(5);
    rect(0,0,h,w,w/3);
    noStroke();
    var sr=body.getSpeed();
    fill(0,235,130);
    if(sr<0){
      fill(230,135,0);
    }
    rect(sr*h*0.25,0,sr*h*0.5,w*0.75);
    // console.log(nf(body.getSpeed(),3,3));
    pop();
    body.show();
    push();
    translate(width*0.8,height*0.9);
    textSize(height/20);
    fill(255);
    noStroke();
    textAlign(RIGHT, BOTTOM);
    text(nf(degrees(avr*60),3,2),0,0);
    textAlign(LEFT, BOTTOM);
    text(" Z deg/s",0,0);
    pop();
  }
  
  this.run=function(av,la){
    avr=av*PI/(2*60);
    lar=la*10/60;// 10m/s^2 as reference acc - like gravity
    // console.log(nf(degrees(avr*60),3,2));
    a+=avr;
    body.run(a,lar);
  }
}

function ControlGyro(x,y,l,d,t,s){
  var val=0;
  var valA=0;
  var dragging=false;
  var hover=false;
  var offset=createVector(0,0);
  var pos=createVector(0,0);
  
  this.get=function(){
    return val;
  }
  
  this.getA=function(){
    return valA;
  }
  
  this.run=function(){
    if(abs(valA)>0.0001){
      valA+=(0-valA)*0.05;
    }
    if(abs(val)>0.0001){
      val+=(0-val)*0.2;
    }
    pos.y=y+valA*d/2+d/2;
    pos.x=x+val*l/2+l/2;
    hover=dist(pos.x, pos.y, mouseX, mouseY)<s/2;
    if(!dragging && hover && mouseIsPressed){
      dragging=true;
      //offset=createVector(mouseX, mouseY).sub(pos);
    }
    if(dragging){
      val=constrain(2*(mouseX-x)/l-1,-1,1);
      valA=constrain(2*(mouseY-y)/d-1,-1,1);
      if(!mouseIsPressed){
        dragging=false;
      }
    }
  };
  
  this.show=function(){
    noStroke();
    fill(170);
    rectMode(CORNER);
    rect(x-l*0.05,y-d*0.05,l*1.1,d*1.1,l*0.1);
    stroke(255);
    strokeWeight(t);
    line(x,pos.y,x+l,pos.y);
    fill(128);
    if(hover){
      fill(100,255,100);
    }
    noStroke();
    ellipse(pos.x, pos.y,s);
  }
  

}

function ControlAcc(){
  
}