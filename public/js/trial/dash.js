
'use strict';

(function(){

   const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";
   const SECTION = {
      HEAR_IT: document.getElementById("hearit"), //music
      SEE_IT: document.getElementById("seeit"), //concerts
      SING_IT: document.getElementById('singit'), //lyrics
      DISCOVER_IT: document.getElementById('discoverit') //similar artists
   };

   var user = new User();

   //if a user does not yet exist, create one
   if (!user.authenticate()) {
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
      var spotify = new Ajax('GET', artistRequestPath, function(err,res) {
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
         var limit = "&limit=50"; //up to 50 albums

         var albums = new Ajax(
            'GET',
            SPOTIFY_BASE_URL+"/artists/"+PAGE_ARTIST.id+"/albums?"+type+limit,
            function(err, res) { //callback
               for (var album = 0; album < res.items.length; album++) {
                  appendToList(res.items[album], SECTION.HEAR_IT.querySelector('#wheel-albums'));
                  console.log("res.items: ", res.items[album]);
               }
            }, null
         );

         // var albums = GlobalArtist.spotify.request; //new request object
         // albums.open('GET', "https://api.spotify.com/v1/artists/"+aId+"/albums?"+type+limit);
         // albums.send();
         // albums.onload = function() {
         //    // console.log("ALBUMS: ", this);
         //    var albumsSection = SECTION.hearit.querySelector('#wheel-albums');
         //    var albums = this.apiData.items;
         //    GlobalArtist.spotify.albums.push(albums);
         //    //load and append albums
         //    for (var album = 0; album < albums.length; album++) {
         //       appendToList(albums[album], albumsSection);
         //    }
         //    //call initial load songs
         //    // loadSongs(albums);
         // }
      }

      function loadSongs() {

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
      function handleSpotifyPlayerChange(e) {
         document.querySelector('iframe').src = "https://embed.spotify.com/?uri="+e.target.uri;
         //scrolls to player on click of song
         scrollToPlayerTop()
      }
      function scrollToPlayerTop() {
         document.body.scrollTop = 645;
      }



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





})();


//
// (function() {
//
//
//    var user = new User();
//
//
//    //page sections
//    var SECTION = {
//       hearit: document.getElementById("hearit"), //music
//       seeit: document.getElementById("seeit"), //concerts
//       singit: document.getElementById('singit'), //lyrics
//       discoverit: document.getElementById('discoverit') //similar artists
//    }
//
//    // console.log("User: ", user.fetchLocal);
//    var GlobalArtist = {
//       spotify: {
//          request: new Ajax().request,
//          id: user.fetchLocal('currentArtist'),
//          albums: [],
//          songs: []
//       },
//       bandsInTown: {
//          request: new Ajax().request,
//          id: null
//       },
//       musixMatch: {
//          request: new Ajax().request,
//          id: null
//       }
//    }
//
//    // init();
//    function init() {
//       console.log("GlobalArtist ID: ", GlobalArtist.spotify.id);
//       loadSpotify();
//    }
//
//
//    function loadArtistName() {
//       var pageTitle = document.getElementById('page-title-artist-name');
//          pageTitle.innerHTML = GlobalArtist.spotify.request.apiData.name;
//    }
//
//
//    function loadSpotify() {
//       //load artist from spotify and load iframe with top 10
//       var spotify = GlobalArtist.spotify.request;
//       var aId = GlobalArtist.spotify.id;
//       spotify.open('GET', "https://api.spotify.com/v1/artists/"+aId);
//       spotify.send();
//       spotify.onload = function() {
//          console.log("ARTIST: ", this);
//          loadArtistName();
//          loadSpotifyIFrame(this.apiData.uri);
//
//          /**FIXME:*/
//          //loadArtistInfo();
//
//          //load the albums
//          loadAlbums();
//       }
//       function loadAlbums() {
//          var type = "album_type=album,single";
//          var limit = "&limit=50";
//          var albums = GlobalArtist.spotify.request; //new request object
//          albums.open('GET', "https://api.spotify.com/v1/artists/"+aId+"/albums?"+type+limit);
//          albums.send();
//          albums.onload = function() {
//             // console.log("ALBUMS: ", this);
//             var albumsSection = SECTION.hearit.querySelector('#wheel-albums');
//             var albums = this.apiData.items;
//             GlobalArtist.spotify.albums.push(albums);
//             //load and append albums
//             for (var album = 0; album < albums.length; album++) {
//                appendToList(albums[album], albumsSection);
//             }
//
//             //call initial load songs
//             loadSongs(albums);
//
//          }
//       }
//
//       /**
//       *
//       * @param {type}
//       * @return {type}
//       */
//       var albumTracks = [];
//       function loadSongs(albumsArray) {
//          //takes an array of albums and
//          //recursively waits to load the next album's songs
//
//          //grab current album and remove
//          var currAlbum = albumsArray.shift();
//
//          //request songs from current album
//          var tracks = GlobalArtist.spotify.request; //new request object
//          tracks.open('GET', "https://api.spotify.com/v1/albums/"+currAlbum.id+"/tracks");
//          tracks.send();
//          tracks.onload = function() {
//             // console.log("loaded: ", this.readyState);
//             //once the song is loaded, check if any albums are left,
//             //if there are remaining albums, load next albums songs
//             if (albumsArray.length > 0) {
//                // console.log("albumsArray: ", albumsArray);
//                albumTracks.push(this.apiData.items);
//                loadSongs(albumsArray);
//                return;
//             }
//             //done with recursive song fetch
//
//             var tracksSection = SECTION.hearit.querySelector('#wheel-tracks');
//
//             //albumTracks = [array of tracks]
//             //albumTracks is array of arrays of albums
//             for (var album in albumTracks) {
//                var currAlbum = albumTracks[album];
//                for (var track = 0; track < currAlbum.length; track++) {
//                   appendToList(currAlbum[track], tracksSection);
//                }
//             }
//
//          }
//
//          // console.log("TRACKS: ", albumTracks);
//          //
//          // console.log("albums: ",albumsArray);
//       }
//
//       // var albums = [];
//       function appendToList(item, parent) {
//          // console.log("item: ", item, parent);
//          var child = document.createElement('div');
//             child.className = item.type + "-list-item";
//             // child.innerHTML = item.name;
//             child.style.overflow = 'hidden';
//             // child.style.fontSize = '12px';
//             var text = document.createElement('h3');
//                text.className = 'name';
//                //display singles & compilation albums
//                if (item.type === 'album') {
//                   if (item.album_type !== 'album') {
//                      text.innerHTML = item.name + " (" + item.type + ")";
//                   }
//                   text.innerHTML = item.name;
//                } else {
//                   text.innerHTML = item.name;
//                }
//
//                if (item.type !== 'track') { //is not a song
//                   if (item.images.length > 0) {
//                      var img = document.createElement('img');
//                         img.className = 'thumbnail';
//                         img.src = item.images[0].url;
//                         img.alt = item.name;
//                         img.height = "40";
//                         img.width = "40";
//                      child.appendChild(img);
//                   }
//                }
//
//          //make icon to play
//          var play = document.createElement('i');
//             play.className = "fa fa-play-circle-o play-item " + item.type;
//             // play.id = "spotify:track"+item.id;
//             // console.log("item: ", item);
//             play.uri = item.uri;
//             play.addEventListener('click', handleSpotifyPlayerChange);
//
//
//          child.appendChild(text);
//          child.appendChild(play);
//          parent.appendChild(child);
//       }
//    }
//
//    function loadSpotifyIFrame(uri) {
//       var iframeBox = document.querySelector('.iframe-box.spotify-embed');
//
//       var iframe = document.createElement('iframe');
//          iframe.src = "https://embed.spotify.com/?uri="+uri;
//          iframe.width = "100%";
//          iframe.height = "100%";
//          iframe.frameborder = "0"
//          iframe.style.border = "none";
//          iframe.allowtransparency = "true";
//       //load elements
//       iframeBox.appendChild(iframe);
//    }
//
//    function handleSpotifyPlayerChange(e) {
//       document.querySelector('iframe').src = "https://embed.spotify.com/?uri="+e.target.uri;
//       //scrolls to player on click of song
//       scrollToPlayerTop()
//    }
//    function scrollToPlayerTop() {
//       document.body.scrollTop = 645;
//    }
//
//
//    var wheelItems = document.querySelectorAll('.wheel-item');
//    var navItems = document.querySelectorAll('.content-wheel .navigation .list .item');
//    handleWheelNavigation();
//    function handleWheelNavigation() {
//       for (var i = 0; i < navItems.length; i++) {
//          navItems[i].addEventListener('click', function(e) {
//             if (!e.target.classList.contains('active')) {
//                for (var j = 0; j < wheelItems.length; j++) {
//                   if (wheelItems[j].classList.contains('active')) {
//                      wheelItems[j].classList.remove('active');
//                      navItems[j].classList.remove('active');
//                   }
//                }
//                console.log("e.target.for:", e.target.attributes.isFor.value);
//                var val = e.target.attributes.isFor.value;
//                var box = document.getElementById("wheel-"+val);
//                   box.className += " " + 'active fade';
//                   setTimeout(function() {
//                      box.classList.remove('fade');
//                   }, 10);
//                e.target.className += " " + 'active fade';
//                   setTimeout(function() {
//                      e.target.classList.remove('fade');
//                   }, 10);
//             }
//          });
//       }
//    }
//
//
//
//
//
//
// })();
