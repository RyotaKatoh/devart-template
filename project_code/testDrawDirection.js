
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
    
    
}

var drawingLineNumber = 0;

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


/* freedom code area */


function testArg(arg1, arg2){

    return arg1 + arg2;
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

function test(){
   

    var bounds = map.getBounds();
    var maxX = bounds.getNorthEast().lng();//東
    var minX = bounds.getSouthWest().lng();//西
    var maxY = bounds.getNorthEast().lat();//北
    var minY = bounds.getSouthWest().lat();//南
    
    var numL = 30;
    for(var i=0;i<numL;i++){
    
        var numW = Math.floor(Math.random() * 8 + 2);
        for(var j=0;j<numW;j++){
            var lng = Math.random()*(maxX - minX) + minX;
            var lat = Math.random()*(maxY - minY) + minY;

            if(j == numW -1){
                setWaypoints(lat,lng, 100);
            }
            else 
                setWaypoints(lat, lng, 1);
            
        }
    }
    
    console.log("set waypoints");
    console.log(wayPoints);

    
}

function getDebugVal(){

    return debugVal;
    
}

function drawFaceWithMarker(){
    var startTime = new Date();
    
setWaypoints(48.375847, 15.414690, 0);
setWaypoints(48.373127, 15.410570, 0);
setWaypoints(48.373127, 15.398211, 0);
setWaypoints(48.370403, 15.394091, 0);
setWaypoints(48.370403, 15.389971, 0);
setWaypoints(48.373127, 15.385851, 0);
setWaypoints(48.370403, 15.389971, 0);
setWaypoints(48.370403, 15.394091, 0);
setWaypoints(48.373127, 15.398211, 0);
setWaypoints(48.373127, 15.410570, 0);
setWaypoints(48.375847, 15.414690, 100);
setWaypoints(48.375847, 15.418810, 0);
setWaypoints(48.384014, 15.019182, 100);
setWaypoints(48.378570, 15.019182, 0);
setWaypoints(48.375847, 15.015062, 0);
setWaypoints(48.375847, 15.010942, 0);
setWaypoints(48.375847, 15.027422, 0);
setWaypoints(48.373127, 15.031542, 0);
setWaypoints(48.373127, 15.043901, 0);
setWaypoints(48.370403, 15.048021, 0);
setWaypoints(48.370403, 15.093340, 0);
setWaypoints(48.373127, 15.097460, 0);
setWaypoints(48.373127, 15.113939, 100);
setWaypoints(48.370403, 15.118059, 0);
setWaypoints(48.370403, 15.151018, 0);
setWaypoints(48.367683, 15.155138, 0);
setWaypoints(48.367683, 15.175737, 0);
setWaypoints(48.364959, 15.179857, 0);
setWaypoints(48.364959, 15.192217, 0);
setWaypoints(48.362236, 15.196337, 0);
setWaypoints(48.362236, 15.266375, 0);
setWaypoints(48.364959, 15.270494, 0);
setWaypoints(48.364959, 15.278734, 100);
setWaypoints(48.367683, 15.282854, 0);
setWaypoints(48.367683, 15.319933, 0);
setWaypoints(48.370403, 15.324053, 0);
setWaypoints(48.370403, 15.340532, 0);
setWaypoints(48.370403, 15.324053, 0);
setWaypoints(48.367683, 15.319933, 0);
setWaypoints(48.367683, 15.282854, 0);
setWaypoints(48.364959, 15.278734, 0);
setWaypoints(48.364959, 15.270494, 0);
setWaypoints(48.362236, 15.266375, 100);
setWaypoints(48.362236, 15.196337, 0);
setWaypoints(48.364959, 15.192217, 0);
setWaypoints(48.364959, 15.179857, 0);
setWaypoints(48.367683, 15.175737, 0);
setWaypoints(48.367683, 15.155138, 0);
setWaypoints(48.370403, 15.151018, 0);
setWaypoints(48.370403, 15.118059, 0);
setWaypoints(48.373127, 15.113939, 0);
setWaypoints(48.373127, 15.097460, 0);
setWaypoints(48.370403, 15.093340, 100);
setWaypoints(48.370403, 15.048021, 0);
setWaypoints(48.373127, 15.043901, 0);
setWaypoints(48.373127, 15.031542, 0);
setWaypoints(48.381294, 15.019182, 0);
setWaypoints(48.517399, 15.105700, 100);
setWaypoints(48.511955, 15.105700, 0);
setWaypoints(48.503788, 15.118059, 0);
setWaypoints(48.503788, 15.122179, 0);
setWaypoints(48.501064, 15.126299, 0);
setWaypoints(48.501064, 15.175737, 0);
setWaypoints(48.503788, 15.179857, 0);
setWaypoints(48.503788, 15.183977, 0);
setWaypoints(48.503788, 15.179857, 0);
setWaypoints(48.501064, 15.175737, 0);
setWaypoints(48.501064, 15.126299, 100);
setWaypoints(48.503788, 15.122179, 0);
setWaypoints(48.503788, 15.118059, 0);
setWaypoints(48.511955, 15.105700, 0);
setWaypoints(48.541897, 15.315813, 100);
setWaypoints(48.539177, 15.315813, 0);
setWaypoints(48.536453, 15.311693, 0);
setWaypoints(48.536453, 15.307573, 0);
setWaypoints(48.533729, 15.303453, 0);
setWaypoints(48.533729, 15.299334, 0);
setWaypoints(48.531009, 15.295214, 0);
setWaypoints(48.531009, 15.286974, 0);
setWaypoints(48.528286, 15.282854, 0);
setWaypoints(48.528286, 15.278734, 0);
setWaypoints(48.522842, 15.270494, 100);
setWaypoints(48.522842, 15.266375, 0);
setWaypoints(48.520122, 15.262255, 0);
setWaypoints(48.522842, 15.266375, 0);
setWaypoints(48.522842, 15.270494, 0);
setWaypoints(48.528286, 15.278734, 0);
setWaypoints(48.528286, 15.282854, 0);
setWaypoints(48.531009, 15.286974, 0);
setWaypoints(48.531009, 15.295214, 0);
setWaypoints(48.533729, 15.299334, 0);
setWaypoints(48.533729, 15.303453, 100);
setWaypoints(48.536453, 15.307573, 0);
setWaypoints(48.536453, 15.311693, 0);
setWaypoints(48.533729, 15.315813, 0);
setWaypoints(48.541897, 15.146898, 100);
setWaypoints(48.539177, 15.146898, 0);
setWaypoints(48.533729, 15.155138, 0);
setWaypoints(48.533729, 15.163378, 0);
setWaypoints(48.531009, 15.167498, 0);
setWaypoints(48.531009, 15.171618, 0);
setWaypoints(48.528286, 15.175737, 0);
setWaypoints(48.528286, 15.179857, 0);
setWaypoints(48.525566, 15.183977, 0);
setWaypoints(48.531009, 15.183977, 0);
setWaypoints(48.528286, 15.179857, 100);
setWaypoints(48.528286, 15.175737, 0);
setWaypoints(48.531009, 15.171618, 0);
setWaypoints(48.531009, 15.167498, 0);
setWaypoints(48.533729, 15.163378, 0);
setWaypoints(48.533729, 15.155138, 0);
setWaypoints(48.539177, 15.146898, 0);
setWaypoints(48.582729, 15.826677, 100);
setWaypoints(48.571842, 15.810198, 0);
setWaypoints(48.569118, 15.810198, 0);
setWaypoints(48.566398, 15.806078, 0);
setWaypoints(48.563675, 15.806078, 0);
setWaypoints(48.555507, 15.793718, 0);
setWaypoints(48.552787, 15.793718, 0);
setWaypoints(48.550064, 15.789598, 0);
setWaypoints(48.547340, 15.789598, 0);
setWaypoints(48.533729, 15.768999, 0);
setWaypoints(48.531009, 15.768999, 100);
setWaypoints(48.528286, 15.764879, 0);
setWaypoints(48.525566, 15.764879, 0);
setWaypoints(48.522842, 15.760759, 0);
setWaypoints(48.522842, 15.756639, 0);
setWaypoints(48.522842, 15.760759, 0);
setWaypoints(48.525566, 15.764879, 0);
setWaypoints(48.528286, 15.764879, 0);
setWaypoints(48.531009, 15.768999, 0);
setWaypoints(48.533729, 15.768999, 0);
setWaypoints(48.547340, 15.789598, 100);
setWaypoints(48.550064, 15.789598, 0);
setWaypoints(48.552787, 15.793718, 0);
setWaypoints(48.555507, 15.793718, 0);
setWaypoints(48.563675, 15.806078, 0);
setWaypoints(48.566398, 15.806078, 0);
setWaypoints(48.569118, 15.810198, 0);
setWaypoints(48.571842, 15.810198, 0);
setWaypoints(48.593616, 15.888475, 100);
setWaypoints(48.582729, 15.888475, 0);
setWaypoints(48.580005, 15.884356, 0);
setWaypoints(48.560951, 15.884356, 0);
setWaypoints(48.552787, 15.871996, 0);
setWaypoints(48.552787, 15.867876, 0);
setWaypoints(48.544620, 15.855516, 0);
setWaypoints(48.544620, 15.851397, 0);
setWaypoints(48.541897, 15.847277, 0);
setWaypoints(48.541897, 15.843157, 0);
setWaypoints(48.536453, 15.834917, 100);
setWaypoints(48.536453, 15.830797, 0);
setWaypoints(48.533729, 15.826677, 0);
setWaypoints(48.533729, 15.822557, 0);
setWaypoints(48.531009, 15.818438, 0);
setWaypoints(48.531009, 15.814318, 0);
setWaypoints(48.528286, 15.810198, 0);
setWaypoints(48.528286, 15.806078, 0);
setWaypoints(48.522842, 15.797838, 0);
setWaypoints(48.522842, 15.789598, 0);
setWaypoints(48.525566, 15.785479, 100);
setWaypoints(48.528286, 15.785479, 0);
setWaypoints(48.520122, 15.785479, 0);
setWaypoints(48.517399, 15.781359, 0);
setWaypoints(48.517399, 15.777239, 0);
setWaypoints(48.520122, 15.773119, 0);
setWaypoints(48.517399, 15.777239, 0);
setWaypoints(48.495620, 15.777239, 0);
setWaypoints(48.484733, 15.760759, 0);
setWaypoints(48.479290, 15.760759, 0);
setWaypoints(48.473846, 15.752520, 100);
setWaypoints(48.473846, 15.740160, 0);
setWaypoints(48.476566, 15.736040, 0);
setWaypoints(48.492901, 15.736040, 0);
setWaypoints(48.495620, 15.740160, 0);
setWaypoints(48.501064, 15.740160, 0);
setWaypoints(48.503788, 15.744280, 0);
setWaypoints(48.528286, 15.744280, 0);
setWaypoints(48.503788, 15.744280, 0);
setWaypoints(48.501064, 15.740160, 0);
setWaypoints(48.495620, 15.740160, 100);
setWaypoints(48.492901, 15.736040, 0);
setWaypoints(48.454788, 15.736040, 0);
setWaypoints(48.452068, 15.731920, 0);
setWaypoints(48.449344, 15.731920, 0);
setWaypoints(48.446624, 15.727800, 0);
setWaypoints(48.441181, 15.727800, 0);
setWaypoints(48.435733, 15.719561, 0);
setWaypoints(48.430290, 15.719561, 0);
setWaypoints(48.427570, 15.715441, 0);
setWaypoints(48.427570, 15.711321, 100);
setWaypoints(48.419403, 15.698961, 0);
setWaypoints(48.416679, 15.698961, 0);
setWaypoints(48.413959, 15.694841, 0);
setWaypoints(48.411235, 15.694841, 0);
setWaypoints(48.408512, 15.690722, 0);
setWaypoints(48.397625, 15.690722, 0);
setWaypoints(48.394905, 15.686602, 0);
setWaypoints(48.389457, 15.686602, 0);
setWaypoints(48.394905, 15.686602, 0);
setWaypoints(48.397625, 15.690722, 100);
setWaypoints(48.408512, 15.690722, 0);
setWaypoints(48.411235, 15.694841, 0);
setWaypoints(48.413959, 15.694841, 0);
setWaypoints(48.416679, 15.698961, 0);
setWaypoints(48.419403, 15.698961, 0);
setWaypoints(48.427570, 15.711321, 0);
setWaypoints(48.427570, 15.715441, 0);
setWaypoints(48.430290, 15.719561, 0);
setWaypoints(48.435733, 15.719561, 0);
setWaypoints(48.441181, 15.727800, 100);
setWaypoints(48.446624, 15.727800, 0);
setWaypoints(48.449344, 15.731920, 0);
setWaypoints(48.452068, 15.731920, 0);
setWaypoints(48.454788, 15.736040, 0);
setWaypoints(48.460235, 15.736040, 0);
setWaypoints(48.473846, 15.756639, 0);
setWaypoints(48.476566, 15.756639, 0);
setWaypoints(48.479290, 15.760759, 0);
setWaypoints(48.484733, 15.760759, 0);
setWaypoints(48.495620, 15.777239, 100);
setWaypoints(48.495620, 15.781359, 0);
setWaypoints(48.492901, 15.785479, 0);
setWaypoints(48.490177, 15.785479, 0);
setWaypoints(48.514675, 15.785479, 0);
setWaypoints(48.528286, 15.806078, 0);
setWaypoints(48.528286, 15.810198, 0);
setWaypoints(48.531009, 15.814318, 0);
setWaypoints(48.531009, 15.818438, 0);
setWaypoints(48.533729, 15.822557, 0);
setWaypoints(48.533729, 15.826677, 100);
setWaypoints(48.536453, 15.830797, 0);
setWaypoints(48.536453, 15.834917, 0);
setWaypoints(48.541897, 15.843157, 0);
setWaypoints(48.541897, 15.847277, 0);
setWaypoints(48.544620, 15.851397, 0);
setWaypoints(48.544620, 15.855516, 0);
setWaypoints(48.552787, 15.867876, 0);
setWaypoints(48.552787, 15.871996, 0);
setWaypoints(48.563675, 15.888475, 0);
setWaypoints(48.577285, 15.888475, 100);
setWaypoints(48.580005, 15.884356, 0);
setWaypoints(48.582729, 15.888475, 0);
setWaypoints(48.626281, 15.859636, 100);
setWaypoints(48.609951, 15.859636, 0);
setWaypoints(48.607227, 15.855516, 0);
setWaypoints(48.596340, 15.855516, 0);
setWaypoints(48.593616, 15.851397, 0);
setWaypoints(48.590896, 15.851397, 0);
setWaypoints(48.588173, 15.847277, 0);
setWaypoints(48.585453, 15.847277, 0);
setWaypoints(48.582729, 15.843157, 0);
setWaypoints(48.580005, 15.843157, 0);
setWaypoints(48.577285, 15.839037, 100);
setWaypoints(48.574562, 15.839037, 0);
setWaypoints(48.571842, 15.834917, 0);
setWaypoints(48.563675, 15.834917, 0);
setWaypoints(48.571842, 15.834917, 0);
setWaypoints(48.574562, 15.839037, 0);
setWaypoints(48.577285, 15.839037, 0);
setWaypoints(48.580005, 15.843157, 0);
setWaypoints(48.582729, 15.843157, 0);
setWaypoints(48.585453, 15.847277, 0);
setWaypoints(48.588173, 15.847277, 100);
setWaypoints(48.590896, 15.851397, 0);
setWaypoints(48.593616, 15.851397, 0);
setWaypoints(48.596340, 15.855516, 0);
setWaypoints(48.607227, 15.855516, 0);
setWaypoints(48.609951, 15.859636, 0);
setWaypoints(48.609951, 15.867876, 0);
setWaypoints(48.612674, 15.863756, 0);
setWaypoints(48.618118, 15.863756, 0);
setWaypoints(48.620838, 15.867876, 0);
setWaypoints(48.618118, 15.863756, 100);
setWaypoints(48.620838, 15.859636, 0);
setWaypoints(48.650783, 15.768999, 100);
setWaypoints(48.648060, 15.764879, 0);
setWaypoints(48.634449, 15.764879, 0);
setWaypoints(48.631729, 15.768999, 0);
setWaypoints(48.626281, 15.768999, 0);
setWaypoints(48.623562, 15.764879, 0);
setWaypoints(48.618118, 15.764879, 0);
setWaypoints(48.615394, 15.760759, 0);
setWaypoints(48.593616, 15.760759, 0);
setWaypoints(48.590896, 15.764879, 0);
setWaypoints(48.593616, 15.760759, 100);
setWaypoints(48.615394, 15.760759, 0);
setWaypoints(48.618118, 15.764879, 0);
setWaypoints(48.623562, 15.764879, 0);
setWaypoints(48.626281, 15.768999, 0);
setWaypoints(48.631729, 15.768999, 0);
setWaypoints(48.634449, 15.764879, 0);
setWaypoints(48.648060, 15.764879, 0);
setWaypoints(48.713390, 14.912066, 100);
setWaypoints(48.707946, 14.920305, 0);
setWaypoints(48.707946, 14.924425, 0);
setWaypoints(48.705227, 14.928545, 0);
setWaypoints(48.705227, 14.932665, 0);
setWaypoints(48.702503, 14.936785, 0);
setWaypoints(48.702503, 14.945024, 0);
setWaypoints(48.699779, 14.949144, 0);
setWaypoints(48.699779, 14.965624, 0);
setWaypoints(48.697059, 14.969744, 0);
setWaypoints(48.697059, 14.994463, 100);
setWaypoints(48.699779, 14.998583, 0);
setWaypoints(48.699779, 15.010942, 0);
setWaypoints(48.702503, 15.015062, 0);
setWaypoints(48.702503, 15.023302, 0);
setWaypoints(48.705227, 15.027422, 0);
setWaypoints(48.705227, 15.031542, 0);
setWaypoints(48.707946, 15.035662, 0);
setWaypoints(48.707946, 15.043901, 0);
setWaypoints(48.710670, 15.048021, 0);
setWaypoints(48.710670, 15.064501, 100);
setWaypoints(48.710670, 15.048021, 0);
setWaypoints(48.707946, 15.043901, 0);
setWaypoints(48.707946, 15.035662, 0);
setWaypoints(48.705227, 15.031542, 0);
setWaypoints(48.705227, 15.027422, 0);
setWaypoints(48.702503, 15.023302, 0);
setWaypoints(48.702503, 15.015062, 0);
setWaypoints(48.699779, 15.010942, 0);
setWaypoints(48.699779, 14.998583, 0);
setWaypoints(48.697059, 14.994463, 100);
setWaypoints(48.697059, 14.969744, 0);
setWaypoints(48.699779, 14.965624, 0);
setWaypoints(48.699779, 14.949144, 0);
setWaypoints(48.702503, 14.945024, 0);
setWaypoints(48.702503, 14.936785, 0);
setWaypoints(48.705227, 14.932665, 0);
setWaypoints(48.705227, 14.928545, 0);
setWaypoints(48.707946, 14.924425, 0);
setWaypoints(48.707946, 14.920305, 0);
setWaypoints(48.732444, 15.591845, 100);
setWaypoints(48.727001, 15.583605, 0);
setWaypoints(48.724281, 15.583605, 0);
setWaypoints(48.721557, 15.579485, 0);
setWaypoints(48.721557, 15.575365, 0);
setWaypoints(48.716114, 15.567125, 0);
setWaypoints(48.716114, 15.563005, 0);
setWaypoints(48.713390, 15.558886, 0);
setWaypoints(48.713390, 15.554766, 0);
setWaypoints(48.710670, 15.550646, 0);
setWaypoints(48.710670, 15.538286, 100);
setWaypoints(48.707946, 15.534166, 0);
setWaypoints(48.710670, 15.530046, 0);
setWaypoints(48.707946, 15.534166, 0);
setWaypoints(48.710670, 15.538286, 0);
setWaypoints(48.710670, 15.550646, 0);
setWaypoints(48.713390, 15.554766, 0);
setWaypoints(48.713390, 15.558886, 0);
setWaypoints(48.716114, 15.563005, 0);
setWaypoints(48.716114, 15.567125, 0);
setWaypoints(48.721557, 15.575365, 100);
setWaypoints(48.721557, 15.579485, 0);
setWaypoints(48.724281, 15.583605, 0);
setWaypoints(48.727001, 15.583605, 0);
setWaypoints(48.732444, 15.591845, 0);
setWaypoints(48.732444, 15.595964, 0);
setWaypoints(48.756946, 15.431170, 100);
setWaypoints(48.751503, 15.422930, 0);
setWaypoints(48.748779, 15.422930, 0);
setWaypoints(48.743335, 15.414690, 0);
setWaypoints(48.743335, 15.406450, 0);
setWaypoints(48.740612, 15.410570, 0);
setWaypoints(48.737892, 15.410570, 0);
setWaypoints(48.735168, 15.406450, 0);
setWaypoints(48.735168, 15.402330, 0);
setWaypoints(48.735168, 15.410570, 0);
setWaypoints(48.729725, 15.418810, 100);
setWaypoints(48.729725, 15.422930, 0);
setWaypoints(48.727001, 15.427050, 0);
setWaypoints(48.727001, 15.431170, 0);
setWaypoints(48.724281, 15.435289, 0);
setWaypoints(48.727001, 15.431170, 0);
setWaypoints(48.727001, 15.427050, 0);
setWaypoints(48.729725, 15.422930, 0);
setWaypoints(48.732444, 15.422930, 0);
setWaypoints(48.735168, 15.418810, 0);
setWaypoints(48.746055, 15.418810, 100);
setWaypoints(48.748779, 15.422930, 0);
setWaypoints(48.751503, 15.422930, 0);
setWaypoints(48.756946, 15.431170, 0);
setWaypoints(48.756946, 15.435289, 0);
setWaypoints(48.765110, 15.530046, 100);
setWaypoints(48.762390, 15.534166, 0);
setWaypoints(48.759666, 15.534166, 0);
setWaypoints(48.754223, 15.525927, 0);
setWaypoints(48.754223, 15.521807, 0);
setWaypoints(48.756946, 15.517687, 0);
setWaypoints(48.759666, 15.517687, 0);
setWaypoints(48.762390, 15.521807, 0);
setWaypoints(48.759666, 15.517687, 0);
setWaypoints(48.759666, 15.501207, 0);
setWaypoints(48.762390, 15.497087, 100);
setWaypoints(48.762390, 15.480608, 0);
setWaypoints(48.759666, 15.476488, 0);
setWaypoints(48.759666, 15.468248, 0);
setWaypoints(48.762390, 15.464128, 0);
setWaypoints(48.759666, 15.464128, 0);
setWaypoints(48.754223, 15.455889, 0);
setWaypoints(48.751503, 15.455889, 0);
setWaypoints(48.748779, 15.451769, 0);
setWaypoints(48.737892, 15.451769, 0);
setWaypoints(48.735168, 15.455889, 100);
setWaypoints(48.732444, 15.455889, 0);
setWaypoints(48.727001, 15.464128, 0);
setWaypoints(48.724281, 15.464128, 0);
setWaypoints(48.716114, 15.476488, 0);
setWaypoints(48.716114, 15.501207, 0);
setWaypoints(48.721557, 15.509447, 0);
setWaypoints(48.721557, 15.513567, 0);
setWaypoints(48.718834, 15.517687, 0);
setWaypoints(48.727001, 15.517687, 0);
setWaypoints(48.729725, 15.521807, 100);
setWaypoints(48.732444, 15.521807, 0);
setWaypoints(48.735168, 15.525927, 0);
setWaypoints(48.740612, 15.525927, 0);
setWaypoints(48.743335, 15.530046, 0);
setWaypoints(48.756946, 15.530046, 0);
setWaypoints(48.762390, 15.538286, 0);
setWaypoints(48.762390, 15.546526, 0);
setWaypoints(48.759666, 15.550646, 0);
setWaypoints(48.759666, 15.567125, 0);
setWaypoints(48.756946, 15.571245, 100);
setWaypoints(48.756946, 15.575365, 0);
setWaypoints(48.754223, 15.579485, 0);
setWaypoints(48.754223, 15.583605, 0);
setWaypoints(48.751503, 15.587725, 0);
setWaypoints(48.751503, 15.591845, 0);
setWaypoints(48.748779, 15.595964, 0);
setWaypoints(48.748779, 15.604204, 0);
setWaypoints(48.751503, 15.608324, 0);
setWaypoints(48.751503, 15.612444, 0);
setWaypoints(48.751503, 15.608324, 100);
setWaypoints(48.748779, 15.604204, 0);
setWaypoints(48.748779, 15.595964, 0);
setWaypoints(48.751503, 15.591845, 0);
setWaypoints(48.751503, 15.587725, 0);
setWaypoints(48.754223, 15.583605, 0);
setWaypoints(48.754223, 15.579485, 0);
setWaypoints(48.756946, 15.575365, 0);
setWaypoints(48.756946, 15.571245, 0);
setWaypoints(48.759666, 15.567125, 0);
setWaypoints(48.759666, 15.550646, 100);
setWaypoints(48.762390, 15.546526, 0);
setWaypoints(48.762390, 15.534166, 0);
setWaypoints(48.765110, 14.916185, 100);
setWaypoints(48.762390, 14.912066, 0);
setWaypoints(48.759666, 14.912066, 0);
setWaypoints(48.756946, 14.907946, 0);
setWaypoints(48.756946, 14.912066, 0);
setWaypoints(48.754223, 14.916185, 0);
setWaypoints(48.754223, 14.920305, 0);
setWaypoints(48.751503, 14.924425, 0);
setWaypoints(48.754223, 14.920305, 0);
setWaypoints(48.754223, 14.916185, 0);
setWaypoints(48.756946, 14.912066, 100);
setWaypoints(48.762390, 14.912066, 0);
setWaypoints(48.778721, 14.949144, 100);
setWaypoints(48.776001, 14.945024, 0);
setWaypoints(48.776001, 14.924425, 0);
setWaypoints(48.773277, 14.920305, 0);
setWaypoints(48.773277, 14.887346, 0);
setWaypoints(48.770557, 14.883226, 0);
setWaypoints(48.770557, 14.874987, 0);
setWaypoints(48.770557, 14.883226, 0);
setWaypoints(48.773277, 14.887346, 0);
setWaypoints(48.773277, 14.920305, 0);
setWaypoints(48.776001, 14.924425, 100);
setWaypoints(48.776001, 14.945024, 0);
setWaypoints(48.778721, 14.949144, 0);
setWaypoints(48.778721, 14.961504, 0);
setWaypoints(48.776001, 14.965624, 0);
setWaypoints(48.776001, 14.994463, 0);
setWaypoints(48.773277, 14.998583, 0);
setWaypoints(48.773277, 15.015062, 0);
setWaypoints(48.767833, 15.023302, 0);
setWaypoints(48.767833, 15.027422, 0);
setWaypoints(48.765110, 15.031542, 100);
setWaypoints(48.748779, 15.031542, 0);
setWaypoints(48.746055, 15.027422, 0);
setWaypoints(48.743335, 15.027422, 0);
setWaypoints(48.740612, 15.023302, 0);
setWaypoints(48.737892, 15.023302, 0);
setWaypoints(48.732444, 15.015062, 0);
setWaypoints(48.732444, 15.010942, 0);
setWaypoints(48.729725, 15.006823, 0);
setWaypoints(48.729725, 14.990343, 0);
setWaypoints(48.732444, 14.986223, 100);
setWaypoints(48.732444, 14.982103, 0);
setWaypoints(48.746055, 14.961504, 0);
setWaypoints(48.754223, 14.961504, 0);
setWaypoints(48.756946, 14.957384, 0);
setWaypoints(48.765110, 14.957384, 0);
setWaypoints(48.767833, 14.961504, 0);
setWaypoints(48.767833, 14.965624, 0);
setWaypoints(48.767833, 14.961504, 0);
setWaypoints(48.770557, 14.957384, 0);
setWaypoints(48.756946, 14.957384, 100);
setWaypoints(48.754223, 14.961504, 0);
setWaypoints(48.746055, 14.961504, 0);
setWaypoints(48.740612, 14.969744, 0);
setWaypoints(48.737892, 14.965624, 0);
setWaypoints(48.737892, 14.973864, 0);
setWaypoints(48.732444, 14.982103, 0);
setWaypoints(48.732444, 14.986223, 0);
setWaypoints(48.729725, 14.990343, 0);
setWaypoints(48.729725, 15.006823, 0);
setWaypoints(48.732444, 15.010942, 100);
setWaypoints(48.732444, 15.015062, 0);
setWaypoints(48.729725, 15.019182, 0);
setWaypoints(48.735168, 15.019182, 0);
setWaypoints(48.737892, 15.023302, 0);
setWaypoints(48.740612, 15.023302, 0);
setWaypoints(48.743335, 15.027422, 0);
setWaypoints(48.746055, 15.027422, 0);
setWaypoints(48.748779, 15.031542, 0);
setWaypoints(48.770557, 15.031542, 0);
setWaypoints(48.773277, 15.035662, 100);
setWaypoints(48.773277, 15.043901, 0);
setWaypoints(48.770557, 15.048021, 0);
setWaypoints(48.770557, 15.056261, 0);
setWaypoints(48.767833, 15.060381, 0);
setWaypoints(48.767833, 15.064501, 0);
setWaypoints(48.751503, 15.089220, 0);
setWaypoints(48.740612, 15.089220, 0);
setWaypoints(48.737892, 15.085100, 0);
setWaypoints(48.737892, 15.072741, 0);
setWaypoints(48.732444, 15.064501, 100);
setWaypoints(48.732444, 15.043901, 0);
setWaypoints(48.732444, 15.064501, 0);
setWaypoints(48.737892, 15.072741, 0);
setWaypoints(48.737892, 15.085100, 0);
setWaypoints(48.740612, 15.089220, 0);
setWaypoints(48.740612, 15.093340, 0);
setWaypoints(48.737892, 15.097460, 0);
setWaypoints(48.740612, 15.097460, 0);
setWaypoints(48.743335, 15.101580, 0);
setWaypoints(48.746055, 15.097460, 100);
setWaypoints(48.756946, 15.097460, 0);
setWaypoints(48.754223, 15.093340, 0);
setWaypoints(48.754223, 15.085100, 0);
setWaypoints(48.767833, 15.064501, 0);
setWaypoints(48.767833, 15.060381, 0);
setWaypoints(48.770557, 15.056261, 0);
setWaypoints(48.770557, 15.048021, 0);
setWaypoints(48.773277, 15.043901, 0);
setWaypoints(48.773277, 15.035662, 0);
setWaypoints(48.767833, 15.027422, 100);
setWaypoints(48.767833, 15.023302, 0);
setWaypoints(48.773277, 15.015062, 0);
setWaypoints(48.773277, 14.998583, 0);
setWaypoints(48.776001, 14.994463, 0);
setWaypoints(48.776001, 14.965624, 0);
setWaypoints(48.778721, 14.961504, 0);
setWaypoints(48.795055, 14.718431, 100);
setWaypoints(48.786888, 14.718431, 0);
setWaypoints(48.784168, 14.714312, 0);
setWaypoints(48.767833, 14.714312, 0);
setWaypoints(48.765110, 14.710192, 0);
setWaypoints(48.746055, 14.710192, 0);
setWaypoints(48.743335, 14.714312, 0);
setWaypoints(48.740612, 14.714312, 0);
setWaypoints(48.743335, 14.714312, 0);
setWaypoints(48.746055, 14.710192, 0);
setWaypoints(48.765110, 14.710192, 100);
setWaypoints(48.767833, 14.714312, 0);
setWaypoints(48.784168, 14.714312, 0);
setWaypoints(48.786888, 14.718431, 0);
setWaypoints(48.797775, 14.693712, 100);
setWaypoints(48.795055, 14.689592, 0);
setWaypoints(48.792331, 14.689592, 0);
setWaypoints(48.789611, 14.685472, 0);
setWaypoints(48.770557, 14.685472, 0);
setWaypoints(48.767833, 14.681353, 0);
setWaypoints(48.748779, 14.681353, 0);
setWaypoints(48.767833, 14.681353, 0);
setWaypoints(48.770557, 14.685472, 0);
setWaypoints(48.789611, 14.685472, 0);
setWaypoints(48.792331, 14.689592, 100);
setWaypoints(48.795055, 14.689592, 0);
setWaypoints(48.882164, 15.031542, 100);
setWaypoints(48.879440, 15.035662, 0);
setWaypoints(48.879440, 15.039782, 0);
setWaypoints(48.876720, 15.043901, 0);
setWaypoints(48.876720, 15.052141, 0);
setWaypoints(48.868553, 15.064501, 0);
setWaypoints(48.868553, 15.068621, 0);
setWaypoints(48.863109, 15.076860, 0);
setWaypoints(48.863109, 15.097460, 0);
setWaypoints(48.860386, 15.101580, 0);
setWaypoints(48.860386, 15.109819, 100);
setWaypoints(48.857662, 15.113939, 0);
setWaypoints(48.857662, 15.126299, 0);
setWaypoints(48.857662, 15.113939, 0);
setWaypoints(48.860386, 15.109819, 0);
setWaypoints(48.860386, 15.101580, 0);
setWaypoints(48.863109, 15.097460, 0);
setWaypoints(48.863109, 15.093340, 0);
setWaypoints(48.871273, 15.080980, 0);
setWaypoints(48.871273, 15.076860, 0);
setWaypoints(48.868553, 15.072741, 100);
setWaypoints(48.868553, 15.064501, 0);
setWaypoints(48.876720, 15.052141, 0);
setWaypoints(48.876720, 15.043901, 0);
setWaypoints(48.879440, 15.039782, 0);
setWaypoints(48.879440, 15.035662, 0);
setWaypoints(49.075432, 14.907946, 100);
setWaypoints(49.064544, 14.891466, 0);
setWaypoints(49.064544, 14.887346, 0);
setWaypoints(49.029155, 14.833788, 0);
setWaypoints(49.026436, 14.833788, 0);
setWaypoints(49.020992, 14.825548, 0);
setWaypoints(49.018268, 14.825548, 0);
setWaypoints(49.012825, 14.817308, 0);
setWaypoints(49.010101, 14.817308, 0);
setWaypoints(49.007381, 14.813189, 0);
setWaypoints(49.004657, 14.813189, 100);
setWaypoints(49.001938, 14.809069, 0);
setWaypoints(48.996490, 14.809069, 0);
setWaypoints(48.993770, 14.804949, 0);
setWaypoints(48.988327, 14.804949, 0);
setWaypoints(48.985603, 14.800829, 0);
setWaypoints(48.980159, 14.800829, 0);
setWaypoints(48.977436, 14.796709, 0);
setWaypoints(48.969268, 14.796709, 0);
setWaypoints(48.966549, 14.792589, 0);
setWaypoints(48.958381, 14.792589, 100);
setWaypoints(48.955661, 14.788469, 0);
setWaypoints(48.947494, 14.788469, 0);
setWaypoints(48.944770, 14.784349, 0);
setWaypoints(48.933883, 14.784349, 0);
setWaypoints(48.931160, 14.780230, 0);
setWaypoints(48.917549, 14.780230, 0);
setWaypoints(48.914829, 14.776110, 0);
setWaypoints(48.901218, 14.776110, 0);
setWaypoints(48.898494, 14.771990, 0);
setWaypoints(48.882164, 14.771990, 100);
setWaypoints(48.879440, 14.767870, 0);
setWaypoints(48.865829, 14.767870, 0);
setWaypoints(48.863109, 14.763750, 0);
setWaypoints(48.849498, 14.763750, 0);
setWaypoints(48.846775, 14.759630, 0);
setWaypoints(48.827720, 14.759630, 0);
setWaypoints(48.824997, 14.755510, 0);
setWaypoints(48.805942, 14.755510, 0);
setWaypoints(48.803222, 14.751390, 0);
setWaypoints(48.803222, 14.747271, 100);
setWaypoints(48.800499, 14.751390, 0);
setWaypoints(48.751503, 14.751390, 0);
setWaypoints(48.748779, 14.747271, 0);
setWaypoints(48.732444, 14.747271, 0);
setWaypoints(48.729725, 14.743151, 0);
setWaypoints(48.718834, 14.743151, 0);
setWaypoints(48.716114, 14.739031, 0);
setWaypoints(48.705227, 14.739031, 0);
setWaypoints(48.702503, 14.734911, 0);
setWaypoints(48.688892, 14.734911, 100);
setWaypoints(48.686168, 14.730791, 0);
setWaypoints(48.686168, 14.722551, 0);
setWaypoints(48.688892, 14.718431, 0);
setWaypoints(48.735168, 14.718431, 0);
setWaypoints(48.667114, 14.718431, 0);
setWaypoints(48.664394, 14.714312, 0);
setWaypoints(48.664394, 14.710192, 0);
setWaypoints(48.661670, 14.714312, 0);
setWaypoints(48.658950, 14.710192, 0);
setWaypoints(48.656227, 14.714312, 100);
setWaypoints(48.650783, 14.714312, 0);
setWaypoints(48.648060, 14.710192, 0);
setWaypoints(48.648060, 14.701952, 0);
setWaypoints(48.656227, 14.689592, 0);
setWaypoints(48.658950, 14.689592, 0);
setWaypoints(48.661670, 14.685472, 0);
setWaypoints(48.667114, 14.685472, 0);
setWaypoints(48.672558, 14.677233, 0);
setWaypoints(48.678005, 14.677233, 0);
setWaypoints(48.680725, 14.673113, 100);
setWaypoints(48.683448, 14.673113, 0);
setWaypoints(48.686168, 14.668993, 0);
setWaypoints(48.691616, 14.668993, 0);
setWaypoints(48.694336, 14.664873, 0);
setWaypoints(48.697059, 14.664873, 0);
setWaypoints(48.699779, 14.660753, 0);
setWaypoints(48.705227, 14.660753, 0);
setWaypoints(48.707946, 14.656633, 0);
setWaypoints(48.710670, 14.656633, 0);
setWaypoints(48.713390, 14.652514, 100);
setWaypoints(48.716114, 14.652514, 0);
setWaypoints(48.718834, 14.648394, 0);
setWaypoints(48.724281, 14.648394, 0);
setWaypoints(48.729725, 14.640154, 0);
setWaypoints(48.735168, 14.640154, 0);
setWaypoints(48.737892, 14.636034, 0);
setWaypoints(48.743335, 14.636034, 0);
setWaypoints(48.746055, 14.631914, 0);
setWaypoints(48.754223, 14.631914, 0);
setWaypoints(48.756946, 14.627794, 100);
setWaypoints(48.765110, 14.627794, 0);
setWaypoints(48.767833, 14.623674, 0);
setWaypoints(48.890327, 14.623674, 0);
setWaypoints(48.893051, 14.627794, 0);
setWaypoints(48.925716, 14.627794, 0);
setWaypoints(48.928440, 14.631914, 0);
setWaypoints(48.939327, 14.631914, 0);
setWaypoints(48.942051, 14.636034, 0);
setWaypoints(48.939327, 14.631914, 0);
setWaypoints(48.928440, 14.631914, 100);
setWaypoints(48.925716, 14.627794, 0);
setWaypoints(48.893051, 14.627794, 0);
setWaypoints(48.890327, 14.623674, 0);
setWaypoints(48.822277, 14.623674, 0);
setWaypoints(48.819553, 14.619555, 0);
setWaypoints(48.819553, 14.615435, 0);
setWaypoints(48.816833, 14.619555, 0);
setWaypoints(48.786888, 14.619555, 0);
setWaypoints(48.784168, 14.623674, 0);
setWaypoints(48.762390, 14.623674, 100);
setWaypoints(48.759666, 14.627794, 0);
setWaypoints(48.743335, 14.627794, 0);
setWaypoints(48.740612, 14.631914, 0);
setWaypoints(48.732444, 14.631914, 0);
setWaypoints(48.729725, 14.636034, 0);
setWaypoints(48.721557, 14.636034, 0);
setWaypoints(48.718834, 14.640154, 0);
setWaypoints(48.713390, 14.640154, 0);
setWaypoints(48.710670, 14.636034, 0);
setWaypoints(48.710670, 14.644274, 100);
setWaypoints(48.702503, 14.656633, 0);
setWaypoints(48.699779, 14.656633, 0);
setWaypoints(48.697059, 14.660753, 0);
setWaypoints(48.694336, 14.660753, 0);
setWaypoints(48.691616, 14.664873, 0);
setWaypoints(48.688892, 14.664873, 0);
setWaypoints(48.683448, 14.673113, 0);
setWaypoints(48.678005, 14.673113, 0);
setWaypoints(48.675281, 14.677233, 0);
setWaypoints(48.664394, 14.677233, 100);
setWaypoints(48.661670, 14.681353, 0);
setWaypoints(48.658950, 14.681353, 0);
setWaypoints(48.656227, 14.685472, 0);
setWaypoints(48.653503, 14.685472, 0);
setWaypoints(48.650783, 14.689592, 0);
setWaypoints(48.648060, 14.689592, 0);
setWaypoints(48.642616, 14.697832, 0);
setWaypoints(48.639892, 14.697832, 0);
setWaypoints(48.637172, 14.701952, 0);
setWaypoints(48.634449, 14.701952, 100);
setWaypoints(48.631729, 14.706072, 0);
setWaypoints(48.629005, 14.706072, 0);
setWaypoints(48.626281, 14.710192, 0);
setWaypoints(48.623562, 14.710192, 0);
setWaypoints(48.620838, 14.714312, 0);
setWaypoints(48.618118, 14.714312, 0);
setWaypoints(48.615394, 14.718431, 0);
setWaypoints(48.609951, 14.718431, 0);
setWaypoints(48.607227, 14.722551, 0);
setWaypoints(48.604507, 14.722551, 100);
setWaypoints(48.601783, 14.726671, 0);
setWaypoints(48.599064, 14.726671, 0);
setWaypoints(48.596340, 14.730791, 0);
setWaypoints(48.590896, 14.730791, 0);
setWaypoints(48.588173, 14.734911, 0);
setWaypoints(48.582729, 14.734911, 0);
setWaypoints(48.580005, 14.739031, 0);
setWaypoints(48.577285, 14.739031, 0);
setWaypoints(48.574562, 14.743151, 0);
setWaypoints(48.569118, 14.743151, 100);
setWaypoints(48.566398, 14.747271, 0);
setWaypoints(48.555507, 14.747271, 0);
setWaypoints(48.552787, 14.751390, 0);
setWaypoints(48.550064, 14.751390, 0);
setWaypoints(48.547340, 14.755510, 0);
setWaypoints(48.541897, 14.755510, 0);
setWaypoints(48.539177, 14.759630, 0);
setWaypoints(48.531009, 14.759630, 0);
setWaypoints(48.528286, 14.763750, 0);
setWaypoints(48.517399, 14.763750, 100);
setWaypoints(48.514675, 14.767870, 0);
setWaypoints(48.495620, 14.767870, 0);
setWaypoints(48.492901, 14.771990, 0);
setWaypoints(48.473846, 14.771990, 0);
setWaypoints(48.471122, 14.776110, 0);
setWaypoints(48.454788, 14.776110, 0);
setWaypoints(48.452068, 14.780230, 0);
setWaypoints(48.443901, 14.780230, 0);
setWaypoints(48.441181, 14.784349, 0);
setWaypoints(48.430290, 14.784349, 100);
setWaypoints(48.427570, 14.788469, 0);
setWaypoints(48.419403, 14.788469, 0);
setWaypoints(48.416679, 14.792589, 0);
setWaypoints(48.411235, 14.792589, 0);
setWaypoints(48.408512, 14.796709, 0);
setWaypoints(48.405792, 14.796709, 0);
setWaypoints(48.403068, 14.800829, 0);
setWaypoints(48.389457, 14.800829, 0);
setWaypoints(48.386738, 14.804949, 0);
setWaypoints(48.381294, 14.804949, 100);
setWaypoints(48.378570, 14.809069, 0);
setWaypoints(48.373127, 14.809069, 0);
setWaypoints(48.370403, 14.813189, 0);
setWaypoints(48.367683, 14.813189, 0);
setWaypoints(48.364959, 14.817308, 0);
setWaypoints(48.359516, 14.817308, 0);
setWaypoints(48.356792, 14.821428, 0);
setWaypoints(48.354072, 14.821428, 0);
setWaypoints(48.351349, 14.825548, 0);
setWaypoints(48.348629, 14.825548, 100);
setWaypoints(48.343181, 14.833788, 0);
setWaypoints(48.340461, 14.833788, 0);
setWaypoints(48.335018, 14.842028, 0);
setWaypoints(48.332294, 14.842028, 0);
setWaypoints(48.326851, 14.850267, 0);
setWaypoints(48.324127, 14.850267, 0);
setWaypoints(48.318683, 14.858507, 0);
setWaypoints(48.315963, 14.858507, 0);
setWaypoints(48.294185, 14.891466, 0);
setWaypoints(48.291462, 14.891466, 100);
setWaypoints(48.272407, 14.920305, 0);
setWaypoints(48.269684, 14.920305, 0);
setWaypoints(48.264240, 14.928545, 0);
setWaypoints(48.258796, 14.928545, 0);
setWaypoints(48.256076, 14.932665, 0);
setWaypoints(48.250629, 14.932665, 0);
setWaypoints(48.247909, 14.928545, 0);
setWaypoints(48.242466, 14.928545, 0);
setWaypoints(48.239742, 14.924425, 0);
setWaypoints(48.231575, 14.924425, 100);
setWaypoints(48.228855, 14.928545, 0);
setWaypoints(48.231575, 14.924425, 0);
setWaypoints(48.239742, 14.924425, 0);
setWaypoints(48.242466, 14.928545, 0);
setWaypoints(48.247909, 14.928545, 0);
setWaypoints(48.250629, 14.932665, 0);
setWaypoints(48.250629, 14.940905, 0);
setWaypoints(48.250629, 14.936785, 0);
setWaypoints(48.253353, 14.932665, 0);
setWaypoints(48.256076, 14.932665, 100);
setWaypoints(48.258796, 14.928545, 0);
setWaypoints(48.264240, 14.928545, 0);
setWaypoints(48.269684, 14.920305, 0);
setWaypoints(48.272407, 14.920305, 0);
setWaypoints(48.291462, 14.891466, 0);
setWaypoints(48.294185, 14.891466, 0);
setWaypoints(48.315963, 14.858507, 0);
setWaypoints(48.318683, 14.858507, 0);
setWaypoints(48.324127, 14.850267, 0);
setWaypoints(48.326851, 14.850267, 100);
setWaypoints(48.332294, 14.842028, 0);
setWaypoints(48.335018, 14.842028, 0);
setWaypoints(48.340461, 14.833788, 0);
setWaypoints(48.343181, 14.833788, 0);
setWaypoints(48.348629, 14.825548, 0);
setWaypoints(48.351349, 14.825548, 0);
setWaypoints(48.354072, 14.821428, 0);
setWaypoints(48.356792, 14.821428, 0);
setWaypoints(48.359516, 14.817308, 0);
setWaypoints(48.364959, 14.817308, 100);
setWaypoints(48.367683, 14.813189, 0);
setWaypoints(48.370403, 14.813189, 0);
setWaypoints(48.373127, 14.809069, 0);
setWaypoints(48.378570, 14.809069, 0);
setWaypoints(48.381294, 14.804949, 0);
setWaypoints(48.386738, 14.804949, 0);
setWaypoints(48.389457, 14.800829, 0);
setWaypoints(48.403068, 14.800829, 0);
setWaypoints(48.405792, 14.796709, 0);
setWaypoints(48.408512, 14.796709, 100);
setWaypoints(48.411235, 14.792589, 0);
setWaypoints(48.416679, 14.792589, 0);
setWaypoints(48.419403, 14.788469, 0);
setWaypoints(48.427570, 14.788469, 0);
setWaypoints(48.430290, 14.784349, 0);
setWaypoints(48.441181, 14.784349, 0);
setWaypoints(48.443901, 14.780230, 0);
setWaypoints(48.452068, 14.780230, 0);
setWaypoints(48.454788, 14.776110, 0);
setWaypoints(48.471122, 14.776110, 100);
setWaypoints(48.473846, 14.771990, 0);
setWaypoints(48.492901, 14.771990, 0);
setWaypoints(48.495620, 14.767870, 0);
setWaypoints(48.514675, 14.767870, 0);
setWaypoints(48.517399, 14.763750, 0);
setWaypoints(48.528286, 14.763750, 0);
setWaypoints(48.531009, 14.759630, 0);
setWaypoints(48.539177, 14.759630, 0);
setWaypoints(48.541897, 14.755510, 0);
setWaypoints(48.547340, 14.755510, 100);
setWaypoints(48.550064, 14.751390, 0);
setWaypoints(48.552787, 14.751390, 0);
setWaypoints(48.555507, 14.747271, 0);
setWaypoints(48.566398, 14.747271, 0);
setWaypoints(48.569118, 14.743151, 0);
setWaypoints(48.574562, 14.743151, 0);
setWaypoints(48.577285, 14.739031, 0);
setWaypoints(48.580005, 14.739031, 0);
setWaypoints(48.582729, 14.734911, 0);
setWaypoints(48.590896, 14.734911, 100);
setWaypoints(48.593616, 14.730791, 0);
setWaypoints(48.599064, 14.730791, 0);
setWaypoints(48.601783, 14.726671, 0);
setWaypoints(48.607227, 14.726671, 0);
setWaypoints(48.609951, 14.722551, 0);
setWaypoints(48.618118, 14.722551, 0);
setWaypoints(48.620838, 14.718431, 0);
setWaypoints(48.683448, 14.718431, 0);
setWaypoints(48.686168, 14.722551, 0);
setWaypoints(48.686168, 14.726671, 100);
setWaypoints(48.683448, 14.730791, 0);
setWaypoints(48.669838, 14.730791, 0);
setWaypoints(48.686168, 14.730791, 0);
setWaypoints(48.688892, 14.734911, 0);
setWaypoints(48.702503, 14.734911, 0);
setWaypoints(48.705227, 14.739031, 0);
setWaypoints(48.716114, 14.739031, 0);
setWaypoints(48.718834, 14.743151, 0);
setWaypoints(48.729725, 14.743151, 0);
setWaypoints(48.732444, 14.747271, 100);
setWaypoints(48.748779, 14.747271, 0);
setWaypoints(48.751503, 14.751390, 0);
setWaypoints(48.789611, 14.751390, 0);
setWaypoints(48.792331, 14.755510, 0);
setWaypoints(48.824997, 14.755510, 0);
setWaypoints(48.827720, 14.759630, 0);
setWaypoints(48.846775, 14.759630, 0);
setWaypoints(48.849498, 14.763750, 0);
setWaypoints(48.863109, 14.763750, 0);
setWaypoints(48.865829, 14.767870, 100);
setWaypoints(48.879440, 14.767870, 0);
setWaypoints(48.882164, 14.771990, 0);
setWaypoints(48.898494, 14.771990, 0);
setWaypoints(48.901218, 14.776110, 0);
setWaypoints(48.914829, 14.776110, 0);
setWaypoints(48.917549, 14.780230, 0);
setWaypoints(48.931160, 14.780230, 0);
setWaypoints(48.933883, 14.784349, 0);
setWaypoints(48.944770, 14.784349, 0);
setWaypoints(48.947494, 14.788469, 100);
setWaypoints(48.955661, 14.788469, 0);
setWaypoints(48.958381, 14.792589, 0);
setWaypoints(48.966549, 14.792589, 0);
setWaypoints(48.969268, 14.796709, 0);
setWaypoints(48.977436, 14.796709, 0);
setWaypoints(48.980159, 14.800829, 0);
setWaypoints(48.985603, 14.800829, 0);
setWaypoints(48.988327, 14.804949, 0);
setWaypoints(48.993770, 14.804949, 0);
setWaypoints(48.996490, 14.809069, 100);
setWaypoints(49.001938, 14.809069, 0);
setWaypoints(49.004657, 14.813189, 0);
setWaypoints(49.007381, 14.813189, 0);
setWaypoints(49.010101, 14.817308, 0);
setWaypoints(49.012825, 14.817308, 0);
setWaypoints(49.018268, 14.825548, 0);
setWaypoints(49.020992, 14.825548, 0);
setWaypoints(49.026436, 14.833788, 0);
setWaypoints(49.029155, 14.833788, 0);
setWaypoints(49.064544, 14.887346, 100);
setWaypoints(49.064544, 14.891466, 0);
setWaypoints(49.075432, 14.677233, 100);
setWaypoints(49.064544, 14.677233, 0);
setWaypoints(49.061821, 14.673113, 0);
setWaypoints(49.059101, 14.673113, 0);
setWaypoints(49.056377, 14.668993, 0);
setWaypoints(49.053657, 14.668993, 0);
setWaypoints(49.050934, 14.664873, 0);
setWaypoints(49.048214, 14.664873, 0);
setWaypoints(49.045490, 14.660753, 0);
setWaypoints(49.042766, 14.660753, 0);
setWaypoints(49.040046, 14.656633, 100);
setWaypoints(49.031879, 14.656633, 0);
setWaypoints(49.029155, 14.652514, 0);
setWaypoints(49.023712, 14.652514, 0);
setWaypoints(49.020992, 14.648394, 0);
setWaypoints(49.012825, 14.648394, 0);
setWaypoints(49.010101, 14.644274, 0);
setWaypoints(48.996490, 14.644274, 0);
setWaypoints(48.993770, 14.640154, 0);
setWaypoints(48.974716, 14.640154, 0);
setWaypoints(48.971992, 14.636034, 100);
setWaypoints(48.961105, 14.636034, 0);
setWaypoints(48.958381, 14.631914, 0);
setWaypoints(48.952938, 14.631914, 0);
setWaypoints(48.950214, 14.627794, 0);
setWaypoints(48.950214, 14.623674, 0);
setWaypoints(48.944770, 14.615435, 0);
setWaypoints(48.939327, 14.615435, 0);
setWaypoints(48.936603, 14.611315, 0);
setWaypoints(48.931160, 14.611315, 0);
setWaypoints(48.928440, 14.607195, 100);
setWaypoints(48.917549, 14.607195, 0);
setWaypoints(48.928440, 14.607195, 0);
setWaypoints(48.931160, 14.611315, 0);
setWaypoints(48.936603, 14.611315, 0);
setWaypoints(48.939327, 14.615435, 0);
setWaypoints(48.944770, 14.615435, 0);
setWaypoints(48.950214, 14.623674, 0);
setWaypoints(48.950214, 14.627794, 0);
setWaypoints(48.952938, 14.631914, 0);
setWaypoints(48.958381, 14.631914, 100);
setWaypoints(48.961105, 14.636034, 0);
setWaypoints(48.971992, 14.636034, 0);
setWaypoints(48.974716, 14.640154, 0);
setWaypoints(48.993770, 14.640154, 0);
setWaypoints(48.996490, 14.644274, 0);
setWaypoints(49.010101, 14.644274, 0);
setWaypoints(49.012825, 14.648394, 0);
setWaypoints(49.020992, 14.648394, 0);
setWaypoints(49.023712, 14.652514, 0);
setWaypoints(49.029155, 14.652514, 100);
setWaypoints(49.031879, 14.656633, 0);
setWaypoints(49.040046, 14.656633, 0);
setWaypoints(49.042766, 14.660753, 0);
setWaypoints(49.045490, 14.660753, 0);
setWaypoints(49.048214, 14.664873, 0);
setWaypoints(49.050934, 14.664873, 0);
setWaypoints(49.053657, 14.668993, 0);
setWaypoints(49.056377, 14.668993, 0);
setWaypoints(49.059101, 14.673113, 0);
setWaypoints(49.061821, 14.673113, 100);
setWaypoints(49.064544, 14.677233, 0);
setWaypoints(49.067268, 14.677233, 0);
setWaypoints(49.069988, 14.681353, 0);
setWaypoints(49.072712, 14.681353, 0);
setWaypoints(49.075432, 14.685472, 0);

    var endTime  = new Date();
    var interval = endTime - startTime;
    console.log(interval + "[ms]経過");
}

/* END FREEDOM CODE AREA */

google.maps.event.addDomListener(window, 'load', initialize);


























