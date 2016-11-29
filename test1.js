/**
   * Function ViewModel
   * @namespace ViewModel
   * @memberof mapApp
   */
  var ViewModel = function() {
    var self = this;
    /** build empty observable arrays to fill later */
    self.locationList = ko.observableArray([]);
    self.images = ko.observableArray([]);
    infowindow = new google.maps.InfoWindow({});

    /** this variable will be used in the search */
    self.query = ko.observable('');

    /** sort array so it will be in alphabetical order */
    initialLocations.sort(function(a,b) {return (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0);} );
    /** add a few default values */
    initialLocations.forEach(function(place){
      place.current = false;
      place.showInfo = false;
      /** map icon names for genre, to be used as css classes */
      var ico = "";
      switch(place.genre) {
        case 'food':
          ico = 'icon-spoon-knife';
          break;
      case 'bar':
        ico = 'icon-glass2';
        break;
      case 'lodging':
        ico = 'icon-bed';
        break;
      case 'nostalgia':
        ico = 'icon-quill';
        break;
      case 'bookstore':
        ico = 'icon-books';
        break;
      case 'misc':
        ico = 'icon-magnet';
        break;
      }
      place.genreIcon = ico;

      /** make each place an instance of location class */
      self.locationList.push(new Location(place));
    }, this);


    /** defaults for page first loading */
    self.currentLocation = ko.observable(this.locationList()[0]);
    self.typeToShow = ko.observable("all");


    /**
     * Function setCurrentLocation
     * @memberof mapApp.ViewModel
     * when a location is clicked on in the UI
    */
    this.setCurrentLocation = function(clickedLocation) {
      /** make sure other current location is not set to show as well in map */
      if (infowindow) {
        infowindow.close();
      }
      /** set the new current location */
      self.currentLocation(clickedLocation);
      reset_markers();
      self.currentLocation().current(true);
      self.currentLocation().showInfo(true);
      self.currentLocation().infoW.subscribe(function(newValue) {
      // this function will be called each time the value of infoW changed
        infowindow.setContent(newValue);
      });
      self.currentLocation().ajax();
    };

    /**
     * Function getImages
     * @memberof mapApp.ViewModel
     * get images that have been taken around the lat/long of current location
    */
    this.getImages = ko.computed(function() {
      self.images.removeAll();
      var lat = self.currentLocation().latitude;
      var long = self.currentLocation().longitude;
      var flickr_key = '0ba16f70231cf1f8e6b825dfa87343d2';
      var flickr_url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' +
      flickr_key + '&lat=' + lat + '&lon=' + long + '&radius=1&page'+
      '=0&per_page=5&format=json&nojsoncallback=1';
      /** grab a page of images from flickr. for each image, build up a
        url for an img src, then push that to the observable images array*/
      $.ajax({
        type: "GET",
        url: flickr_url})
        .done (function(data){
        $(data.photos.photo).each(function(i,item){
          var src = "https://farm"+ item.farm +".static.flickr.com/"+ item.server +
          "/"+ item.id +"_"+ item.secret +"_m.jpg";
          self.images.push(src);
        });
      })
      .fail (function(){
        $('#flickr_imgs').append("<em>Temporarily unable to pull from the flickr API</em>");
      });
    });

    /**
     * Function locationsToShow
     * @memberof mapApp.ViewModel
     * show the list of locations on the UI
    */
    this.locationsToShow = ko.pureComputed(function() {
      /** begin a new empty array to help filter locations */
      locations = this.locationList();
      /** first set all to false, then
       after filtering locations, set to true */
      locations.forEach(function(location) {
        location.marker.setVisible(false);
      });
      /** get search term from UI */
      var search = this.query().toLowerCase();
      /** if any search term, look for it within list */
      if (search) {
        locations = ko.utils.arrayFilter(locations, function(locale){
          return (locale.title.toLowerCase().indexOf(search) >= 0);
      });
    }

    /** get proper genre to show from radio buttons on UI. filter based on that */
    var desiredType = this.typeToShow();
    if (desiredType && desiredType != 'all'){
      locations =  ko.utils.arrayFilter(locations, function(locale) {
        return locale.genre === desiredType;
      });
    }

    locations.forEach(function(location){
      location.marker.setVisible(true);
      /** when a maker is clicked on in google maps */
      location.marker.addListener('click', function(){
        reset_markers();
        self.currentLocation(location);
        location.current(true);
        location.showInfo(true);
        location.ajax();
      });
    });

    /** return filtered list of locations */
    return locations;
  }, this);
};

/**
 * Function reset_markers
 * close info descriptions and put marker color back to default red
*/
function reset_markers(){
  var all = vm.locationList();
  all.forEach(function(location) {
    location.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
    location.current(false);
    location.showInfo(false);
  });
}

/**
 * Function setTimeout
 * error message if google maps doesn't load in a certain amount of time
*/
setTimeout(function(){
 if(!window.google || !window.google.maps) {
    $('#map').html('<span class="error">Our apologies, Google Maps isn\'t' +
       'working at the moment for us</span>');
  }
}, 1000);

var vm = new ViewModel();
  ko.applyBindings(vm);
}
