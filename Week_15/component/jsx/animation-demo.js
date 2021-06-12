import {Timeline ,Animation} from './animation'
import {ease ,easeIn,easeOut,easeInOut} from './ease'

let timeLine = new Timeline();

timeLine.start();

timeLine.add(new Animation(document.querySelector('#el').style,'transform',0, 500,2000, 0, easeInOut, v => `translateX(${v}px)`));
document.querySelector('#el2').style.transition ='transform 2s ease-in-out';
document.querySelector('#el2').style.transform ='translateX(500px)';

document.querySelector("#pause-btn").addEventListener('click',() => timeLine.pause());//测试暂停
document.querySelector("#resume-btn").addEventListener('click',() => timeLine.resume());//测试恢复
document.querySelector("#reset-btn").addEventListener('click',() => timeLine.reset());//测试重置