var map;
var markers = [];
var infowindow;
function initMap() {
    /***************
     * Setup Map
     ***************/
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -41.7647719, lng: 172.7009717},
        zoom: 7,
        styles: darkGray,
        // mapTypeControl: false,
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
    service = new google.maps.places.PlacesService(map);
    service.textSearch(request, callback);
    
    function callback(results, status) {
        console.log(results);
        console.log(status);
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                markers.push(createMarker(results[i]));
            }
        }
        console.log("callback");
        console.log(markers);
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
        position: place.geometry.location
    });
    
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}

function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
    }
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
