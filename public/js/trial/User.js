
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
      id: (spotify id)
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

*
*
*
*
*/

var Local = function() {};
Local.prototype.fetch = function (target, key, value) {};
Local.prototype.set = function (target, value) {};



var User = function() {
   const MODEL = 'GroupieUser';
   const CACHE = 'GroupieCache';

   this.authenticate = function() {
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

   this.fetchLocal = function(from, key) {
      if (typeof from === 'undefined' || from === null) return null;
      if (from === 'model') {
         return JSON.parse(localStorage.getItem(MODEL));
      }

   };

   this.setLocal = function() {};

   this.findInCache = function() {};

   this.saveToCache = function() {};
}


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
