   
var directionsDisplay;
var directionsDisplay2;
var directionsService = new google.maps.DirectionsService();
var map;

var directionDisplays = [];
var numDirectionDisplays;

var route = [];

var separatePoint;
var separateFlag;

// initialize map

function initialize() {
	
    /* polyline style */
    var polylineOptionsActual = new google.maps.Polyline({
        strokeColor: '#FF0000',
    	//strokeOpacity: 1.0,
		//strokeWeight: 10
	});

    
    /* directionDisplay is the variable of DirectionRenderer. */
    
    directionsDisplay = new google.maps.DirectionsRenderer({
	
        suppressMarkers: true,
        //polylineOptions: polylineOptionsActual
        preserveViewport: true
    });
  
  
    /* you can draw multiple direction.*/
    directionsDisplay2 = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        preserveViewport: true
    });
    
    /* I add DirectionsRenderer array */
    directionDisplays.push({
        directionRenderer: directionsDisplay
    });
    numDirectionDisplays = 0;
    
  
    separatePoint = 0;
    separateFlag  = false;
  
    var mapCenter = new google.maps.LatLng(36.015782,139.657774);
    var mapOptions = {
        zoom:9,
        center: mapCenter,
        disableDefaultUI: true
    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    
    /* set map to directionDisplays. */
    directionsDisplay.setMap(map);
    directionsDisplay2.setMap(map);
    
    
    /* set initial route */
    route.push({
        location: "Tokyo"
    });
    
    
    /* set event listener */
    google.maps.event.addListener(map, 'click', function(event) {
        console.log(event.latLng);
        
        route.push({
            location: event.latLng
        });
        
        calcTotallRoute();
        
    });
    
}


function calcTotallRoute(){
   
    
    if(separateFlag){
    
        separateFlag = false;
        
        separatePoint = separatePoint + 9;
        
        var tmpDisplay = new google.maps.DirectionsRenderer({
	
            suppressMarkers: true,
            //polylineOptions: polylineOptionsActual
            preserveViewport: true
            
        });
        
        directionDisplays.push({
        
            directionRenderer: tmpDisplay
            
        });  
        
        numDirectionDisplays ++;
        
        
    }
    
    var start = route[separatePoint].location;
    
    var end   = route[route.length - 1].location;
    
    var waypoint = [];
    var numWaypoints = 0;
    
    while((numWaypoints + separatePoint) < ((route.length - 1)  - separatePoint)){

        waypoint.push({
            location: route[separatePoint + numWaypoints].location,
            stopover: true
        });
        
        numWaypoints ++;
        if(numWaypoints > 9){
            separateFlag = true;
        }
    }
    
    
    var request = {
        origin:start,
        destination:end,
        travelMode: google.maps.TravelMode.DRIVING,
        waypoints: waypoint,
        optimizeWaypoints: true
    }

    directionsService.route(request, function(response, status) {
        
        if (status == google.maps.DirectionsStatus.OK) {
            //directionsDisplay.setDirections(response);
        
            console.log(numDirectionDisplays);
            directionDisplays[numDirectionDisplays].directionRenderer.setDirections(response);
        
        }
        
        
    });
    
}


function draw(){

    
}

/*
function calcRoute() {
    var start = "Tokyo";
    var end = "Maebashi";
  
    var waypoint = [];
    waypoint.push({
        location: "Utsunomiya",
        stopover: true
    });
  
    waypoint.push({
        location: "Ooarai",
        stopover: true
    });
  
    
    var request = {
        origin:start,
        destination:end,
        travelMode: google.maps.TravelMode.DRIVING,
        waypoints: waypoint,
        optimizeWaypoints: true
    };
    
    
    directionsService.route(request, function(response, status) {
        
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        }
    });
  
  
    var start2 = "Yokohama";
    var end2 = "Kamakura";
  
    var req2 = {
        origin: start2,
        destination: end2,
        travelMode: google.maps.TravelMode.DRIVING
    };
  
    directionsService.route(req2, function(response, status){
        if(status == google.maps.DirectionsStatus.OK){
            directionsDisplay2.setDirections(response);
    }
    })
}
*/



google.maps.event.addDomListener(window, 'load', initialize);


