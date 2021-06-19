
import { createElement } from './framework.js';
import {Component, STATE, ATTRIBUTE} from './framework.js';
export { STATE, ATTRIBUTE } from './framework.js';//导出供其他地方使用

export class Button extends Component{
    constructor(){
       super();
    }
    render(){
        this.childContainer = <span></span>;
        this.root = (<div>{this.childContainer}</div>).render();
        return this.root;
    }
    appendChild(child){
        if(!this.childContainer) this.render();//ensure childContainer exist
        this.childContainer.appendChild(child);
    }
}