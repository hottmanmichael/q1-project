var Spotify = {
   getData: function() {
      var req = GlobalArtist.spotify.request;
      req.open('GET', "https://api.spotify.com/v1/artists/"+GlobalArtist.spotify.id);
      req.send();
      req.onload = function() {
         console.log("spotify loaded");
         console.log("this: ", this.apiData);
         loadMainAppData(this.loadIFrame(this.apiData.uri));
      }
   },
   loadIFrame: function(uri) {
      //FIXME:
         //Currently loaded on doc.body for testing

      var iframeBox = document.createElement('div');
         iframeBox.className = 'iframe-box spotify-embed';
         // var loader = document.createElement('i');
            //  loader.className = "fa fa-spinner fa-pulse fa-3x fa-fw";
            // <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
      var iframe = document.createElement('iframe');
         iframe.src = "https://embed.spotify.com/?uri="+uri;
         iframe.width = "320";
         iframe.height = "320";
         iframe.frameborder = "0"
         iframe.style.border = "none";
         iframe.allowtransparency = "true";
      //load elements
      //iframeBox.appendChild(loader);
      iframeBox.appendChild(iframe);
      document.body.appendChild(iframeBox);
   }
}
