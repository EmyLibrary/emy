window.app = {

	uid : 0,
	nickname : '',
	ready: false,

	setNickname : function() 
	{
		var n = emy.$('#nickname').value;
		if(n!='') {
			if(app.nickname)
				chat.emit('nickchange', { uid: app.uid, from: app.nickname, to: n });
			else
				chat.emit('newuser', { uid: app.uid, me: n });

			app.nickname = n;
		}
	},

	history : function() 	{ chat.emit('history'); }
};


var chat = io.connect('http://localhost:8080');

chat.on('connect', function () 
{
	app.uid = 'emy-';
	for(var i=0;i<12;i++) {
		app.uid += Math.floor(Math.random()*10);
	}
	app.ready=true;
});

chat.on('info', function (o)
{
	if(app.ready) 
	{
		if(o.type=="newuser") {
			console.log(o.data);
			console.log('#'+o.data.uid+' : Bienvenu '+o.data.me+' !');
		}
		else if(o.type=="nickchange") {
			console.log('#'+o.data.uid+' : '+o.data.from+' est maintenant '+o.data.to);
		}
	}
});

chat.on('history', function (o)
{
	console.log(o);
});