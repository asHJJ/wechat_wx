/**
 * Created by Administrator on 2018/11/17.
 */
  //初始化消息配置对象
module.exports = message =>{


let options = {
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName,
    createTime: Date.now(),
    msgType: 'text'
  }

//初始化一个消息文本
let content = '你在说什么，我听不懂~';


if(message.MsgType ==='text'){
  //判断用户发送消息的内容，根据内容返回特定的响应
  if (message.Content === '1') {  //全匹配
    content = '啊哈哈哈哈哈哈~';
  } else if (message.Content === '2') {
    content = '你拍二我拍二';
  } else if (message.Content.includes('比心')) {  //半匹配
    content = '么么哒';
  } else if (message.Content === '3') {
    //回复图文消息
    options.msgType = 'news';
    options.title = '微信公众号开发~';
    options.description = 'class0810~';
    options.picUrl = 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=199783060,2774173244&fm=58&s=188FA15AB1206D1108400056000040F6&bpow=121&bpoh=75';
    options.url = 'http://www.atguigu.com';
  }

}else if(message.MsgType === 'voice'){
  //说明用户发送的是语音消息
  content = `语音识别结果为: ${message.Recognition}`;

}else if(message.MsgType ==='location'){
  //用户主动发送位置
  content = `纬度：${message.Location_X}  经度：${message.Location_Y} 地图的缩放大小：${message.Scale} 位置详情：${message.Label}`;
}else if (message.MsgType === 'event'){
  //关注事件，订阅事件
  if(message.Event ==='subscribe'){
    content = '欢迎您关注公众号~';
    if (message.EventKey) {
      //说明扫了带参数的二维码
      content = '欢迎您关注公众号~, 扫了带参数的二维码';
    }
  }else if(message.Event ==='unsubscribe'){
    //取消关注事件
    console.log('无情取关~');
  }else if(message.Event ==='LOCATION'){
    //用户初次访问公众号，会自动获取地理位置
    content =`维度 ：${message.Latitude} 经度:${message.Longitude}`

  }else if(message.Event ==='CLICK'){
    //用户初次访问公众号，会自动获取地理位置
    content =`用户点击了 :${message.EventKey}`;

  }

}
//判断用户发送消息的内容，根据内容返回特定的响应
options.content = content;
return options;
}