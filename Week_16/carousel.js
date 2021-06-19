
import {Component, STATE, ATTRIBUTE} from './framework.js';
import { enableGesture } from "./gesture.js";
import { Timeline, Animation} from "./animation.js";
import { ease } from "./ease.js";

export { STATE, ATTRIBUTE } from './framework.js';//导出供其他地方使用

// 自定义的类
export class Carousel extends Component{
    constructor(){
       super();//调用父类的构造函数，构造函数中的this指向当前创建的实例(必须调用)
    }
    render(){
        this.root = document.createElement('div');//默认创建一个 div
        this.root.classList.add('carousel');//添加类名
        for(let record of this[ATTRIBUTE].src){   
            let image = document.createElement('div');
            image.style.backgroundImage = `url(${record.img})`;
            this.root.appendChild(image);
        }
        enableGesture(this.root);//给组件添加手势

        let timeLine = new Timeline;
        timeLine.start();

        let children = this.root.children;
        
        this[STATE].position = 0;//记录当前处于哪一张图（0~4）

        let ax = 0;
        let handler = null;

        this.root.addEventListener('start',(event)=>{
            timeLine.pause();
            clearInterval(handler);//清除定时器
            let progress = timeLine.getTime() / 1500;
            
            if(progress > 0){
                ax = ease(progress) * 500 - 500;//动画产生的距离
            }else{
                ax = 0;
            }
           
        })

        this.root.addEventListener('tap',(event) => {
            // 触发点击事件
            this.triggerEvent('click',{
                data:this[ATTRIBUTE].src[this[STATE].position],
                position:this[STATE].position,
            })
        })
        this.root.addEventListener('pan',(event)=>{
            let x = event.clientX - event.startX - ax;//计算鼠标拖动的距离
            //计算当前拖动距离对应到哪一个图片了
            let current = this[STATE].position - (x - x % 500) / 500;// x - x % 500的值一定是500的倍数（自己把自己多余的给减去）
            for(let offset of [-1, 0, 1]){  
                let pos = current + offset;//计算当前是哪个图片，可能为负值，所以要把负值转为正值
                pos = (pos % children.length + children.length) % children.length; //把-1转为3，-2转为2，-3转为1
                children[pos].style.transition = "none";//取消动画
                children[pos].style.transform = `translateX(${ - pos * 500 + offset * 500 + x % 500}px)`;
            }
        })
        this.root.addEventListener('end',(event)=>{
            timeLine.reset();
            timeLine.start();
            handler = setInterval(nextPicture,3000)
            let x = event.clientX - event.startX - ax;//计算鼠标拖动的距离
            //计算当前拖动距离对应到哪一个图片了
            let current = this[STATE].position - (x - x % 500) / 500;// x - x % 500的值一定是500的倍数（自己把自己多余的给减去）
            
            let direction  = Math.round((x % 500) / 500);

            if(event.isFlick){
                console.log('flick',event.velocity)
                if(event.velocity < 0){
                    direction = Math.ceil((x % 500) / 500)
                }else{
                    direction = Math.floor((x % 500) / 500)
                }
            }
            for(let offset of [-1, 0, 1]){  
                let pos = current + offset;//计算当前是哪个图片，可能为负值，所以要把负值转为正值
                pos = (pos % children.length + children.length) % children.length; //把-1转为3，-2转为2，-3转为1
                children[pos].style.transition = "none";//取消动画

                timeLine.add(new Animation( children[pos].style, "transform",
                - pos * 500 + offset * 500 + x % 500, 
                - pos * 500 + offset * 500 + direction * 500, 
                1500, 0, ease, v=>`translateX(${v}px)`));
            }
            this[STATE].position = this[STATE].position - (x - x % 500) / 500 - direction;
            this[STATE].position = (this[STATE].position % children.length + children.length) % children.length;//转为正数
            this.triggerEvent('change', {position :this[STATE].position})
        })

        let nextPicture = ()=>{

            let children = this.root.children;
            let nextIndex = (this[STATE].position + 1) % children.length;
            
            let current = children[this[STATE].position];
            let next = children[nextIndex];

            timeLine.add(new Animation(current.style, "transform", -this[STATE].position * 500, -500 - this[STATE].position * 500, 1500, 0, ease, v=>`translateX(${v}px)`));
            timeLine.add(new Animation(next.style, "transform", 500 - nextIndex * 500, - nextIndex * 500, 1500, 0, ease, v=>`translateX(${v}px)`));

            this[STATE].position = nextIndex;
            this.triggerEvent('change', {position :this[STATE].position})
        }
        handler = setInterval(nextPicture,3000);
        return this.root;
    }
}