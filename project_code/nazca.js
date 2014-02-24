function setMarker(float Lat, float Long){

	var markerLatitude = new google.maps.LatLng(Lat, Long);        
    
    var marker = new google.maps.Marker({
    	osition: markerLatitude,
      	map: map,
      	title: 'Hello World!'
  	});        
}

//setMarker(-34.397, 150.644);

function calcRoute() {
  var start = new google.maps.LatLng(41.850033, -87.6500523);
  var end = new google.maps.LatLng(45.850033, -90.6500523);
  var request = {
      origin:start,
      destination:end,
      travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    }
  });
}

calcRoute();