var locations = [
    {
      businessName: "Panera Bread",
      address: "1200 White Horse Rd, Voorhees Township, NJ 08043"
    },
    {
      businessName: "Chick-fil-A",
      address: "1170 White Horse Rd, Voorhees Township, NJ 08043"
    }
  ];

var viewModel = function(){
  this.name = ko.observable(name);
}


function initialize() {
  geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(-34.397, 150.644);
  var mapOptions = {
    zoom: 8,
    center: latlng
  }
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  codeAddress();
}

function codeAddress() {
  // var address = document.getElementById('address').value;
  var markerList = [];
  locations.forEach(function(loc){
    alert(loc);
    geocoder.geocode( { 'address': loc.address}, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  })
}

ko.applyBindings(new viewModel());
