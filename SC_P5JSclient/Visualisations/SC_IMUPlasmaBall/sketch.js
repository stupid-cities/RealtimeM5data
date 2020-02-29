var ranges={};
// var GYRX=0, GYRY=1, GYRZ=2, ACCX=3, ACCY=4, ACCZ=5, ROLL=6, PITC=7, YAWW=8;
var types=["GYRX","GYRY","GYRZ","ACCX","ACCY","ACCZ","PITC","ROLL","YAWW"];
var connection = new WebSocket('ws://127.0.0.1:8011/', ['arduino']);
var dataPoints=[];
var movers=[];
var gyroSensitivity=-20;
var accSensitivity=-500;
var plasmaBalls;
var invert=false;
var numMovers=0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  
  // movers.push(new Mover(0,250,350,50,200,0.75));
  // movers.push(new Mover(1,550,350,50,200,0.55));
  
  plasmaBalls=new PlasmaBalls();
}

function draw() {
  if(dataPoints.length>movers.length+1){
    movers.push(new Mover(movers.length,250,350,50,200,0.75));
  }
  background(0);
  moverPos=[];
  for(var i=0; i<movers.length; i++){
    if(dataPoints.length>i+1){
      var av=gyroSensitivity * dataPoints[i+1].meanVals["GYRZ"].get();
      var la=accSensitivity * dataPoints[i+1].meanVals["ACCY"].get();
      movers[i].run(av,la);
      moverPos.push(movers[i].getPos());
    }
    //movers[i].show();
  }
  
  plasmaBalls.run(moverPos);
}

function PlasmaBalls(){
  var balls=[];

  this.run=function(blobPos){
    while(balls.length<blobPos.length){
      balls.push(new PlasmaBall(balls.length));
    }
    blobPos.forEach(function(b,i){
      balls[i].run(b.x, b.y);
    });
  };
}

function PlasmaBall(id){
  var numParticles=200;
  var particles=[];
  var radMin=width/8;
  var radMax=width/3;
  var radNow=radMin;
  
  this.run=function(nx,ny){
    // console.log(particles.length);
    if(particles.length<numParticles){
      for(var i=0; i<5; i++){
        particles.push(new PParticle(id,nx,ny, radNow));
      }
    }
    // console.log(particles.length);
    for(var i=particles.length-1; i>=0; i--){
      if(!particles[i].update()){
        particles.splice(i,1);
      }
      particles[i].show();
    }
  };
}

function PParticle(callerID,x,y, rad){
  var pos=createVector(x,y);
  var vel=createVector(0,0);
  var acc;
  var ttlInit=40;
  var ttl=ttlInit;
  var baseHue=callerID*120+0;
  
  this.update=function(){
    var acc=p5.Vector.random2D();
    acc.mult(1);
    vel.add(acc);
    pos.add(vel);
    ttl--;
    return ttl>0;
  };
  
  this.show=function(){
    var r=map(ttl,0,ttlInit,0,rad);
    var a=map(ttl,0,ttlInit,50,255)
    push();
    colorMode(HSB,255);
    if(invert){
      fill(invCol-map(ttl,ttlInit,0,100,180)+invColShift,invCol-map(ttl,ttlInit,0,0,200),255);
    } else {
      fill(baseHue+map(ttl,ttlInit,0,0,80),map(ttl,ttlInit,0,0,200),255);
    }
    noStroke();
    ellipse(pos.x,pos.y,r,r);
    colorMode(RGB,255);
    pop();
  }
}


