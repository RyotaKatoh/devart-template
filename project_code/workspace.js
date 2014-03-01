
var directionsService = new google.maps.DirectionsService();
var map;

var directionDisplays = [];
var numDirectionDisplays;

var route = [];

var testDirectionRenderer;
var directionRendererArray = [];

// initialize map
                            
function initialize() {
	
    /* polyline style */
    var polylineOptionsActual = new google.maps.Polyline({
        strokeColor: '#FF0000',
    	//strokeOpacity: 1.0,
		//strokeWeight: 10
	});

    
    /* directionDisplay is the variable of DirectionRenderer. */
    
  
    var mapCenter = new google.maps.LatLng(36.015782,139.657774);
    var mapOptions = {
        zoom:9,
        center: mapCenter,
        disableDefaultUI: true
    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    
    
    testDirectionRenderer = new google.maps.DirectionsRenderer({
	
        suppressMarkers: true,
        //polylineOptions: polylineOptionsActual
        preserveViewport: true
    });
    testDirectionRenderer.setMap(map);
    
    for(var i=0;i<100;i++){
    
        directionRendererArray[i] = new google.maps.DirectionsRenderer({
	
            suppressMarkers: true,
            //polylineOptions: polylineOptionsActual
            preserveViewport: true
        });
        directionRendererArray[i].setMap(map);
        
    }
    
    /* set event listener */
    google.maps.event.addListener(map, 'click', function(event) {

        
        route.push({
        
            location:event.latLng
            
        });

        
        drawMultipleDirection();
        
        
        
    })
    
}

var directions      = [];
var renderers       = [];
var numDirections   = 0;


function drawMultipleDirection(){

    var maxNumDots = 9; //最大10個の点が打てる
    
    var numRenderer = parseInt(route.length / maxNumDots) + 1;
    
    
    for(var i=0;i<numRenderer;i++){
    
        var start, end;
        
        start = route[maxNumDots*i].location;

        
        if(i != numRenderer -1){
        
            end = route[maxNumDots*i + maxNumDots ].location;
        
        }
        else{
        
            end = route[route.length - 1].location; 
        }
        
        var waypoints = []
        
        if(i != numRenderer -1){
            for(var w=maxNumDots*i + 1;w<(maxNumDots*i + maxNumDots)-1;w++){
        
                waypoints.push({
                    location: route[w].location,
                    stopover: true
                });
            
            }
        }
        
        else{
        
            for(var w=maxNumDots*i + 1;w<route.length -1;w++){
            
                waypoints.push({
                    location: route[w].location,
                    stopover: true
                });
            }
        }
        
        
        // 2014/02/24 TODO  requestを作ってdrawRendererクラスに引き渡す
        var request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING,
            waypoints: waypoints,
            optimizeWaypoints: true
        }

//                    var newRenderer = new google.maps.DirectionsRenderer({
//	
//                suppressMarkers: true,
//                //polylineOptions: polylineOptionsActual
//                preserveViewport: true
//            });
//        newRenderer.setMap(map);
//        if(numDirections < numRenderer){
//            
////            var newRenderer = new google.maps.DirectionsRenderer({
////	
////                suppressMarkers: true,
////                //polylineOptions: polylineOptionsActual
////                preserveViewport: true
////            });
//            
//            //newRenderer.setMap(map);
////            renderers.push(request, newRenderer);
//        
//            numDirections++;
//        }
//        
        
        directionsService.route(request, function(response, status) {
        
        if (status == google.maps.DirectionsStatus.OK) {
    
            console.log("status is OK");
         
            directionRendererArray[i].setDirections(response);
            
            console.log("draw?");
        
        }
        
        else{
    
            console.log(status);
        }
        
    });
        
        //draw(renderers[i]);
        
//        else{
//            
//            directions[i].setRequest(request);
//            
//            directions[i].draw();
//        }
        
        
    }

    
}


var drawDirection = function(request){
    
    this.request = request;
    
    this.test = 342354;

}

drawDirection.prototype.getTest = function(){

    return (this.test);
}

drawDirection.prototype.getRequest = function(){

    return (this.request);
}

drawDirection.prototype.setRequest = function(request){

    this.request = request;
    
}

drawDirection.prototype.setDirection = function(){

    this.rend = new google.maps.DirectionsRenderer({
	
        suppressMarkers: true,
        //polylineOptions: polylineOptionsActual
        preserveViewport: true
    });
    
}

drawDirection.prototype.drawDirection = function(){

    console.log(this.request);
}

drawDirection.prototype.draw = function(renderer){
    
    directionsService.route(this.request, function(response, status) {
        

        if (status == google.maps.DirectionsStatus.OK) {
    
            console.log("status is OK");
         
            //renderer.setDirections(response);
            
           // console.log("draw?");
        
        }
        
        else{
    
            console.log(status);
        }
        
        
    });
}

function draw(request, renderer){

    directionsService.route(request, function(response, status) {
        
        if (status == google.maps.DirectionsStatus.OK) {
    
            console.log("status is OK");
         
            renderer.setDirections(response);
            
            console.log("draw?");
        
        }
        
        else{
    
            console.log(status);
        }
        
    });
}

google.maps.event.addDomListener(window, 'load', initialize);
