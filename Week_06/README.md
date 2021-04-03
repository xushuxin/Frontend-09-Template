学习笔记
#### 语言按语法分类
+ 非形式语言
    - 中文，英文
+ 形式语言（乔姆斯基谱系）
    - 0 型 无限制文法 包括所有的文法
    - 1型 上下文相关文法 生成上下文相关语言
    - 2型 上下文无关文法 生成上下文无关语言
    - 3型 正则文法 生成正则语言

#### 产生式（巴科斯诺尔范式，BNF）
+ BNF是一种用于表示上下文无关文法的语言
+ 用尖括号括起来的名称来表示语法结构名
+ 语法结构分成基础结构和需要用其他语法结构定义的复杂结构
    - 基础结构称终结符
    - 复合结构称非终结符
+ 引号和中间的字符表示终结符
+ 可以有括号
+ *表示重复多次
+ | 表示或
+ +表示至少一次

##### 使用BNF描述四则运算
+ 四则运算：
    - `1 + 2 * 3`
+ 终结符（最终在代码中出现的字符）：
    - `Number`
    - `+ - * /`
+ 非终结符：
    - `MutiplicativeExpression`
    - `AdditiveExpression`
```js
<MultiplicativeExpression>::=<Number>|
    <MultiplicativeExpression>"*"<Number>|
    <MultiplicatveExpression>"/"<Number>|
<AddtiveExpression>::=<MultiplicativeExpression>|
    <AddtiveExpression>"+"<MultiplicativeExpression>|
    <AddtiveExpression>"-"<MultiplicativeExpression>|
```
解析：
+ 先定义加法表达式AddtiveExpression：
    - 可以是一个乘法表达式，
    - 也可以是一个加法表达式加上或减去一个乘法表达式
+ 再定义乘法表达式MultiplicativeExpression:
    - 把一个单独的数字定义为特殊的乘法表达式，方便加法表达式中将数字和乘法表达式都当前作乘法表达式处理

##### 编写带括号的四则运算产生式
```js
<BracketExpression>::=<Number>|
    "("<AddtiveExpression>")"

<MultiplicativeExpression>::=<BracketExpression>|
    <MultiplicativeExpression>"*"<BracketExpression>|
    <MultiplicativeExpression>"/"<BracketExpression>

<AdditiveExpression>::=<MultiplicativeExpression>|
    <AddtiveExpression>"+"<MultiplicativeExpression>|
    <AddtiveExpression>"-"<MultiplicativeExpression>
```
+ 把最小的计算单位从Number变为一个括号表达式
+ 这个括号表达式可以是一个Number， 也可以是一个带括号的加法表达式
+ 并且加法表达式也可以是一个乘法表达式，所以括号内可以包含四则运算
#### 现代语言的特例
现代语言主体都是上下文无关文法，但是又一些地方，由于从使用方面的考虑，有一些特例
+ c++中，* 可能表示乘号或者指针，具体指哪个，取决于当前位置的标识符是否被声明为类型
+ VB中，<可能是小于号，也可能是XML直接量的开始，取决于当前位置时否可以接受XML直接量
+ Python中行首的tab符和空格会根据上一行的行首空白以一定规则被处理成虚拟终结符indent或者dedent
+ JavaScript中，/ 可能是除号，也可能是正则表达式的开头，处理方式类似于VB，字符串模板中也需要特殊处理 } ，还有自动插入分号规则

#### 形式语言的分类
##### 按照用途来分类：
+ 数据描述语言
    JSON，HTML，XAML，SQL，CSS
+ 编程语言
    C，C++，Java，C#，Python，Ruby，Perl，Lisp，T-SQL，Clojure，Haskell，JavaScript

##### 按表达方式分类：
+ 声明式语言
    JSON，HTML，XAML，SQL，CSS，Lisp，Clojure，Haskell
+ 命令式语言
    C，C++，Java，C#，Python，Ruby，Perl，JavaScript
##### 练习：尽可能寻找你知道的计算机语言，尝试把它们分类
```html
数据描述语言：
JSON，HTML，CSS，XML，SQL
编程语言：
C，C++，Java，C#，Python，JavaScript，PHP，TypeScript

声明式语言:
JSON，HTML，SQL，CSS，XML
命令式语言：
C，C++，Java，C#，Python，JavaScript，PHP，TypeScript
```

#### String
+ Charactor 字符
+ Code Point 码点
+ Encoding  编码方式
1. 码点
+ ASCII  只规定了英文，数字，特殊字符等127个字符
+ Unicode 全世界的所有文字的编码集，分为不同片区
+ UCS 另一个国际编码标准
+ GB 国标，和Unicode码点不一致，但是都兼容ASCII码
    - GB2312 第一版
    - GBK(GB13000) 扩充版本
    - GB18030 真正意义上的完全版
    对于中文编码，相对于Unicode的好处：①范围小②同样的中文字符，国标编码省空间
