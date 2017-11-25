var map, model, infowindow, placesService;
var markers = [];
var highlightedIcon, defaultIcon;
function initMap() {
    /***************
     * Setup Map
     ***************/
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -41.7647719, lng: 172.7009717},
        zoom: 6,
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
    placesService.textSearch(request, callback);
    
    function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                markers.push(createMarker(results[i]));
            }
        }
        setModel(markers, results);
    }
    infowindow = new google.maps.InfoWindow();
    highlightedIcon = makeMarkerIcon('FFFF24');
    defaultIcon = makeMarkerIcon('0091ff');
}

/*************************************************
 * Knockout model
 ************************************************/

var m = function(data){
    context = this;
    this.markers = ko.observableArray(data);
    this.initialMarkers = data.slice();
    
    this.selectMarker = function(marker){
        if(this.selectedMarker){this.selectedMarker.setIcon(defaultIcon);}
        this.selectedMarker = marker;
        populateInfoWindow(marker, infowindow);
    };

    this.selectedMarker = null;

    // Search through markers and display the correct items to the map and menu list
    this.search = function(){
        hideListings();
        this.markers.removeAll();
        this.initialMarkers.forEach(function(marker){
            if(marker.data.name.toLowerCase().includes(context.searchValue.toLowerCase())){
                context.markers.push(marker);
            }
        });
        
        this.markers().forEach(function(elem){
            elem.setMap(map);
        });
    };

    this.searchValue = '';

    this.toggleMenu = function(){
        if(this.showMenu() == 'hide menu-container container'){
            this.showMenu('show menu-container container');
        } else {
            this.showMenu('hide menu-container container');
        }
    };
    
    this.showMenu = ko.observable('hide menu-container container');

};
function setModel(markers, results) {
    markers.forEach(function(elem, i){
        elem.data = results[i];
    });
    model = new m(markers);
    ko.applyBindings(model);

}


/*************************************************
 * Info window and marker functions
 ************************************************/

function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        id: place.place_id,
        icon: defaultIcon
    });
    google.maps.event.addListener(marker, 'click', function() {
        model.selectMarker(this);
    });
    return marker;
}

function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker && marker!==null) {
        infowindow.marker = marker;
        details = getLocationDetails(marker, function(details, status, weather){
            if (status === google.maps.places.PlacesServiceStatus.OK){
                infowindow.setContent(parkHTML(details, weather));
            }else{
            }
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                model.selectMarker(null);
            });
        });
        marker.setIcon(highlightedIcon);
    }
}

// This is the html behind the infowindow
function parkHTML(details, weather) {
    var html = '<div><h2 class="park-name">' + details.name + '<img style="width: 50px;"src="http:' + weather.current.condition.icon + '"></h2><div style="width: 45%; float: left; margin-right: 5%;"><p>' + details.formatted_address + '<br>Rating: ' + details.rating + '<br><a href="' + details.url + '">View Park</a></p></div><div style="width: 45%; float: left;"><h3>Weather</h3><p>' + weather.current.condition.text + '</p></div></div>';
    return html;
}

// Google maps places details api call
function getLocationDetails(marker, callback){
    placesService.getDetails({
        placeId: marker.id
    }, function(place, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
            error();
        }
        getWeatherForLocation(place, status, callback);        
    });
}

// Gets the current weather for specified location
function getWeatherForLocation(location, status, callback) {
    var lng = location.geometry.location.lng();
    var lat = location.geometry.location.lat();
    var url = "http://api.apixu.com/v1/current.json?q=" + lat + ',' + lng + "&key=d2ac4ed7b70f4eeaa2b04829171711";
    $.getJSON(url, function( weather ) {
        callback(location, status, weather);
    }).fail(function(){
        error();
    });

}

// Show or hide markers from the map
function showListings() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function hideListings() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21,34));
    return markerImage;
  }

  /*************************************************
 * Error Handling
 ************************************************/
function error(){
    alert("We seem to have encountered a problem with one of our resources.  Please try again later.")
}
