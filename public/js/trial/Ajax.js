"use strict";const post="POST",get="GET";var Ajax=function(t,e,s,r){function n(){4===this.readyState&&(200===this.status?s(null,JSON.parse(this.responseText)):(console.error("Error in Ajax "+t+" request: "+this),s({message:JSON.parse(this.responseText),status:this.status,all:this},null)))}if(this.request=new XMLHttpRequest,this.request.onreadystatechange=n,this.request.open(t,e),t===post);else{if(t!==get)throw console.trace(),new Error("Invalid method: "+t+" in Ajax request.");this.request.send()}};