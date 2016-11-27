var geocoder;
var map;
var infowindow;
var vm;
var client_id = 'QPNBJRUTQQUWJ320EPK5KSQK3NOUKLIGG2WM2F2AYLVV0XYI';
var client_secret = 'RYENOEUHWVDNZ2VPCOT1UXDV3I4EHRW5YPEKQG40U2WMV0TK';
var contentString = '';

function initMap(){
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var mapOptions = {
      zoom: 13,
      center: latlng
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    vm = new ViewModel();
    ko.applyBindings(vm);
}

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

var markers = [];
var Location = function(data){
  var self = this;
  this.businessName = data.businessName;
  this.address = data.address;
  this.category = data.category;
  this.latlng = { lat: data.lat, lng: data.lng };
  this.marker = new google.maps.Marker({
      position: this.latlng,
      map: map,
      animation: google.maps.Animation.DROP
  });
  this.marker.addListener('click', toggleBounce);
  this.marker.addListener('click', function(){
    self.buildInfo();
  });
  this.glyphicon = ko.computed(function() {
    switch(self.category){
      case "Food":
        return "glyphicon glyphicon-cutlery";
      case "Coffee":
        return "glyphicon glyphicon-barcode";
      case "Pubs":
        return "glyphicon glyphicon-glass";
      case "Entertainment":
        return "glyphicon glyphicon-music";
      default:
        return "glyphicon glyphicon-map-marker";
    }
  });
  markers.push(this.marker);
}


Location.prototype.buildInfo = function(marker){
  var self = this;
  var picSize = '250x250';
  var latlng = this.latlng.lat + ',' + this.latlng.lng
  var venue_search_url = `https://api.foursquare.com/v2/venues/search?ll=${latlng}&client_id=` +
  client_id + '&client_secret=' + client_secret + '&v=20161125';
  console.log(venue_search_url);

  var venue_photo_url = 'https://api.foursquare.com/v2/venues/{{venue_id}}' +
  '/photos?client_id=' + client_id + '&client_secret=' + client_secret + '&v=20161125';

  $.ajax({
    url: venue_search_url
  }).done( function ( msg ) {
    venues = msg.response.venues;
    venues.forEach(function (venue) {
      if(venue.name.indexOf(self.businessName) >= 0){
        venue_photo_url = venue_photo_url.replace(/{{venue_id}}/g,venue.id);
        $.ajax({
          url: venue_photo_url
        }).done( function (msg) {
          var photo = msg.response.photos.items[0];
          var photo_url = photo.prefix + picSize + photo.suffix;
          contentString = '<div id="content">'+
              '<div id="siteNotice">'+
              '</div>'+
              `<h3 id="firstHeading" class="firstHeading">${self.businessName}</h3>`+
              `<div style="color: grey; font-size: 14px;">${venue.categories[0].name}</div>` +
              '<div id="bodyContent">'+
              `<img src="${photo_url}" alt="restaurant pic" />` +
              '</div>'+
              '</div>';
              infowindow = new google.maps.InfoWindow({
               content: contentString
              });
              infowindow.open(map, self.marker, self);
        })
      }
    })
  });

 }

var categories = ['All','Entertainment','Pubs','Coffee','Food']

function ViewModel(){
  var self = this;
  this.setMapOnAll = function(map) {
    self.locationList().forEach(function(loc){
      loc.marker.setMap(map);
    });
  }

  // Show all the markers on the map by setting map object
  this.showMarkers = function() {
    map.setCenter({lat: 39.953, lng: -75.140});
    self.setMapOnAll(map);
  }

  // Function to clear markers on the map by setting map to null on all markers
  this.clearMarkers = function(){
    self.setMapOnAll(null);
    markers = [];
  }

  this.resetLocation = function(){
    locations.forEach(function(data){
      self.locationList.push(new Location(data));
    }, this);
    self.showMarkers();
  };

  this.locationList = ko.observableArray([]);
  this.filter = ko.observable('Test');

  this.resetLocation();
  this.query = ko.observable('');
  this.filter = ko.observable('All');
  this.filter.subscribe(function(value){
    if(value !== 'All'){
      self.clearMarkers();
      self.locationList.removeAll();
      locations.forEach(function(loc){
        if(loc.category.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
          self.locationList.push(new Location(loc));
        }
      });
      self.showMarkers();
    } else {
      self.resetLocation();
    }
  });

  this.query.subscribe(function(value){
    self.clearMarkers();
    self.locationList.removeAll();
    locations.forEach(function(loc){
      if(loc.businessName.toLowerCase().indexOf(value.toLowerCase()) >= 0 ||
      loc.address.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        self.locationList.push(new Location(loc));
      }
    });
    self.showMarkers();
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
