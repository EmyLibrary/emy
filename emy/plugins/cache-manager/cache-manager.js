// Emy Cache Manager Plugin
// For more infos: http://www.html5rocks.com/en/tutorials/appcache/beginner/
//
// This is a port from the original code for iUI
// http://www.iui-js.org

(function() {
addEventListener("DOMContentLoaded", function(event)
{
  if(window.applicationCache)
    emy.plugin.appCache.init();
});

emy.plugin.appCache = {

  e : window.applicationCache,
  cachePrompt : null,
  busy: false,

  init : function()
  {
    // check if cachePrompt DIV element exists in the DOM. If not, we create it
    if(!emy.$('#cachePrompt')) {
      var a = document.createElement('div');
      a.id="cachePrompt";
      emy.$('body')[0].appendChild(a);
    }

		this.e.addEventListener('checking', function(e) { emy.plugin.appCache.eventListener(e); }, false);
		this.e.addEventListener('downloading', function(e) { emy.plugin.appCache.eventListener(e); }, false);
		this.e.addEventListener('noupdate', function(e) { emy.plugin.appCache.eventListener(e); }, false);
		this.e.addEventListener('updateready', function(e) { emy.plugin.appCache.eventListener(e); }, false);
		this.e.addEventListener('progress', function(e) { emy.plugin.appCache.eventListener(e); }, false);
		this.e.addEventListener('cached', function(e) { emy.plugin.appCache.eventListener(e); }, false);
		this.e.addEventListener('error', function(e) { emy.plugin.appCache.eventListener(e); }, false);
		this.e.addEventListener('obsolete', function(e) { emy.plugin.appCache.eventListener(e); }, false);
	},

	eventListener : function(e)
	{
	  var msg='';
	  switch(e.type)
	  {
	    case 'noupdate':
	      emy.log('** AppCache : NoUpdate **');
	      emy.plugin.appCache.busy=false;
	      break;
	    case 'cached':
	      msg = 'This app is now available offline!';
	      emy.log('** AppCache : Cached **');
	      emy.plugin.appCache.busy=false;
	      break;
	    case 'checking':
	      emy.log('** AppCache : Checking **');
	      break;
	    case 'downloading':
	      msg = 'A new version is available';
	      emy.log('** AppCache : Downloading **');
	      emy.plugin.appCache.busy=true;
	      break;
	    case 'progress':
	      msg = 'Downloading ('+parseInt((e.loaded/e.total)*100)+'%)';
	      emy.log('** AppCache : Progress **');
	      break;
	    case 'updateready':
	      msg = 'New version is ready! Restarting...';
	      emy.log('** AppCache : UpdateReady **');
  	    setTimeout(function() { window.location.reload(); }, 1000);
  	    break;
	    case 'obsolete':
	      msg = 'Cache manifest is obsolete.';
	      emy.log('** AppCache : Obsolete **');
	      emy.plugin.appCache.busy=false;
	      break;
	    case 'error':
	      if(emy.plugin.appCache.busy)
  	      msg = 'An error has occured. Update failed';
	      emy.log('** AppCache : Error **');
	      emy.plugin.appCache.busy=false;
	      break;
	  }
    emy.plugin.appCache.updatePrompt(msg, e.type);
	},

	updatePrompt : function(msg, eventType) {
    if(msg!='') {
      emy.$('#cachePrompt').innerHTML ='<p>'+msg+'</p>';
      emy.$('#cachePrompt').style.display='block';
    }
    if(eventType=='error' || eventType=='cached'  || eventType=='noupdate')
      setTimeout(function() { emy.$('#cachePrompt').style.display='none'; }, 1000);

	}

};
})();
