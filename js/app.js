var locations = [
    {
      businessName: "Umai Umai",
      address: "533 N 22nd St, Philadelphia, PA",
      category: "Food",
      lat: 39.965,
      lng: -75.174
    },
    {
      businessName: "Cantina Dos Segundos",
      address: "931 N 2nd St, Philadelphia, PA",
      category: "Food",
      lat: 39.965,
      lng: -75.140
    },
    {
      businessName: "Jones",
      address: "700 Chestnut St, Philadelphia, PA",
      category: "Food",
      lat: 39.949,
      lng: -75.153
    },
    {
      businessName: "Beiler's Doughnuts",
      address: "51 N 12th St, Philadelphia, PA",
      category: "Coffee",
      lat: 39.953,
      lng: -75.159
    },
    {
      businessName: "Elixr Coffee Roasters",
      address: "207 S Sydenham St, Philadelphia, PA",
      category: "Coffee",
      lat: 39.949,
      lng: -75.167
    },
    {
      businessName: "The Franklin Bar",
      address: "112 S 18th St, Philadelphia, PA",
      category: "Pubs",
      lat: 39.951,
      lng: -75.171
    },
    {
      businessName: "Yards Brewing Company",
      address: "901 N Delaware Ave, Philadelphia, PA",
      category: "Pubs",
      lat: 39.963,
      lng: -75.136
    },
    {
      businessName: "Bottle Bar East",
      address: "1308 Frankford Ave, Philadelphia, PA",
      category: "Pubs",
      lat: 39.970,
      lng: -75.135
    },
    {
      businessName: "Union Transfer",
      address: "1026 Spring Garden St, Philadelphia, PA",
      category: "Entertainment",
      lat: 39.961,
      lng: -75.155
    },
    {
      businessName: "Philadelphia Museum of Art",
      address: "2600 Benjamin Franklin Pkwy, Philadelphia, PA",
      category: "Entertainment",
      lat: 39.966,
      lng: -75.181
    },
    {
      businessName: "The Fillmore",
      address: "29 E Allen St, Philadelphia, PA",
      category: "Entertainment",
      lat: 39.966,
      lng: -75.137
    }
  ];

var viewModel = function(){
  var self = this;
  this.locationList = ko.observableArray([]);
  locations.forEach(function(data){
    self.locationList.push(data);
  });
  this.query = ko.observable('');
  addMarkers(self.locationList());
  this.query.subscribe(function(value){
    self.locationList.removeAll();
    locations.forEach(function(loc){
      if(loc.businessName.toLowerCase().indexOf(value.toLowerCase()) >= 0 ||
      loc.address.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        self.locationList.push(loc);
      }
    });
    clearMarkers();
    deleteMarkers();
    addMarkers(self.locationList());
  });
}

var geocoder;
var map;
var markers = [];
var contentString = '<div id="content">'+
    '<div id="siteNotice">'+
    '</div>'+
    '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
    '<div id="bodyContent">'+
    '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
    'sandstone rock formation in the southern part of the '+
    'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
    'south west of the nearest large town, Alice Springs; 450&#160;km '+
    '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
    'features of the Uluru - Kata Tjuta National Park. Uluru is '+
    'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
    'Aboriginal people of the area. It has many springs, waterholes, '+
    'rock caves and ancient paintings. Uluru is listed as a World '+
    'Heritage Site.</p>'+
    '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
    'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
    '(last visited June 22, 2009).</p>'+
    '</div>'+
    '</div>';
var infowindow;

function initMap(){
     infowindow = new google.maps.InfoWindow({
      content: contentString
    });
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var mapOptions = {
      zoom: 13,
      center: latlng
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    ko.applyBindings(new viewModel());
}

function findLocationCoordinates(){
  geocoder = new google.maps.Geocoder();
  locations.forEach(function(loc){
    geocoder.geocode( { 'address': loc.address}, function(results, status) {
      if (status == 'OK') {
        alert(loc.businessName + "," + results[0].geometry.location);
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  });
};

function addMarkers(locationList){
    locationList.forEach(function(loc){
          var myLatLng = {lat: loc.lat, lng: loc.lng};
          map.setCenter(myLatLng);
          var marker = new google.maps.Marker({
              position: myLatLng,
              map: map,
              animation: google.maps.Animation.DROP
          });
          marker.addListener('click', toggleBounce);
          marker.addListener('click', function(){
            infowindow.open(map, marker);
          });
          markers.push(marker);
      });
  }

  function toggleBounce(){
    var self = this;
    if (this.getAnimation() !== null){
      this.setAnimation(null);
    } else {
      this.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){
        self.setAnimation(null);
      }, 2500)
    }
  }


// Set map object on all the markers
function setMapOnAll(map){
  markers.forEach(function(marker){
    marker.setMap(map);
  });
}

// Show all the markers on the map by setting map object
function showMarkers(){
  setMapOnAll(map);
}

// Function to clear markers on the map by setting map to null on all markers
function clearMarkers(){
  setMapOnAll(null);
}

//clear marker on the map and delete it
function deleteMarkers() {
  clearMarkers();
  markers = [];
}
