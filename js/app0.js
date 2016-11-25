var locations = [
    {
      businessName: "Panera Bread",
      address: "1200 White Horse Rd, Voorhees Township, NJ 08043"
    },
    {
      businessName: "Chick fil A",
      address: "1170 White Horse Rd, Voorhees Township, NJ 08043"
    }
  ];

var Location = function(data) {
  this.businessName = ko.observable(data.businessName);
  this.address = ko.observable(data.address);
}

var viewModel = function(){
  var self = this;
  this.query = ko.observable('');
  this.locationList = ko.observableArray([]);
  locations.forEach(function(loc){
    self.locationList().push(new Location(loc));
  });
  codeAddress(self.locationList());
  this.query.subscribe(function(value) {
    // remove all the current beers, which removes them from the view
    self.locationList.removeAll();
    locations.forEach(function(loc){
      if(loc.businessName.toLowerCase().indexOf(value.toLowerCase()) >= 0 ||
      loc.address.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        self.locationList.push(new Location(loc));
      }
    });
    codeAddress(self.locationList());
  });
}
// viewModel.query.subscribe(viewModel.search);

var geocoder;
var map;

function initialize() {
  geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(-34.397, 150.644);
  var mapOptions = {
    zoom: 14,
    center: latlng
  }
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  // codeAddress(locations);
  ko.applyBindings(new viewModel());
}

function codeAddress(locationList) {
  // var address = document.getElementById('address').value;
  var markerList = [];
    locationList.forEach(function(loc){
    geocoder.geocode( { 'address': loc.address()}, function(results, status) {
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
