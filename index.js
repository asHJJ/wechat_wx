const express = require('express');
const sha1 = require('sha1');
const app = express();


const config = {
  appID: 'wxb6934e89eb6785d0',
  appsecret: '58e9db0e17a43d3b4b717f12aeccc20f',
  token: 'atguigu@weixin'
}

app.use((req, res, next) => {
  console.log(req.query);

  //获取请求参数
  const {signature,echostr,timestamp,nonce} = req.query;
  const {token} = config;

  // - 将参数签名加密的三个参数（timestamp、nonce、token）组合在一起，按照字典序排序
  const arr = [timestamp,nonce,token];
  console.log(arr); // [ '1542350582', '477910604', 'atguiguHTML0810' ]
  // - 将排序后的参数拼接在一起，进行sha1加密
  const str = sha1(arr.join(''));
  console.log(str);
  if (signature === str) {
    //说明消息来自于微信服务器
    res.end(echostr);
  } else {
    //说明消息不来自于微信服务器
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