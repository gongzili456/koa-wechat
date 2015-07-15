/**
 * Created by liuguili on 7/10/15.
 */
'use strict';

const debug = require('debug')('koa_wechat:');
const crypto = require('crypto');
const xml2js = require('xml2js');
const parse = require('co-body');
const views = require('co-views');
const ejs = require('ejs');
const pathToRegExp = require('path-to-regexp');
const assert = require('assert');
const Q = require('q');
const viewPath = require('path').join(__dirname, 'template');

var render = views(viewPath, {
  map: {
    xml: 'ejs'
  }
});


/**
 *
 * @param path
 * @param config
 * @param handler function(msg){}
 * @constructor
 */
var Wechat = function (path, config, handler) {

  if (!(this instanceof Wechat)) {
    return new Wechat(path, config, handler);
  }

  if (!path || 'string' !== typeof path) {
    throw('path is require.');
  }

  ['token', 'EncodingAESKey'].forEach(function (key) {
    assert(config[key], `${key} is required`);
  });

  if (!handler && 'function' !== typeof handler) {
    throw('handler function is required.');
  }

  this.path = path;
  this.config = config;
  this.handler = handler;
};

Wechat.prototype.reply = function* (msg) {

  msg = msg || '';

  if (msg === '') {
    return msg;
  }

  if ('string' === typeof msg) {
    var content = msg;
    msg = {
      Content: content,
      MsgType: 'text'
    }
  }

  if (Array.isArray(msg)) {
    var content = msg;
    msg = {
      MsgType: 'news',
      Content: content
    }
  }

  switch (msg.MsgType) {
    case 'text':
      this._response.MsgType = 'text';
      this._response.Content = msg.Content;
      break;
    case 'image':
      this._response.MsgType = 'image';
      this._response.MediaId = msg.MediaId;
      break;
    case 'voice':
      this._response.MsgType = 'voice';
      this._response.MediaId = msg.MediaId;
      break;
    case 'video':
      this._response.MsgType = 'video';
      this._response.MediaId = msg.MediaId;
      this._response.Title = msg.Title;
      this._response.Description = msg.Description;
      break;
    case 'music':
      this._response.MsgType = 'music';
      this._response.Title = msg.Title;
      this._response.Description = msg.Description;
      this._response.MusicUrl = msg.MusicUrl;
      this._response.HQMusicUrl = msg.HQMusicUrl;
      this._response.ThumbMediaId = msg.ThumbMediaId;
      break;
    case 'news':
      this._response.MsgType = 'news';
      this._response.ArticleCount = msg.Content.length;
      this._response.Articles = [];

      for (var i in msg.Content) {
        let con = msg.Content[i];
        this._response.Articles.push({
          Title: con.Title,
          Description: con.Description,
          PicUrl: con.PicUrl,
          Url: con.Url
        })
      }
      ;

      break;
    case 'event':
      break;
  }

  return yield render(this._response.MsgType + '.ejs', this._response);

}

//['text', 'image', 'voice', 'video', 'music', 'news', 'event'].forEach(function (method) {
//  Object.defineProperty(Wechat.prototype, method, {
//
//    get: function get() {},
//
//    set: function set(msg) {
//
//    }
//  });
//});


Wechat.prototype.wechats = Wechat.prototype.middleware = function () {
  var wechat = this;
  var chain = function* chain(next) {

    //mach url
    debug('match: ', this.path.match(pathToRegExp(wechat.path)));
    if (!this.path.match(pathToRegExp(wechat.path))) {
      debug('comming in match.')
      return yield next;
    }

    this.token = wechat.config.token;

    if (this.method.toUpperCase() === 'GET') {
      debug('handle request GET.');

      var isSignature = yield wechat.checkSignature.bind(this)();
      this.body = isSignature ? this.query.echostr : '';

    } else if (this.method.toUpperCase() === 'POST') {
      debug('handle request POST.');

      /**
       * 1. check signature
       * 2. parse received data xml to json
       * 2.5 prepare response data json
       * 3. call overwrite handler
       * 4. ?
       */
      var isSignature = yield wechat.checkSignature.bind(this)();

      if (!isSignature) {
        return this.body = '';
      }

      var xml = yield parse.text(this.req);
      var msg = yield wechat.parseToJson(xml);

      wechat._response = {
        ToUserName: msg.FromUserName,
        FromUserName: msg.ToUserName,
        CreateTime: new Date().valueOf()
      };

      //call handler overwrite
      var response = yield wechat.handler.bind(wechat)(msg);


      this.body = response;
    } else {
      yield next;
    }
  };

  chain.wechat = this;
  return chain;
};

Wechat.prototype.checkSignature = function* () {
  var signature = this.query.signature;
  var timestamp = this.query.timestamp;
  var nonce = this.query.nonce;
  var shasum = crypto.createHash('sha1');
  var arr = [this.token, timestamp, nonce].sort();
  shasum.update(arr.join(''));
  return shasum.digest('hex') === signature;
};

Wechat.prototype.parseToJson = function* parseToJson(xml) {
  var deferred = Q.defer();
  xml2js.parseString(xml, {trim: true}, function (err, result) {
    if (err) {
      deferred.reject(new Error(error));
    } else {
      var message = {};
      Object.keys(result.xml).forEach(function (key) {
        message[key] = result.xml[key][0];
      });
      deferred.resolve(message);
    }
  })
  return deferred.promise;
};

module.exports = Wechat;
