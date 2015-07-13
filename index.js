/**
 * Created by liuguili on 7/13/15.
 */
var koa = require('koa');
var logger = require('koa-logger')();

var app = koa();

app.use(logger);

app.use(function*(next) {
  try {
    yield next;
  } catch (err) {
    this.status = err.status || 500;
    this.body = {
      status: this.status,
      message: err.message
    };
    this.app.emit('error', err, this);
  }
});

app.on('err', function(err) {
  console.error(err);
});


var Wechat = require('./lib/wechat');

var config = {
  token: '7a5b589093714d1fa578ac37fea5f8d4',
  EncodingAESKey: '4hSnErkESRA5LT6klTlj196vvb33jl9QvKZJyHDV3Z7'
}

var wechat = new Wechat('/wechat', config, handler);

app.use(wechat.wechats());

function* handler(msg) {
  console.log('received msg: ', msg);

  return yield this.reply('Hi.');
}

app.listen(8000);