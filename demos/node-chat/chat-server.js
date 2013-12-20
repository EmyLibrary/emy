var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , file_index = 'node-chat.html'

app.listen(8080);

function handler (req, res) 
{
	var f = (req.url!='/')?req.url:file_index;
	var file = __dirname+'/'+f;
	console.log(req.url);

	fs.readFile(file, function (err, data) {
		if (err) {
		  res.writeHead(500);
		  return res.end('Error loading '+f);
		}
		res.writeHead(200);
		res.end(data);
	});
}

var users=[], logs=[];

io.sockets.on('connection', function (socket) 
{

	socket.on('newuser', function (data) {
		socket.emit('info', { type: 'newuser', data: data });
		users[data] = data;
		logs.push({ type:'newuser', content: data });
	});

	socket.on('nickchange', function (data) {
		socket.emit('info', { type: 'nickchange', data: data });
		users[data].me = data.to;
		logs.push({type:'nickchange', content: data });
	});

	socket.on('message', function (data) {
		socket.emit('message', { msg: msg });
		logs.push({type:'msg', content: msg });
	});

	socket.on('history', function () {
		socket.emit('history', logs);
	});

});