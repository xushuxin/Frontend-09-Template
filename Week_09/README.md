学习笔记

#### HTML解析成DOM树
HTML标准：https://html.spec.whatwg.org/multipage/
搜索查看Tokenization部分

第一步 HTML parse模块的文件拆分
+ 为了方便管理，把parser单独拆分到一个文件中
+ parser接收HTML文本作为参数，返回一颗DOM树

第二步 HTML的解析
+ 用FSM(有限状态机)来实现解析
+ 在HTML标准中，已经规定了HTML的状态
+ Toy-Browser只挑选其中一部分状态，完成一个最简版本

第三步 
+ 主要的标签有：开始标签，结束标签和自封闭标签
+ 这一步暂时忽略属性

第四步 
+ 在状态机中，除了状态迁移，我们还要加入业务逻辑（创建token，把字符加到token上，最后emit token）
+ 在标签的结束状态提交标签token(开始标签和结束标签，从词法角度分为了两个token)

第五步 处理属性
+ 属性值分为单引号、双引号、无引号三种写法，因此需要较多状态处理
+ 处理属性的方式跟标签类似
+ 属性结束时，我们把属性加到标签Token上

第六步 用token构建DOM树
+ 从标签构建DOM树的基本技巧是使用栈
+ 遇到开始标签时创建元素并入栈，遇到结束标签时出栈
+ 自封闭节点可视为入栈后立即出栈
+ 任何元素的父元素是它入栈前的栈顶

