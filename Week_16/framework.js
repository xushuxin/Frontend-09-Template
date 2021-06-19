/**
 * 
 * @param {元素名/组件的类} type 
 * @param {属性对象} attributes 
 * @param  {...子组件列表} children 
 */
export function createElement(type, attributes, ...children){
    // 创建元素
    let element;
    if(typeof type === 'string')//普通元素
        element = new ElementWrapper(type);
    else    
        element = new type;//自定义组件
        
    // 设置属性
    for(let name in attributes){
        element.setAttribute(name, attributes[name])
    }
    
    let processChildren = (children) =>{
        console.log('children',children)
        // 添加子节点
        for(let child of children){
            if(Array.isArray(child)){
                processChildren(child);
                continue;
            } 
            if(typeof child === 'string'){
                child = new TextNodeWrapper(child);
            }
            element.appendChild(child);
        }
    }
    processChildren(children);
    return element;
}

export const STATE = Symbol("state");//状态管理
export const ATTRIBUTE = Symbol("attribute");//状态管理

export class Component{
    constructor(){
        this[ATTRIBUTE] = Object.create(null);//初始化存储属性的对象
        this[STATE] = Object.create(null);
    }
    render(){
        return this.root;
    }
    setAttribute(name,value){
        this[ATTRIBUTE][name] = value;//存储属性和值
    }
    appendChild(child){
        child.mountTo(this.root);
    }
    mountTo(parent){
        if(!this.root) this.render();
        parent.appendChild(this.root);
    }
    triggerEvent(type, args){ //触发事件
        // 1.替换事件首字母为大写
        // 2.使用浏览器自带的CustomEvent创建事件对象（注意参数放在detail属性上）
        this[ATTRIBUTE]["on" + type.replace(/^[a-z]/,s => s.toUpperCase())](new CustomEvent(type, {detail:args}));
    }
}
// 将原生元素的创建包装一层，提供 mountTo方法
class ElementWrapper extends Component{
    constructor(type){
        super();
        this.root = document.createElement(type);
    }

    setAttribute(name,value){ //重载setAttribute方法，原生元素直接设置属性即可
        this.root.setAttribute(name,value)
    }
}

// 将文本节点也包装一层，提供 mountTo方法
class TextNodeWrapper extends Component{
    constructor(content){
        super();
        this.root = document.createTextNode(content);
    }
}