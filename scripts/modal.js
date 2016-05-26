

var Modal = function(child) {
   this.child = child;
   this.portal = false;
   // console.log("modal: ", this.portal);
};


Modal.prototype.show = function () {
   if (!this.portal) {
      this.portal = document.createElement('div');
      this.portal.className = "modal fade";
      var backdrop = document.createElement('div');
         backdrop.className="modal-backdrop";
         backdrop.addEventListener('click', this.hide.bind(this));
      this.portal.appendChild(backdrop);
      document.body.insertBefore(this.portal, document.body.children[0]);
      this.render();
      stopBodyScroll(); //from menu.js
   }
};


Modal.prototype.render = function () {
   var that = this;
   setTimeout(function(){
      that.portal.classList.add('in');
   }, 10);
   var inner = document.createElement('div');
      inner.className = "modal-inner";
   var closeModal = document.createElement('div');
      closeModal.id = 'close-modal';
      closeModal.className = 'fa fa-times';
      // closeModal.style.postition = absolute;
   inner.appendChild(closeModal);
   inner.appendChild(this.child);
   this.portal.children[0].appendChild(inner);
};

Modal.prototype.settleOnMount = function () {
   this.portal.classList.add('in');
};

Modal.prototype.hide = function (e) {
   if (e.target.className === 'modal-backdrop' || e.target.id === 'close-modal') {
      this.unmount();
   }
};

Modal.prototype.unmount = function () {
   document.body.removeChild(this.portal);
   this.portal = false;
   resumeBodyScroll(); //from menu.js
};






var Notification = function(type, message, time) {
   this.type = type; //must be error or success
   this.message = message;
   this.time = (!time) ? 3000 : time;
   this.portal = false;
};

Notification.prototype.show = function () {
   if (!this.portal) {
      this.portal = document.createElement('div');
         this.portal.className = "notification fade " + this.type;
         var msg = document.createElement('h3');
            msg.className = "message";
            msg.innerHTML = this.message;
         this.portal.appendChild(msg);
      if (!this.hasList()) {
         //ensures that notification list is created first
         //if not, calls render as callback after appending list ul to body
         this.createList(this.render.bind(this)); //bind to attach this portal to render method
      } else this.render();
   }
   console.log("this.hasList(): ", this.hasList());

};

Notification.prototype.render = function () {
   var notif = document.querySelector('.notification-list');
   notif.appendChild(this.portal);
   setTimeout(function() {
      this.portal.classList.remove('fade'); //for transition
   }.bind(this), 10);
   this.fadeOut();
};

Notification.prototype.fadeOut = function () {
   setTimeout(function() {
      this.hide();
   }.bind(this), this.time);
};

Notification.prototype.hide = function () {
   //add fade class back to element to fade back up
   this.portal.classList.add('fade');
   //remove after time specified
   setTimeout(function() {
      this.unmount();
   }.bind(this), (this.time*0.75));
};

Notification.prototype.unmount = function () {
   this.portal.remove();  //remove notification
   //and if the notification-list has no children, remove it from body
   if (document.querySelector('.notification-list').children.length === 0) {
      document.querySelector('.notification-list').remove();
   }
};

Notification.prototype.hasList = function() {
   var notif = document.querySelector('.notification-list');
   return (!notif) ? false : true; //if notification-list is falsy, return false, else true
}

Notification.prototype.createList = function(callback) {
   var list = document.createElement('div');
      list.className = 'notification-list';

   document.body.insertBefore(list, document.body.children[0]);

   return callback();

}
