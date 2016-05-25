
'use strict';

(function(){

   var SPOTIFY_BASE_URL = "https://api.spotify.com/v1";
   var SECTION = {
      HEAR_IT: document.getElementById("hearit"), //music
      SEE_IT: document.getElementById("seeit"), //concerts
      SING_IT: document.getElementById('singit'), //lyrics
      DISCOVER_IT: document.getElementById('discoverit') //similar artists
   };
   var TOP_OF_SPOTIFY_EMBED = 590;

   var GOOGLE_BASE_URL = "https://kgsearch.googleapis.com/v1/entities:search?query=ARTIST&key=AIzaSyAUrXU5tUMx8z9kuUq_uYKro-IHsTigorY&limit=5&indent=True"
   var BANDSINTOWN_BASE_URL = "http://api.bandsintown.com/artists/ARTIST/events.json?api_version=2.0&app_id=Groupie"

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
      //spotify
         loadArtistNameAsTitle();
         loadSpotify();
      //google knowledge graph
         loadInformation();
      //bands in town
         // loadConcerts();
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
         //spotify
            loadIframe(res.uri);
            /**FIXME: UNCOMMENT BELOW */
            loadAlbums(); // also calls load songs upon completion

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
               /**FIXME: UNCOMMENT BELOW */
               // loadSongs(res.items);

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
   } //end loadSpotify()


   function loadInformation() {
      //ajax to google knowledge graph
      console.log("PAGE_ARTIST: ", PAGE_ARTIST);
      var query = PAGE_ARTIST.slug.replace(/(-)/g, '+'); //replace all "-"
      var url = GOOGLE_BASE_URL.replace('ARTIST', query);
      new Ajax('GET', url, function(err, res) {
         if (!err) {
            console.log("Artist Info: ", res.itemListElement[0].result);
            //SECTION.HEAR_IT.querySelector('#wheel-info');
            buildInfo(res.itemListElement[0].result);
         }
      }, null);


      function buildInfo(data) {
         var section = SECTION.HEAR_IT.querySelector('#wheel-info');

         var topic = document.createElement('div');
            topic.className = 'topic';
            var title = document.createElement('h1');
               title.className = 'title';
               title.innerHTML = data.name;
            var description = document.createElement('p');
               description.className = 'description';
               if (data.hasOwnProperty('detailedDescription')) {
                  description.innerHTML = data.detailedDescription.articleBody;
               } else description.innerHTML = "No description available...";
            var globe = document.createElement('i');
               globe.className = "fa fa-globe";
               globe.style.float = "left";
               globe.style.fontSize = "2em";
               globe.style.padding = "5px";
            var website = document.createElement('a');
               if (data.hasOwnProperty('url')) {
                  website.href = data.url;
                  website.innerHTML = "Artist Website";
               } else {
                  website.href = "#";
                  website.innerHTML = "No website listed.";
               }
               website.target = "_blank";
               website.className = "artist-website";
               website.style.float = "left";
               website.style.fontSize = "1.6em";
               website.style.padding = "5px";
               website.style.textDecoration = "none";

            var wikiLink = document.createElement('a');
               if (data.hasOwnProperty('detailedDescription')) {
                  wikiLink.href = data.detailedDescription.url;
                  wikiLink.innerHTML = "Wikipedia";
               } else {
                  wikiLink.href = "#";
                  wikiLink.innerHTML = "No Wikipedia page available...";
               }

               wikiLink.target = "_blank";
         description.appendChild(wikiLink);
            var wikiLicense = document.createElement('a');
               if (data.hasOwnProperty('detailedDescription')) {
                  wikiLicense.href = data.detailedDescription.license;
                  wikiLicense.innerHTML = "License: " + data.detailedDescription.license;
               } else {
                  wikiLicense.href = "#";
                  wikiLicense.innerHTML = "No Wiki license link available...";
               }
               // wikiLicense.href = data.detailedDescription.license;
               wikiLicense.className = "wiki-license";
               wikiLicense.target = "_blank";
         topic.appendChild(title);
         topic.appendChild(description);
         topic.appendChild(globe);
         topic.appendChild(website);
         topic.appendChild(wikiLicense);

         var imgBox = document.createElement('div');
            imgBox.className = 'image-box';
            var image = document.createElement('img');
               image.className = 'image-inner';
               if (data.hasOwnProperty('image')) {
                  image.src = data.image.contentUrl;
                  image.alt = data.name;
                  var imgLicense = document.createElement('a');
                     imgLicense.innerHTML = "Image License: " + data.image.license;
                     imgLicense.target = "_blank";
                  imgBox.appendChild(image);
                  imgBox.appendChild(imgLicense);
               } else {
                  image.src = "http://placehold.it/350x150";
                  image.alt = "no image available.";
               }


         section.appendChild(topic);
         section.appendChild(imgBox);
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

   var header = document.querySelector('header');
   window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
         if (!header.classList.contains('darken'))
            header.className += " darken";
      } else header.classList.remove('darken');
   });



})();










// 'use strict';
//
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
