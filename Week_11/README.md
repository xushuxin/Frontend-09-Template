学习笔记
#### CSS总论
一、CSS语法的研究

CSS2.1的语法
+ https://www.w3.org/TR/CSS21/grammar.html#q25.0
+ https://www.w3.org/TR/css-syntax-3/

CSS的总体结构
+ @charset css的字符集一般不需要自己去设置，和HTML一致
+ @import
+ rules
    - @media
    - @page 
    - rule 普通的css规则，我们通常编写的css

CSS2.1
+ at-rules :@charset @import @media @page
+ rule

二、CSS @规则的研究

+ @charset 字符集
+ @import 导入
+ @media 媒体 (重点)
+ @page 分页，通常用于打印机
+ @counter-style 列表的样式（前面的黑点）
+ @keyframes 动画 (重点)
+ @fontface 字体（重点）
+ @supports 检查CSS兼容性（本身隶属于CSS3语法，暂不推荐使用）
+ @namespace 命名空间

有一些@规则未列出：document、color-profile(SVG1.0，已废弃)、font-feature

三、CSS规则的结构

+ 选择器(Selector)
+ 声明
    - Key
    - Value

Selector
目前有两个标准：
+ https://www.w3.org/TR/selectors-3/
+ https://www.w3.org/TR/selectors-4/

Key
+ Properties 普通的属性定义
+ Variables 变量 ：https://www.w3.org/TR/css-variables/

Value
+ https://www.w3.org/TR/css-values-4/


四、收集标准
+ 打开W3C官网：https://www.w3.org/TR/?tag=css
+ 打开控制台，输入
```js
JSON.stringify([...container.children].filter(e=>e.getAttribute('data-tag').match(/css/)).map(e=>({name:e.children[1].innerText,url:e.children[1].children[0].href})))
```
+ 复制控制台打印的内容到一个文件中备用

+ 编写爬虫代码，见css-crawler.js
主要思路是：
将W3C的页面替换为我们创建的iframe,然后监听iframe的load事件，再根据之前收集的url列表，每次load完成之后(通过Promise来控制)修改iframe的src为下一个url

+ CSS标准使用一个带propdef类名的table来描述属性，所以我们在iframe 加载完url后，获取带类名propdef的元素即可
```js
 console.log(iframe.contentDocument.querySelectorAll('.propdef'));
```

#### CSS选择器
一、选择器语法
+ 简单选择器
    - `*` 通配符
    - `type选择器` 如：div svg|a
        HTML是有命名空间的，主要有三个：HTML、SVG、MathML
        如果想选择SVG或者MathML中的元素，需要用到`|`，如： `svg|a`
        在HTML里面命名空间是冒号，需要使用@namespace去声明
    - class类选择器
    - id选择器 
    - 属性选择器`[attr=value]` 支持匹配模式
    - 伪类选择器 `:hover` 元素的特殊状态
    - 伪元素选择器 `::before` 提倡双冒号写法

+ 复合选择器
    - `<简单选择器><简单选择器><简单选择器>`多个简单选择器组合
    - `*` 或者 `type选择器`必须写在最前面

+ 复杂选择器
    - `<复合选择器><sp><复合选择器>` 子孙选择器(空格连接)
    - `<复合选择器>">"<复合选择器>` 父子选择器
    - `<复合选择器>"~"<复合选择器>` 相邻选择器（首个）
    - `<复合选择器>"+"<复合选择器>` 相邻选择器（所有）
    - `<复合选择器>"||"<复合选择器>` 做表格时，选中某一列（Selector level4）

二、选择器的优先级
+ 简单选择器技术
    ```markdown
    #id div.a#id{
        //...
    }
    specificity:[0,     2,      1,      1]  
                        id    class     type
    ```
    优先级计算： $ S = 0 * N^3 + 2 * N^2 + 1 * N^1 + 1$
    取 N = 100000 => S = 2000001000001
    标准中描述：N取足够大即可

    **题目：请写出下面选择器的优先级：`div#a.b .c[id=x]`、`#a:not(#b) `、`*.a `、`div.a `** 

    ```js
    N取65536
    优先级计算公式：S = s1 * N^3  + s2 * N^2 + s3 * N^1 + s4

    div#a.b .c[id=x]
    [0, 1, 3, 1] 
    S1= 0 + 1 * (65536**2) + 3 * 65536 + 1 = 4295163905

    #a:not(#b) :not选择器不计算优先级
    [0, 2, 0, 0]
    N取1000
    S2= 0 + 2 * (65536**2)  = 8589934592

    *.a  通配符不计入优先级
    [0, 0, 1, 0]
    N取1000
    S3= 0 + 1 * 65536 = 65536

    div.a
    [0, 0, 1, 1]
    N取1000
    S4= 0 + 1 * 65536 + 1  = 65537

    S1 > S2 > S4 > S3
    ```
