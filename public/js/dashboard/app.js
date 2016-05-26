
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

   var GOOGLE_BASE_URL = "https://kgsearch.googleapis.com/v1/entities:search?query=ARTIST&key=AIzaSyAUrXU5tUMx8z9kuUq_uYKro-IHsTigorY&limit=5&indent=True&types=MusicGroup";
   // var BANDSINTOWN_BASE_URL = "http://api.bandsintown.com/artists/ARTIST/events.json?api_version=2.0&app_id=Groupie";
   // var BANDSINTOWN_BASE_URL_CHECK = "http://api.bandsintown.com/artists/ARTIST.json?api_version=2.0&app_id=YOUR_APP_ID"
   var BANDSINTOWN_ID = "&app_id=Groupie";
   var BANDSINTOWN = {
      BASE: "http://api.bandsintown.com/artists/",
      ARTIST: "ARTIST.json?api_version=2.0"+BANDSINTOWN_ID,
      ALL_EVENTS: "ARTIST/events.json?api_version=2.0"+BANDSINTOWN_ID
   }
   var CORS_BYPASS = "https://jsonp.afeld.me/?url=";


   //initialize user
   var user = new User();


   //if a user does not yet exist, create one
   if (!user.authenticated()) {
      user.create();
   }

   //set up window user object for use throughout
   user.establish(user.fetchLocal('MODEL'));


   // console.log("user on page load and setup: ", user);


   //setup the artist
   var artistFromStorage = user.fetchLocal('CURRENT_ARTIST');

   //fallback if fail on local storage
   // console.log("artistFromStorage: ", artistFromStorage)
   // if (!artistFromStorage) {}

   //to give artist methods
   var PAGE_ARTIST = new Artist(
      artistFromStorage.id,
      artistFromStorage.name,
      artistFromStorage.slug
   );

   // console.log("PAGE_ARTIST: ", PAGE_ARTIST);


   init();
   function init() {
      //spotify
         loadArtistNameAsTitle();
         loadSpotify();
      //google knowledge graph
         loadInformation();
      //bands in town concerts
         checkArtistConcerts();
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
      }, null, true); //true === needs CORS

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
   } //end loadSpotify()


   function loadInformation() {
      //ajax to google knowledge graph
      // console.log("PAGE_ARTIST: ", PAGE_ARTIST);
      var query = PAGE_ARTIST.name
         .replace(/(\W+)/g, '+') //replace non-words plus extra whitespace with "+"
         .toLowerCase();
      var url = GOOGLE_BASE_URL.replace('ARTIST', query);
      // console.log("query: ", query)
      new Ajax('GET', url, function(err, res) {
         if (!err) {
            // console.log("Artist Info: ", res.itemListElement[0].result);
            buildInfoSection(res.itemListElement[0].result);
         }
      }, null);


      function buildInfoSection(data) {
         var section = SECTION.HEAR_IT.querySelector('#wheel-info');
         var hipsterTally = 0;

         var topic = document.createElement('div');
            topic.className = 'topic';
            var title = document.createElement('h1');
               title.className = 'title';
               if (data.hasOwnProperty('name')) {
                  title.innerHTML = data.name;
               } else {
                  title.innerHTML = "Data not found.";
                  hipsterTally++;
               }
            var description = document.createElement('p');
               description.className = 'description';
               if (data.hasOwnProperty('detailedDescription')) {
                  description.innerHTML = data.detailedDescription.articleBody;
               } else {
                  description.innerHTML = "No description available...";
                  hipsterTally++;
               }
            var globe = document.createElement('i');
               globe.className = "fa fa-globe";
               globe.style.float = "left";
               globe.style.fontSize = "2em";
               globe.style.padding = "5px";
            var website = document.createElement('a');
               if (data.hasOwnProperty('url')) {
                  website.href = data.url;
                  website.innerHTML = data.url.replace("http://","").replace("https://","");
               } else {
                  website.href = "#";
                  globe.style.fontSize = "0";
                  hipsterTally++;
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
                  hipsterTally++;
               }

               wikiLink.target = "_blank";
         description.appendChild(wikiLink);
            var wikiLicense = document.createElement('a');
               if (data.hasOwnProperty('detailedDescription')) {
                  wikiLicense.href = data.detailedDescription.license;
                  wikiLicense.innerHTML = "License: " + data.detailedDescription.license;
               } else {
                  wikiLicense.href = "#";
                  // wikiLicense.innerHTML = "No Wiki license link available...";
                  hipsterTally++;
               }
               // wikiLicense.href = data.detailedDescription.license;
               wikiLicense.className = "wiki-license";
               wikiLicense.target = "_blank";

            if (hipsterTally === 5) {
               description.innerHTML = "This band is so hipster, you heard about them before Google did...";
            }

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
                  topic.style.width = "100%"; //display text at 100 width% // graceful degredation
                  if (hipsterTally === 5) {
                     image.src = "http://www.telegraph.co.uk/content/dam/men/2015/12/11/Cera1-large_trans++qVzuuqpFlyLIwiB6NTmJwZwVSIA7rSIkPn18jgFKEo0.jpg";
                     image.alt = "Hipster Michael Cera";
                     topic.style.width = "65%";
                     imgBox.appendChild(image);
                  }
               }

         section.appendChild(topic);
         section.appendChild(imgBox);
      }
   }



   //Bands in Town Concerts

   function checkArtistConcerts() {
      var query = BANDSINTOWN.ARTIST.replace("ARTIST", PAGE_ARTIST.name.replace(/\s/g, '%20'));
      var bitUrl = CORS_BYPASS + encodeURIComponent(BANDSINTOWN.BASE + query);

      new Ajax('GET', bitUrl, function(err, res) {
         if (!err) {
            // console.log("RES: ", res);
            if (res.upcoming_event_count > 0) {
               loadConcerts();
            } else handleNoConcerts();
         } //FIXME HANDLE ERR
      }, null);
   }

   function loadConcerts() {
      var query = BANDSINTOWN.ALL_EVENTS.replace("ARTIST", PAGE_ARTIST.name.replace(/\s/g, '%20'));
      var concertsUrl = CORS_BYPASS + encodeURIComponent(BANDSINTOWN.BASE + query);

      new Ajax('GET', concertsUrl, function(err, res) {
         if (!err) {
            // console.log("CONCERTS: ", res);
            buildConcertsView(res);
         } //FIXME HANDLE ERR
      }, null);

   }

   function buildConcertsView(concerts) {
      var concertList = document.createElement('ul');
         concertList.className = "concert-list";
      for (var c = 0; c < concerts.length; c++) {
         createConcert(concerts[c]);
      }
      // console.log("section seeit: ", SECTION.SEE_IT);
      SECTION.SEE_IT.querySelector('.seeit-inner').appendChild(concertList);
      function createConcert(concert) {
         // console.log("concert: ", concert);
         var concertItem = document.createElement('li');
            concertItem.className = "concert-item";
            var title = document.createElement('h3');
               title.className = "concert-title item-inner";
               title.innerHTML = concert.formatted_location;
            var datetime = document.createElement('h3');
               datetime.className = "concert-datetime item-inner";
               datetime.innerHTML = concert.formatted_datetime;
            var seemore = document.createElement('div');
               var seemoreText = document.createElement('h4');
                  seemoreText.className = "text";

               if (concert.ticket_status === "available") {
                  seemore.className = "seemore item-inner tix-true";
                  seemoreText.innerHTML = "Tickets Available";
               } else {
                  seemore.className = "seemore item-inner tix-false";
                  seemoreText.innerHTML = "Tickets Unavailable";
               }

               seemore.appendChild(seemoreText);
               seemore.addEventListener('click', function(e) {
                  showConcertInfo(concert);
               });
               seemore.addEventListener('mouseenter', function(e) {
                  e.target.classList.add('flip');
               });
               seemore.addEventListener('mouseleave', function(e) {
                  e.target.classList.remove('flip');
               });


         concertItem.appendChild(title);
         concertItem.appendChild(datetime);
         concertItem.appendChild(seemore);

         concertList.appendChild(concertItem);
      }

   }

   function handleNoConcerts() {
      //show facebook page?
      //show other info??
   }

   function showConcertInfo(concert) {
      //console.log("OPEN MODAL HERE MOFOS");
      var concertInfo = document.createElement('div');
            concertInfo.className = "concert-info";
         var title = document.createElement('div');
            title.className = 'title';
            title.innerHTML = "<h2>"+concert.title+"</h2>";
         var date = document.createElement('div');
            date.className = 'date';
            date.innerHTML = "<p>"+concert.formatted_datetime+"</p>";
         if (concert.description) {
            var description = document.createElement('div');
               description.className = 'description';
               description.innerHTML = "<p>Event Description: "+concert.description+"</p>";
         }
         var venue = document.createElement('div');
            venue.className = 'venue';
            // venue.
            //h4 venue name : Venue
            //p venue place : Place
            //p city/region(st) : Location (concat city + ", " + region)
            var venueName = document.createElement('p');
               venueName.className = "venue-detail";
               venueName.innerHTML = "Venue: "+concert.venue.name;
            var venuePlace = document.createElement('p');
               venuePlace.className = "venue-detail";
               venuePlace.innerHTML = "Place: "+concert.venue.place;
            var venueLoc = document.createElement('p');
               venueLoc.className = "venue-detail";
               venueLoc.innerHTML = "Location: " + concert.venue.city + ", " + concert.venue.region;

         venue.appendChild(venueName);
         venue.appendChild(venuePlace);
         venue.appendChild(venueLoc);


         var tixLink = document.createElement('a');
            tixLink.target = "_blank";
            var tickets = document.createElement('div');
               tickets.className = 'tickets';
            if (concert.ticket_status === 'available') {
               tixLink.href = concert.ticket_url;
               tickets.innerHTML = "Buy Tickets";
               tickets.classList.add('tix-true');
            } else {
               tickets.innerHTML = "Tickets Unavailable";
               tickets.classList.add('tix-false');
               tixLink.href = "javascript: void(0)";
               tixLink.style.pointerEvents = "none"; //disable link
            }
         tixLink.appendChild(tickets);

         var share = document.createElement('a');
            share.target = "_blank";
            share.href = concert.facebook_rsvp_url; //goes to bands in town, not facebook
            var shareIcon = document.createElement('div');
               shareIcon.className = 'fa fa-share share';
         share.appendChild(shareIcon);


      concertInfo.appendChild(title);
      concertInfo.appendChild(date);
      if (concert.description) concertInfo.appendChild(description);
      concertInfo.appendChild(venue);
      concertInfo.appendChild(tixLink);
      concertInfo.appendChild(share);


      var modal = new Modal(concertInfo).show();
   }





   function handleSpotifyPlayerChange(e) {
      document.querySelector('iframe').src = "https://embed.spotify.com/?uri="+e.target.uri;
      //scrolls to player on click of song
      scrollToPlayerTop();
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
               // console.log("e.target.for:", e.target.attributes.isFor.value);
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
