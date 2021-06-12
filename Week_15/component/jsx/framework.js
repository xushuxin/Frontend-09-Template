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
        
    console.log(element)
    // 设置属性
    for(let name in attributes){
        element.setAttribute(name, attributes[name])
    }
    console.log(children)
    for(let child of children){
        if(typeof child === 'string'){
            child = new TextNodeWrapper(child);
        }
        // console.log(child);
        element.appendChild(child);
    }
    return element;
}


export class Component{
    setAttribute(name,value){
        this.root.setAttribute(name,value)
    }
    appendChild(child){
        child.mountTo(this.root);
    }
    mountTo(parent){

        parent.appendChild(this.root);
    }
}
// 将原生元素的创建包装一层，提供 mountTo方法
class ElementWrapper extends Component{
    constructor(type){
        super();
        this.root = document.createElement(type);
    }

}

// 将文本节点也包装一层，提供 mountTo方法
class TextNodeWrapper extends Component{
    constructor(content){
        super();
        this.root = document.createTextNode(content);
    }
}