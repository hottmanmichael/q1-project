
'use strict';

(function(){

   const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";
   const SECTION = {
      HEAR_IT: document.getElementById("hearit"), //music
      SEE_IT: document.getElementById("seeit"), //concerts
      SING_IT: document.getElementById('singit'), //lyrics
      DISCOVER_IT: document.getElementById('discoverit') //similar artists
   };
   const TOP_OF_SPOTIFY_EMBED = 590;


   //initialize user
   var user = new User();


   //if a user does not yet exist, create one
   if (!user.authenticated()) {
      user.create();
   }

   //set up window user object for use throughout
   user.establish(user.fetchLocal('MODEL'));


   console.log("user on page load and setup: ", user);


   //setup the artist
   var artistFromStorage = user.fetchLocal('CURRENT_ARTIST');

   //fallback if fail on local storage
   console.log("artistFromStorage: ", artistFromStorage)
   // if (!artistFromStorage) {}

   //to give artist methods
   var PAGE_ARTIST = new Artist(
      artistFromStorage.id,
      artistFromStorage.name,
      artistFromStorage.slug
   );

   console.log("PAGE_ARTIST: ", PAGE_ARTIST);


   init();
   function init() {
      loadArtistNameAsTitle();
      loadSpotify();
      //load bands in town
      //load something else??
   }

   function loadArtistNameAsTitle() {
      var pageTitle = document.getElementById('page-title-artist-name');
         pageTitle.innerHTML = PAGE_ARTIST.name;
   }


   function loadSpotify() {
      //load artist from spotify and load iframe with top 10
      var artistRequestPath = SPOTIFY_BASE_URL + "/artists/"+PAGE_ARTIST.id;
      new Ajax('GET', artistRequestPath, function(err,res) {
         loadIframe(res.uri);
         loadAlbums();
         /** TODO:
            * add to user artists array if it doesn't already exist
            * handle CACHE ?? CAN ALSO DO IN AJAX.JS??
         **/
      }, null);

      function loadIframe(uri) {
         var iframeBox = document.querySelector('.iframe-box.spotify-embed');
         var iframe = document.createElement('iframe');
            iframe.src = "https://embed.spotify.com/?uri="+uri;
            iframe.width = "100%";
            iframe.height = "100%";
            iframe.frameborder = "0"
            iframe.style.border = "none";
            iframe.allowtransparency = "true";
         //load elements
         iframeBox.appendChild(iframe);
      }

      function loadAlbums() {
         var type = "album_type=album,single"; //don't load compilations
         var limit = "&limit=10"; //up to 50 albums

         new Ajax(
            'GET',
            SPOTIFY_BASE_URL+"/artists/"+PAGE_ARTIST.id+"/albums?"+type+limit,
            function(err, res) { //callback
               //add all albums to page
               for (var album = 0; album < res.items.length; album++) {
                  appendToList(res.items[album], SECTION.HEAR_IT.querySelector('#wheel-albums'));
                  // console.log("res.items: ", res.items[album]);
               }
               //load songs from albums
               loadSongs(res.items);

            }, null
         );
      }

      var albumTracks = [];
      function loadSongs(albums) {
         //takes an array of albums and
         //recursively waits to load the next album's songs

         //grab current album and remove
         var currAlbum = albums.shift();
         // https://api.spotify.com/v1/albums/"+currAlbum.id+"/tracks

         new Ajax('GET',
            SPOTIFY_BASE_URL+"/albums/"+currAlbum.id+"/tracks", function(err,res) {
               if (albums.length > 0) {
                  // console.log("albumsArray: ", albumsArray);
                  albumTracks.push(res.items);
                  loadSongs(albums);
                  return;
               }
         }, null);

         var tracksSection = SECTION.HEAR_IT.querySelector('#wheel-tracks');
         //albumTracks = [array of tracks]
         //albumTracks is array of arrays of albums
         for (var album in albumTracks) {
            var currAlbum = albumTracks[album];
            for (var track = 0; track < currAlbum.length; track++) {
               appendToList(currAlbum[track], tracksSection);
            }
         }
      }

      function appendToList(item, parent) {
         // console.log("item: ", item, parent);
         var child = document.createElement('div');
            child.className = item.type + "-list-item";
            // child.innerHTML = item.name;
            child.style.overflow = 'hidden';
            // child.style.fontSize = '12px';
            var text = document.createElement('h3');
               text.className = 'name';
               //display singles & compilation albums
               if (item.type === 'album') {
                  if (item.album_type !== 'album') {
                     text.innerHTML = item.name + " (" + item.type + ")";
                  }
                  text.innerHTML = item.name;
               } else {
                  text.innerHTML = item.name;
               }

               if (item.type !== 'track') { //is not a song
                  if (item.images.length > 0) {
                     var img = document.createElement('img');
                        img.className = 'thumbnail';
                        img.src = item.images[0].url;
                        img.alt = item.name;
                        img.height = "40";
                        img.width = "40";
                     child.appendChild(img);
                  }
               }

         //make icon to play
         var play = document.createElement('i');
            play.className = "fa fa-play-circle-o play-item " + item.type;
            // play.id = "spotify:track"+item.id;
            // console.log("item: ", item);
            play.uri = item.uri;
            play.addEventListener('click', handleSpotifyPlayerChange);


         child.appendChild(text);
         child.appendChild(play);
         parent.appendChild(child);
      }
   }

   function handleSpotifyPlayerChange(e) {
      document.querySelector('iframe').src = "https://embed.spotify.com/?uri="+e.target.uri;
      //scrolls to player on click of song
      scrollToPlayerTop()
   }

   function scrollToPlayerTop() {
      document.body.scrollTop = TOP_OF_SPOTIFY_EMBED;
   }

   var wheelItems = document.querySelectorAll('.wheel-item');
   var navItems = document.querySelectorAll('.content-wheel .navigation .list .item');
   handleWheelNavigation();
   function handleWheelNavigation() {
      for (var i = 0; i < navItems.length; i++) {
         navItems[i].addEventListener('click', function(e) {
            if (!e.target.classList.contains('active')) {
               for (var j = 0; j < wheelItems.length; j++) {
                  if (wheelItems[j].classList.contains('active')) {
                     wheelItems[j].classList.remove('active');
                     navItems[j].classList.remove('active');
                  }
               }
               console.log("e.target.for:", e.target.attributes.isFor.value);
               var val = e.target.attributes.isFor.value;
               var box = document.getElementById("wheel-"+val);
                  box.className += " " + 'active fade';
                  setTimeout(function() {
                     box.classList.remove('fade');
                  }, 10);
               e.target.className += " " + 'active fade';
                  setTimeout(function() {
                     e.target.classList.remove('fade');
                  }, 10);
            }
         });
      }
   }

   var menubar = document.querySelector('header');
   window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
         if (!menubar.classList.contains('darken'))
            menubar.className += " darken";
      } else menubar.classList.remove('darken');
   });



})();
