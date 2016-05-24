
'use strict';

//save 3 item types in localStorage
   //groupieUser
   //groupieArtist
   //groupieCache

/**
* Save 3 Items to localStorage
   * groupieUser:{
      firstname:
      lastname:
      location: (zip code)
      artists: ['id1', 'id2', 'id3', etc]
   }
   * groupieCurrentArtist:{
      id: (spotify id),
      name: (string lower case)
   }
   * groupieCache: [
      {
         id: (spotify id)
         name: (spotify name)
         data: {
            spotify: {}
            bandsInTown: {}
            musixMatch: {}
         }
      }
      {
         id: (spotify id)
         name: (spotify name)
         data: {
            spotify: {}
            bandsInTown: {}
            musixMatch: {}
         }
      }
      etc.
   ]
*/


var User = function() {
   const MODEL = 'GroupieUser';
   const CACHE = 'GroupieCache';
   const CURRENT_ARTIST = 'GroupieCurrentArtist';

   this.authenticated = function() {
      //checks for user model GroupieUser
      //if key exists in local storage, return true, else false
      return localStorage.getItem(MODEL) !== null;
   };

   this.create = function() {
      localStorage.setItem(MODEL, JSON.stringify({
         firstname: "",
         lastname: "",
         location: null,
         artists: []
      }));
   };

   this.establish = function(usr) {
      for (var item in usr) {
         this[item] = usr[item];
      }
   }

   this.fetchLocal = function(pullFrom, key) {
      if (typeof pullFrom === 'undefined' || pullFrom === null) return null;
      switch (pullFrom) {
         case 'MODEL':
            return JSON.parse(localStorage.getItem(MODEL));
            break;
         case 'CURRENT_ARTIST':
            return JSON.parse(localStorage.getItem(CURRENT_ARTIST));
            break;
         case 'CACHE':
            return JSON.parse(localStorage.getItem(CACHE));
            break;
         default:
            /** FIXME: Handle Error Here **/
            return null; //err
      }
   };

   this.setLocal = function(storeTo, value) {
      if (typeof storeTo === 'undefined' || storeTo === null) return null;
      switch (storeTo) {
         case 'MODEL':
            /** FIXME: Ensure correct storage! **/
            localStorage.setItem(MODEL, JSON.stringify(value));
            break;
         case 'CURRENT_ARTIST':
            /** FIXME: Ensure correct storage! **/
            localStorage.setItem(CURRENT_ARTIST, JSON.stringify(value));
            break;
         case 'CACHE':
            /** FIXME: Ensure correct storage! **/
            localStorage.setItem(CACHE, JSON.stringify(value));
            break;
         default:
            /** FIXME: Handle Error Here **/
            return null; //err
      }
   };

   this.findInCache = function() {};

   this.saveToCache = function() {};
}



var Artist = function(id, name, slug) {
   this.id = id;
   this.name = name;
   this.slug = slug;
}
Artist.prototype.fixme = function () {

};

// // (function() {
//
//    var User = function() {
//
//       this.setCurrentArtist = function(artist) {
//          this.currentArtist = artist;
//          this.setLocal('currentArtist', artist);
//       };
//
//       /**
//       * Fetches from data object groupie in local storage
//       FIXME: Should handle infinitely nested keys!!!!!
//       * @param {key}
//       * @return {type}
//       */
//       // this.fetchLocal = function(key,callback) {
//       //    /**
//       //       TODO: Key can be an array. If type array, loop through and make
//       //       key of key of key in obj to store
//       //    */
//       //    var groupie = localStorage.getItem('groupie');
//       //    groupie = JSON.parse(groupie);
//       //    console.log("Fetch Local Returns: ", groupie[key]);
//       //    return groupie[key];
//       // };
//
//       /**
//       * Sets data object groupie in local storage from key and value
//       * //it should handle infintely nested keys
//       FIXME: Should handle infinitely nested keys!!!!!
//       * @param {key}
//       * @return {type}
//       */
//       this.setLocal = function(key,value) {
//          /**
//             TODO: Key can be an array. If type array, loop through and make
//             key of key of key in obj to store
//          */
//          var groupie = localStorage.getItem('groupie');
//          groupie = JSON.parse(groupie);
//          groupie[key] = value;
//          groupie = JSON.stringify(groupie);
//          console.log("setLocal sets groupie to : ", groupie);
//          localStorage.setItem("groupie", groupie);
//          return;
//       };
//
//       this.init = function() {
//          var userKeys = ['firstname', 'lastname', 'currentArtist'];
//          for (var k = 0; k < userKeys.length; k++) {
//             console.log("userKeys[k]: ", userKeys[k]);
//          }
//       };
//
//       this.authenticate = function() {
//
//       };
//
//
//
//    }
//
//
//    User.prototype.fetchLocal = function () {
//       var groupie = localStorage.getItem('groupie');
//       groupie = JSON.parse(groupie);
//       console.log("Fetch Local Returns: ", groupie[key]);
//       return groupie[key];
//    };
//
// // })();
//
//    var Artist = function() {
//
//       this.save = function() {
//          // handle save to local storage
//
//       }
//
//    }
