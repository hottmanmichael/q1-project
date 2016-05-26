'use strict';


(function() {

   var user = new User();
   // console.log("user authenticated: ", user.authenticate());

   //if a user does not yet exist, create one
   if (!user.authenticated()) {
      user.create();
   }

   //set up window user object for use throughout
   user.establish(user.fetchLocal('MODEL'));

   // console.log("user: ", user);

   //handle user input for artist search
   var artistSearch = document.getElementById('main-artist-search');
   var wait = window.setTimeout(handleSearch(null), 0);
   var waitTime = 250;
   artistSearch.addEventListener('keyup', handleUserInput);

   //dropdown underneath search bar for suggestions
   var searchDigest = document.querySelector('#artist-search .digest');
   // console.log("searchDigest: ", searchDigest);


   function handleUserInput(e) {
      if (e.target.value === '') {
         removeCurrentDigestArtists();
      } else {
         window.clearTimeout(wait);
         wait = setTimeout(function() {
            handleSearch(e.target.value);
         }, waitTime);
      }
   }

   function handleSearch(searchString) {
      if (searchString === null || searchString === '') return;
      var baseURI = "https://api.spotify.com/v1/search?";
      var type = '&type=artist';
      var start = "&offset=0";
      var limit = "&limit=8";
      var query = "query=" + searchString.replace(/(\s)/g, '%20');
      var fullPath = baseURI + query + start + limit + type;
      // https://api.spotify.com/v1/search?query=the%20grateful%20dead&offset=0&limit=20&type=artist

      /*
         FIXME: handle 400 error!
      */
      new Ajax('GET', fullPath, function(err, res) {
         // console.log("err: ", err);
         if (!err) {
            // console.log("SPOTIFY: ", res);
               removeCurrentDigestArtists();
               showArtists(res);
         } else handleResponseError(err);
      }, null);
   }

   function showArtists(data) {
      // console.log("DATA: ", data);
      if (data.artists.items.length > 0) {
         for (var artist = 0; artist < data.artists.items.length; artist++) {
            addArtistToDigest(data.artists.items[artist]);
         }
      } else addArtistToDigest(null);
   }

   function addArtistToDigest(artist) {
      var artistBox = document.createElement('div');
         artistBox.className = "artist-box";
         artistBox.hasArtist = false;
      var abox_name = document.createElement('h3');
         abox_name.className = "name";
      if (artist === null) {
         abox_name.innerHTML = "No artist found..."
      } else { // artist(s) exist(s)
         artistBox.hasArtist = true;
         artistBox.id = artist.id;
         artistBox.name = artist.name;
         //show artist name
         abox_name.innerHTML = artist.name;
         if (artist.images.length > 0) {
            var abox_photo = document.createElement('img');
               abox_photo.className = "thumbnail";
               abox_photo.style.backgroundColor = "rgb(106, 106, 106)";
               abox_photo.src = artist.images[0].url;
               abox_photo.alt = artist.name;
            artistBox.appendChild(abox_photo);
         }
      }

      //register event listener
      //and prevent bubbling
      artistBox.addEventListener('click', function(e) {
         handleSubmit(e, null);
      });

      //append all elements
      artistBox.appendChild(abox_name);
      searchDigest.appendChild(artistBox);
      setTimeout(function() {
         artistBox.classList.remove('fade');
      }, 10);
   }

   function removeCurrentDigestArtists() {
      while(searchDigest.children.length > 0) {
         searchDigest.firstChild.remove();
      }
   }


   function handleSubmit(e, searchString) {
      //ensure click is handled on parent element
      var target;
      if (e.target.children.length === 0) {
         //is child
         target = e.target.parentElement;
      } else target = e.target;
      // console.log("has artist: ", target.hasArtist);
      if (!target.hasArtist) return; //if no artist, do not route

      // console.log("id: ", target.id);
      // console.log("name: ", target.name.toLowerCase());
      // console.log("name: ", target);
      var artist = {
         id: target.id,
         name: target.name,
         slug: target.name.replace(/\s/g, '-').toLowerCase()
      }

      user.setLocal('CURRENT_ARTIST', artist);

      // console.log("FROM LOCAL: ", user.fetchLocal('CURRENT_ARTIST'));

      var dashboard = '/dashboard.html';
      var query = "?"+artist.slug;

      //handle route
      window.location.assign(dashboard + query);

   }


   function handleResponseError() {
      /** FIXME! **/
   }




})();
