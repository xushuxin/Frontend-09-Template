
import { createElement } from './framework.js';
import {Component, STATE, ATTRIBUTE} from './framework.js';
export { STATE, ATTRIBUTE } from './framework.js';//导出供其他地方使用

export class List extends Component{
    constructor(){
       super();
    }
    render(){
        this.children = this[ATTRIBUTE].data.map(this.template);//遍历数据，使用模板函数生成一个元素数组
        this.root = (<div>{this.children}</div>).render();//将元素数组放到根元素下
        return this.root;
    }
    appendChild(child){
       this.template = child;
       this.render();
    }
}