
import {Component, createElement} from './framework.js'
import {Carousel} from './carousel.js';
import {Button} from './button.js';
import {List} from './list.js';
import {Timeline ,Animation} from './animation.js'

/* ============ test Carousel =============== */
let imgs = [
    {
        img:'https://ssyerv1.oss-cn-hangzhou.aliyuncs.com/picture/9c8e4afbe8174349ad8bf3a0d4cac457.jpg!sswm',
        url:'https://www.baidu.com',
        title:'图片1'
    },
    {
        img:'https://ssyerv1.oss-cn-hangzhou.aliyuncs.com/picture/28a123ce2b1f472192e6f5b020d528f1.jpg!sswm',
        url:'https://www.baidu.com',
        title:'图片2'
    },
    {
        img:'https://ssyerv1.oss-cn-hangzhou.aliyuncs.com/picture/e52b83a736524e6191ddcb84835c688c.jpg!sswm',
        url:'https://www.baidu.com',
        title:'图片3'
    },
    {
        img:'https://ssyerv1.oss-cn-hangzhou.aliyuncs.com/picture/fde5b608f8fa4611947c6b224080aeeb.jpg!sswm',
        url:'https://www.baidu.com',
        title:'图片4'
    }
];

var a = <Carousel src={imgs} 
onChange={event => console.log(event.detail.position)}
onClick={event => window.open(event.detail.data.url)}
>
</Carousel>;

// 统一调用 mountTo 接口挂载元素
a.mountTo(document.body);

/* ============ test timeline =============== */
let timeLine = new Timeline();
// timeLine.add(new Animation({set a(v){ console.log(v)}},'a',0, 100,1000,null));
window.timeLine = timeLine;
window.animation = new Animation({set a(v){ console.log(v)}},'a',0, 100,1000,null);
timeLine.start();


// 两种children的实现

/* ============内容型children test Button =============== */
let b = <Button>
    button content
</Button>;
b.mountTo(document.body);

/* ============模板型children test List =============== */
let c = <List data={imgs}>
    {
        (record)=> <div>
            <img style="width:100px;height:80px;vertical-align:middle;" src={record.img} />
            <a href={record.url}>{record.title}</a>
        </div>
    }
</List>;
c.mountTo(document.body);