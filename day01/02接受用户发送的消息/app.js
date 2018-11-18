const express = require('express');
const sha1 = require('sha1');
const {getUserDataAsync,parseXMLDataAsync,formatMessage} = require('./utils/tools');

const app = express();


const config = {
  appID: 'wxb6934e89eb6785d0',
  appsecret: '58e9db0e17a43d3b4b717f12aeccc20f',
  token: 'atguigu@weixin'
}

app.use(async (req, res, next) => {
  console.log(req.query);

  //获取请求参数
  const {signature,echostr,timestamp,nonce} = req.query;
  const {token} = config;

  // // - 将参数签名加密的三个参数（timestamp、nonce、token）组合在一起，按照字典序排序
  // const arr = [timestamp,nonce,token];
  // console.log(arr); // [ '1542350582', '477910604', 'atguiguHTML0810' ]
  // // - 将排序后的参数拼接在一起，进行sha1加密
  // const str = sha1(arr.join(''));
  // console.log(str);


  const str = sha1([timestamp, nonce, token].sort().join(''));
  /*
   微信服务器会发送两种类型的消息给开发者
   1. GET 验证服务器有效性逻辑
   2. POST 转发用户消息
   */
if(req.method ==='GET'){
  //验证服务器有效性逻辑
  if (signature === str) {
    //说明消息来自于微信服务器
    res.end(echostr);
  } else {
    //说明消息不来自于微信服务器
    res.end('error');
  }

}else if(req.method ==='POST'){
  // 转发用户消息
  //接受微信服务器转发用户消息
  //验证消息来自于微信服务器

  if(signature !==str){
    res.end('error');
    return;
  }
  //用户发送的消息在请求体
  const xmlData = await getUserDataAsync(req);
  console.log(xmlData);

  // <xml><ToUserName><![CDATA[gh_957ce5788b5a]]></ToUserName>
  // <FromUserName><![CDATA[oY6UT5lZCFF-_sUAwefLoinkk34w]]></FromUserName>
  // <CreateTime>1542368073</CreateTime>
  // <MsgType><![CDATA[text]]></MsgType>
  // <Content><![CDATA[111]]></Content>
  // <MsgId>6624420432355366866</MsgId>
  // </xml>

 //将用户发送过来的xml数据解析为js对象
  const jsData = await parseXMLDataAsync(xmlData);
  console.log(jsData);
  // { xml:
  // { ToUserName: [ 'gh_957ce5788b5a' ],
  //   FromUserName: [ 'oY6UT5lZCFF-_sUAwefLoinkk34w' ],
  //   CreateTime: [ '1542370914' ],
  //   MsgType: [ 'text' ],
  //   Content: [ '3' ],
  //   MsgId: [ '6624432634357454806' ] } }

  //格式化数据
  const message = formatMessage(jsData);
  console.log(message);

  //
  // { ToUserName: 'gh_957ce5788b5a',
  //   FromUserName: 'oY6UT5lZCFF-_sUAwefLoinkk34w',
  //   CreateTime: '1542372426',
  //   MsgType: 'text',
  //   Content: '6',
  //   MsgId: '6624439128348006362' }

  //初始化一个消息文本
  let content = '你在说什么，我听不懂~';
  //判断用户发送消息的内容，根据内容返回特定的响应
  if (message.Content === '1') {  //全匹配
    content = '啊哈哈哈哈哈哈~';
  } else if (message.Content === '2') {
    content = '你拍二我拍二';
  } else if (message.Content.includes('比心')) {  //半匹配
    content = '么么哒';
  }

  //返回xml 给微信服务器
  let replyMessage = `
   <xml> <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
  <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
  <CreateTime>${Date.now()}</CreateTime>
  <MsgType><![CDATA[text]]></MsgType>
  <Content><![CDATA[${content}]]></Content>
  </xml>`;
  /*
   注意：微信服务器当没有接收到开发者服务器响应时，默认会请求3次开发者服务器，就会导致接口被调用多次
   解决：提前返回一个值给微信服务器  res.end('');
   */
  res.send(replyMessage);




}
else {
  res.end('error');
}

  // { signature: '61af323e8fec051c17e805387f710cc6caa0af76',
  // echostr: '6682776030172573435',
  //   timestamp: '1542352569',
  //   nonce: '1928438980' }
})





app.listen(3000, err => {
  if (!err) console.log('服务器启动成功了');
  else console.log(err);
})