/*
   Copyright (c) 2012-13, Emy Project Members.
   See LICENSE.txt for licensing terms.
   Version 1.1
 */

(function() {

	var slideSpeed = 10; // milliseconds between each JS sliding step - only if CSS transition is not supported
	var slideStep = 5; // percent of each JS sliding step - only if CSS transition is not supported
	var ajaxTimeoutVal = 30000;
	var prefix = null;

	var originalView = null;
	var currentView = null;
	var currentDialog = null;
	var currentWidth = 0;
	var currentHeight = 0;
	var currentHash = location.hash;
	var hashPrefix = "#_";
	var navStackStartIndex = 0; // Browser navigation stack index onload
	var navStack = []; // Navigation stack
	var checkTimer;
	var screenHeight = 0;

	// *************************************************************************************************

	/*
	events:
	emy fires a number of custom events on your panel and dialog elements. Handling
	these events is the recommended way to do any just-in-time transformations or
	loading (besides the ajax pre-loading built into emy).
	*/

	window.emy = {
	/*
	version
	useful for plugins, support & debug
	*/
	v : 1.0,
    /*
	used in emy.log()
	initialized at: onload.
	This is set to `true`, console.log is enabled
	*/
	logging: false,

	/*
	emy.busy
	initialized at: onload.
	This is set to `true` if a slide animation is in progress.
	*/
	busy: false,

	/*
	emy.transitionMode
	initialized at: onload.
	Determines which transition mode to use between two screens.
	Value can be 'css', 'js' or 'none' - if 'css', a test is done onLoad to determine is 'css' transition is supported. If not, value is changed to 'js'.
	*/
	transitionMode: 'css',

	/*
	emy.httpHeaders
	initialized at: onload.
	An object defining headers to be sent with Ajax requests.
	*/
	httpHeaders: {
		"X-Requested-With": "XMLHttpRequest"
	},

	/*
	emy.prefixedProperty
	initialized at: onload.
	Vendor prefixed CSS3 events methods for transform, transition and transitionEnd
	NOTE: This might be removed when more than 90% of daily-used browsers support non-prefixed events
	*/
	prefixedProperty: [],

		/*
	emy.prefixedProperty
	initialized at: onload.
	An array where all plugins should be
	*/
	plugin: [],

	/*
	emy.ready
	initialized at: onload.
	Determines if Emy has been initialized yet (if the init() function has been already loaded)
	*/
	ready : false,

    /* version
	useful for plugins, support & debug
	*/
	v : function() {
        return 1.1;
    },
	/*
	emy.init
	Loads private function init(), automatically loaded by onload event, but you can manually load it
	This change is really helpful when using Emy inside for a PhoneGap/Cordova app with deviceready event for ex
	*/
	 init : function() {
		init();
	 },
	/*
	emy.showView(view[, backwards=false])
	`showView()` should probably be an internal function, outside callers should
	call `showViewById()` instead. `showView()` does NOT set the busy flag because
	it is already set by the public-facing functions.

	`view` is the html element to show. If `backwards` is set to `true`, it will
	display a right-to-left animation instead of the default left-to-right.

	If the currently-displayed view is passed, emy will do nothing. `showView()`
	is used for both panel-type views and dialog-type views (dialogs float on top
	of the panels, have a cancel button and do not participate in sliding
	animations). Panel-type views receive blur/focus events and load/unload events,
	but dialog-type views only receive blur/focus events.
	*/
		showView: function(view, backwards) {
			if (view) {
				if (view == currentView) {
					emy.busy = false; //  Don't do anything, just clear the busy flag and exit
					return;
				}

				if (currentDialog) {
					currentDialog.removeAttribute("selected");
					emy.sendEvent("emy-blur", currentDialog); // EVENT: BLUR
					currentDialog = null;
				}

				/*
			events:
			Dialogs receive a `focus` event when they are shown and a `blur` event
			when hidden. Currently they don't receive any `load` or `unload` events.
			*/
				if (emy.hasClass(view, "dialog")) {
					emy.sendEvent("emy-focus", view); // EVENT: FOCUS
					showDialog(view);
				}
				/*
			events:
			Panels receive `focus` and `blur` events and also receive a `load` event
			and (only when going backwards away from a panel) an `unload` event.
			*/
				else {
					//			  emy.$('header.toolbar').style.display='';
					emy.sendEvent("emy-load", view); // EVENT: LOAD
					var fromView = currentView;
					emy.sendEvent("emy-blur", currentView); // EVENT: BLUR
					currentView = view;
					emy.sendEvent("emy-focus", view); // EVENT: FOCUS

					if (fromView) {
						setTimeout(slideViews, 0, fromView, view, backwards);
					} else {
						updateView(view, fromView);
					}
				}
			}
		},


        gotoView: function(view, replace) {
			var node, nodeId;

			if (view instanceof HTMLElement) {
				node = view;
				nodeId = node.id;
			} else {
				nodeId = view;
				node = emy.$('#'+nodeId);
			}

			if (!node) emy.log("gotoView: node is null");

			if (!emy.busy) {
				emy.busy = true;
				var index = navStack.indexOf(nodeId);
				var backwards = index != -1;
				if (backwards) {
					// we're going back, remove history from index on
					// remember - viewId will be added again in updateView
					navStack.splice(index);
				} else if (replace) navStack.pop();

				emy.showView(node, backwards);
				return false;
			} else {
				return true;
			}
		},


		/*
	emy.showViewById(viewId)
	Looks up the view element by the id and checks the internal history to
	determine if the view is on the stack -- if so, it will call `showView()` with
	`backwards` set to `true`, reversing the direction of the animation.
	*/
		showViewById: function(viewId) {
			emy.gotoView(viewId, false);
		},

		/*
	emy.goBack()
	Navigates to the previous view in the history stack.
	*/
		goBack: function(viewId) {
			if (viewId) {
				var a = navStack.length - (navStack.indexOf(viewId) + 1);
				navStack = navStack.slice(0, (navStack.length - a));
				if(window.history.length > navStackStartIndex)
					window.history.go(-a);
				else
			} else {
				if(window.history.length - (navStackStartIndex-1) == 1) {
					// history.length can't be equal to 1 when you ask to go back so it means 
					// the cache manifest is goofing browser's history stack. In this case, we use
					// showView to navigate between views
					// navStackStartIndex is important here since window.history can be more than 1
					// if user comes from another page
                    var view = navStack.pop();

                    if(emy.$('#'+view) == currentView)
                        emy.showView(emy.$('#'+navStack.pop()), true);
                    else
                        emy.showView(emy.$('#'+view), true);

				} else {
					navStack.pop();
					window.history.go(-1);
				}
			}
			return navStack;
		},

		/*
	method: emy.showViewByHref(href, args, method, replace, cb)
	Outside callers should use this version to do an ajax load programmatically
	from your webapp.

	`href` is a URL string, `method` is the HTTP method (defaults to `GET`),
	`args` is an Object of key-value pairs that are used to generate the querystring,
	`replace` is an existing element that either is the panel or is a child of the
	panel that the incoming HTML will replace (if not supplied, emy will append
	the incoming HTML to the `body`), and `cb` is a user-supplied callback function.
	*/
		showViewByHref: function(url, args, method, replace, callback , errorCallback) {

            function successCb(ajaxResult) {
                var frag = document.createElement("div");
                frag.innerHTML = ajaxResult;
                // EVENT beforeInsert->body
                if (replace) {
                    replaceElementWithFrag(replace, frag);
                    emy.busy = false;
                } else {
                    emy.insertViews(frag);
                }

                if (callback) {
                    emy.log('showViewByHref error callback');
                    setTimeout(callback, 1000, true);
                }   
			}

            function errorCb() {
                emy.log('showViewByHref error callback');
                emy.busy = false;
                errorCallback();
            }

            if (!emy.busy) {
				emy.busy = true;
				emy.ajax(url, args, method, successCb, errorCb);
			} else {
				callback(); // We didn't get the "lock", we may need to unselect something
			}
		},

		/*
	method: emy.ajax(url, parameters, method, callback, errorCallback)
	Handles ajax requests and also fires a `setTimeout()` call
	to abort the request if it takes longer than 30 seconds. See `showViewByHref()`
	above for a description of the various arguments (`url` is the same as `href`).
	*/
		ajax: function(url, args, method, callback, errorCallback) {

            var xhr = new XMLHttpRequest();
            if(!xhr)
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            if(!xhr)
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            
			method = method ? method.toUpperCase() : "GET";
			if (args && method == "GET") {
				url = url + "?" + ajaxParam(args);
			}
			xhr.open(method, url, true);
            if (callback) {
                // only if a callback function is set
                xhr.onreadystatechange = function() {
                    if(xhr.readyState==4 && !xhr.aborted)
                    {
                        // once call is done
                        if(xhr.status==200 && xhr.responseText) {
                            // if call status is ok
                            xhr.aborted = true;
                            callback(xhr.responseText);
                        } else if(xhr.status==0) {
                            // if ajax call failed
                            ajaxTimeout();
                        }
                    }
                };
			}
			var data = null;
			if (args && method != "GET") {
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				data = ajaxParam(args);
			}
			for (var header in emy.httpHeaders) {
				xhr.setRequestHeader(header, emy.httpHeaders[header]);
			}
			xhr.send(data);
            // make the ajax call act as a failure is call is too long
            // too long = 30sec by default
            // but this can be change in global variables on top of the file
			xhr.requestTimer = setTimeout(ajaxTimeout, ajaxTimeoutVal);
			return xhr;

			function ajaxTimeout() {
                xhr.aborted = true;
                if(errorCallback)
                    errorCallback(xhr);
            }
		},

		/*
	method: emy.insertViews(frag)
	If an AJAX call (`showViewByHref()`) is made without supplying a `replace`
	element, `insertViews()` is called to insert the newly-created element
	fragment into the view DOM. Each child-node of the HTML fragment is a panel
	and if any of them are already in the DOM, they will be replaced by the
	incoming elements.
	go parameter can be set to false if you don't want Emy to navigate to this newly inserted screen
	*/
		insertViews: function(frag, go) {

			var newfrag;
			if(typeof frag==='string') {
				// if the frag parameter is a HTML string
				// it is added to a DIV element to loop on childNodes
				newfrag = document.createElement('div');
				newfrag.innerHTML = frag;
			} else if(frag.nodeName.toLowerCase()=='section' && frag.getAttribute('data-title')) {
				// if the frag parameter is a section view element
				// it is added to a DIV element for code consistency
				newfrag = document.createElement('div');
				newfrag.appendChild(frag);
			} else
				newfrag = frag;

			var nodes = newfrag.childNodes, targetView;
			// set go to false if you dont want to navigate to the inserted view
			go = (go==false)?false:true;

			emy.sendEvent("emy-beforeinsert", document.body, {
				fragment: newfrag
			});

			for (var i = 0, inb = nodes.length; i < inb; i++) {
				var child = nodes[i];
				if (child && child.nodeName.toLowerCase()=='section') {
					if (!child.id) child.id = "__" + (new Date().getTime()) + "__";

					var clone = emy.$('#' + child.id);
					var docNode;
					if (clone) {
						clone.parentNode.replaceChild(child, clone);
						docNode = emy.$(child.id);
					} else
						docNode = document.body.appendChild(child);

					emy.sendEvent("emy-afterinsert", document.body, {
						insertedNode: docNode
					});
					fitHeight();

					// First child becomes selected view/view by default unless
					// selected="true" is set
					// BUG: selected="true" results in a visually incorrect transition
					if (child.getAttribute("selected") == "true" || !targetView) targetView = child;
					--i;
				}
			}

			emy.sendEvent("emy-afterinsertend", document.body, {
				fragment: newfrag
			})

			if (targetView && go) {
				setTimeout(function() { emy.showView(targetView); }, 1);
			}
		},

		/*
	method: emy.getSelectedView()
	Returns the panel element that is currently being viewed. Each panel must be a
	direct child of the `body` element. A panel is set as the selected panel by
	setting the `selected` attribute to `true`.
	*/

		getSelectedView: function() {
			for (var child = document.body.firstChild; child; child = child.nextSibling) {
				if (child.nodeType == 1 && child.getAttribute("selected") == "true") return child;
			}
		},

		/*
	emy.getAllViews()
	Returns all views, aka direct body childnodes with both `id` and `data-title` attributes
	*/
		getAllViews: function() {
			var views=[];
			for (var child = document.body.firstChild; child; child = child.nextSibling) {
				if (child.nodeType == 1 && child.getAttribute("data-title"))
					views.push(child);
			}
			return (views.length>0)?views:false;
		},

		/*
	emy.isNativeUrl(href)
	Determines whether the supplied URL string launches a native app (maps, YouTube, phone, email, etc). 
    If so, emy does not attempt to load or slide to a view and do let the phone handling the click natively.
	*/
		isNativeUrl: function(url) {
			var urlPatterns = [
                new RegExp("^javascript:"),
                new RegExp("^mailto:"),
                new RegExp("^tel:"),
                new RegExp("^sms:"),
                new RegExp("^callto:"),
                new RegExp("^skype:"),
                new RegExp("^video:"),
                new RegExp("^music:"),
                new RegExp("^maps:"),
                new RegExp("^feed:"),
                new RegExp("^(http|https):\/\/itunes.apple.com\/"),
                new RegExp("^(http|https):\/\/youtube.com\/watch\\?v="),
                new RegExp("^(http|https):\/\/youtube.com\/v\/"),
                new RegExp("^http:\/\/youtu.be\/"),
                new RegExp("^(http|https):\/\/maps.google.com\/?"),
                new RegExp("^(http|https):\/\/www.google.com\/maps\/?"),
                new RegExp("^(http|https):\/\/facebook.com\/"),
                new RegExp("^(http|https):\/\/twitter.com\/")
            ];
			var out = false;
			for (var i = 0; i < urlPatterns.length; i++) {
				if (url.match(urlPatterns[i])) out = true;
			}
			return out;
		},

		/*
	emy.hasClass(el, name)
	Returns true/false if the given element `el` has the class `name`.
	*/
		hasClass: function(el, name) {
			return ((el.className).indexOf(name) > -1)?true:false;
		},

		/*
	emy.addClass(el, name)
	Add the given class `name` to element `el`
	*/
		addClass: function(el, name) {
			if (!emy.hasClass(el, name))
				el.className += " "+name;
		},

		/*
	emy.changeClass(el, name)
	change the given class `name` to `newname` to element `el`
	*/
		changeClass: function(el, name, newname) {
			if (emy.hasClass(el, name)) el.className = el.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'), ' '+newname+' ');
		},

		/*
	Basic selector : if you need a complete Jquery-style, you might consider Zepto.js
	Use emy.$('#myElement') to select an element with id attribute equals to myElement
	Use emy.$('.myClass') to select all elements having myClass in their class value
	Use emy.$('a') to select all a elements (links)
	Use emy.$('a.myClass') to select all a elements having myClass in their class value (links)
	*/
		$: function(a) {
			if(document.querySelectorAll) {
				var res = document.querySelectorAll(a);
				return (res.length==0)?null:((res.length==1 && '#'+res[0].id==a)?res[0]:res);
			} else {
				// this should soon be removed, since all modern browsers supports querySelectorAll now
				if (a.substr(0, 1) == '#') return (document.getElementById(a.substr(1))) ? document.getElementById(a.substr(1)) : null;
				else if (a.substr(0, 1) == '.') return (document.getElementsByClassName(a.substr(1))) ? document.getElementsByClassName(a.substr(1)) : null;
				else if (a.indexOf('.') > -1) {
					var c = document.getElementsByTagName(a.split('.')[0]),
						d = a.split('.')[1];
					for (var i = 0, inb = c.length; i < inb; i++) {
						if (c[i].className.indexOf(d) > -1) {
							return c[i];
							exit;
						}
					}
				} else if (a) return (document.getElementsByTagName(a)) ? document.getElementsByTagName(a) : null;
			}
		},

		/*
		Performs a console.log if browser supports it
		Keep logging to false by default, console.log can create huge performance issues, specially in Cordova
		*/
		log: function() {
			if ((window.console != undefined) && emy.logging==true) console.log.apply(console, arguments);
		},

		findParent : function(node, localName) {
			while (node && (node.nodeType != 1 || node.localName.toLowerCase() != localName))
			node = node.parentNode;
			return node;
		},

		sendEvent : function(type, node, props) {
			if (node) {
				var event = document.createEvent("UIEvent");
				event.initEvent(type, false, false); // no bubble, no cancel
				if (props) {
					for (i in props) {
						event[i] = props[i];
					}
				}
				node.dispatchEvent(event);
			}
			emy.log('event sent: ' + type);
		}
	};

	// *************************************************************************************************

/*
load: On Load event
*/
	addEventListener("load", init, false);

/*
init: On Load
On load, emy will determine which view to display primarily based on
the anchor part of the URL (everything after `#_`) and secondarily based on the
top-level (child of the `body`) element with the `selected` attribute set to
`true`. If these both exist, emy.showView() will be called twice, but the
anchor-based load will win because it is done second.
*/

	function init()
	{
		if(!emy.ready)
		{
			emy.changeClass(emy.$('html')[0],'no-js','js');
		
			emy.ready=true;
			var a = document.createElement('div').style;
			prefix = (a.WebkitTransform == '') ? 'webkit' : (a.MozTransform == '') ? 'moz' : (a.msTransform == '') ? 'ms' : (a.transform == '') ? 'none' : null;
			if (emy.transitionMode == 'css') emy.transitionMode = (prefix) ? 'css' : 'js';
			if (prefix == 'webkit') {
				emy.prefixedProperty['transform'] = 'webkitTransform';
				emy.prefixedProperty['transformDuration'] = 'webkitTransformDuration';
				emy.prefixedProperty['transitionEnd'] = 'webkitTransitionEnd';
				emy.prefixedProperty['animationStart'] = 'webkitAnimationStart';
				emy.prefixedProperty['animationDuration'] = 'webkitAnimationDuration';
				emy.prefixedProperty['animationEnd'] = 'webkitAnimationEnd';
			} else if (prefix == 'moz') {
				emy.prefixedProperty['transform'] = 'MozTransform';
				emy.prefixedProperty['transformDuration'] = 'MozTransformDuration';
				emy.prefixedProperty['transitionEnd'] = 'transitionend';
				emy.prefixedProperty['animationStart'] = 'animationstart';
				emy.prefixedProperty['animationDuration'] = 'animationduration';
				emy.prefixedProperty['animationEnd'] = 'animationend';
			} else if (prefix == 'ms') {
				emy.prefixedProperty['transform'] = 'msTransform';
				emy.prefixedProperty['transformDuration'] = 'msTransformDuration';
				emy.prefixedProperty['transitionEnd'] = 'transitionend';
				emy.prefixedProperty['animationStart'] = 'MSAnimationStart';
				emy.prefixedProperty['animationDuration'] = 'MSAnimationDuration';
				emy.prefixedProperty['animationEnd'] = 'MSAnimationEnd';
			} else if (prefix == 'none') {
				emy.prefixedProperty['transform'] = 'msTransform';
				emy.prefixedProperty['transformDuration'] = 'msTransformDuration';
				emy.prefixedProperty['transitionEnd'] = 'transitionend';
				emy.prefixedProperty['animationStart'] = 'MSAnimationStart';
				emy.prefixedProperty['animationDuration'] = 'MSAnimationDuration';
				emy.prefixedProperty['animationEnd'] = 'MSAnimationEnd';
			}
			
			navStackStartIndex = history.length;

			var defaultView = emy.getSelectedView();

			// get requested view ID as a hash value in the URL
			var locViewId = location.hash.substr(hashPrefix.length);
			var locView = (locViewId)?emy.$('#' + locViewId):null;

			if (defaultView) {
				// get the default view node, aka got a "selected" attribute
				emy.originalView = defaultView;
				emy.showView(defaultView);
			} else {
				// no default view set, so we take the first view
				var views = emy.getAllViews();
				emy.originalView = (views.length>0)?views[0]:false;
			}

			// navigate to the requested view if different than the default one
			if (locView && (locView != defaultView))
				emy.showView(locView);

			//set resize handler onorientationchange if available, otherwise use onresize
			if (typeof window.onorientationchange == "object") window.onorientationchange = resizeHandler;
			else window.onresize = resizeHandler;

			// use modern onhashchange listener for navigation, fallback to listener if not supported
			if ("onhashchange" in window) window.onhashchange = checkLocation;
			else checkTimer = setInterval(checkLocation, 300);

			setTimeout(function() {
				preloadImages();
				checkLocation();
				fitHeight();
				emy.sendEvent('emy-ready', document);
			}, 1);
		}
	}

	/*
	click: Link Click Handling
	emy captures all clicks on `a` elements and goes through a series of checks to
	determine what to do:

	1. If the link has a `href="#..."`, emy will navigate to the panel ID specified
	   after the # (no underscore).
	2. If the link's ID is `backButton`, emy will navigate to the previous screen
	   (see `emy.goBack()`).
	3. If the link has a `type="submit"`, emy will find the parent `form` element,
	   gather up all the input values and submit the form via AJAX (see
	   `emy.showViewByHref()`).
	4. If the link has a `type="cancel"`, emy will cancel the parent `form` element
	   dialog.
	5. If the link has a `target="_replace"`, emy will do an AJAX call based on the
	   href of the link and replace the panel that the link is in with the contents
	   of the AJAX response.
	6. If the link is a native URL (see `emy.isNativeURL()`), emy will do nothing.
	7. If the link has a `target="_webapp"`, emy will perform a normal link,
	   navigating completely away from the emy app and pointing the browser to the
	   linked-to webapp instead.
	8. If there is no `target` attribute, emy will perform a normal (non-replace)
	   AJAX slide (see `emy.showViewByHref()`).
	*/
	addEventListener("click", function(event) { /* an iOS6 bug stops the timer when a new tab fires an alert - this fixes the issue */
		if (!emy.busy && !("onhashchange" in window)) checkTimer = setInterval(checkLocation, 300);

		var link = emy.findParent(event.target, "a");
		if (link) {
			function unselect() {
				link.removeAttribute("selected");
			}
			if (link.href && link.hash && link.hash != "#" && !link.target) {
				followAnchor(link);
			} else if (link == emy.$("#backButton")) {
				link.setAttribute("selected", "true");
				setTimeout(function() {
					unselect();
				}, 300);
				emy.goBack();
			} else if (link.target == "_replace") {
				followAjax(link, link);
			} else if (emy.isNativeUrl(link.href)) {
				return;
			} else if (link.target == "_webapp") {
				location.href = link.href;
			} else if (!link.target && link.getAttribute('href')) {
				followAjax(link, null);
			} else if (link.getAttribute('href') == '') {

			} else if (link.href == '' || !link.href) {
				return;
			} else {
				return;
			}
			event.preventDefault();
		}

		var button = emy.findParent(event.srcElement, "button");
		if (button && button.getAttribute("type") == "cancel") {
			var view = emy.findParent(event.srcElement, "section");
			if(emy.hasClass(view,'dialog'))
				cancelDialog(view);
		} else if(button && button.getAttribute("type") != "submit") {
			event.preventDefault();
		}
	}, true);

	/*
submit: Form submit handling
All forms without target="_self" will use emy's Ajax from submission.
*/
	addEventListener("submit", function(event) {
		var form = event.target;
		if (form.target != "_self") {
			event.preventDefault();
			submitForm(form);
		}
	}, true);

	function followAnchor(link) {
		link.setAttribute("selected", "true");
		var busy = emy.gotoView(link.hash.substr(1), false);
		// clear selected immmediately if busy, else wait for transition to finish
		setTimeout(function() {
			link.removeAttribute("selected");
		}, busy ? 0 : 500);
	}

	function followAjax(link, replaceLink) {
		link.setAttribute("selected", "progress");
		emy.showViewByHref(link.href, null, "GET", replaceLink, function() {
			link.removeAttribute("selected");
		}, function error() {
            link.removeAttribute("selected");
        });
	}

	function resizeHandler() {
		fitHeight();
	}

	function checkLocation() {
		if (location.hash != currentHash) {
			var viewId = location.hash.substr(hashPrefix.length);
			if ((viewId == "") && originalView) // Workaround for WebKit Bug #63777
			viewId = originalView.id;
			emy.showViewById(viewId);
		}
	}

	function showDialog(view) {
		scrollTo(0, 1);
		currentDialog = view;
		view.setAttribute("selected", "true");
		if (emy.transitionMode == 'css') setTimeout(function() {
			emy.addClass(view, 'show');
		}, 1); // adding the classname one second later otherwise CSS3 transitions does not apply
		else emy.addClass(view, 'show');
		showForm(view);
		view.onclick = function(e) {
			if (e.srcElement) {
				if (emy.hasClass(e.srcElement, 'dialog')) cancelDialog(e.srcElement);
			}
		};
	}

	function cancelDialog(form) {
		if (emy.transitionMode == 'css') {
			setTimeout(function() {
				emy.changeClass(form, 'show', '');
			}, 1);
			form.addEventListener(emy.prefixedProperty['transitionEnd'], hideForm, false);
		} else {
			emy.changeClass(form, 'show', '');
			hideForm(form);
		}
	}

	function showForm(form) { /* Noop click-handler on the view works around problem where our main click handler doesn't get called in Mobile Safari */
		form.addEventListener("click", function(event) {}, true);
		emy.busy = false;
	}

	function hideForm(form) {
		if (undefined == form.srcElement) {
			form.removeAttribute("selected");
		}
		else {
			var toolbarElement = emy.$('#'+form.srcElement.id+' .toolbar')[0];
			toolbarElement.style.display = '';
			form.srcElement.removeAttribute("selected");
			form.srcElement.removeEventListener(emy.prefixedProperty['transitionEnd'], hideForm, false);
		}
	}

	function updateView(view, fromView) {
		if (!view.id) view.id = "__" + (new Date().getTime()) + "__";

		currentHash = hashPrefix + view.id;
		if (!fromView) { // If fromView is null, this is the initial load and we want to replace a hash of "" with "#_home" or whatever the initial view id is.
			//		location.replace(location.protocol + "//" + location.hostname + location.port + location.pathname + newHash + location.search);
			location.replace(currentHash);
		} else { // Otherwise, we want to generate a new history entry
			//		location.hash = currentHash;
			location.assign(currentHash);
		}

		navStack.push(view.id);

		var viewTitle = emy.$('#viewTitle');
		if (view.getAttribute('data-title')) {
			viewTitle.innerHTML = view.getAttribute('data-title');
		}

		if (view.localName.toLowerCase() == "form") showForm(view);

		var backButton = emy.$("#backButton");
		if (backButton) {
			var prevView = emy.$('#' + navStack[navStack.length - 2]);
			if (prevView && !view.getAttribute("data-hidebackbutton")) {
				backButton.style.display = "block";
				backButton.innerHTML = (prevView.getAttribute('data-title')) ? prevView.getAttribute('data-title') : "Back";
				//			var bbClass = prevView.getAttribute("bbclass");
				//			backButton.className = (bbClass) ? 'button ' + bbClass : 'button';
			} else backButton.style.display = "none";
		}
		emy.busy = false;
	}


	function canDoSlideAnim() {
		return (emy.transitionMode != 'none') && (emy.prefixedProperty != null);
	}
	/*
events:
Both panels involved in a slide animation receive `beforetransition` and
`aftertransition` events. The panel being navigated from receives event
parameters `{ out :true }`, the panel being navigated to receives `{ out: false }`.
*/
	function slideViews(fromView, toView, backwards) {
		scrollTo(0, 1);
		clearInterval(checkTimer);

		emy.sendEvent("emy-beforetransition", fromView, {
			out: true
		});
		emy.sendEvent("emy-beforetransition", toView, {
			out: false
		});

		if (emy.transitionMode == 'css') slideCSS(fromView, toView, backwards, slideDone);
		else if (emy.transitionMode == 'js') slideJS(fromView, toView, backwards, slideDone);
		else noSlide(fromView, toView, slideDone);

		function slideDone() {
			if (!emy.hasClass(toView, "dialog")) {
				fromView.removeAttribute("selected");
				fromView.removeAttribute('emy-transition');
				toView.removeAttribute('emy-transition');
			}

			if (!("onhashchange" in window)) checkTimer = setInterval(checkLocation, 300);

			setTimeout(updateView, 0, toView, fromView);
			fromView.removeEventListener(emy.prefixedProperty['animationEnd'], slideDone, false);

			if (fromView.getAttribute('data-onexit')) eval(fromView.getAttribute('data-onexit'));
			if (toView.getAttribute('data-onshow')) eval(toView.getAttribute('data-onshow'));

			emy.sendEvent("emy-aftertransition", fromView, {
				out: true
			});
			emy.sendEvent("emy-aftertransition", toView, {
				out: false
			});

			if (backwards) emy.sendEvent("emy-unload", fromView); // EVENT: UNLOAD
		}
	}

	function slideJS(fromView, toView, backwards, cb) {
		toView.style.left = "100%";
		scrollTo(0, 1);
		toView.setAttribute("selected", "true");
		var percent = 100;

		function slide() {
			percent -= slideStep;
			fromView.style.left = (backwards ? (100 - percent) : (percent - 100)) + "%";
			toView.style.left = (backwards ? -percent : percent) + "%";
			if (percent <= 0) {
				clearInterval(slideInterval);
				percent = 0;
				cb();
			}
		}
		var slideInterval = setInterval(slide, slideSpeed);
		slide();
	}

	function slideCSS(fromView, toView, backwards, cb) {
		toView.style.visibility = 'hidden';
		if (!backwards) var transName = (toView.getAttribute('custom-transition')) ? toView.getAttribute('custom-transition') : 'slide';
		else var transName = (fromView.getAttribute('custom-transition')) ? fromView.getAttribute('custom-transition') : 'slide';

		var fromViewTransition = backwards ? (transName + 'backout') : (transName + 'out');
		var toViewTransition = backwards ? (transName + 'backin') : (transName + 'in');
		toView.setAttribute("selected", "true");

		function startTrans() {
			fromView.setAttribute('emy-transition', fromViewTransition);
			toView.setAttribute('emy-transition', toViewTransition);
			toView.style.visibility = '';
		}
		fromView.addEventListener(emy.prefixedProperty['animationEnd'], cb, false);
		setTimeout(startTrans, 1);
	}

	function noSlide(fromView, toView, cb) {
		setTimeout(function() {
			fromView.removeAttribute("selected");
			toView.setAttribute("selected", "true");
			cb();
		}, 1);
	}

	function submitForm(form) {
		emy.addClass(form, "progress");
		emy.sendEvent("emy-beforeformsubmit", document.body, {
			form: form
		})
		emy.showViewByHref(form.getAttribute('action'), encodeForm(form), form.hasAttribute('method') ? form.getAttribute('method') : 'GET', null, function() {
			emy.changeClass(form, 'progress', '');
			cancelDialog(form);
			emy.sendEvent("emy-afterformsubmit", document.body, {
				form: form
			})
		});
	}

    /*
	Stripped-down, simplified object-only version of a jQuery function that
	converts an object of keys/values into a URL-encoded querystring.
	*/
	function ajaxParam(o) {
			var s = [];
			// Serialize the key/values
			for (var key in o) {
				var value = o[key];
				if (value != null && typeof(value) == "object" && typeof(value.length) == "number") {
					for (var i = 0; i < value.length; i++) {
						s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value[i]);
					}
				} else s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
			}
			// Return the resulting serialization
			return s.join("&").replace(/%20/g, "+");
    }
    
	function encodeForm(form) {
		function encode(inputs) {
			for (var i = 0; i < inputs.length; ++i) {
				if (inputs[i].name) {
					var input = inputs[i];
					if (input.getAttribute("type") == "checkbox" && !input.checked || input.getAttribute("type") == "radio" && !input.checked || input.disabled) {
						continue;
					}
					if (input.getAttribute("type") == "submit") {
						if (input.getAttribute("submitvalue")) { // Was marked, this is the value to send, but clear it for next time
							input.removeAttribute("submitvalue");
						} else { // not marked, don't send value -- continue
							continue;
						}
					}
					var value = args[input.name];
					if (value === undefined) { // If parm is 'empty' just set it
						args[input.name] = input.value;
					} else if (value instanceof Array) { // If parm is array, add to it
						value.push(input.value);
					} else { // If parm is scalar, change to array and add to it
						args[input.name] = [value, input.value];
					}
				}
			}
		}

		var args = {};
		encode(form.getElementsByTagName("input"));
		encode(form.getElementsByTagName("textarea"));
		encode(form.getElementsByTagName("select"));
		encode(form.getElementsByTagName("button"));
		return args;
	}

	function replaceElementWithFrag(replace, frag) {
		var parent = replace.parentNode;
		var parentTarget = parent.parentNode;
		parentTarget.removeChild(parent);

		emy.sendEvent("beforereplace", document.body, {
			fragment: frag
		});
        
        var docNode;
		while (frag.firstChild) {
			docNode = parentTarget.appendChild(frag.firstChild);
			emy.sendEvent("afterreplace", document.body, {
				insertedNode: docNode
			});
		}
		emy.sendEvent("afterreplaceend", document.body, {
			fragment: frag
		});
	}

	function preloadImages() {
		var preloader = document.createElement("div");
		preloader.id = "preloader";
		document.body.appendChild(preloader);
	}

	function fitHeight(a) {
		// this script could use a cleanup...
		// to avoid innerHeight with scrollTo(0,0) address hide trick, on afterInserted for ex
		window.scrollTo(0, 0);
		if (screenHeight == 0) var wih = screenHeight;
		else var wih = window.innerHeight;

		// we put this in a timeout to be sure the scrollTo(0,0) is done
		setTimeout(function() {
			var heightVal;
			var toolbarHeight = emy.$('.toolbar')[0].clientHeight;
			var sc = emy.$('body')[0].childNodes;
			if (sc) {
				for (var i = 1; i <= (sc.length - 1); i++) {
					if ((sc[i].id != '') && (sc[i].id != undefined) && (typeof sc[i] === 'object') && !emy.hasClass(sc[i], 'toolbar')) {
						heightVal = wih; /* default value */
						if (window.navigator.standalone === false) { // for iphone
							if (navigator.userAgent.toLowerCase().search('ipad') > -1) heightVal = (wih);
							else if (emy.hasClass(sc[i], 'dialog')) heightVal = (wih + 60);
							else if (screenHeight < 2) heightVal = (wih + 60);
						} else {
							if (navigator.userAgent.toLowerCase().search('android') > -1 && screenHeight == 0) heightVal = (wih + 50);
							else if (navigator.userAgent.toLowerCase().search('firefox') > -1) heightVal = (wih - toolbarHeight);
						}
						sc[i].style.minHeight = heightVal + 'px';
					}
				}
			}
			if (screenHeight == 0) {
				screenHeight = 1;
				fitHeight();
			} else if (screenHeight == 1) {
				screenHeight = heightVal;
			}
			setTimeout(function() {
				window.scrollTo(0, 1)
			}, 1);

		}, 1);

	}

})();
