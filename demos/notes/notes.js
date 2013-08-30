/*
   Copyright (c) 2012, Remi Grumeau
   See LICENSE.txt for licensing terms
*/

window.notes = {
	
	items : [],
	currentNote : 0,
	
	init : function()
	{	
		var a = notes.getFromLocalStorage('emy-notes');
		notes.items = (a)?a:[];
		a=null;
		notes.generateInbox();
		
		return;
	},
	
	generateInbox : function() 
	{
		if(notes.items.length) 
		{
			emy.$('#inbox_list').innerHTML = '';
			for(var i=0,inb=notes.items.length;i<inb;i++) {
				var d = new Date(notes.items[i].date);
				var a = document.createElement('li');
				a.innerHTML = '<a href="javascript:notes.showNote('+(i)+')">'+notes.items[i].title+' <time datetime="'+d.toJSON().substr(0, 10)+'">'+d.toLocaleDateString().substr(0, (d.toLocaleDateString().length-5))+'</time></a>';
				emy.$('#inbox_list').appendChild(a);
			}
			return true;
		}
		else
		{
			emy.$('#inbox_list').innerHTML = '<span>No notes. <a href="javascript:notes.addNote()">Add one?</a></span>';
			return false;
		}
	},
	
	getFromLocalStorage : function(a)
	{
		// returns an object from JSON String
		return JSON.parse(localStorage.getItem(a), function (key, value) {
		    var type;
		    if (value && typeof value === 'object') {
		        type = value.type;
		        if (typeof type === 'string' && typeof window[type] === 'function') {
		            return new (window[type])(value);
		        }
		    }
		    return value;
		});
	},
	
	addNote : function()
	{
		try {
			notes.currentNote = 0;
			emy.$('#note_title').value = '';
			emy.$('#note_desc').value = '';
			notes.hide('deleteBtn');
			emy.gotoView('note');
		}
		catch(e) {
			emy.log(e.message+' (line '+e.line+')');
		}	
	},
	
	showNote : function(id)
	{
		try {
			notes.currentNote = id+1;

			var n = notes.items[id];
			emy.$('#note_title').value = n.title;
			emy.$('#note_desc').value = n.desc;
			notes.display('deleteBtn');
			emy.gotoView('note');
		}
		catch(e) {
			emy.log(e.message+' (line '+e.line+')');
		}
	},	

	saveNote : function()
	{
    var n = new Object();
    n.title = emy.$('#note_title').value;
    n.desc  = emy.$('#note_desc').value;
    n.date	= new Date().getTime();

    if(n.title!='') 
    {
      if(notes.currentNote > 0) {
        emy.log('Update existing note');
        notes.items[notes.currentNote-1] = n;
      } else {
        emy.log('add new note');
        notes.items.push(n);
      }
      notes.currentNote=0;
      notes.saveNotes();
  
      notes.generateInbox();
      setTimeout(function() { emy.goBack(); }, 10);
	  }
	  else
	  {
	    alert('Note title cannot be empty');
	    return;
	  }	
	},
	
	saveNotes : function()
	{
		localStorage.setItem('emy-notes', JSON.stringify(notes.items));
	},
	
	deleteNote : function(id)
	{
		try {
			notes.items.splice((id-1),1);
			notes.saveNotes();
			notes.generateInbox();
		}
		catch(e) {
			emy.log(e.message);
		}
	},

	deleteNotes : function()
	{
		try {
			notes.items = [];
			localStorage.removeItem('emy-notes');
			notes.generateInbox();
		}
		catch(e) {
			emy.log(e.message);
		}
	},



	tlbManager : function()
	{
		var a = emy.getSelectedView().id;
		if(a=='inbox') {
			notes.display('tlbAdd');
			notes.display('tlbAbout');
			notes.hide('tlbSave');
		}
		if(a=='note') {
			notes.hide('tlbAdd');
			notes.hide('tlbAbout');
			notes.display('tlbSave');
		}
		if(a=='about') {
			notes.hide('tlbAdd');
			notes.hide('tlbAbout');
			notes.hide('tlbSave');
		}
	},
	
	emptyForm : function() {
    emy.$('#note_title').value='';
    emy.$('#note_desc').value='';
	},

	display : function(a)
	{
		emy.$('#'+a).style.display='block';
	},
	hide : function(a)
	{
		emy.$('#'+a).style.display='none';
	}
	
}

emy.logging = true;