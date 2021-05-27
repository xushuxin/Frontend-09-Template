学习笔记
#### 重学HTML

##### DTD与XML namesapce
+ http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd
+ http://www.w3.org/1999/xhtml

**从DTD了解HTML**
+ DTD是SGML规定的定义它的子集的文档的格式
+ HTML最早设计出来是SGML的一个子集，所以它有这个DTD

重点：
lat
+ &nbsp  空格，不会把单词分开（如果想要多个空格，推荐使用white-space属性）
symbol
+ &Omega、&alpha、&lambda 等特殊符号
special
+ quot  "
+ amp  &
+ lt  <
+ gt   >

namespace
+ HTML
+ XHTML
+ MathML
+ SVG

**HTML语法**

合法元素
+ Element:`<tagName>...</tagName>`
+ Text:text
+ Comment:`<!--comments-->`
+ DocumentType:`<!Doctype html>`
+ ProcessingInstruction:`<?a 1?>` 预处理
+ CDATA:`<![CDATA[]]>` 一种语法，产生的也是文本节点，不需要考虑转义问题

字符引用
+ `&#161;` 
+ `&amp;`
+ `&lt;`
+ `&quot;`

**DOM API**

Node
+ Element：元素型节点，跟标签对应
    - HTMLElement
        - HTMLAnchorElement
        - HTMLAppletElement
        - HTMLAreaElement
        - HTMLAudioElement
        - HTMLBaseElement
        - HTMLBodyElement
        ...
    - SVGElement
        - SVGAElement
        - SVGAltGlyphElement
        ...
+ Document:文档根节点
+ CharacterData字符数据
    - Text:文本节点 
        - CDATASection:CDATA节点
    - Comment：注释
    - ProcessingInstruction:处理信息
+  DocumentFragment:文档片段
+ DocumentType:文档类型

导航类操作
+ Node
    - parentNode
    - childNodes
    - firstChild
    - lastChild
    - nextSibling
    - previousSibling
+ element
    - parentElement
    - children
    - firstElementChild
    - lastElementChild
    - nextElementSibling
    - previousElementSibling

修改操作(都是对子元素的操作)
+ appendChild 添加一个节点到所有子元素的后面
+ insertBefore 插入一个节点到某个子元素的前面
+ removeChild 删除一个子元素
+ replaceChild 替换一个子元素

高级操作
+ compareDocumentPosition 是一个用于比较两个节点中关系的函数
+ contains 检查一个节点是否包含另一个节点的函数
+ isEqualNode 检查两个节点是否完全相同
+ isSameNode 检查两个节点是否是同一个节点，实际在JavaScript中可以使用“===”
+ cloneNode 复制一个节点，如果传入参数true，会连同子元素做深拷贝

**事件API**

