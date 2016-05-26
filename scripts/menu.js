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

   // console.log("MENU USER: ", user);

   var artistFromStorage = user.fetchLocal('CURRENT_ARTIST');


   //to give artist methods
   if (artistFromStorage) {
      var PAGE_ARTIST = new Artist(
         artistFromStorage.id,
         artistFromStorage.name,
         artistFromStorage.slug
      );
   }
   /*FIXME: What if !artistFromStorage??? **/

   // console.log("MENU PAGE_ARTIST: ", PAGE_ARTIST);

   //build menu
   var menuButton = document.getElementById('user-menu-button');
   var header = document.querySelector('header');

   var menu = document.createElement('div');
      menu.isOpen = false;
      menu.className = 'user-menu';

   menuButton.addEventListener('click', handleMenuState);

   function handleMenuState() {
      menu.classList.toggle('open');
      if (!menu.isOpen) {
         stopBodyScroll();
         buildMenu();
      } else {
         resumeBodyScroll();
         removeMenu();
      }
      menu.isOpen = !menu.isOpen;
   };

   document.body.insertBefore(menu,document.body.children[0]);


   function buildMenu() {
      menu.classList.add('fade');
      var menuInner = document.createElement('div');
         menuInner.className = "menu-inner";
      var menuTitle = document.createElement('h1');
         menuTitle.className = "menu-title";
         menuTitle.innerHTML = "Menu";
      var close = document.createElement('i');
         close.className = "fa fa-times close-menu";
         close.addEventListener('click', handleMenuState);
      var returnHome = document.createElement('i');
         returnHome.className = "fa fa-home go-home";
         returnHome.addEventListener('click', handleReturnHome);

      menuInner.appendChild(returnHome);
      menuInner.appendChild(close);
      menuInner.appendChild(menuTitle);

      //show the current artist, or handle if no current artist
      var current = document.createElement('div');
         current.className = "current-artist";
         var currentTitle = document.createElement('h1');
            currentTitle.className = "menu-section-title";
            currentTitle.innerHTML = "Current Artist";
         var currentContent = document.createElement('h3');
            currentContent.className = "current-content-title";
         if (PAGE_ARTIST) {
            currentContent.innerHTML = PAGE_ARTIST.name;
            var save = document.createElement('div');
               save.className = "save-favorite";
               save.innerHTML = "Save current as favorite";
               save.addEventListener('click', function() {
                  user.addFavorite(PAGE_ARTIST, function(res) {
                     if (res.status === 'success') {
                        addNewFavoriteToList(PAGE_ARTIST);
                     }
                     new Notification(res.status, res.message, 2000).show();
                  });
               });
            current.appendChild(save);
         } else currentContent.innerHTML = "No current artist found... Search for one to get started!";
         current.appendChild(currentTitle);
         current.appendChild(currentContent);
      menuInner.appendChild(current);


      //show favorites
      var favorites = document.createElement('div');
         favorites.className = "favorites";
         var favoritesTitle = document.createElement('h1');
            favoritesTitle.className = "menu-section-title";
            favoritesTitle.innerHTML = "Favorites";
         favorites.appendChild(favoritesTitle);
      menuInner.appendChild(favorites);

      var favoritesList = document.createElement('ul');
         favoritesList.className = "favorites-list";
         favoritesList.id = "favorites-list";
         menuInner.appendChild(favoritesList);
         menu.appendChild(menuInner);
         if (user.artists.length > 0) {
            for (var i = 0; i < user.artists.length; i++) {
               addNewFavoriteToList(user.artists[i]);
            }
         }
      menu.classList.remove('fade');
   }

   function addNewFavoriteToList(artist) {
      var favoritesList = document.getElementById('favorites-list');
      var currArtist = document.createElement('li');
         currArtist.className = "favorite-item";
         currArtist.innerHTML = artist.name;
         currArtist.properties = artist;
         currArtist.addEventListener('click', function(e) {
            user.setLocal('CURRENT_ARTIST', e.target.properties);
            navigateToFavoriteSelected(e.target.properties);
         });
      favoritesList.appendChild(currArtist);
   }

   function removeMenu() {
      var menuInner = document.querySelector('.menu-inner');
      menu.classList.add('fade');
      setTimeout(function() {
         menu.removeChild(menuInner);
      }, 350);
   }

   function saveNewFavorite(artist) {
      user.addFavorite(artist);
   }

   function navigateToFavoriteSelected(target) {
      //set route
      var dashboard = '/dashboard.html';
      var query = "?"+target.slug;

      //handle route
      window.location.assign(dashboard + query);
   }

   function handleReturnHome() {
      window.location.assign('/'); //go home page, you're drunk
   }


})();


function stopBodyScroll() {
   document.body.classList.add('noscroll');
}
function resumeBodyScroll() {
   document.body.classList.remove('noscroll');
}
