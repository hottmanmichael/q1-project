'use strict';
//modular code to handle api data across files

const post = 'POST';
const get = 'GET';


var Ajax = function(method, url, callback, data) {
   this.request = new XMLHttpRequest();
   this.request.onreadystatechange = handleRequest;
   function handleRequest() {
      if (this.readyState === 4) {
         if (this.status === 200) {
            callback(null, JSON.parse(this.responseText));
         } else {
            console.error("Error in Ajax " + method + " request: " + this);
            callback({
               message: JSON.parse(this.responseText),
               status: this.status,
               all: this
            }, null);
         }
      }
   }
   this.request.open(method, url);
   if (method === post) {
      //handle post
   } else if (method === get) {
      this.request.send();
   } else {
      console.trace();
      throw new Error('Invalid method: ' + method + ' in Ajax request.');
   }
}
