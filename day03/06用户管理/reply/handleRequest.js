/**
 * Created by Administrator on 2018/11/17.
 */
const sha1 = require('sha1');
const reply = require('./reply');
const {getUserDataAsync, parseXMLDataAsync, formatMessage} = require('../utils/tools');
const template = require('./template');
const {token} = require('../config/index');

module.exports =() => {

  return async(req, res, next) => {
    console.log(req.query);
    //获取请求参数
    const {signature, echostr, timestamp, nonce} = req.query;
    // const {token} = config;
    const str = sha1([timestamp, nonce, token].sort().join(''));
    /*
     微信服务器会发送两种类型的消息给开发者
     1. GET 验证服务器有效性逻辑
     2. POST 转发用户消息
     */
    if (req.method === 'GET') {
      // 验证服务器有效性逻辑
      if (signature === str) {
        //说明消息来自于微信服务器
        res.end(echostr);
      } else {
        //说明消息不来自于微信服务器
        res.end('error');
      }
    } else if (req.method === 'POST') {
      // 转发用户消息
      //接受微信服务器转发用户消息
      //验证消息来自于微信服务器
      if (signature !== str) {
        res.end('error');
        return;
      }
      //用户发送的消息在请求体
      const xmlData = await getUserDataAsync(req);
      console.log(xmlData);
      /*
       <xml>
       <ToUserName><![CDATA[gh_4fe7faab4d6c]]></ToUserName>    开发者的微信号
       <FromUserName><![CDATA[oAsoR1iP-_D3LZIwNCnK8BFotmJc]]></FromUserName>  微信用户openid
       <CreateTime>1542355200</CreateTime>   发送消息的时间戳
       <MsgType><![CDATA[text]]></MsgType>   消息类型
       <Content><![CDATA[111]]></Content>    消息的具体内容
       <MsgId>6624365143243452763</MsgId>    消息id，微信服务器会默认保存3天微信用户发送的消息，在此期间内通过这id就能找到当前消息
       </xml>
       */
      //将用户发送过来的xml数据解析为js对象
      const jsData = await parseXMLDataAsync(xmlData);
      console.log(jsData);
      /*
       {
       xml:
       { ToUserName: [ 'gh_4fe7faab4d6c' ],
       FromUserName: [ 'oAsoR1iP-_D3LZIwNCnK8BFotmJc' ],
       CreateTime: [ '1542355988' ],
       MsgType: [ 'text' ],
       Content: [ '222' ],
       MsgId: [ '6624368527677682013' ]
       }
       }
       */
      //格式化数据
      const message = formatMessage(jsData);
      console.log(message);
      /*
       { ToUserName: 'gh_4fe7faab4d6c',
       FromUserName: 'oAsoR1iP-_D3LZIwNCnK8BFotmJc',
       CreateTime: '1542356422',
       MsgType: 'text',
       Content: '333',
       MsgId: '6624370391693488478' }
       */

      const options = reply(message);

      const replyMessage = template(options);
      console.log(replyMessage);

      /*
       遇见问题：
       当你在微信客户端发送一条消息给微信公众号，这时收到一个错误：该公众号提供的服务出现故障，请稍后再试
       说明：
       1. 你没有返回响应给微信服务器
       2. 返回了，但是消息的内容格式错误
       - 你返回的不是xml数据
       - 返回的xml数据有多余的空格
       - xml数据多删了几个字符
       解决：检查replyMessage是否有以上问题
       */

      /*
       注意：微信服务器当没有接收到开发者服务器响应时，默认会请求3次开发者服务器，就会导致接口被调用多次
       解决：提前返回一个值给微信服务器  res.end('');
       */
      res.send(replyMessage);

    } else {
      res.end('error');
    }

  }
}