addEventListener(type, listener, options)
+ type 定义要监听的事件类型
+ listener 必须是一个JS函数或者是实现了[EventListener](https://developer.mozilla.org/zh-CN/docs/Web/API/EventListener)接口的对象
+ options
    - capture boolean类型，表示是否在捕获阶段触发listener
    - once boolean类型，设置为true，listener会被触发调用一次之后移除
    - passive boolean类型，设置为true时，在listener内部不可调用preventDefault（可以用于移动端滑动事件优化）
    
Event:冒泡与捕获

+ 冒泡和捕获是浏览器处理事件的一种机制，在任何一个事件的触发过程中都会发生，而和我们是否添加监听没有关系
+ 任何一个事件都是先捕获后冒泡
    - 捕获阶段：我们手中的鼠标并不能提供我们到底点在哪个元素上的信息，需要通过浏览器的计算才能得到，也就是从外到内，一层一层的去计算，到底这个事件发生在哪个元素上，这就是捕获的过程（从外到内）
    - 冒泡阶段：我们已经算出来，触发事件的是哪个元素，层层的向外去触发，让外层元素响应这个事件的过程，更符合人类的直觉（从内向外）。
+ 默认添加的是冒泡阶段执行的listener，里层的元素的listener会先执行，然后才会一层一层执行外层的listener
+ 如果外层元素添加了捕获阶段执行的listener，会先从外层向内依次执行捕获阶段执行的listener（不包括触发事件的元素）
+ 触发事件的元素的listener触发的顺序和添加顺序一致（不区分捕获还是冒泡，都是按添加顺序来执行的）备注：最新版Chrome规则修改了，触发事件的元素也会先触发捕获模式的listener，再触发冒泡模式的listener

**Range API**

一个问题：把一个元素所有的子元素逆序

考点：
1. DOM的collection 是一个living collection，使用DOM API修改操作（比如appendChild等会修改到元素的childNodes），取出来的childNodes集合会跟着变化
2. 使用appendChild的等API操作元素时，如果操作的元素是文档中已存在的，不需要自己去移除（API本身帮我们做了）

二级的答案，正常的解法：
```html
<div id="a">
    <span>1</span>
    <p>2</p>
    <a>3</a>
    <div>4</div>
</div>
<script>
    let element = document.getElementById('a');
    function reveseCHildren(element){
        var l = element.childNodes.length;
        while(--l >= 0){
            element.appendChild(element.childNodes[l])
        }
    }
    reveseCHildren(element)
</script>
```

完美的答案：使用Range API

```html
<div id="a"><span>1</span><p>2</p><a>3</a><div>4</div></div>
<script>
    let element = document.getElementById('a');
    function reveseChildren(element){

       var range = new Range();//创建一个range对象
       
       range.selectNodeContents(element);//选中元素的所有内容

       let fragment = range.extractContents();//从dom上取下所有选中内容

        // 操作fragment，不影响页面布局
       let l = fragment.childNodes.length;
       while(l-- > 0){
           fragment.appendChild(fragment.childNodes[l])
       }

       //修改后的fragment的内容再次放回元素中
       element.appendChild(fragment);
    }

    reveseChildren(element)
</script>
```

Range 
+ 范围，可以理解为HTML文档流里面的有一个起始点和一个终止点的一段范围
+ range是不能跳的，可能会有多个Range，但是每一个range一定是连续的
+ range只需要起点在DOM树中的位置先于终点即可，不需要管层级关系
    - 比如：起点可能位于前一个节点的三层的子节点里面，而终点位于后一个节点的后面
    - 可以包含半个节点，range选择的范围很灵活，可以选择DOM树上的任意一段
+ 起止点都是由一个element和偏移值来决定的
    - 对于element来说，偏移值就是children
    - 对于text node来说，偏移值是字符的个数
    - 偏移量，我们可以看做输入框中的光标，刚开始光标位于元素或者节点的最开头，每增加一个偏移值，我们就将光标向后移动一个偏移单位（字符或者是元素）
    - range选中就是start的光标位置和end光标的位置之间的范围

Range的创建方法
1. Document.createRange
2. Range构造函数
   ```js
    var range = new Range();
    range.setStart(element, 9);
    range.setEnd(element, 4)
   ```
3. 从selection来创建Range（鼠标左键按下，圈中的内容）
    + var range = document.getSelection().getRangeAt(0);
    + 因为我们现在的selection只支持一个Range，所以直接使用getRangeAt(0)就能获取到一个Range

Range的一些便捷API

有时候我们不需要精确的去算偏移值，并且我们的DOM树中，start和end的节点可能处于一些空白的文本节点（写HTML时的缩进和换行，一些格式上的需求，产生大量空白节点，这些空白节点我们可能会压缩或者不压缩，range就可能计算不准确）
+ range.setStartBefore 把起点设置到某个节点之前
+ range.setEndBefore 把终点设置到某个节点之前
+ range.setStartAfter 把起点设置到某个节点之后
+ range.setEndAfter 把终点设置到某个节点之后
+ range.selectNode 使 Range 包含某个节点及其内容，元素标签的开始位置即为`<`前面
+ range.selectNodeContents 选择一个节点（一般是元素）的内容

Range可以做什么
1. 从DOM树上提取一个Range里面的内容
    ```js
    var fragment = range.extractContents();
     ```
    注意：
    + range.extractContents调用后，range中的内容就会从DOM树中移除
    + extractContents返回的是一个Fragment对象,
    + Fragment是Node的一个子类，可以容纳一些元素，在appendChild的操作时，不会将自身添加到DOM上，而是会将所有的子节点放上去
    + Fragment也可以进行DOM API，比如querySelector等
2. 在range的开始位置插入一个新的节点
    ```js
    range.insertNode(document.createTextNode('aaaa'));
    ```

**CSSOM**
DOM API是HTML语言的对象化，基本上和HTML的能力是对等的，DOM是对HTML所描述的文档的一个抽象，而CSSOM就是对CSS文档的一个抽象

CSSOM的访问

需要通过DOM API进行访问
+ document.styleSheets

创建使用CSS的方法：
1. style标签
    + 直接在标签内部写css
    + 想修改styleSheets，直接改innerHTML即可
2. link标签
    + href引用资源地址
    + 修改styleSheets，需要通过Rules API去访问

style和link标签最终都会创建styleSheets

Rules
+ `document.styleSheets[0].cssRules` 获取样式，只读
+ `document.styleSheets[0].insertRule("p{color:pink;}", 0)` 插入样式
   0： 插入的style样式字符串
   1： 插入的位置
+ `document.styleSheets[0].removeRule(0)` 删除样式

Rule
+ CSSStyleRule
+ CSSCharsetRule
+ CSSImportRule
+ CSSMediaRule
+ CSSFrontFaceRule
+ CSSPageRule
+ CSSNamespaceRule
+ CSSKeyframesRule
+ CSSKeyframeRule
+ CSSSupportsRule
...

CSSStyleRule
+ selectorText String 选择器部分
+ style k-v结构 样式部分

通过CSSOM修改样式比直接修改style标签的优点：
+ 可以批量修改
+ 伪元素无法通过DOM API获取，的样式只能通过CSSOM去修改

getComputedStyle 计算后的css样式(最终渲染的样式)
+ 使用方式
  window.getComputedStyle(el, preudoEl)
    - el 想要获取的元素怒
    - preudoEl 可选，伪元素
+ 使用场景
    - 比如元素需要做拖拽，获取元素的transform
    - CSS动画的中间态，想要暂停动画，没有办法DOM API，style和cssRule判断播到哪了，需要使用getComputedStyle去获取实时的状态


**CSSOM View**
+ 获取layout和render后的一些信息
+ CSSOM View 主要和浏览器最后画上去的视图相关

window
+ window.innerWidth，window.innerHeight 
    浏览器实际渲染html内容的区域的宽高
+ window.outerrWidth，window.outerHeight
    浏览器窗口总共占的宽高，包括工具栏
+ window.devicePixelRatio
   - 屏幕上的物理像素和代码里面的逻辑像素px之间的比值
   - 正常的设备，比值是1:1，retina屏上是1:2，在有些安卓机上还有可能是1:3
+ window.screen 屏幕的信息
    - window.screen.width 屏幕宽
    - window.screen.height 屏幕高
    - window.screen.availWidth 屏幕可用宽
    - window.screen.availHeight 屏幕可用高（去除物理按键占用的部分，取决于硬件配置）

Window API
+ window.open("about:blank", "_blank", "width=100,height=100,left=100,right=100")
    - 原始的标准里面的定义只有两个参数，但是CSSOM的Window API给它加了第三个参数
    - 我们可以指定，我们打开的窗口的宽高和在屏幕上所处的位置
+ `moveTo(x,y);` 移动我们自己创建的窗口的位置，直接修改为目标值
+ `moveBy(x, y);` 移动我们自己创建的窗口的位置，在原来的基础上增加值
+ `resizeTo(x, y);` 修改我们自己创建的窗口的位尺寸，直接修改为目标值
+ `resizeBy(x, y);` 修改我们自己创建的窗口的位尺寸，在原来的基础上增加值


scroll API

+ scroll元素
    + scrollTop 当前元素当前滚动到的位置（垂直方向）
    + scrollLeft 当前元素滚动到的位置（水平方向）
    + scrollwidth 可滚动类型的最大宽度
    + scrollHeight 可滚动类型的最大高度
    + scroll(x, y) 滚动到一个坐标位置
    + scrollBy(x, y)  在当前基础上滚动一段距离
    + scrollIntoView() 滚动到元素的可见区域

+ window元素
    + scrollX 窗口水平方向滚动到的位置，对应元素的scrollLeft
    + scrollY 窗口垂直方向滚动到的位置，对应元素的scrollTop  
    + scroll(x,y) 和元素scroll的一致
    + scrollBy(x,y) 和元素scrollBy的一致

layout API
获取浏览器layout之后，元素的位置大小信息
+ el.getClientRects() 获取元素内部生成的所有盒的位置大小信息
+ el.getBoundingClientRect() 获取元素本身占用的位置和大小信息
```html
<style>
    .x::before{
        content:"额外 额外 额外 额外 额外";
        background-color:pink;
    }
</style>

<div style="width:100px;height:400px;overflow:auto;">
    文字<span class="x" style="background-color:lightblue;">文字 文字 文字 文字 文字 文字 文字</span>
</div>
<script>
    var x = document.getElementsByClassName('x')[0];
    //获取x元素layout时内部生成的所有盒的信息（会有多个盒产生，是一个数组），并且x的伪元素也会参与到生成盒的过程中
    console.log(x.getClientRects());
    //获取x元素layout时包含所有内部生成盒的容器的信息，这个容器的大小等同于元素的实际占用的空间大小
    console.log(x.getBoundingClientRect());
</script>
```

**其他API**
