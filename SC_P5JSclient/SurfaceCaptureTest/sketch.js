var ranges={};
// var GYRX=0, GYRY=1, GYRZ=2, ACCX=3, ACCY=4, ACCZ=5, ROLL=6, PITC=7, YAWW=8;
var types=["GYRX","GYRY","GYRZ","ACCX","ACCY","ACCZ","PITC","ROLL","YAWW","TIME"];
var connection = new WebSocket('ws://127.0.0.1:8011/', ['arduino']);
var dataPoints=[];
var movers=[];
var gyroSensitivity=-20;
var accSensitivity=-500;
var gyroRange=-0.01;
var inkTrails=[];
var invert=false;
var numMovers=0;
var graphHeight=0.07;
var logging=false;
var dataLog=null;

var surfaceData;

var graphs=[];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  background(0,0,10);
  // for(var i=0; i<4; i++){
  //   graphs.push(new Graph(width*0.1,height*(0.1+0.18*i),width*0.7,height*0.15,10,100,"Noise data"+nf(i,2,0),20+i*30));
  // }
  var i=0;
  graphs.push(new Graph(width*0.1,height*(0.1+graphHeight*1.2*i),width*0.7,height*graphHeight,-0.5,0.5,"GYRX",20+i*30));
  i++;
  graphs.push(new Graph(width*0.1,height*(0.1+graphHeight*1.2*i),width*0.7,height*graphHeight,-0.5,0.5,"GYRY",20+i*30));
  i++;
  graphs.push(new Graph(width*0.1,height*(0.1+graphHeight*1.2*i),width*0.7,height*graphHeight,-0.5,0.5,"GYROZ",20+i*30));
  i++;
  graphs.push(new Graph(width*0.1,height*(0.1+graphHeight*1.2*i),width*0.7,height*graphHeight,-0.1,0.1,"ACCX",20+i*30));
  i++;
  graphs.push(new Graph(width*0.1,height*(0.1+graphHeight*1.2*i),width*0.7,height*graphHeight,-0.1,0.1,"ACCY",20+i*30));
  i++;
  graphs.push(new Graph(width*0.1,height*(0.1+graphHeight*1.2*i),width*0.7,height*graphHeight,-0.1,0.1,"ACCZ",20+i*30));
  i++;
  graphs.push(new Graph(width*0.1,height*(0.1+graphHeight*1.2*i),width*0.7,height*graphHeight,-1,1,"PITC",20+i*30));
  i++;
  graphs.push(new Graph(width*0.1,height*(0.1+graphHeight*1.2*i),width*0.7,height*graphHeight,-1,1,"ROLL",20+i*30));
  i++;
  graphs.push(new Graph(width*0.1,height*(0.1+graphHeight*1.2*i),width*0.7,height*graphHeight,-1,1,"YAWW",20+i*30));
  // movers.push(new Mover(0,250,350,50,200,0.75));
  // movers.push(new Mover(1,550,350,50,200,0.55));
  
  // plasmaBalls=new PlasmaBalls();
  
  // Initialize Firebase
  
  var firebaseConfig = {
    apiKey: "AIzaSyCjRAbWqnr87M5l5p-femOmfhX8OCRPNLk",
    authDomain: "stupidcitiessurface.firebaseapp.com",
    databaseURL: "https://stupidcitiessurface.firebaseio.com",
    projectId: "stupidcitiessurface",
    storageBucket: "stupidcitiessurface.appspot.com",
    messagingSenderId: "656281181425",
    appId: "1:656281181425:web:980ebbfe2d733b7f1b9d50",
    measurementId: "G-XEJS1H4QPD"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
	surfaceData = firebase.database();
}

