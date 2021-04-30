let currentToken = null;
let currentAttribute = null;

let stack = [{type:'document',children:[]}]
let currentTextNode = null;


const css = require('css');
const layout = require('./layout.js');//引入单独的layout文件

//加入一个新的函数，addCSSRules，这里我们把CSS规则暂存到一个数组中
let rules = [];
function addCSSRules(text){
    var ast = css.parse(text);
    // console.log(JSON.stringify(ast,null,"   "));
    rules.push(...ast.stylesheet.rules);
    // console.log(rules)
}

/* 三种选择器的匹配：id、class、tagName */
// 可以在这里扩展其他的选择器匹配（比如属性选择器）
function match(element, selector){
    //如果没有选择器 或者 元素没有attibutes属性(存放着所有的属性)
    if(!selector || !element.attributes){//其实这里一定会有attibutes的，因为我们默认初始化了一个空数组
        return false;
    }

    if(selector.charAt(0) === '#'){
        //找出之前解析时存入的id属性对象
        var attr = element.attributes.filter(attr => attr.name === 'id')[0];
        //对比id的value和选择器是否匹配
        if(attr && attr.value === selector.replace('#', '')){
            return true;
        }
    }else if(selector.charAt(0) === '.'){
        var classObj = element.attributes.filter(attr => attr.name === 'class')[0];
        let classArr = classObj?classObj.value.split(' '):null;//切割类名字符串为数组(支持带空格的class类名匹配)
        //如果类名数组中有类名匹配上选择器
        if(classArr && classArr.includes(selector.replace('.',''))){
            return true;
        }
    }else{
        if(element.tagName === selector){
            return true;
        }
    }
    return false;
}

//统计一条css规则中，id class tag 3种选择器出现的次数
// 可以再这里解析复合选择器
function specificity(selector){
    //inline id class tag
    var p = [0, 0, 0, 0];
    var selectorParts = selector.split(' ');
    for(var part of selectorParts){
        if(part.charAt(0) === '#'){//id选择器数量加1
            p[1] += 1;
        }else if(part.charAt(0) === '.'){//class选择器数量加1
            p[2] += 1;
        }else{ //tag选择器数量加1
            p[3] += 1;
        }
    }  
    return p;
}
//按四元组顺序比较两个选择器的优先级
//如果高级别的选择器的数量不相等，直接就按照高级别的数量比较来决定优先级
//如果高级别的选择器数量相同，则比较下一级别的选择器的数量
//tag的优先级最低
//如果最后一级的tag的数量也相等，表示两个选择器优先级相同
function compare(sp1,sp2){
    if(sp1[0] - sp2[0]){
        return sp1[0] - sp2[0];
    }
    if(sp1[1] - sp2[1]){
        return sp1[1] - sp2[1];
    }
    if(sp1[2] - sp2[2]){
        return sp1[2] - sp2[2];
    }

    return sp1[3] - sp2[3];
}

function computeCSS(element){
    //解析到当前元素时,stack中正好存储了所有当前元素的父元素
    var elements = stack.slice().reverse();

    if(!element.computedStyle){
        element.computedStyle = {};
    }

    //遍历每一个css规则（一个选择器），和元素进行对比
    for(let rule of rules){
        //将复杂选择器（div div .myid这种）用空格拆分成数组并翻转（不考虑复合选择器）
        var selectorParts = rule.selectors[0].split(" ").reverse();
        
        //将当前元素和选择器（.myid）进行匹配，匹配上了才进行后续父选择器的匹配，没匹配上直接进行下一个规则的匹配
        if(!match(element,selectorParts[0]))
            continue;

        let matched = false;

        var j = 1;//当前用于匹配的选择器的索引
        //遍历父元素集合,将每个父元素与选择器进行对比
        for(var i= 0;i<elements.length;i++){
            if(match(elements[i],selectorParts[j])){//如果匹配上了，下个元素就匹配下一个选择器
                j++;
                if(j === selectorParts.length) break;//所有的selector都匹配到对应的元素，就可以停止遍历父元素了
            }
        }   
        
        //选择器数组中所有选择器全部匹配上了对应的父元素(全等我觉得也可以)
        if(j >= selectorParts.length){//如果只有一个简单选择器，selectorParts的length也正好为1
            matched = true;
        }

        if(matched){
            //如果匹配到，我们要加入
            // console.log("Element",JSON.stringify(element,null,'   '),"matched rule",JSON.stringify(rule,null,'   '));
            
            var sp = specificity(rule.selectors[0]);//统计几种标签出现的次数的数组

            var computedStyle = element.computedStyle; //
            for(let {property,value} of rule.declarations){
                if(!computedStyle[property]){
                    computedStyle[property] = {}
                }
                //首次没有优先级数组，直接保存样式和优先级列表
                if(!computedStyle[property].specificity){
                    computedStyle[property].value = value;
                    computedStyle[property].specificity = sp;
                //后续如果选择器再匹配到这个元素，就已径存在优先级列表，取出之前的优先级列表和本次的优先级列表进行对比
                //如果之前的选择器优先级低于当前的选择器的优先级；则保存当前的样式值和优先级列表
                }else if(compare(computedStyle[property].specificity, sp) < 0){
                    computedStyle[property].value = value;
                    computedStyle[property].specificity = sp;
                }
            }
            // console.log(element.computedStyle)
        }
    }
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
        // element.parent = top;//标记当前子元素的父元素

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
            layout(top);//调用排版方法
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
   return stack[0]
}