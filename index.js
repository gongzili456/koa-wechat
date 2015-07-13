/**
 * Created by liuguili on 7/13/15.
 */
var koa = require('koa');


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


var wechat = require('./lib/wechat');

app.use(wechat('/wechat', {
  token: '7a5b589093714d1fa578ac37fea5f8d4',
  EncodingAESKey: '4hSnErkESRA5LT6klTlj196vvb33jl9QvKZJyHDV3Z7'
}, function(msg) {
  console.log('received msg: ', msg);

  return yield this.reply('Hi.');
}));