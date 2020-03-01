var ranges={};
// var GYRX=0, GYRY=1, GYRZ=2, ACCX=3, ACCY=4, ACCZ=5, ROLL=6, PITC=7, YAWW=8;
var types=["GYRX","GYRY","GYRZ","ACCX","ACCY","ACCZ","PITC","ROLL","YAWW"];
var connection = new WebSocket('ws://127.0.0.1:8011/', ['arduino']);
var dataPoints=[];
var movers=[];
var gyroSensitivity=-10;
var accSensitivity=-5000;

let midiOutput = null;
let channel=0;
let ccRotZ=60;
let ccAccY=61;
let noteOn=false;
let noteStarted=false;

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
const PITCH_BEND = 0xE0;
const CONTROL = 0xB0;
const MODWHEEL = 0x02;


function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  movers.push(new Mover(0,250,350,50,200,0.75));
  movers.push(new Mover(1,550,350,50,200,0.55));
}

function draw() {
  // console.log(dataPoints);
  background(0);
  // showData();
  // if(dataPoints.length>1){
  //   var av=gyroSensitivity * dataPoints[1].meanVals["GYRZ"].get();
  //   var la=accSensitivity * dataPoints[1].meanVals["ACCY"].get();
  //   mover.run(av,la);
  // }
  for(var i=1; i<dataPoints.length; i++){
    // if(dataPoints.length>i+1){
      var av=gyroSensitivity * dataPoints[i].meanVals["GYRZ"].get();
      var la=accSensitivity * dataPoints[i].meanVals["ACCY"].get();
      movers[i].run(av,la);
      midiPlay(i,av,la);
    // }
    movers[i].show();
  }
  if(noteOn){
    if(!noteStarted){
      midiOutput.send([NOTE_ON, 41, 0x7f]);
      noteStarted=true;
    }
  }
}

function mousePressed(){
  midiOutput.send([NOTE_ON, 41, 0x7f]);
}

function midiPlay(id,av,la){
  var avLim=constrain(av,-1,1);
  var ccAV=floor(map(avLim,-1,1,0,127));
  var laLim=constrain(la,-300,300);
  var ccLA=floor(map(laLim,-300,300,0,127));
  // var ms7=floor(pitch/128);
  // var ls7=pitch-(ms7*128);
  // console.log()
  midiOutput.send([CONTROL,ccRotZ, ccAV]);
  midiOutput.send([CONTROL,ccAccY, ccLA]);
  
  // console.log(nf(av,2,2),nf(la,2,2));
  
}

navigator.requestMIDIAccess()
.then(function(midiAccess) {
  const outputs = midiAccess.outputs.values();
  console.log(outputs);
  for(const output of outputs) {
    console.log(output);
    midiOutput = output;
  }
  // playNote();
  noteOn=true;
});

// function showData(){
//     var ts=16;
//   var gap=ts*1.8;
//   var tx1=80;
//   var tx2=150;
//   var txg=100;
//   var ty1=100;
//   fill(255);
//   textSize(ts);
//   textAlign(RIGHT, CENTER);
//   text("GyroX:",tx1,ty1+gap*0);
//   text("GyroY:",tx1,ty1+gap*1);
//   text("GyroZ:",tx1,ty1+gap*2);
//   text("AccX:",tx1,ty1+gap*3);
//   text("AccY:",tx1,ty1+gap*4);
//   text("AccZ:",tx1,ty1+gap*5);
//   text("Pitch:",tx1,ty1+gap*6);
//   text("Roll:",tx1,ty1+gap*7);
//   text("Yaw:",tx1,ty1+gap*8);
//   // textAlign(LEFT, CENTER);
//   for(var i=0; i<dataPoints.length; i++){
//     text(i,tx2+i*txg, ty1-gap);
//     // text(nf(dataPoints[i].GYRX,3,3),tx2+i*txg,ty1+gap*0);
//     text(nf(dataPoints[i].meanVals["GYRX"].get(),3,3),tx2+i*txg,ty1+gap*0);
//     text(nf(dataPoints[i].meanVals["GYRY"].get(),3,3),tx2+i*txg,ty1+gap*1);
//     text(nf(dataPoints[i].meanVals["GYRZ"].get(),3,3),tx2+i*txg,ty1+gap*2);
//     text(nf(dataPoints[i].meanVals["ACCX"].get(),3,3),tx2+i*txg,ty1+gap*3);
//     text(nf(dataPoints[i].meanVals["ACCY"].get(),3,3),tx2+i*txg,ty1+gap*4);
//     text(nf(dataPoints[i].meanVals["ACCZ"].get(),3,3),tx2+i*txg,ty1+gap*5);
//     text(nf(dataPoints[i].meanVals["PITC"].get(),3,3),tx2+i*txg,ty1+gap*6);
//     text(nf(dataPoints[i].meanVals["ROLL"].get(),3,3),tx2+i*txg,ty1+gap*7);
//     text(nf(dataPoints[i].meanVals["YAWW"].get(),3,3),tx2+i*txg,ty1+gap*8);
//   }
// }


function Particle(id,x,y,s,cHue){
  var pos=createVector(x,y);
  var speed=0.0001;
  var maxSpeed=20;//arbitrary?
  var vel=createVector(1,0);
  var acc=createVector(0,0);
  var trail=[];
  var trailMax=200;
  var friction=1-0.05;
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
    speed=-la;
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
  }
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
