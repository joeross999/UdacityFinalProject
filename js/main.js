var map;
var markers = [];
var infowindow;
var placesService;
function initMap() {
    /***************
     * Setup Map
     ***************/
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -41.7647719, lng: 172.7009717},
        zoom: 7,
        styles: darkGray,
        mapTypeControl: false,
        disableDefaultUI: true,
        // gestureHandling: 'none',
        // zoomControl: false,
        // minZoom: 7,
        // maxZoom: 7
    });
    
    /**********************************
     * Locations request
     **********************************/
    var request = {
        query: 'Nationl parks in new zealand'
    };
    placesService = new google.maps.places.PlacesService(map);
    console.log()
    placesService.textSearch(request, callback);
    
    function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                markers.push(createMarker(results[i]));
            }
        }
    }
    
    infowindow = new google.maps.InfoWindow();
    
    document.getElementById('show-food').addEventListener('click', showListings);
    document.getElementById('show-bakeries').addEventListener('click', hideListings);
}



/*************************************************
 * Info window and marker functions
 ************************************************/

function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        id: place.place_id
    });
    // marker.addEventListener('click', populateInfoWindow);
    google.maps.event.addListener(marker, 'click', function() {
        // infowindow.setContent(place.name);
        // infowindow.open(map, this);
        populateInfoWindow(marker, infowindow);
        console.log("addListener")
    });
    console.log('createMarker')
}

function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        console.log("populateInfoWindow")
        details = getLocationDetails(marker, function(details, status){
            console.log(details);
            if (status === google.maps.places.PlacesServiceStatus.OK){
            infowindow.setContent(parkHTML(details));
            }else{
                console.log('there is a problem');
            }
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        });
    }
}

function parkHTML(details) {
    var html = '<div><h2>' + details.name + '</h2><p>' + details.formatted_address + '<br>Rating: ' + details.rating + '<br><a href="' + details.url + '">View Park</a></p></div>'
    console.log('html');
    console.log(html);
    return html;
}

function getLocationDetails(marker, callback){
    console.log(marker);
    placesService.getDetails({
        placeId: marker.id
      }, function(place, status) {
            callback(place, status);
      });
}

// function getWeatherForLocation(location) {
//     request = 'http://api.geonames.org/postalCodeLookupJSON?postalcode=' + postalcode  + '&country=' + country  + '&callback=getLocation&username=demo';
    
//       // Create a new script object
//       aObj = new JSONscriptRequest(request);
//       // Build the script tag
//       aObj.buildScriptTag();
//       // Execute (add) the script tag
//       aObj.addScriptTag();

// }
// getWeatherForLocation();

function showListings() {
    // var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        // bounds.extend(markers[i].position);
    }
    // map.fitBounds(bounds);
}


function hideListings() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}