function Particle(id,x,y,s,cHue){
  var pos=createVector(x,y);
  var speed=0.0001;
  var maxSpeed=20;//arbitrary?
  var vel=createVector(1,0);
  var acc=createVector(0,0);
  var trail=[];
  var trailMax=200;
  var friction=1-0.1;
  var lar=0;
  
  this.show=function(){
    fill(cHue,70,80,1);
    noStroke();
    ellipse(pos.x, pos.y, s);
    beginShape();
    stroke(cHue,80,90,0.7);
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
    translate(width*0.1+id*width*0.2,height*0.95);
    textSize(height/40);
    fill(0,0,100);
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
    speed=constrain(speed,-20,20);
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
  
  this.getPos=function(){
    return pos;
  };
  
  this.getSpeed=function(){
    return speed/maxSpeed;
  };
  
  function edges(){
    pos.x=(pos.x+width)%width;
    pos.y=(pos.y+height)%height;
  }
}

function Mover(id,x,y,w,h,col){
  // var pos=createVector(x,y);
  // var vel=createVector(0,0);
  // var acc=createVector(0,0);
  var a=0;
  var avr;
  var lar=0;
  var cHue=col*360;
  var body=new Particle(id, width/2, height/2,w,cHue);
  
  this.show=function(){
    push();
    translate(x,y);
    rotate(a);
    rectMode(CENTER);
    fill(cHue,60,60,0.6);
    stroke(cHue,70,70,1);
    strokeWeight(5);
    rect(0,0,h,w,w/3);
    noStroke();
    var sr=body.getSpeed();
    fill(120,70,70);
    if(sr<0){
      fill(30,70,70);
    }
    rect(sr*h*0.25,0,sr*h*0.5,w*0.75);
    // console.log(nf(body.getSpeed(),3,3));
    pop();
    body.show();
    push();
    translate(width*0.1+id*width*0.2,height*0.9);
    textSize(height/40);
    fill(0,0,100);
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
  };
  
  this.getPos=function(){
    return body.getPos();
  };
}

connection.onopen = function () {
	//send browser identity string
	connection.send('IAMABROWSER');
	connection.send('Time: ' + new Date());
};

connection.onerror = function (error) {
	console.log('WebSocket Error ', error);
};

connection.onmessage = function (e) {
// 	console.log('Server: ', e.data);
	processData(e.data);
};

function processData(data){
	//data format=SCDV+000+TYPE+0.000000
	//values for slice=0-4, 4-7, 7-11,

	done=false;
	var signal=data.slice(0,4);
	if(signal!=="SCDV"){
		done=false;
	} else {
		var client=Number(data.slice(4,7));
		var type=data.slice(7,11);
		var data=Number(data.slice(11));
		// console.log(client+":"+type+":"+data);
		var foundClient=null;
		dataPoints.forEach(function(dp){
			if(dp.id===client){
				foundClient=dp;
			}
		});
		if(foundClient!=null){
			foundClient[type]=data;
			foundClient.update(type,data);
		// 	console.log(type);
		// 	ranges[type].update(data);
		} else {
			dataPoint=new DataPoint(client);
			dataPoints.push(dataPoint);
		}
		done=true;
		// console.log(dataPoints);
	}
	return done;
}

function DataPoint(id){
	this.id=id;
	this.GYRX=0;
	this.GYRY=0;
	this.GYRZ=0;
	this.ACCX=0;
	this.ACCY=0;
	this.ACCZ=0;
	this.PITC=0;
	this.ROLL=0;
	this.YAWW=0;
	
	this.meanVals={};
	var range=1;
	for(var i=0; i<9; i++){
	  if(i<3) { range= 2000;}
	  else if(i<6) { range=10;}
	  else { range = 180};
	  this.meanVals[types[i]]=(new DPAvg(3,range));
	}
	
	this.update=function(type, data){
	  this.meanVals[type].update(data);
	}
	
	
	function DPAvg(count,range){
	  var prevs=[];
	  var accum=0;
	  var mean=0;
	  
	  this.get=function(){
	    return mean;
	  };
	  
	  this.update=function(val){
	    prevs.push(val/range);
	    accum+=val/range;
	    if(prevs.length>count){
	      accum-=prevs[0];
	      prevs.shift();
	    }
	    mean=accum/prevs.length;
	  };
	  
	}
}

// function RangeCatcher(){
//   var minVal=100000;
//   var maxVal=-100000;
 
//   this.update=function(val){
//     if(val<minVal){
//       minVal=val;
//     }
//     if(val>maxVal){
//       maxVal=val;
//     }
//   };
  
//   this.get=function(){
//     return {min: minVal, max: maxVal};
//   };
// }
