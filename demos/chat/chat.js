;(function() {
window.chat = {

	db : null,
	rooms : null,
	users : null,
	createdRoomId : 0,

	init : function() {
		// connecting to the database
		chat.db = new Firebase('https://emy-chat-demo.firebaseio.com');
		// creating child instances
		chat.rooms = chat.db.child('rooms');
		chat.messages = chat.db.child('messages');

		// initial call to get rooms list
		chat.rooms.once('value', function(items) {
			emy.$('#toolbarRight').innerHTML = '<a class="button icon-add" href="javascript:chat.createRoom()">Add</a></li>';
			emy.$('#room_add').innerHTML = '<li class="group">Chat Rooms</li>';
		});

		// listening for new rooms
		chat.rooms.on('child_added', function(item, prevChild) {
			// create rooms
			chat.addRoom(item);
		});
		// listening for deleted rooms
		chat.rooms.on('child_removed', function(item) {
			// remove homescreen link reference
			emy.$('#rooms_list').removeChild(emy.$('#link'+item.name()).parentNode);
			// if user is on this romm at the moment
			if(emy.getSelectedView().id == 'room'+item.name())
			{
				// going back - leaving the screen
				emy.goBack();
				// removing the screen after a second
				setTimeout(function() { document.body.removeChild(emy.$('#room'+item.name())); } ,1000);
			} else {
				// if not, jsut removing the screen
				document.body.removeChild(emy.$('#room'+item.name()));
			}
		});

		// listening for new messages
		chat.messages.on('child_added', function(item) {
			// create rooms
			chat.addMessage(item);
		});

		// dealing with online/offline
		var connectedRef = new Firebase("https://SampleChat.firebaseIO-demo.com/.info/connected");
		connectedRef.on("value", function(snap) {
		  if (snap.val() === true) {
		  	// going online
			emy.changeClass(document.body,'offline','online');
		  } else {
		  	// going offline
			emy.changeClass(document.body,'online','offline');
		  }
		});

	},

	// add a new chat room
	createRoom : function() {
		var ts = new Date().getTime();
		// ask user room name
		var roomName = window.prompt("Create a new room", "new room "+ts);
		// add created ID reference
		if(roomName!='') {
			// add created ID reference
			chat.createdRoomId = "new room "+ts;
			// push new room to Firebase
			chat.rooms.push({title : roomName, creation : ts});
		}
	},

	// create new chat room & link on the homescreen
	addRoom : function(item) {
		// set a div element to put screen in
		var roomViews = document.createElement('div');
		// check if the room already exists
		if(!emy.$('#room'+item.name()))
		{
			// get datas from Firebase
			var room = item.val();
			// create new view node
			var roomView = document.createElement('section');
			roomView.setAttribute('id', 'room'+item.name());
			roomView.setAttribute('data-title', room.title);
			roomView.setAttribute('class', 'panel');
			// add the fieldset where message will be added
			roomView.innerHTML = '<fieldset id="messages'+item.name()+'"></fieldset>';
			// add the form to post new message
			roomView.innerHTML += '<form id="form'+item.name()+'"class="messageform" action="javascript:chat.sendMessage()" target="_self"><div><textarea id="message" placeholder="Type a message..."></textarea></div><div><button type="submit">ok</button></div></form>';
			// add everything to the view node
			roomViews.appendChild(roomView);

			// add new link to this room to the homescreen
			var roomListOutput = '<li><a id="link'+item.name()+'" href="#room'+item.name()+'" data-title="'+room.title+'">'+room.title+'</a></li>';
			emy.$('#rooms_list').innerHTML += roomListOutput;
		}

		// if this new room has been added by the current user
		if(chat.createdRoomId!=0) {
			// add view & navigate to it
			emy.insertViews(roomViews, true);
			// empty new room
			chat.createdRoomId = 0;
		} else {
			// add view but do not navigate to it
			emy.insertViews(roomViews, false);
		}

	},

	// create new chat room & link on the homescreen
	addMessage : function(item) {
		// get datas from Firebase
		var message = item.val();
		// if message is not already in
		if(!emy.$('#message'+item.name()))
		{
			// get date object from Firebase datas
			var date = new Date(message.creation);
			var hours = date.getHours(), minutes = date.getMinutes(), seconds = date.getSeconds();

			// create new message item
			var messageItem = document.createElement('div');
			messageItem.setAttribute('id', 'message'+item.name());
			messageItem.innerHTML = '<p class="text">'+message.message+'</p>';
			messageItem.innerHTML += '<p class="date">'+hours + ':' + minutes + ':' + seconds+'</p>';
			emy.$('#messages'+message.room).appendChild(messageItem);

			// add a notification bubble on the homescreen if user is not on this room at the moment
			if(emy.getSelectedView().id.substr(4) != message.room) {
				var nb=0, link = emy.$('#link'+message.room),text;
				// if there is already a bubble in the link node, get the number value
				if(link.childNodes[1])
					nb = parseInt(link.childNodes[1].innerText);
				// add one
				nb++;
				// recreate the link text & bubble
				link.innerHTML = link.getAttribute('data-title')+'<span class="bubble">'+nb+'</span>';
			}
			else {
				// if user is on this room, force view to scroll down to see it
				setTimeout(function() {
					window.scrollTop = emy.$('#room'+message.room).scrollHeight;
				}, 50);
			}
		}
	},

	// post a new message to a room
	sendMessage : function() {
		// get timestamp & actual room
		var ts = new Date().getTime(), uid = emy.getSelectedView().id.substr(4);
		// get message text
		var message = emy.$('#form'+uid).message;
		// send message if not empty, and empty the textarea
		if(message.value!='') {
			chat.messages.push({message : message.value, room : uid, creation : ts});
			message.value='';
		}
	}

}
chat.init();
})();