第七步 将文本节点加到DOM树
+ 通过一个全局变量来控制当前元素的文本内容的拼接
+ 为null时，代表一开始直接就是文本节点或者被其他元素标签中断过，视为当前栈顶元素的文本内容
+ 不为null时，代表是连续的文本节点，追加到当前的content中
```js
let currentToken = null;
let currentAttribute = null;

let stack = [{type:'document',children:[]}]
let currentTextNode = null;

function emit(token){
    let top = stack[stack.length - 1];
    if(token.type === 'startTag'){
        let element = {
            type:'element',
            children:[],
            attributes:[]
        };
        element.tagName = token.tagName;

        //获取element的属性列表
        for(let p in token){
            if(p!== 'type' && p!="tagName"){
                element.attributes.push({
                    name:p,
                    value:token[p]
                });
            }
        }
        //向父元素的children数组中添加当前子元素
        top.children.push(element);
        element.parent = top;//标记当前子元素的父元素

        //如果不是自闭合标签，就将当前元素入栈
        if(!token.isSelfClosing){
            stack.push(element);
        }

        currentTextNode = null;

    }else if(token.type === 'endTag'){
        if(top.tagName != token.tagName){
            throw new Error('Tag Start end doesn\'t match!')
        }else{
            stack.pop();
        }
        currentTextNode = null;
    } else if(token.type === 'text'){//处理文本节点
        if(currentTextNode === null){
            currentTextNode = {
                type:'text',
                content:''
            };
            top.children.push(currentTextNode)//放到当前栈顶元素的children数组中
        }
        currentTextNode.content += token.content;//拼接当前栈顶元素的文本内容
    }
       
}

//使用Symbol作为文件结束的唯一标识
const EOF = Symbol('EOF');// End of File

function data(c){
    if(c === '<'){//开始标签
        return tagOpen;
    }else if(c === EOF){//结束标识，代表文件已解析完成
        emit({
            type:'EOF'
        })
        return;
    }else{//否则都认为是文本节点
        emit({
            type:'text',
            content:c
        })
        return data;//继续处理下个字符
    }
}

function tagOpen(c){
    if(c === '/'){//判断是不是结束标签：（「<」后面紧跟着一个「/」）
        return endTagOpen;
    }else if(c.match(/^[a-zA-Z]$/)){//如果「<」后面是一个英文字母，要么是一个开始标签，要么是自封闭标签
        currentToken = {
            type: 'startTag',//都视为开始标签，自封闭标签后面使用isSelfClosing来区分
            tagName: ''
        }
        return tagName(c);//进入收集tagName
    }else{
        return;
    }
}

//结束标签的开头
function endTagOpen(c){
    if(c.match(/^[a-zA-Z]$/)){
        currentToken = {
            type: 'endTag',
            tagName: ''
        }
       return tagName(c); //收集结束标签
    }else if(c  === '>'){
        throw Error('错误')
    }else if(c === EOF){
        throw Error('错误')
    }else{

    }
}

function tagName(c){
    //html中有效的空白符有4种（tab符，换行符，禁止符，空格符）
    if(c.match(/^[\t\n\f\s]$/)){//如果是空格，表示后面是属性设置
        return beforeAttributeName;
    }else if(c === '/'){// 自闭合标签
        return selfClosingStartTag;
    }else if(c.match(/^[a-zA-Z]$/)){//英文字符，标签名的一部分，继续收集下一个字符
        currentToken.tagName += c;
        return tagName;
    }else if(c === '>'){//开始标签结束或者结束标签 的结束
        emit(currentToken);
        return data;//进行下一个标签的查找（可能是子节点或者是下一个元素标签）
    }else{
       return tagName; 
    }
}


function beforeAttributeName(c){
    if(c.match(/^[\t\n\f\s]$/)){
        return beforeAttributeName;
    }else if(c === '/' || c === '>' || c === EOF){
        return afterAttributeName(c);
    }else if(c === '='){
        //报错
    }else {
        currentAttribute = {
            name:'',
            value:''
        }
        return attributeName(c);
    }
}

function attributeName(c){
    if(c.match(/^[\t\n\f\s]$/) || c === '/' || c === '>' || c === EOF){
        return afterAttributeName(c);
    }else if(c === '='){
        return beforeAttributeValue;
    }else if(c === '\u0000'){

    }else if(c === '\"' || c === "'"  || c === "<"){
        
    }else {
        currentAttribute.name += c; //收集属性名
        return attributeName;
    }
}

function afterAttributeName(c){
    //如果是空白符，继续判断后面是不是有属性
    if(c.match(/^[\t\n\f\s]$/)){
        return attributeName;
    }else if(c === '/' ){//自闭合标签
        return selfClosingStartTag;
    }else if(c === '>' ){
        //单标签，我们这里不考虑
    }else if(c  === EOF){
        //不合法
    }else{
        //不合法
    }
}
//
function beforeAttributeValue(c){
    if(c.match(/^[\t\n\f\s]$/) || c === '/' || c === '>' || c === EOF){
        return beforeAttributeValue;
    }else if(c === '\"'){
        return doubleQuotedAttributeValue;
    }else if(c === '\''){
        return singleQuotedAttributeValue;
    }else if(c === '>'){
        // return data;
    }else{
        return UnquotedAttributeValue(c);
    }
}
//双引号的值
function doubleQuotedAttributeValue(c){
    if(c === '\"'){//拼接了一个完整的属性值了
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    }else if(c === '\u0000'){

    }else if(c === EOF){

    }else{
        currentAttribute.value += c;//拼接属性值
        return doubleQuotedAttributeValue;
    }

}

function singleQuotedAttributeValue(c){
    if(c === '\''){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    }else if(c === '\u0000'){

    }else if(c === EOF){

    }else{
        currentAttribute.value += c;
        return singleQuotedAttributeValue;
    }
}

function afterQuotedAttributeValue(c){
    if(c.match(/^[\t\n\f\s]$/)){
        return beforeAttributeName;
    }else if(c === '/'){
        return selfClosingStartTag;
    }else if(c === '>'){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }else if(c === EOF){

    }else{
        // currentAttribute.value += c;
        // return doubleQuotedAttributeValue; 
    }
}

function UnquotedAttributeValue(c){
    if(c.match(/^[\t\n\f\s]$/)){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    }else if(c === '/'){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    }else if(c === '>'){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }else if(c === '\u0000'){

    }else if(c === '\'' || c === '\"' || c === '<' || c === '=' || c === '`'){

    }else if(c === EOF){

    }else{
        currentAttribute.value += c;
        return UnquotedAttributeValue;
    }
}
//自闭合标签
function selfClosingStartTag(c){
    if( c === '>'){
        currentToken.isSelfClosing = true;//标识为自闭合标签
        emit(currentToken);
        return data;
    }else if(c === EOF){
        //报错
    }else{
        //报错
    }

}
module.exports.parseHTML = function(html){

   let state = data;
   for(let c of html){
       state = state(c);
   }
   state = state(EOF);
   console.dir(stack[0])
}
```
#### CSS计算

环境准备：解析css的工具`npm install css`

步骤：
第一步 收集CSS规则
+ 遇到style标签时，我们把CSS规则保存起来

+ 这里我们调用CSS Parser来分析CSS规则

+ 这里我们必须要仔细研究此库分析CSS规则的格式

  ![image-20210422075317133](/Users/xushuxin/Library/Application Support/typora-user-images/image-20210422075317133.png)
```js
let css = require('css');
//加入一个新的函数，addCSSRules，这里我们把CSS规则暂存到一个数组中
let rules = [];
function addCSSRules(text){
    var ast = css.parse(text);
    console.log(JSON.stringify(ast,null,"   "));
    rules.push(...ast.stylesheet.rules);
    console.log(rules)
}
```

第二步 添加调用
+ 当我们创建一个元素后，立即计算CSS
+ 理论上，当我们分析一个元素时，所有的CSS规则已经收集完毕
+ Toy Browser 不考虑head中的style标签中CSS的计算
+ 在真实浏览器中，可能遇到写在body中的style标签，需要重新CSS计算的情况，这里我们忽略

```js
function computeCSS(element){
    console.log(rules);
    console.log('computed CSS for Element',element)
}