function draw() {
  // if(dataPoints.length>movers.length+1){
  //   movers.push(new Mover(movers.length,250,350,50,200,0.75));
  //   inkTrails.push(new SplotTrail(inkTrails.length));
  // }
  background(0,0,10);
  graphs.forEach(function(graph){
    // graph.run();
    graph.show();
  });
  if(dataPoints.length>1 && dataPoints[1].CAPT==1){
    graphs[0].run(dataPoints[1].meanVals["GYRX"].get());
    graphs[1].run(dataPoints[1].meanVals["GYRY"].get());
    graphs[2].run(dataPoints[1].meanVals["GYRZ"].get());
    graphs[3].run(dataPoints[1].meanVals["ACCX"].get());
    graphs[4].run(dataPoints[1].meanVals["ACCY"].get());
    graphs[5].run(dataPoints[1].meanVals["ACCZ"].get());
    graphs[6].run(dataPoints[1].meanVals["PITC"].get());
    graphs[7].run(dataPoints[1].meanVals["ROLL"].get());
    graphs[8].run(dataPoints[1].meanVals["YAWW"].get());
  }
  if(!logging){
    if(dataPoints.length>1 && dataPoints[1].CAPT==1){
      dataLog=new DataLog(Date.now());
      logging=true;
    }
  } else {
    if(dataPoints[1].CAPT==0){
      logging=false;
      writeLoggedData();
    } else {
      dataLog.add(dataPoints[1]);
    }
  }
  
  function writeLoggedData(){
    if(dataLog){
      dataLog.write();
    }
  }
  
  // for(var i=0; i<movers.length; i++){
  //   if(dataPoints.length>i+1){
  //     var av=gyroSensitivity * dataPoints[i+1].meanVals["GYRZ"].get();
  //     var la=accSensitivity * dataPoints[i+1].meanVals["ACCY"].get();
  //     movers[i].run(av,la);
  //     // console.log(movers[i].getPos());
  //     var p=movers[i].getPos();
  //     inkTrails[i].add(p.x, p.y);
  //   }
  //   inkTrails[i].run();
    // console.log(inkTrails.length);
    // movers[i].show();
  // }
}

function DataLog(date){
  var data={};
  data.ranges=[2000,2000,2000,10,10,10,180,180,180];
  data.values=[];
  data.date=date;
  var lastTime=0;
  
  this.add=function(dataSet){
    // console.log(dataSet);
    dataVals={};
    var time=dataSet["TIME"];
    if(time>lastTime){
      lastTime=time;
      for(var i=0; i<types.length; i++){
        // console.log(dataSet[types[i]]);
    	  dataVals[types[i]]=dataSet[types[i]];
    	}
      data.values.push(dataVals);
    }
  };
  
  this.write=function(){
    // console.log(data);
    var ref=surfaceData.ref('surface');
    ref.push(data);
    data={};
  };
}

function Graph(x,y,w,h,minV,maxV,label,col){
  var trail=[];
  var historyLength=5;
  var trailMax=60*historyLength;
  var gap=h*0.05;
  var iw=w-gap*2;
  var ih=h-gap*2;
  var trailStep=iw/trailMax;
  var rangeV=maxV-minV;
  
  var nOff=random(10);
  
  this.run=function(val){
    // console.log(val);
    // var val=noise(nOff+frameCount/100)*rangeV+minV;
    trail.unshift(val);
    if(trail.length>trailMax){
      trail.pop();
    }
  };
  
  this.show=function(){
    push();
    translate(x,y);
    fill(0,0,30);
    noStroke();
    rectMode(CORNER);
    rect(0,0,w,h);
    translate(gap,gap);
    fill(0,0,40);
    rect(0,0,iw,ih);
    noStroke();
    fill(255,150);
    textSize(h/5);
    textAlign(RIGHT,TOP);
    text(maxV,iw,0);
    textAlign(RIGHT,BOTTOM);
    text(minV,iw,ih);
    textAlign(LEFT,TOP);
    text(label,0,0);
    // translate(gap,gap);
    translate(iw,ih);
    fill(col,100,100);
    noStroke();
    ellipse(0,-ih*(trail[0]-minV)/rangeV,6);
    stroke(col,100,100,0.7);
    strokeWeight(2);
    noFill();
    beginShape();
    trail.forEach(function(tp,i){
      vertex(-i*trailStep,-ih*(tp-minV)/rangeV);
    });
    endShape();
    pop();
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
	this.CAPT=0;
	this.TIME=0;
	
	this.meanVals={};
	var range=1;
	for(var i=0; i<9; i++){
	  if(i<3) { range= 2000;}
	  else if(i<6) { range=10;}
	  else { range = 180};
	  this.meanVals[types[i]]=(new DPAvg(1,range));
	}
	
	this.update=function(type, data){
	  if(type=="CAPT"){
	    this.CAPT=data;
	  } else if(type=="TIME"){
	    this.TIME=data;
	  } else {
	    this.meanVals[type].update(data);
	  }
  };
	
	
	
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
