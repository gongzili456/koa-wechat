/**
 * Created by liuguili on 7/13/15.
 */
var koa = require('koa');
var logger = require('koa-logger')();
var Wechat = require('../lib/wechat');

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


var config = {
  token: '7a5b589093714d1fa578ac37fea5f8d4',
  EncodingAESKey: '4hSnErkESRA5LT6klTlj196vvb33jl9QvKZJyHDV3Z7'
}

var wechat = new Wechat('/wechat', config, handler);

app.use(wechat.wechats());

function* handler(msg) {
  console.log('received msg: ', msg);

  var res = '';

  switch (msg.Content){
    case 'text':
      res = 'Hi';
      break;

    case 'image':
      res = {
        MsgType: 'image',
        MediaId: 'HsaaCMBGpwqpZW6vOSGsE6DFdBiLsQ-BE8Jkw7-ujLpm7PqAtFTK9lJck8eMTL5R'
      }
      break;

    case 'voice':
      res = {
        MsgType: 'voice',
        MediaId: 'uEKLi-ll-jqe54ojkgJu54TBmi64wfAX5TdopVzStNEeGWQe0TOxijiQWe7iYZ1J'
      }
      break;

    case 'video':
      res = {
        MsgType: 'video',
        MediaId: 'vMcPRgclyCTJ8TYz5NnTwsaSYgcwmAHFqPShGnOXMSyQqV6bEZmcdWbxZ5fxJYQF',
        Title: 'video title',
        Description: 'video desc'
      }
      break;

    case 'music':
      res = {
        MsgType: 'music',
        MediaId: ''
      }
      break;

    case 'news':
      res = [
        {
          Title: 'title 1',
          Description: 'desc 1',
          PicUrl: 'http://bizhi.zhuoku.com/2011/02/25/music/Music07.jpg',
          Url: 'http://baidu.com'
        },
        {
          Title: 'title 2',
          Description: 'desc 2',
          PicUrl: 'http://img0.pconline.com.cn/pconline/1305/20/3304470_1.jpg',
          Url: 'http://sina.com'
        }
      ]
  }

  return yield this.reply(res);
}

app.listen(9300);