function emit(token){
    let top = stack[stack.length - 1];
    if(token.type === 'startTag'){
        let element = {
            type:'element',
            children:[],
            attributes:[]
        };
        element.tagName = token.tagName;

        //获取element的属性列表
        for(let p in token){
            if(p!== 'type' && p!="tagName"){
                element.attributes.push({
                    name:p,
                    value:token[p]
                });
            }
        }

        //属性列表收集完成之后，我们已经知道这个元素有哪些style规则了，添加计算css方法调用
        computeCSS(element);

        //向父元素的children数组中添加当前子元素
        top.children.push(element);
        element.parent = top;//标记当前子元素的父元素

        //如果不是自闭合标签，就将当前元素入栈
        if(!token.isSelfClosing){
            stack.push(element);
        }

        currentTextNode = null;

    }else if(token.type === 'endTag'){
        if(top.tagName != token.tagName){
            throw new Error('Tag Start end doesn\'t match!')
        }else{
            // ++++++++++ 遇到style标签时，执行添加CSS规则的操作
            if(top.tagName === "style"){
                addCSSRules(top.children[0].content);
            }
            stack.pop();
        }
        currentTextNode = null;
    } else if(token.type === 'text'){//处理文本节点
        if(currentTextNode === null){
            currentTextNode = {
                type:'text',
                content:''
            };
            top.children.push(currentTextNode)//放到当前栈顶元素的children数组中
        }
        currentTextNode.content += token.content;//拼接当前栈顶元素的文本内容
    }
       
}
```

第三步 获取父元素序列
+ 在computeCSS函数中，我们必须知道元素所有父元素才能判断元素与规则是否匹配
+ 我们从上一步骤的stack，可以获取本元素所有的父元素
+ 因为我们首先获取的是“当前元素”，所以我们获取和计算父元素匹配的顺序是从内向外
比如：`div div #myid`
前面两个`div`是子孙元素选择器，不确定是和哪个父元素匹配，而最后一个`#myid`是一定会和当前元素匹配的

    修改computeCSS函数：
    ```js
    function computeCSS(element){
        //解析到当前元素时,stack中正好存储了所有当前元素的父元素
        var element = stack.slice().reverse();
    }
    ```
第四步 选择器与元素的匹配
+ 选择器也要从当前元素向外排列
+ 复杂选择器拆成针对单个元素的选择器，用循环匹配父元素队列
+ 暂时不考虑复合选择器的解析

第五步 选择器与元素匹配
+ 根据选择器的类型和元素属性，计算是否与当前元素匹配
+ 这里仅仅实现了三种基本选择器，实际的浏览器中要处理复合选择器
+ 作业（可选）：实现复合选择器 , 实现支持空格的Class选择器

第六步
+ 一旦选择器匹配上，就应用选择器对应的样式到元素上，形成computedStyle

第七步
+ CSS规则根据specificity和后来优先规则覆盖
+ specificity是个四元组，越左边权重越高
+ 一个CSS规则的specificity根据包含的简单选择器相加而成
```js
    specificity:[0,     0,      0,      0]
                inline  id      class   tag
    例如： div div #id 和 div #id
    它的specificity是 [0, 1, 0, 2] 和 [0, 1, 0, 1]
```

