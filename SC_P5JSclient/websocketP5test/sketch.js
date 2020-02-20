function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
  var ts=16;
  var gap=ts*1.8;
  var tx1=80;
  var tx2=150;
  var txg=100;
  var ty1=100;
  fill(255);
  textSize(ts);
  textAlign(RIGHT, CENTER);
  text("GyroX:",tx1,ty1+gap*0);
  text("GyroY:",tx1,ty1+gap*1);
  text("GyroZ:",tx1,ty1+gap*2);
  text("AccX:",tx1,ty1+gap*3);
  text("AccY:",tx1,ty1+gap*4);
  text("AccZ:",tx1,ty1+gap*5);
  text("Pitch:",tx1,ty1+gap*6);
  text("Roll:",tx1,ty1+gap*7);
  text("Yaw:",tx1,ty1+gap*8);
  // textAlign(LEFT, CENTER);
  for(var i=0; i<dataPoints.length; i++){
    text(i,tx2+i*txg, ty1-gap);
    text(nf(dataPoints[i].GYRX,3,3),tx2+i*txg,ty1+gap*0);
    text(nf(dataPoints[i].GYRY,3,3),tx2+i*txg,ty1+gap*1);
    text(nf(dataPoints[i].GYRZ,3,3),tx2+i*txg,ty1+gap*2);
    text(nf(dataPoints[i].ACCX,3,3),tx2+i*txg,ty1+gap*3);
    text(nf(dataPoints[i].ACCY,3,3),tx2+i*txg,ty1+gap*4);
    text(nf(dataPoints[i].ACCZ,3,3),tx2+i*txg,ty1+gap*5);
    text(nf(dataPoints[i].PITC,3,3),tx2+i*txg,ty1+gap*6);
    text(nf(dataPoints[i].ROLL,3,3),tx2+i*txg,ty1+gap*7);
    text(nf(dataPoints[i].YAWW,3,3),tx2+i*txg,ty1+gap*8);
  }
}

var connection = new WebSocket('ws://127.0.0.1:8011/', ['arduino']);
var dataPoints=[];

connection.onopen = function () {
	//send browser identity string
	connection.send('IAMABROWSER');

/*	setInterval(function() {
		connection.send('Time: ' + new Date());
	}, 20);
*/
	connection.send('Time: ' + new Date());
};

connection.onerror = function (error) {
	console.log('WebSocket Error ', error);
};

connection.onmessage = function (e) {
	console.log('Server: ', e.data);
	// var client=Number(e.data.slice(0,3));
	// var type=e.data.slice(3,7);
	// var data=Number(e.data.slice(7))+1;
	// console.log(client+":"+type+":"+data);
	// connection.send('Time: ' + new Date());
	processData(e.data);
};

function sendRGB() {
	var r = parseInt(document.getElementById('r').value).toString(16);
	var g = parseInt(document.getElementById('g').value).toString(16);
	var b = parseInt(document.getElementById('b').value).toString(16);
	if(r.length < 2) { r = '0' + r; }
	if(g.length < 2) { g = '0' + g; }
	if(b.length < 2) { b = '0' + b; }
	var rgb = '#'+r+g+b;
	console.log('RGB: ' + rgb);
	connection.send(rgb);
}

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
		console.log(client+":"+type+":"+data);
		var foundClient=null;
		dataPoints.forEach(function(dp){
			if(dp.id===client){
				foundClient=dp;
			}
		});
		if(foundClient!=null){
			foundClient[type]=data;
		} else {
			dataPoint=new DataPoint(client);
			dataPoints.push(dataPoint);
		}
		done=true;
		console.log(dataPoints);
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
}
