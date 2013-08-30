// Assumes that Google Analytics has been installed in the page in asynchronous mode
// Typically this is done by inserting the recommended script tag and contents at the bottom
// of the head section of the page
// More infos: https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide
//
// This is a port from the original code for iUI
// http://www.iui-js.org

(function() {

  addEventListener("DOMContentLoaded", function(event)
  {
    // IF ANY NEW VIEW IS ADDED TO THE DOM VIA AJAX, THIS REGISTERS THEM
	  document.body.addEventListener('afterinsert', afterInsert, false);

    // GET ALL VIEWS IN THE DOM
    var views = emy.getAllViews();
    if(views) {
      for (var i=0,inb=views.length;i<inb;i++)
      {
        // FOR EACH VIEW, THIS ADDS A "FOCUS" EVENT LISTENER
        registerEvents(views[i]);
      }
    }
  }, false);

function registerEvents(view)
{
  // FOR EACH VIEW, THIS ADDS A "FOCUS" EVENT LISTENER
  view.addEventListener('focus', trackEvent, false);
}

function afterInsert(e)
{
  // IF ANY NEW VIEW IS ADDED TO THE DOM VIA AJAX, THIS REGISTERS THEM
	registerEvents(e.insertedNode);
}

function trackEvent(e)
{
  // URL IS DEFINED AS THE CURRENT DOCUMENT FILENAME + THE ID OF THE CURRENT VIEW
	_gaq.push(['_trackPageview', window.location.pathname+"#" + e.target.id]);
}

})();
