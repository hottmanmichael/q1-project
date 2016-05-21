


var wheelItems = document.querySelectorAll('.wheel-item');
var navItems = document.querySelectorAll('.navigation .list .item');
for (var i = 0; i < navItems.length; i++) {
   navItems[i].addEventListener('click', function(e) {
      if (!e.target.classList.contains('active')) {
         for (var j = 0; j < wheelItems.length; j++) {
            if (wheelItems[j].classList.contains('active')) {
               wheelItems[j].classList.remove('active')
            }
         }
         console.log("e.target.for:", e.target.attributes.isFor.value);
         var val = e.target.attributes.isFor.value;
         var box = document.getElementById("wheel-"+val);
            box.className += " " + 'active fade';
            setTimeout(function() {
               this.classList.remove('fade');
            }, 10);
      } else {
         return;
      }
   });
}
