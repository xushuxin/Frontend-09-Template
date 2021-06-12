
import {Component} from './framework'
// 自定义的类
export class Carousel extends Component{
    constructor(){
       super();//调用父类的构造函数，构造函数中的this指向当前创建的实例(必须调用)
       this.attributes = Object.create(null);//初始化存储属性的对象
    }
    setAttribute(name,value){
        this.attributes[name] = value;//存储属性和值
    }
    render(){
        this.root = document.createElement('div');//默认创建一个 div
        this.root.classList.add('carousel');//添加类名
        for(let url of this.attributes.src){   
            let image = document.createElement('div');
            image.style.backgroundImage = `url(${url})`;
            this.root.appendChild(image);
        }
        let position = 0;//记录当前处于哪一张图（0~4）
        this.root.addEventListener('mousedown',(event) => {
            let children = this.root.children;
            let startX = event.clientX;
            let move = (event) => {
                let x = event.clientX - startX;//计算鼠标拖动的距离
                //将每个元素都移动鼠标拖动的距离
                // for(let child of children){
                //     child.style.transition = 'none';//鼠标按下时，只需要图片的位置随着鼠标拖动而改变，不需要动画效果
                //     child.style.transform = `translateX(${- position * 500 + x}px)`;//自己手动调用transform实现动画
                // }
                /* 优化 */
                //计算当前拖动距离对应到哪一个图片了
                let current = position - (x - x % 500) / 500;// x - x % 500的值一定是500的倍数（自己把自己多余的给减去）
                for(let offset of [-1, 0, 1]){  
                    let pos = current + offset;//计算当前是哪个图片，可能为负值，所以要把负值转为正值
                    console.log(pos,current, offset);
                    pos = (pos + children.length) % children.length; //把-1转为3，-2转为2，-3转为1
                    children[pos].style.transition = "none";//取消动画
                    children[pos].style.transform = `translateX(${ - pos * 500 + offset * 500 + x % 500}px)`;
                }
            }
            let up = (event) => {
                let x = event.clientX - startX;//计算鼠标拖动的距离(往左划x为负)
                position = position - Math.round(x / 500);//拖动的距离如果超过图片的一半宽度就移动到下一个图片，没超过一半则显示当前的图片
                // for(let child of children){
                //     child.style.transition = '';//鼠标抬起时需要判断需要回弹还是进入下一个（需要动画过程），取消js的transition设置，CSS的transition生效
                //     child.style.transform = `translateX(${- position * 500 }px)`;
                // }
                for(let offset of [0, - Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]){  
                    let pos = position + offset;//计算当前是哪个图片，可能为负值，所以要把负值转为正值
                    pos = (pos + children.length) % children.length; //把-1转为3，-2转为2，-3转为1
                    children[pos].style.transition = "";//加上css动画
                    children[pos].style.transform = `translateX(${ - pos * 500 + offset * 500}px)`;
                }
                document.removeEventListener('mousemove', move)
                document.removeEventListener('mouseup', up)
            }
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        })
        // let currentIndex = 0;
        // setInterval(()=>{
        //     let children = this.root.children;
        //     let nextIndex = (currentIndex + 1) % children.length;
            
        //     let current = children[currentIndex];
        //     let next = children[nextIndex];
            
        //     next.style.transition = 'none';// js设置 property 覆盖 css 属性，取消过渡效果
        //     next.style.transform = `translateX(${100 - nextIndex * 100}%)`; // 0 -100 -200 100

        //     setTimeout(()=>{
        //         next.style.transition = '';//取消 js 的设置，css 属性生效，产生过渡效果
        //         current.style.transform = `translateX(${-100 - currentIndex * 100}%)`;//-100 -200 -300 -400
        //         next.style.transform = `translateX(${- nextIndex * 100}%)`;// -100 -200 -300 0
        //         currentIndex = nextIndex;
        //     },16)
        // },2000);
        return this.root;
    }
    mountTo(parent){
        parent.appendChild(this.render())//添加到父元素时创建组件根元素
    }
}