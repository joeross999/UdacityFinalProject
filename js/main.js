var map, model, infowindow, placesService;
var markers = [];
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
    });
    
    /**********************************
     * Locations request
     **********************************/
    var request = {
        query: 'National parks in new zealand'
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
        setModel(markers, results);
        console.log(results);
        console.log(markers);
    }
    infowindow = new google.maps.InfoWindow();
}

/*************************************************
 * Knockout model
 ************************************************/

var m = function(markers){
    this.markers = ko.observableArray(markers);
    // this.info = ko.observableArray(results);
    
    this.selectMarker = function(marker){
        this.selectedMarker = marker;
        populateInfoWindow(marker, infowindow);
        console.log(model);
    }
    this.selectedMarker = null;
};
function setModel(markers, results) {
    markers.forEach(function(elem, i){
        elem.data = results[i];
    });
    model = new m(markers);
    ko.applyBindings(model);

    console.log(model);
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
        // infowindow.open(map, this);'
        model.selectMarker(this);
        // populateInfoWindow(marker, infowindow);
        console.log("addListener");
        console.log(this);
    });
    return marker;
}

function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        console.log("populateInfoWindow")
        details = getLocationDetails(marker, function(details, status, weather){
            console.log('getLocationDetails');
            console.log(details);
            console.log(weather);
            if (status === google.maps.places.PlacesServiceStatus.OK){
            infowindow.setContent(parkHTML(details, weather));
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

function parkHTML(details, weather) {
    var html = '<div><h2>' + details.name + '</h2><div style="width: 50%; float: left"><p>' + details.formatted_address + '<br>Rating: ' + details.rating + '<br><a href="' + details.url + '">View Park</a></p></div><div style="width: 50%; float: left;"><h3>Weather</h3><p>' + weather.current.condition.text + '</p><img style="width: 100%"src="' + weather.current.condition.icon + '"></div></div>'
    console.log('html');
    console.log(html);
    return html;
}

function getLocationDetails(marker, callback){
    placesService.getDetails({
        placeId: marker.id
      }, function(place, status) {
        getWeatherForLocation(place, status, callback);        
            // callback(place, status);
      });
}

function getWeatherForLocation(location, status, callback) {
    console.log('getWeatherForLocation');
    var lng = location.geometry.location.lng();
    var lat = location.geometry.location.lat();
    console.log(lat);
    console.log(lng);
    // var url = encodeURIComponent("http://api.geonames.org/findNearByWeatherJSON?lat=" + lat + "&lng= " + lng + "&username=joeross999");
    var url = "http://api.apixu.com/v1/current.json?q=" + lat + ',' + lng + "&key=d2ac4ed7b70f4eeaa2b04829171711";
    $.getJSON(url, function( weather ) {
        callback(location, status, weather);
        console.log("test")
    });

}

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
