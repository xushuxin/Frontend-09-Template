
import {Component, createElement} from './framework'
import {Carousel} from './carousel';
import {Timeline ,Animation} from './animation'

let imgs = [
    'https://ssyerv1.oss-cn-hangzhou.aliyuncs.com/picture/9c8e4afbe8174349ad8bf3a0d4cac457.jpg!sswm',
    'https://ssyerv1.oss-cn-hangzhou.aliyuncs.com/picture/28a123ce2b1f472192e6f5b020d528f1.jpg!sswm',
    'https://ssyerv1.oss-cn-hangzhou.aliyuncs.com/picture/e52b83a736524e6191ddcb84835c688c.jpg!sswm',
    'https://ssyerv1.oss-cn-hangzhou.aliyuncs.com/picture/fde5b608f8fa4611947c6b224080aeeb.jpg!sswm'
];

var a = <Carousel src={imgs}>
</Carousel>;

// document.body.appendChild(a);

console.log(a);
// 统一调用 mountTo 接口挂载元素
a.mountTo(document.body);

let timeLine = new Timeline();
// timeLine.add(new Animation({set a(v){ console.log(v)}},'a',0, 100,1000,null));
window.timeLine = timeLine;
window.animation = new Animation({set a(v){ console.log(v)}},'a',0, 100,1000,null);
timeLine.start();