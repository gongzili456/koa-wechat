/**
 * Created by liuguili on 7/10/15.
 */
var pathToRegExp = require('path-to-regexp');

var rs = '/wechat'.match(pathToRegExp('/wechat', []));

console.log('rs: ', rs);