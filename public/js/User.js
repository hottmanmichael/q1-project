"use strict";var User=function(){var t="GroupieUser",e="GroupieCache",r="GroupieCurrentArtist";this.authenticated=function(){return null!==localStorage.getItem(t)},this.create=function(){localStorage.setItem(t,JSON.stringify({firstname:"",lastname:"",location:null,artists:[]}))},this.establish=function(t){for(var e in t)this[e]=t[e]},this.fetchLocal=function(s,a){if("undefined"==typeof s||null===s)return null;switch(s){case"MODEL":return JSON.parse(localStorage.getItem(t));case"CURRENT_ARTIST":return JSON.parse(localStorage.getItem(r));case"CACHE":return JSON.parse(localStorage.getItem(e));default:return null}},this.setLocal=function(s,a){if("undefined"==typeof s||null===s)return null;switch(s){case"MODEL":localStorage.setItem(t,JSON.stringify(a));break;case"CURRENT_ARTIST":localStorage.setItem(r,JSON.stringify(a));break;case"CACHE":localStorage.setItem(e,JSON.stringify(a));break;default:return null}},this.addFavorite=function(e,r){for(var s=JSON.parse(localStorage.getItem(t)),a=0;a<s.artists.length;a++)if(s.artists[a].id===e.id)return r({status:"error",message:"Artist already exists in favorites."});if(s.artists.push(e),localStorage.setItem(t,JSON.stringify(s)),e.name.length>15)var i=e.name.substring(0,15)+"...";else var i=e.name;return r({status:"success",message:i+" saved as favorite."})},this.findInCache=function(){},this.saveToCache=function(){}},Artist=function(t,e,r){this.id=t,this.name=e,this.slug=r};Artist.prototype.fixme=function(){};