三、伪类
+ 链接/行为
    - `:any-link`匹配任意超链接（包括未访问和访问过的）
    - `:link`匹配未访问的超链接
    - `:visited`匹配访问过的超链接
        ```markdown
        知识点：一但使用了:link或者:visited之后，就无法对被选择元素的除颜色之外的属性进行修改
        原因：如果修改了尺寸相关的属性，会影响页面布局，这样就可以被js监听到，并检测到哪些链接被访问过
        ```
    - `:hover`鼠标悬停状态
    - `:active` 激活状态，点击的一瞬间触发
    - `:focus` 聚焦状态
    - `:target` 选择锚点锚定的目标，是给作为锚点的a标签使用的
        例：
        ```html
        <!DOCTYPE html>
        <html>
        <head>
        <style>
        :target
        {
        border: 2px solid #D4D4D4;
        background-color: #e5eecc;
        }
        </style>
        </head>
        <body>

        <h1>这是标题</h1>

        <p><a href="#news1">跳转至内容 1</a></p>
        <p><a href="#news2">跳转至内容 2</a></p>

        <p>请点击上面的链接，:target 选择器会突出显示当前活动的 HTML 锚。</p>

        <p id="news1"><b>内容 1...</b></p>
        <p id="news2"><b>内容 2...</b></p>

        <p><b>注释：</b> Internet Explorer 8 以及更早的版本不支持 :target 选择器。</p>

        </body>
        </html>
        ```
+ 树结构
    - `:empty` 无子元素的元素
    - `:nth-child()` 
        even、odd、4N + 1
    - `:nth-last-child()`
        从后往前数
    - `:first-child` `:last-child` `:only-child`
    注意点：`:empty`、 `:nth-last-child()`、`:last-child`、`:only-child`会破坏CSS回溯原则（可能会性能不好）
+ 逻辑型
    - `:not`伪类 
    - `:where` `:has` CSS Level4实现，暂时用不到

总结：不应该出现过于复杂的选择器

四、伪元素
+ `::before` 元素内容的前面
+ `::after` 元素内容的后面
+ `::first-line` 选中第一行
+ `::first-letter` 选中第一个字母

`::before`和`::after`的declaration中可以设置content属性，只要写了content属性，就可以像一个真正的DOM元素一样，可以去生成盒，来参与后续的排版和渲染，也可以指定border、background等属性。可以理解为，就是通过选择器向界面上添加了一个不存在的元素

带有`::before`的选择器，就是给选中的元素的内容的前面增加了一个元素，可以通过content属性，为这个元素添加文本内容，我们可以任意指定这个元素的display
`::after`与`::before`仅选中的位置不同
```html
<div>
<::defore/>
content content content content
content content content content
content content content content
content content content content
<::after/>
</div>
```


`::fisrt-line`和`::fisrt-letter`的机制是：通过一个不存在的元素把一部分文本括起来，让我们可以对它做一些处理
`::fisrt-letter`：相当于我们用一个元素把内容里面的第一个字母括起来，可以添加任意属性，但是无法修改content
`::fisrt-line`：选择的是排版之后的第一行，假如浏览器提供的渲染宽度不同，有可能控制的字符数量不同，需要根据需求决定是否使用
```html
<div>
<::fitst-letter>c</::first-letter>content content content content
content content content content
content content content content
content content content content
content content content content
</div>
```
可用属性统计：

::fisrt-line
- font系列
- color系列
- background系列
- word-spacing
- letter-spacing
- text-decoration
- text-transform
- line-height

::fisrt-letter
- font系列
- color系列
- background系列
- word-spacing
- letter-spacing
- text-decoration
- text-transform
- line-height
- float
- vertical-align
- 盒模型系列：margin，padding，border



**第9节思考题作业 为什么first-letter可以设置display:block之类，而first-line不行呢?**
答：我认为：first-line选中的是排版之后的第一行，只有排版之前去设置好display才有用，排版之后就没有办法去设置了


**第9节课后作业：编写一个 match 函数。它接收两个参数，第一个参数是一个选择器字符串性质，第二个是一个 HTML 元素。这个元素你可以认为它一定会在一棵 DOM 树里面。通过选择器和 DOM 元素来判断，当前的元素是否能够匹配到我们的选择器。（不能使用任何内置的浏览器的函数，仅通过 DOM 的 parent 和 children 这些 API，来判断一个元素是否能够跟一个选择器相匹配。）以下是一个调用的例子。**
```js
function match(selector, element){
    return true;
}
match("div #id.class", document.getElementById('id'));
``` 
答：见match.js
