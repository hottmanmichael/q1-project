

var Modal = function(child) {
   this.child = child;
   this.portal = false;
   console.log("modal: ", this.portal);
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
   }
};


Modal.prototype.render = function () {
   var that = this;
   setTimeout(function(){
      // that.portal.classList.add('fade');
      that.portal.classList.add('in');
   }, 10);
   var inner = document.createElement('div');
      inner.className = "modal-inner";
   inner.appendChild(this.child);
   this.portal.children[0].appendChild(inner);
};

Modal.prototype.settleOnMount = function () {
   this.portal.classList.add('in');
};

Modal.prototype.hide = function (e) {
   if (e.target.className === 'modal-backdrop') {
      this.unmount();
   }
};

Modal.prototype.unmount = function () {
   document.body.removeChild(this.portal);
   this.portal = false;
};



var Notification = function () {




}
