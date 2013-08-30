/*
   Copyright (c) 2012, Remi Grumeau
   See LICENSE.txt for licensing terms
*/

window.music = {
	
	a : new Audio(),
	canPlayMp3 : (new Audio().canPlayType('audio/mpeg') != '')?true:false,
	canPlayOgg : (new Audio().canPlayType('audio/ogg; codecs="vorbis"') != '')?true:false,

	play : function(audiofile)
	{
		if(this.a.src=='' && audiofile!='') {
			emy.$('#music-preload').innerHTML = 'Buffering '+audiofile;
			if(!this.canPlayMp3 && !this.canPlayOgg)
				alert('Your browser is not supported');
			else {
				this.a = new Audio(audiofile+'.'+((this.canPlayMp3)?'mp3':'ogg'));
				this.a.load();
			}
		}

		this.a.play();
		emy.$('#music-play').style.display='none';
		emy.$('#music-pause').style.display='inline-block';
		emy.$('#music-preload').innerHTML = '';
	},

	pause : function()
	{
		this.a.pause();	
		emy.$('#music-play').style.display='inline-block';
		emy.$('#music-pause').style.display='none';
	},

	stop : function()
	{
		this.pause();
		emy.$('#music-play').style.display='inline-block';
		emy.$('#music-pause').style.display='none';
	}
	
}