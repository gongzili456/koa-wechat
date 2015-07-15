"use strict";

var Promise = require('promise');


function a() {

  return new Promise(function(reslove, reject){
    setTimeout(function () {
      console.log('ok');
      reslove(200);
    }, 4000);
  });

}

