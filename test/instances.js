/**
 * Created by liuguili on 7/10/15.
 */
function Handler(a, b) {

}

function H(x, y){
  console.log(y instanceof Handler);
}


var h = new H(1, function(m, n) {

});