'use strict';

(function() {

   var user = new User();
   if (typeof localStorage.groupie === 'undefined') {
      localStorage.groupie = JSON.stringify(user);
   } else {

   }
   console.log("User: ", user);

   //setup request
      //see Ajax.js file for requests
   // var spotifyRequest = new Ajax().request;

   //handle user input for artist search
   var artistSearch = document.getElementById('main-artist-search');
   var wait = window.setTimeout(handleSearch(null), 0);
   artistSearch.addEventListener('keyup', handleUserInput);

   //dropdown underneath search bar for suggestions
   var searchDigest = document.querySelector('#artist-search .digest');
   console.log("searchDigest: ", searchDigest)


   function handleUserInput(e) {
      if (e.target.value === '') {
         removeCurrentDigestArtists();
      } else {
         if (e.charCode === 13 || e.code === "Enter") {
            // handleSubmit();
         } else { //send data to provide suggestions dropdown
            //wait for user to stop typing
            window.clearTimeout(wait);
            wait = setTimeout(function() {
               //search for artist with input value
               handleSearch(e.target.value);
            }, 500);
         }
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
      new newAjax('GET', fullPath, function(err, res) {
         console.log("err: ", err);
         if (!err) {
            console.log("res: ", res);
               // removeCurrentDigestArtists();
               // showArtists(res);
         } else handleResponseError(err);
      }, null);

      // spotifyRequest.onload = function() {
      //    /*
      //       FIXME: handle 400 error!
      //    */
      //    // console.log("this.api: ", this.apiData);
      //    removeCurrentDigestArtists();
      //    showArtists(this.apiData);
      // };
   }

   function showArtists(data) {
      if (data.artists.items.length > 0) {
         for (var artist = 0; artist < data.artists.items.length; artist++) {
            addArtistToDigest(data.artists.items[artist]);
         }
      } else addArtistToDigest(null);
   }

   function addArtistToDigest(artist) {
      var artistBox = document.createElement('div');
         artistBox.className = "artist-box fade";
         artistBox.addEventListener('click', handleSubmit);
      var abox_name = document.createElement('h3');
         abox_name.className = "name";
      if (artist === null) {
         abox_name.innerHTML = "No artist found..."
      } else { // artist(s) exist(s)
         //show artist name
         abox_name.innerHTML = artist.name;
         artistBox.id = artist.id;
         if (artist.images.length > 0) {
            var abox_photo = document.createElement('img');
               abox_photo.className = "thumbnail";
               abox_photo.style.backgroundColor = "rgb(106, 106, 106)";
               abox_photo.src = artist.images[0].url;
               abox_photo.alt = artist.name;
            artistBox.appendChild(abox_photo);
         }
      }
      //append all elements
      artistBox.appendChild(abox_name);
      searchDigest.appendChild(artistBox);
      setTimeout(function(){
         console.log("class list: ", artistBox.classList);
         artistBox.classList.remove('fade');
      },10);
   }

   function removeCurrentDigestArtists() {
      // if (typeof searchDigest === 'undefined') return;
      while(searchDigest.children.length > 0) {
         searchDigest.firstChild.remove();
      }
   }


   function handleSubmit(e) {
      var artists = spotifyRequest.apiData.artists.items;
      var id;
      if (e !== null && typeof e !== 'undefined') {
         console.log("e: ", e.target.parentElement.id);
         id = e.target.parentElement.id;
      }
      //get first artist in list
      //function should technically not be called if there
      //are no artists, buuut just in case

      //FIXME: Should always get the correct artist!, not the first!
      /**
      * FIXME:
      */
      if (spotifyRequest.apiData.artists.items.length > 0) {
         user.setLocal('currentArtist', id);
         window.location.pathname = '/dashboard';
         // console.log("first artist in list: ", artists[0]);
         // console.log("ID: ", artists[0].id);
         // console.log("URI: ", artists[0].uri);
      }
   }


   function handleResponseError() {

   }




})();