+ ISO-8859 东欧国家的非统一标准
+ BIG5  台湾的编码标准
GB、ISO-8859、BIG5都属于移动的国家地区语言的特定的编码格式，彼此之间是冲突的，但是都兼容ASCII码、
2. 编码
+ UTF
UTF8、UTF16
##### 练习：写一段 JS 的函数，把一个 string 它代表的字节给它转换出来，用 UTF8 对 string 进行遍码。
```js
function UTF8_Encoding(string){
    let bitStr = '';
    var buf;
    for(let c of string){
        let code = c.charCodeAt();
        let bitCode =code.toString(2);
        let encode;
        //前面补0
        while(bitCode.length%8){
            bitCode='0'+bitCode;
        }
        if(code>=0&&code<=127){
            encode = bitCode;
        }else if(code>=128&&code<=2047){
            //utf8编码，第一个字节0前面有几个1表示占用几个字节
            //后面每个字节都是10开头
            encode = '110'+bitCode.slice(0,5)+'10'+bitCode.slice(5);
        }else if(code>=2048&&code<=65535){
            encode = '1110'+bitCode.slice(0,4)+'10'+bitCode.slice(4,10) + '10'+bitCode.slice(10);
        }else if(code>=65535&&code<=1114111){
            encode = '11110'+bitCode.slice(0,3)+'10'+bitCode.slice(3,9) + '10'+bitCode.slice(9,15) + '10'+bitCode.slice(15);
        }
        bitStr += encode;
    }
    //根据二进制字符串的长度开辟空间存储
    let len = bitStr.length
    buf = new ArrayBuffer(len);
    let view = new Int8Array(buf,0,len);
    for(var i = 0;i<buf.byteLength;i++){
        view[i] = bitStr[i]
    }
    return buf;
}

UTF8_Encoding('哈哈哈')
```
3. Grammar 语法
+ 双引号和单引号没有什么区别
+ 特殊字符
    - 换行不能用，使用`\n`
    - Tab符可用，但是可以使用`\t`
    - 双引号字符串里面，想使用双引号：`\"`，单引号相同
    - 字符串中想要用 \，对自身转义 : `\\`
    - 没有特殊含义的字母，前面加 \ 表示自身
+ 反引号（es6）
    - 可以回车
    - ${} 用于书写js表达式和变量
    - 反引号语法-模板字符串
        + 属于语法结构

会被转义的字符：
+ 字母：b f n r t v
+ 数字：数字0-7会被转义
+ 符号：\ ' "
+ 编码：
    - \x开头转义后两位为16机制：\x[0-9a-fA-F]{2}
    - \u2028 行分隔符 \u2029 段落分隔符（都属于换行符）
    - \u开头，将后四位从unicode16进制编码转为汉字：\u[0-9a-fA-F]{4}
```js
\b => ""
\f => ""
\n => 换行
\r => "" 回车
\v => ""
```

#### JavaScript中的对象
+ 原型链`[[prototype]]`,如果找一个对象的属性时，自身不包含属性，会通过原型的指向去查找，一直到指向原型指向null
这一算法，保证了，每个对象只需要描述自己和原型的区别即可。
+ 普通的属性，可以随意获取；而Symbol在内存里创建后，只能通过变量去引用，没有办法构造两个一模一样的Symbol，即使两个Symbol的名字一样，他们也是不相等的，所以可以使用Symbol作为对象的属性，很好的实现属性访问的权限控制，想要使用对象的Symbol属性，必须接收传递的Symbol的地址
+ 对象的两种属性
    JavaScript用属性来统一抽象对象状态和行为
    1. 数据属性（Data Property）
    `[[value]]` 具体存储的值，可以是任意类型的值
    `writable` 是否可写的特征值，当其设置为false后，不可通过点运算，修改值（但是我们可以通过defineProperty修改writable的值为true，这样就能修改value了）
    `enumerable` 是否可枚举的特征值
    `configurable` 是否可以被改变的特征值，当configurable设置为false后，configurable、enumerable、writable、value都不可更改了
   
    2. 访问器属性（Accessor Property）
    `get` 访问属性时触发
    `set` 通过属性写值时触发
    `enumerable`  影响Object.keys,for...in的行为
    `configurable` 
    一般数据属性用来描述状态，访问器属性用来描述行为
    数据属性中如果存储函数，也可以用于描述行为

+ 对象的语法和API
    1. 基本的面向对象的能力
        `{}` `.` `[]` `Object.defineProperty`
        提供了基本的对象机制，让我们可以通过语法创建对象、访问属性、定义新的属性以及去改变属性的特针值
    2. 基于原型的对象API
        `Object.create`  在指定原型的情况下创建对象
       `Object.setPrototypeOf ` 修改一个对象的原型
       `Object.getPrototypeOf` 获取对象的原型
    3. 基于分类的方式描述对象 
        `new` `class` `extends`
        尽管在运行时仍然会被转换成JavaScript的原型相关的访问，
        但是从语法和抽象能力上来看，完全是一个基于类的面向对象的组织方式
    4. 历史包袱，不伦不类，建议不用 
    `new` `function` `prototype`

+ 函数对象（Function Object）
    - 除了一般对象的属性和原型，函数对象还有一个行为:`[[call]]`
    - 使用function关键字声明、箭头运算符、或者Function构造器创建对象都会有`[[call]]`这个行为
    - 用类似f()这样的语法调用函数时，会访问到`[[call]]`这个行为

+ 特殊对象
    Array:`[[length]]`会随着元素的数量增减而变化
    Object.prototype: 没有setPrototypeOf方法，调用会失效

+ 宿主对象（Host Object）
    - 提供JavaScript语言不支持，但是JavaScript语法支持的一些特性（只要语法支持，宿主对象理论上都可以实现）
##### 作业：找出 JavaScript 标准里面所有具有特殊行为的对象
待补充
```
对象实例：[[prototype]]
函数对象：
[[call]]
name属性优先获取function声明时的函数名，否则获取保存该函数的变量名或者属性名
```
