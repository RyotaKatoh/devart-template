
var directionsService = new google.maps.DirectionsService();
var map;
var polylineOptionsActual;
var polylineOptions={};

var route = [];

var marker;
var markerArray = [];
var routes = [];

var directionDisplay;
var directionDisplayArray = [];
var numDirectionDisplay;

// initialize map                           
function initialize() {
	
    /* initialize variables */
    numDirectionDisplay = 0;
    
    /* polyline style */
    polylineOptions.strokeColor="#2e8b57";
    polylineOptions.strokeOpacity=.6;
    polylineOptions.strokeWeight=6;


    /* define Map object */
    var mapCenter = new google.maps.LatLng(35.634593,139.695104);
    var mapOptions = {
        zoom:14,
        center: mapCenter,
        disableDefaultUI: true,
        //draggable: false,
        styles: lopanType,
        disableDoubleClickZoom: true
    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    
    /* map style options */
    var styleOptions = [{
        featureType: 'all',
          
        elementType: 'labels',
          
        stylers: [{ visibility: 'off' }]
    },  
    {
        featureType: 'all',
        
        elementType: 'geometry',
        stylers: [{ hue: '#6d4d38' }, { saturation: '-70' }, { gamma: '0.5' }]
    }];

    var styledMapOptions = { name: '文字なし' }
    var lopanType = new google.maps.StyledMapType(styleOptions, styledMapOptions);
    map.mapTypes.set('noText', lopanType);
    map.setMapTypeId('noText');
    
    
    /* set event listener */
    google.maps.event.addListener(map, 'click', function(event) {

        var latlng = new google.maps.LatLng(event.latLng.lat(),event.latLng.lng());
 
        marker = new google.maps.Marker({
            map:map,
            position: latlng,
        });
 
        marker.setMap(map);
        markerArray.push(marker);
    });
    
}


function drawDirection(){

    directionDisplay = new google.maps.DirectionsRenderer({
	
            suppressMarkers: true,
            polylineOptions: polylineOptions,
            preserveViewport: true
    
    });
    
    //directionDisplay.polylineOptions = polylineOptions;
    directionDisplay.setMap(map);
    
    numDirectionDisplay ++;
    
    directionDisplayArray.push(directionDisplay);

    var start, end;
    var waypoints = [];
    
    start = markerArray[0].position;
    end   = markerArray[markerArray.length - 1].position;
    
    for(var i=1;i< markerArray.length -1;i++){
    
        waypoints.push({
        
            location: markerArray[i].position,
            stopover: true
            
        });
        
    }
    
    var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.WALKING,
        waypoints: waypoints,
        optimizeWaypoints: true
    }

    directionsService.route(request, function(response, status) {
        
        if (status == google.maps.DirectionsStatus.OK) {
    
            console.log("status is OK");
         
            directionDisplayArray[numDirectionDisplay - 1].setDirections(response);
            
            console.log("draw?");
        
        }
    });
    
}


function resetMarker(){

    for(var i=0;i<markerArray.length;i++){
    
        markerArray[i].setMap(null);
        
    }
    
    markerArray.splice(0, markerArray.length);
    
    console.log(markerArray.length);
    
}

function resetMap(){

    location.reload();
}

google.maps.event.addDomListener(window, 'load', initialize);


























