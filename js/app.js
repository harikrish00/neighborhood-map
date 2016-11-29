// Sidebar nav, jquery ui selectable
$(function() {
    $("#selectable").selectable();
});

// Global variables
var geocoder;
var map;
var infowindow;
var vm;
var client_id = 'QPNBJRUTQQUWJ320EPK5KSQK3NOUKLIGG2WM2F2AYLVV0XYI';
var client_secret = 'RYENOEUHWVDNZ2VPCOT1UXDV3I4EHRW5YPEKQG40U2WMV0TK';
var contentString = '';
var markers = [];
var redIconUrl = 'https://www.google.com/mapfiles/marker.png';
var greenIconUrl = 'https://www.google.com/mapfiles/marker_green.png';

// callback method to google map api to initiate the map
function initMap() {
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var mapOptions = {
        zoom: 13,
        center: latlng
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    vm = new ViewModel();
    infowindow = new google.maps.InfoWindow({
        content: ''
    });
    ko.applyBindings(vm);
}

// Model data, contains all the locations
var locations = [{
    businessName: "Umai Umai",
    address: "533 N 22nd St, Philadelphia, PA",
    category: "Food",
    lat: 39.965,
    lng: -75.174
}, {
    businessName: "Cantina Dos Segundos",
    address: "931 N 2nd St, Philadelphia, PA",
    category: "Food",
    lat: 39.965,
    lng: -75.140
}, {
    businessName: "Jones",
    address: "700 Chestnut St, Philadelphia, PA",
    category: "Food",
    lat: 39.949,
    lng: -75.153
}, {
    businessName: "Beiler's Doughnuts",
    address: "51 N 12th St, Philadelphia, PA",
    category: "Coffee",
    lat: 39.953,
    lng: -75.159
}, {
    businessName: "Elixr Coffee Roasters",
    address: "207 S Sydenham St, Philadelphia, PA",
    category: "Coffee",
    lat: 39.949,
    lng: -75.167
}, {
    businessName: "Tria",
    address: "123 S 18th St, Philadelphia, PA 19103",
    category: "Pubs",
    lat: 39.951,
    lng: -75.171
}, {
    businessName: "Yards Brewing Company",
    address: "901 N Delaware Ave, Philadelphia, PA",
    category: "Pubs",
    lat: 39.963,
    lng: -75.136
}, {
    businessName: "Bottle Bar East",
    address: "1308 Frankford Ave, Philadelphia, PA",
    category: "Pubs",
    lat: 39.970,
    lng: -75.135
}, {
    businessName: "Union Transfer",
    address: "1026 Spring Garden St, Philadelphia, PA",
    category: "Entertainment",
    lat: 39.961,
    lng: -75.155
}, {
    businessName: "Philadelphia Museum of Art",
    address: "2600 Benjamin Franklin Pkwy, Philadelphia, PA",
    category: "Entertainment",
    lat: 39.966,
    lng: -75.181
}, {
    businessName: "The Fillmore",
    address: "29 E Allen St, Philadelphia, PA",
    category: "Entertainment",
    lat: 39.966,
    lng: -75.137
}];

/**
* @description Represents a Location
* @constructor
* @param {object} data - location object literal
*/
var Location = function(data) {
    var self = this;
    this.businessName = data.businessName;
    this.address = data.address;
    this.category = data.category;
    this.latlng = {
        lat: data.lat,
        lng: data.lng
    };
    this.marker = new google.maps.Marker({
        position: this.latlng,
        map: map,
        animation: google.maps.Animation.DROP,
        icon: redIconUrl
    });
    this.marker.addListener('click', function() {
        resetMarkerIcon();
        setGreenIcon(this);
        self.buildInfo();
    });
    this.marker.setVisible(true);
    markers.push(this.marker);
    //Glyphicon classes computed dynamically
    this.glyphicon = ko.computed(function() {
        switch (self.category) {
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
};

/* prototype function shared by all the location objects to build info about the
 locations stored */
Location.prototype.buildInfo = function(marker) {
    var self = this;
    var picSize = '250x250';
    var latlng = this.latlng.lat + ',' + this.latlng.lng;
    var venueSearchUrl = `https://api.foursquare.com/v2/venues/search?ll=${latlng}` +
    '&client_id=' + client_id + '&client_secret=' + client_secret + '&v=20161125';
    var venuePhotoUrl = 'https://api.foursquare.com/v2/venues/{{venue_id}}' +
    '/photos?client_id=' + client_id + '&client_secret=' + client_secret + '&v=20161125';

    var venueLinksUrl = 'https://api.foursquare.com/v2/venues/{{venue_id}}' +
    '/links?client_id=' + client_id + '&client_secret=' + client_secret + '&v=20161125';

    var linksHref = '';
    //Ajax api call to fetch the venue information
    $.ajax({
        url: venueSearchUrl
    }).done(function(msg) {
        venues = msg.response.venues;
        venues.forEach(function(venue) {
            if (venue.name.toLowerCase() === self.businessName.toLowerCase()) {
                venuePhotoUrl = venuePhotoUrl.replace(/{{venue_id}}/g, venue.id);
                venueLinksUrl = venueLinksUrl.replace(/{{venue_id}}/g, venue.id);
                contentString = '<div id="content">' +
                    '<div id="siteNotice">' +
                    '</div>' +
                    '<h3 id="firstHeading" class="firstHeading">' +
                    `${self.businessName}</h3>` +
                    '<div style="color: grey; font-size: 14px;">' +
                    `${venue.categories[0].name}</div>` +
                    '<div id="bodyContent">';
                //Ajax api call to fetch the photoUrl and other information
                $.ajax({
                    url: venuePhotoUrl
                }).done(function(msg) {
                    var photo = msg.response.photos.items[0];
                    var photoUrl = photo.prefix + picSize + photo.suffix;
                    var photoHtml = `<img src="${photoUrl}" alt="restaurant pic" /><br><br>`;
                    infowindow.setContent(contentString + photoHtml);
                    self.getVenueUrl(venueLinksUrl);
                }).fail(function(jqXHR, exception) {
                    self.failInfoWindow();
                });
            }
        });
    }).fail(function(jqXHR, exception) {
        self.failInfoWindow();
    });

    this.getVenueUrl = function(venueLinksUrl) {
        $.ajax({
            url: venueLinksUrl
        }).done( function(msg){
            var links = msg.response.links.items;
            if (links.length) {
                linksHref = `<div><a href=${links[0].url}>${links[0].url}</a></div>`;
            } else {
                linksHref = "<strong>No links available for this location</strong>";
            }
            infowindow.setContent(infowindow.getContent() + linksHref +
            '</div><br><strong>Powered by Foursquare API</strong></div>');
            self.openInfoWindow();
        }).fail( function (jqXHR, exception) {
            self.failInfoWindow();
        });
    };

    // Show the user an error message incase the api call fails
    this.failInfoWindow = function() {
        contentString = '<div id="content">' +
            '<div id="siteNotice">' +
            '</div>' +
            `<h3 id="firstHeading" class="firstHeading">${self.businessName}</h3>` +
            '<div id="bodyContent">' +
            '<strong style="color:red;">' +
            'Something went wrong, please try again later</strong>' +
            '</div></div>';
        infowindow.setContent(contentString);
        self.openInfoWindow();
    };

    // Show the user successful content about the locations
    this.openInfoWindow = function() {
        infowindow.open(map, self.marker, self);
    };
};

/**
 * Function ViewModel
 * @description View model which connects the application together
 * @namespace ViewModel
 */
function ViewModel() {
    var self = this;
    // Reset the markers and show all the markers on the map
    this.resetLocation = function() {
        locations.forEach(function(data) {
            self.locationList.push(new Location(data));
        }, this);
    };

    // Upon selecting the location from the sidebar, show info window and animation
    this.showInfoWindow = function() {
        if (infowindow) {
            infowindow.close();
        }
        resetMarkerIcon();
        toggleBounce(this.marker);
        setGreenIcon(this.marker);
        this.buildInfo();
    };

    this.locationList = ko.observableArray([]);

    this.resetLocation();
    this.query = ko.observable('');
    this.filter = ko.observable('All');
    this.filterLocations = ko.pureComputed( function () {
        var locationList = self.locationList();

        if (self.filter() === 'All' && self.query() === '') {
            return self.locationList();
        } else if (self.filter() !== 'All' && self.query() === ''){
            return ko.utils.arrayFilter(locationList, function(loc) {
                return loc.category === self.filter();
            });
        }

        if (self.query() !== ''){
            return ko.utils.arrayFilter(locationList, function(loc) {
                return loc.businessName.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
            });
        }

        // if (self.query() !== '' || self.filter() !== 'All'){
        //     self.locationList().forEach( function(loc){
        //         loc.marker.setVisible(false);
        //     });
        //     locationList.forEach(function(loc){
        //         loc.marker.setVisible(true);
        //     });
        // }

    });

    // this.filterLocations().forEach( function(loc) {
    //     loc.marker.setVisible(true);
    // });

    // // Live search queries and updating view with the filter
    // this.query.subscribe(function(value) {
    //     self.queryFilter = true;
    //     self.clearMarkers();
    //     self.locationList.removeAll();
    //     locations.forEach(function(loc) {
    //         if (loc.businessName.toLowerCase().indexOf(value.toLowerCase()) >= 0 ||
    //             loc.address.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
    //             self.locationList.push(new Location(loc));
    //         }
    //     });
    //     self.showMarkers();
    // });
}

// Toggle bounce for the markers when location is selected from the sidebar
function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1400);
    }
}

// Reset marker icons to default one
function resetMarkerIcon(){
    markers.forEach(function (marker) {
        marker.setIcon(redIconUrl);
    });
}

// Set marker icon to green when someone clicks on it
function setGreenIcon(marker){
    marker.setIcon(greenIconUrl);
}
