var ranges={};
// var GYRX=0, GYRY=1, GYRZ=2, ACCX=3, ACCY=4, ACCZ=5, ROLL=6, PITC=7, YAWW=8;
var types=["GYRX","GYRY","GYRZ","ACCX","ACCY","ACCZ","PITC","ROLL","YAWW","TIME"];

// var gyroSensitivity=-20;
// var accSensitivity=-500;
// var gyroRange=-0.01;

var surfaceData;
var lastDataSet=null;
var structured;
var dataRetrieved=false;


function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  background(0,0,10);
  // for(var i=0; i<4; i++){
  //   graphs.push(new Graph(width*0.1,height*(0.1+0.18*i),width*0.7,height*0.15,10,100,"Noise data"+nf(i,2,0),20+i*30));
  // }
  var i=0;

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
	retrieveData();
}

function retrieveData(){
  var ref=surfaceData.ref('surface');
  ref.once('value', function(snapshot) {
    var data=snapshot.val();
    // console.log(data);
    datakeys=Object.keys(data);
    console.log(datakeys);
    // data.forEach(function(
    var lastDataIndex=-1;
    var newest=0;
    datakeys.forEach(function(dk,i){
      var thisDate=data[dk].date;
      console.log(data[dk].date+" "+new Date(data[dk].date));
      if(thisDate>newest){
        newest=thisDate;
        lastDataIndex=i;
      }
    });
    if(lastDataIndex>-1){
      lastDataSet=data[datakeys[lastDataIndex]];
      dataRetrieved=true;
      structured=new StructuredIMUData(lastDataSet);
    }
  });
  // noLoop();
}



function draw() {
  background(0,0,10);
  fill(300,100,100);
  noStroke();
  textSize(10);
  textAlign(LEFT,BASELINE);
  text(dataRetrieved,100,100);
  if(dataRetrieved){
    text(new Date(lastDataSet.date),100,120);
    drawData(structured,100,100,400,250);
    noLoop();
  }
}

function drawData(data,x,y,w,h){
  var timeSpan=data.TIME[data.TIME.length-1];
  var xStep=w/timeSpan;
  console.log(timeSpan,xStep);
  push();
  translate(x,y);
  fill(0,0,40);
  stroke(0,0,100);
  rect(0,0,w,h);
  translate(0,h);
  var xProg=0;
  
  console.log(data.size);
  // for(var i=0; i<data.size; i++){
  //   var ay=data.ACCY[i];
  //   xProg=data.TIME[i]*xStep;
  //   // console.log(xProg, ay);
  //   // ellipse(xProg,-1,2);
  //   line(xProg,0,xProg,-ay*100);
  //   push();
  //   translate(xProg,-50);
  //   stroke(0,100,100);
  //   rotate(-data.ROLL[i]*PI/180);
  //   line(0,0,20,0);
  //   pop();
  // }
  
  // translate(0,-h/2);
  
  
  // calc base slope
  var sum=0;
  var count=10;
  var avg=0;
  for(var i=0; i<count; i++){
    sum+=data.ROLL[i];
  }
  avg=sum/count;
  var baseSlope=avg*PI/180;
  console.log(baseSlope);
  
  
  // calculate vertices
  var linVel=0;
  var linAcc=0;
  var prevTime=0;
  var verts=[];
  // beginShape();
  
  var x=y=0;
  var px=py=0;
  var ang=0;
  // vertex(x,y);
  verts.push({x:x, y:y});
  var maxAvgAngle=0;
  var numAngles=10;
  for(var i=0; i<data.size; i++){
    var ay=data.ACCY[i];
    var timeNow=data.TIME[i];
    var timeInc=timeNow-prevTime;
    prevTime=timeNow;
    linAcc=ay;//-gravityEffectOnY;
    linVel+=linAcc;
    ang=data.ROLL[i]*PI/180-baseSlope;
    x+=cos(-ang)*linVel*timeInc*xStep*0.2;
    y+=sin(-ang)*linVel*timeInc*xStep*0.2;
    verts.push({x:x, y:y, lv:linVel});
    // vertex(x,y);
    // stroke(linVel*120/20,70,70,0.6);
    // console.log(linVel*120/100);
    // strokeWeight(linVel*0.2);
    // noFill();
    // line(px,py,x,y);
    // fill(0,0,100);
    // noStroke();
    // textSize(5);
    // text(nf(linVel,2,2),x,y*y);
    // px=x;
    // py=y;
  }
  // stroke(120,100,100);
  // strokeWeight(0.1);
  // noFill();
  // endShape();
  prevTime=0;
  var scaleX=w/x;
  var scaleY=1;//h/y;
  
  //render vertices
  push();
  // scale(scaleX,scaleY);
  beginShape();
  verts.forEach(function(v){
    vertex(v.x*scaleX,v.y*scaleY);
  });
  stroke(20,100,100);
  strokeWeight(2);
  noFill();
  endShape();
  pop();
  // beginShape();
  
  // var x=y=0;
  // var ang=0;
  // vertex(x,y);
  // for(var i=0; i<data.size; i++){
  //   var gravityEffectOnY=sin(-(data.ROLL[i]*PI/180-baseSlope))*2;
  //   var ay=data.ACCY[i];
  //   var timeNow=data.TIME[i];
  //   var timeInc=timeNow-prevTime;
  //   prevTime=timeNow;
  //   linAcc=gravityEffectOnY;
  //   linVel+=linAcc;
  //   ang=data.ROLL[i]*PI/180-baseSlope;
  //   x+=cos(-ang)*linVel*timeInc*xStep*0.01;
  //   y+=sin(-ang)*linVel*timeInc*xStep*0.01;
  //   vertex(x,y);
    
  //   stroke(0,100,100);
  //   noFill();
  //   ellipse(x,y,gravityEffectOnY*10);
  // }
  // stroke(0,100,100);
  // noFill();
  // endShape();
  pop();
  // noLoop();
}
  

function StructuredIMUData(rawData){
  this.size=rawData.values.length;
  this.date=rawData.date;
  this.time=[];
  var sid=this;
  
  rawData.values.forEach(function(row){
    var cols=Object.keys(row);
    cols.forEach(function(col){
      if(!sid[col]){
        sid[col]=[];
      } 
      sid[col].push(row[col]);
    });
  });
  console.log(this);
}
    


