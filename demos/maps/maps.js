window.mapApp = {

	map: null,
	apiService : null,

	init : function()
	{
		// hide & show toolbar buttons
		emy.$('#aboutBtn').style.display='block';
		emy.$('#locateBtn').style.display='none';
	},

	setMapCallBack : function(functionName)
	{
		emy.$('#aboutBtn').style.display='none';
		emy.$('#map').setAttribute('data-onshow', functionName+'()');	// set onshow attribute
	},

	clearMap : function()
	{
		emy.$('#aboutBtn').style.display='block';
		emy.$('#locateBtn').style.display='none';
		mapApp.map = null;
		mapApp.apiService = null;
		emy.$('#map').removeChild(emy.$('#map_canvas'));
		var a = document.createElement('div');
		a.id = 'map_canvas';
		emy.$('#map').appendChild(a);
	},


	loadGoogleMap : function()
	{
	  mapApp.apiService = 'google';
    var mapOptions = {
      zoom: 8,
      center: new google.maps.LatLng(50.635, 3.06),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    mapApp.map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);
	},

	loadGoogleMapWithMarkers : function()
	{
	  mapApp.apiService = 'google';
		var myLatlng=new google.maps.LatLng(50.635, 3.06);
        var mapOptions = {
          zoom: 8,
          center: myLatlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        mapApp.map = new google.maps.Map(document.getElementById('map_canvas'),
            mapOptions);

        mapApp.myPositionMarker = new google.maps.Marker({
            position: myLatlng,
            map: mapApp.map
        });
        google.maps.event.addListener(mapApp.myPositionMarker, 'click', function() {
        	mapApp.showPositionInfos(this.position);
        });
	},

	loadGoogleMapWithGeolocation : function()
	{
	  mapApp.apiService = 'google';
		emy.$('#aboutBtn').style.display='none';
		emy.$('#locateBtn').style.display='block';

		var myLatlng=new google.maps.LatLng(40.635, -73.06);
        var mapOptions = {
          zoom: 3,
          center: myLatlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        mapApp.map = new google.maps.Map(document.getElementById('map_canvas'),
            mapOptions);

        mapApp.getMyPosition();
	},


  // this credential key is linked to http://www.emy-library.org/demos/maps/maps.html url.
  // to get yours, visit bingmapsportal.com/
	loadBingMap : function()
	{
		mapApp.apiService = 'bing';

		var mapOptions = {
			credentials:  		"Al3pZfIdFHKxh2pk5f9EArGtRk8P1SibrVHSnt-qJ8wD1n40Z0kCw677iTKOzup_",
			center:       			new Microsoft.Maps.Location(40.7623, -73.9883),
			mapTypeId:    	Microsoft.Maps.MapTypeId.road,
			zoom:         			11
		}
		mapApp.map = new Microsoft.Maps.Map(emy.$("#map_canvas"), mapOptions);
	},

	loadBingMapWithPin : function()
	{
		mapApp.apiService = 'bing';

    	var mapCenter = new Microsoft.Maps.Location(40.7623, -73.9883);
		var mapOptions = {
			credentials:  	"Al3pZfIdFHKxh2pk5f9EArGtRk8P1SibrVHSnt-qJ8wD1n40Z0kCw677iTKOzup_",
			center:       		mapCenter,
			mapTypeId:   Microsoft.Maps.MapTypeId.aerial,
			zoom:         		11
		}

	  	mapApp.map = new Microsoft.Maps.Map(emy.$("#map_canvas"), mapOptions);

	  	var pin = new Microsoft.Maps.Pushpin(mapCenter, {text: 'Y'});
    	mapApp.map.entities.push(pin);
	},

	loadBinMapWithGeolocation : function()
	{
		mapApp.apiService = 'bing';
		emy.$('#aboutBtn').style.display='none';
		emy.$('#locateBtn').style.display='block';

		var mapOptions = {
			credentials:  		"Al3pZfIdFHKxh2pk5f9EArGtRk8P1SibrVHSnt-qJ8wD1n40Z0kCw677iTKOzup_",
			center:       			new Microsoft.Maps.Location(40.7623, -73.9883),
			mapTypeId:    	Microsoft.Maps.MapTypeId.road,
			zoom:         			11
		}
		mapApp.map = new Microsoft.Maps.Map(emy.$("#map_canvas"), mapOptions);

        mapApp.getMyPosition();
	},

	loadMapBoxMap : function()
	{
		mapApp.apiService = 'mapbox';
		mapApp.map = L.mapbox.map('map_canvas', 'examples.map-uci7ul8p').setView([40, -74.50], 9);
		L.mapbox.markerLayer({
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [3.06,50.635]
			},
			properties: {
			  'marker-color': '#000',
			  'marker-symbol': 'star-stroked',
			  title: 'Example Marker',
			  description: 'This is a single marker.'
			}
		}).addTo(mapApp.map);
	},

	loadModestMap : function()
	{
		mapApp.apiService = 'modestmap';
//		var template = 'http://c.tiles.mapbox.com/v3/examples.map-szwdot65/{Z}/{X}/{Y}.png';
//		var template = 'http://tile.openstreetmap.org/{Z}/{X}/{Y}.png';
//		var template = 'http://otile1.mqcdn.com/tiles/1.0.0/osm/{Z}/{X}/{Y}.jpg';
		var template = 'http://a.tiles.mapbox.com/mapbox/2.0.0/mapbox.world-bright/{Z}/{X}/{Y}.png';
		var provider = new MM.TemplatedLayer(template);
		mapApp.map = new MM.Map('map_canvas', provider);
		mapApp.map.setZoom(5).setCenter({ lat: 50.635, lon: 3.06 });
	},

	loadHereMap : function() {

		mapApp.apiService = 'here';
		nokia.Settings.set( "appId", "wrNCpLsj615P0J1z7U3v");
		nokia.Settings.set( "authenticationToken", "T59PloOHXz7ZEdCHbRHAzg");

		var mapContainer = document.getElementById("map_canvas");
		var center =    new nokia.maps.geo.Coordinate(60.17180, 24.82715);
        mapApp.map = new nokia.maps.map.Display(mapContainer, {
            center : center,
            zoomLevel : 6,
            components : [ new nokia.maps.map.component.ZoomBar(),
                    new nokia.maps.map.component.Behavior(), ]
        });

		var marker = new nokia.maps.map.StandardMarker(center);
		mapApp.map.objects.add(marker);

	},

	loadLeafletJSMap : function() {

		mapApp.apiService = 'leafletjs';
		mapApp.map = L.map('map_canvas').setView([51.505, -0.09], 6);
		L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
			maxZoom: 18,
			zoomAnimation: true,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
		}).addTo(mapApp.map);
		var marker = L.marker([51.5, -0.09]).addTo(mapApp.map);

	},

	getMyPosition : function()
	{
		// test if browser supports HTML5 geolocation
		if(navigator.geolocation)
		{
			// show a prompt box
			mapApp.showLoader('Detect your location...');

			if(mapApp.apiService=='google' || mapApp.apiService=='bing')
			{
				// ask for user's geolocation
				navigator.geolocation.getCurrentPosition(function(position)
				{
					// geolocation found a GPS position
					mapApp.showLoader('Got you!');
					// if loaded map API is Google Map
					if(mapApp.apiService=='google')
					{
						// create a position object based on detected location
						var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
						// center the map to this location
						mapApp.map.panTo(pos);
						// add a marker at this position
						mapApp.myPositionMarker = new google.maps.Marker({
							position: pos,
							map: mapApp.map,
							animation: google.maps.Animation.DROP,
							title: 'This is you'
						});
						// ask for geocoding informations when the marker is clicked
						google.maps.event.addListener(mapApp.myPositionMarker, 'click', function() {
							mapApp.showPositionInfos(this.position);
						});
					}
					// if loaded map API is Bing
					else if(mapApp.apiService=='bing')
					{
						// create a position object based on detected location
						var pinLocation = new Microsoft.Maps.Location(position.coords.latitude, position.coords.longitude);
						// add a marker at this position
						var pin = new Microsoft.Maps.Pushpin(pinLocation, {
							text: 'Y',
							position: pos,
						});
						mapApp.map.entities.push(pin);
						// center the map to this location
						mapApp.map.setView({ center: pinLocation});
					}
					// hide the prompt message after one second
					setTimeout( mapApp.hideLoader, 1000);
				},
				function()
				{
					// if the HTML5 geolocation object can't find user's location
					alert('Position could not be found');
					// hide the prompt message after one second
					setTimeout( mapApp.hideLoader, 1000);
				});

       		}
       		// mapbox uses its own event-based geolocation script so we just use it
       		else if(mapApp.apiService=='mapbox')
        	{
				// show a prompt box
				mapApp.showLoader('Detect your location...');
        		// ask for user's geolocation and listen to custom mapbox events
	        	mapApp.map.locate();
				// mapbox got a geolocation back from API
				mapApp.map.on('locationfound', function(e) {
					// center map to this location
					mapApp.map.fitBounds(e.bounds);
					// create a position object based on detected location
					mapApp.map.markerLayer.setGeoJSON({
						type: "Feature",
						geometry: {
							type: "Point",
							coordinates: [e.latlng.lng, e.latlng.lat]
						},
						properties: {
							'marker-color': '#000',
							'marker-symbol': 'star-stroked'
						}
					});
				});

				// If the user chooses not to allow their location to be shared, display an error message.
				mapApp.map.on('locationerror', function() {
					mapApp.showLoader('Position could not be found');
					setTimeout( mapApp.hideLoader, 1000);
				});

			}

		} else {
			mapApp.showLoader('Your browser does not support geolocation');
			setTimeout( mapApp.hideLoader, 1000);
		}

	},

	showPositionInfos : function(pos)
	{
		mapApp.showLoader('Geocoding your location...');
		if(mapApp.apiService=='google')
		{
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({'latLng': pos}, function(res, status)
			{
				if (status == google.maps.GeocoderStatus.OK)
				{
					mapApp.showLoader('Got it!');
					var a = res[0].address_components, b = '';
					for(i=0;i<a.length;i++) {
						b += '<div class="row"><p><strong>'+a[i].types[0]+'</strong><br />'+a[i].long_name+'</p></div>';
					}
					emy.$('#map_info').innerHTML = "<h2>"+res[0].formatted_address+"</h2><fieldset>"+b+"</fieldset>";
					mapApp.hideLoader();
					setTimeout(function() { emy.gotoView('map_info'); }, 10);
        		}
        		else
        		{
          			mapApp.showLoader("Geocoder failed due to: " + status);
          			setTimeout(mapApp.hideLoader, 1000);
          		}
  			});
		}
	},


	showLoader : function(txt)
	{
		var a = emy.$('#loadingPrompt');
		if(!a)
		{
			var divLoading = document.createElement('div');
			divLoading.id = "loadingPrompt";
			divLoading.innerHTML = '<p>'+txt+'</p>';
			document.body.appendChild(divLoading);
		} else {
			a.innerHTML = '<p>'+txt+'</p>';
			a.style.display = 'block';
		}
	},

	hideLoader : function() {
		var a = emy.$('#loadingPrompt');
		if(a) { a.style.display = 'none'; }
	}
}