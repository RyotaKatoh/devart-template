
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


var MAX_DIRECTION = 10;
var numDirections = 0;

var MAX_WAYPOINT = 10;
var numLine = 0;
var wayPoints = [];
wayPoints[numLine] = [];

var debugVal = 1987;


// initialize map                           
function initialize() {
	
    /* initialize variables */
    numDirectionDisplay = 0;
    
    /* polyline style */
    polylineOptions.strokeColor="#2e8b57";
    polylineOptions.strokeOpacity=.6;
    polylineOptions.strokeWeight=6;


    /* define Map object */
    var mapCenter = new google.maps.LatLng(48.6444967,15.2375355);
    
    var mapOptions = {
        zoom:9,
        center: mapCenter,
        disableDefaultUI: true,
        //draggable: false,
        styles: lopanType,
        disableDoubleClickZoom: true
    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    
    /* map style options */
    var styleOptions = [
        {
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

    drawing = true;
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

    var statusMessage = "not get status";
    directionsService.route(request, function(response, status) {
        
        if (status == google.maps.DirectionsStatus.OK) {
    
            //console.log("status is OK");
         
            statusMessage = "drection is drawed.";
            directionDisplayArray[numDirectionDisplay - 1].setDirections(response);
            
            //console.log("draw?");
            
            resetMarker();
            
            numDirections ++;
            if(numDirections < MAX_DIRECTION)
                drawRandomeRoute(2);
            
        }
        
        else{
        
            statusMessage = "direction is not drawed.";
        }
        
        drawing = false;
    });
    
    return statusMessage;
    
}


function resetMarker(){

    for(var i=0;i<markerArray.length;i++){
    
        markerArray[i].setMap(null);
        
    }
    
    markerArray.splice(0, markerArray.length);
    
    //console.log(markerArray.length);
    
}

function resetMap(){

    location.reload();
}

function getLatLngBound(){
    var bounds = map.getBounds();
    var maxLng = bounds.getNorthEast().lng();//東
    var minLng = bounds.getSouthWest().lng();//西
    var maxLat = bounds.getNorthEast().lat();//北
    var minLat = bounds.getSouthWest().lat();//南
    
    var val = {
        maxLat: maxLat,
        maxLng: maxLng,
        minLat: minLat,
        minLng: minLng
    };
    
    console.log(val);
    
    return val;
}

function getNumLine(){

    return numLine;
    
}

function setMarker(argLat, argLng) {
    
    var myLatlng = new google.maps.LatLng(argLat,argLng);
    var marker = new google.maps.Marker({
        map: map,
        position: myLatlng,
        visible: true
    }); 
    marker.setMap(map);
    markerArray.push(marker);
    
}

function getMarker(argLat, argLng){

    var myLatlng = new google.maps.LatLng(argLat,argLng);
    var marker = new google.maps.Marker({
        map: map,
        position: myLatlng,
        visible: false
    }); 
    marker.setMap(map);
    
    return marker;
}


function setWaypoints(lat, lng, flag){

    debugVal = flag;
    
    if(flag == 100){
        numLine++;
        wayPoints[numLine] = [];
    }
    
    var latLng = {
        lat: lat,
        lng: lng
    };
    
    wayPoints[numLine].push(latLng);

    
}

function resetWaypoints(){

    
    wayPoints.splice(0, wayPoints.length);
    numLine = 0;
    wayPoints[numLine] = [];
    
    drawingLineNumber = 0;
    totalDistance = 0.0;
    
    changeStrokeColor();
    
    
}

var drawingLineNumber = 0;

var totalDistance = 0.0;

function drawFaceWithDirection(){

    
    directionDisplay = new google.maps.DirectionsRenderer({
	
            suppressMarkers: true,
            polylineOptions: polylineOptions,
            preserveViewport: true
    
    });

    directionDisplay.setMap(map);
    
    numDirectionDisplay ++;
    
    directionDisplayArray.push(directionDisplay);

    
    var waypointsMarker = [];
    for(var i=0;i<wayPoints[drawingLineNumber].length;i++){
    
        waypointsMarker.push(getMarker(wayPoints[drawingLineNumber][i].lat, wayPoints[drawingLineNumber][i].lng));
        
    }
    
    var start, end;
    var waypoints = [];
    
    start = waypointsMarker[0].position;
    end   = waypointsMarker[waypointsMarker.length - 1].position;
    
    for(var i=1;i< wayPoints[drawingLineNumber].length -1;i++){
    
        waypoints.push({
        
            location: waypointsMarker[i].position,
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
        
        console.log(status);
        
        if (status == google.maps.DirectionsStatus.OK) {

            directionDisplayArray[numDirectionDisplay - 1].setDirections(response);
            
            // add distance
            totalDistance += response.routes[0].legs[0].distance.value;
            
            console.log("totalDistance: " + totalDistance);
            
            drawingLineNumber ++;
            console.log("num line:" + drawingLineNumber);
            console.log("numLine;" + numLine);
            if(drawingLineNumber <= numLine)
                drawFaceWithDirection();
            
        }
        
        else if( status == google.maps.DirectionsStatus.OVER_QUERY_LIMIT){
            
            Sleep(1000);
   
            if(drawingLineNumber <= numLine)
                drawFaceWithDirection();        
            
        }

    });
     
}

function getTotalDistance(){

    return totalDistance;
    
}


function getNumDirections(){

    return numDirectionDisplay;
}

function drawRandomeRoute(numWaypoints){

    var bounds = map.getBounds();
    var maxX = bounds.getNorthEast().lng();//東
    var minX = bounds.getSouthWest().lng();//西
    var maxY = bounds.getNorthEast().lat();//北
    var minY = bounds.getSouthWest().lat();//南
    
        
    for(var i=0;i<numWaypoints;i++){
    
        var lng = Math.random()*(maxX - minX) + minX;
        var lat = Math.random()*(maxY - minY) + minY;
        
        setMarker(lat, lng);
        
    }
    
    drawDirection();
    
}

function Sleep(ms) {
    var d1 = new Date().getTime();
    var d2 = new Date().getTime();
    while( d2 < (d1 + ms) ) {
        d2 = new Date().getTime();
    }
    return;
}


function getDebugVal(){

    return debugVal;
    
}

function changeStrokeColor(){

    var newColor;// = "#" + Math.floor(Math.random() * 0xFFFFFF).toString(16);
    var r = Math.floor(Math.random() * 0x80).toString(16);
    var gb= Math.floor(Math.random() * 0xFFFF).toString(16);
    newColor = "#"+r+gb;
    polylineOptions.strokeColor = newColor;
}

function getDrawingLineNumber(){

    return drawingLineNumber;
}

google.maps.event.addDomListener(window, 'load', initialize);


























