学习笔记
#### 表达式（Expression）
1.  Member 成员访问(单独的表达式，优先级最高)
    - a.b、a['b']
    - foo\`string\` 调用函数foo并将模板字符串中的string根据`${}`分割成数组，并当做参数传递（这个和成员访问其实没有关系，只是优先级是相同的）
    - super.b、super['b']   
    只能在class构造函数中使用，优先级和a.b一样
    - [new.target](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new.target) 构造函数内使用，指向直接被new执行的构造函数
    - new Foo() 带括号的new优先级高于不带括号的，优先级和成员访问相同
2. New （优先级低于Member）
    - new Foo 不带括号的new
    Example:
    ```js
        new a()(); // 由于new a()优先级高于new a，所以第一个括号是new运算的一部分，而不是函数执行
        new new a();//这里的括号跟着第二个new，先执行 new a()
    ```
3. Reference 引用
    引用分为两个部分：
    + Object ：对象
    + Key ：可以是string或者symbol

    正常的取值操作会进行解引用，但是有些基础设施会涉及到操作引用，
    涉及到引用的操作:
        + delete 操作的对象是Member，需要知道删除的是哪个对象的那个属性
        + assign 对对象的某个属性进行修改或者赋值时，需要知道是哪个对象的那个属性

4. Call（优先级低于Member和New）
    当member运算出现在Call运算后面时，member运算的优先级被降低了
    + foo()
    + super()
    + foo()['b']
    + foo().b
    + foo()`abc` 
    
    Example:
    ```js
    a()['b'];//成员访问优先级被降低，a(）先执行，成员访问后执行
    ```

5. Left Handside & Right Handside
    > 能放到等号左边的称为 Left Handside Expression

    > 不是Left Handside的，一定是Right Handside，所以一般不用单独去定义Right Handside

    > Left Handside Expression几乎一定是Right Handside Expression，在JavaScript中没有例外，在大部分语言中也没有例外

    + Update Expression
        - a ++
        - a --
        - ++ a
        - -- a

        Example:
        ```js
        ++ a ++ 
        ++ (a ++)
        ```
        以上两个表达式，a会优先和后面的自增结合，但是都是不合法，语法上是不合法的，运行时，不论谁先都是不合法的

    + Unary（单目运算符）
        - delete a.b
        - void foo() 把后面的值都变为undefined
        - typeof a
        - \+ a 对于数字不会造成任何影响，但是对于其他类型，会产生类型转换，强制转为数字
        - \- a 
        - ~ a 位运算，把整数按位取反，不是整数，会强制转为整数
        - ! a 非运算，针对布尔型，可使用!!将任意类型转为布尔类型
        - await a 
    + Exponental (指数运算符)
        - **
            JavaScript唯一一个右结合的运算
            Example:
            ```js
            3 ** 2 ** 3//先运算2**3得到结果a，在运算3 ** a
            相当于
            3 ** (2 ** 3) 
            ```
    + Multiplicative（加法）
        - `*` `/` `%`
    + Additive（加法）
        - `+` `-`
        加号可能存在字符串拼接和数字运算两种情况
    + Shift（移位运算）
        - `<<`
        - `>>`
        - `>>>`
    + Relationship（关系运算）
        - `<` `>` `<=` `>=` `instanceof` `in`
        `<` `>` `<=` `>=`需要两边是数字，当然JavaScript也设计了一个字符串的比较方式，就是比较字符串的字典序，但是容易出错，不建议使用
    + Equality（等号运算）
        - `==` 
        - `!=`
        - `===`
        - `!==`
    + Bitwise （位运算）
        - `&` `^` `|`
        优先级低于等号运算

    - Logical（逻辑运算）
        - `&&`
        - `||`
        可用于代替if else

    - Conditional(条件运算)
        - `? :`
        可用于代替if else
#### 类型转换（Type Convertion）
##### 拆箱转换（Uboxing）
将对象转成基本类型，最主要的过程是ToPremitive
+ Symbol.toPremitive
+ toString
+ valueOf

优先调用Symbol.toPrimitive，toString和valueOf视情况优先调用：
比如：
```js
var x = {}
var o = {
    toString(){return "2"},
    valueOf(){return 1},
    //[Symbol.toPrimitive](){return 3}
};
x[o]  = 1;//对象作为属性名时，优先调用toString，结果是x增加属性“2”

console.log("x"+o);//加法运算，优先调用valueOf,结果是x1
```
一定会转为字符串时，会优先调用toString

##### 装箱转换（Boxing）
类型|对象|值
--|:--:|---:
Number|new Number(1)|1
String|new String('a')|'a'
Boolean|new Boolean(true)|true
Symbol|new Object(Symbol('a'))|Symbol('a')

Symbol不能使用new，只能通过Object对Symbol值进行包装

练习：完成 StringToNumber 和 NumberToString 两个函数
```js
function StringToNumber(str){
    let val;
    //负数
    let hasMinus = str.startsWith('-');
    if(hasMinus){
        str = str.slice(1);
    }
    if(str.indexOf('0b') === 0){//二进制
        console.log('二进制转为十进制');
        val =  parseInt(str.slice(2),2)
    }else if(str.indexOf('0o')=== 0){//八进制
        console.log('八进制转为十进制');
        val =  parseInt(str.slice(2),8)
    }else if(str.indexOf('0x') === 0){//十六进制
         console.log('十六进制转为十进制');
        val =  parseInt(str.slice(2),16)
    }else{//十进制
        val =  Number(str)
    }
    return hasMinus ? -val : val;
}

function NumberToString(num,radix){
    let prefix = {
        2:'0b',
        8:'0o',
        16:'0x'
    };
    let val = prefix[radix] + Math.abs(num).toString(base)
    return num>0? val : '-' + val ;
}
```

#### 运行时相关概念
##### 语句（Statement）
1. 语法（Grammar）
+ 简单语句
+ 复合语句
+ 声明
2. 运行时（Runtime）
+ Completion Record 完成记录
    1. `[[type]]` : normal,break,continue,return,throw
    2. `[[value]]` : 基本类型
    3. `[[target]] : label`
+ Lexical Environment 词汇环境

**简单语句**：
+ ExpressionStatement 表达式加上一个分号（核心）
+ EmptyStatement  只有一个分号
+ DebuggerStatement 调试语句
+ ThrowStatement  抛出异常 
+ ContinueStatement 结束当次循环
+ BreakStatement 结束整个循环
+ ReturnStatement 结束函数，并返回值

**复合语句**：
+ BlockStatement 最重要的语句
    ```js
    {
        //多个语句
        //...
    }
    ```
    返回值：
    - `[[type]]`:normal
    - `[[value]]`:--
    - `[[target]]`:--
+ IfStatement 条件语句
+ SwitchStatement 多分支语句
+ IterationStatement 循环语句（一类）
    - while(条件)语句
    - do语句while(条件)
    - for(表达式;表达式;条件表达式;) 语句
    - for(表达式 in 表达式) 语句
    - for(表达式 of 表达式) 语句
    for await (of)
+ WithStatement
 with打开一个对象，把所有对象的属性放到一个作用域中，这些属性在作用域中可以直接使用
+ LabelledStatement 给语句起名字（比如给IterationStatement命名，可以使用break通过名字来终止语句）
+ TryStatement (try...catch...finally)

BreakStatement和ContinueStatement：

返回值：
- `[[type]]`:break continue
- `[[value]]`:--
 - `[[target]]`:label

可以结合labelledStatement，结束/跳过命名的循环，节省不必要的循环

try
```js
try{

}catch(err){

}finally{

}
```
返回值：
    - `[[type]]`:return
    - `[[value]]`:--
    - `[[target]]`:label

特殊性：
+ 括号不可删除
+ 在函数中，try和catch中return并不能终止finally中语句的执行（但是try语句之后的代码不会执行）

**声明**：
+ FunctionDeclaration 普通函数声明
+ GeneratorDeclaration 产生器声明（function*）
+ AsyncFunctionDeclaration 异步函数声明（async function）
+ AsyncGeneratorDeclaration 异步产生器声明
+ VariableStatement var声明（JS标准将其划分为语句）
+ ClassDeclaration 类声明（新）
+ LexicalDeclaration  作用域声明（新），let const

作用范围为function或者body（历史包袱）
+ function
+ function*
+ async function
+ async function*
+ var   声明和赋值不是一起的

在声明之前使用会报错（预处理）（最新标准推荐）
+ class
+ const
+ let

预处理机制
var的预处理机制： 将变量声明到作用域（函数/body）的顶部 
```js
    var a = 2;
    void function(){
        a =1;
        return;
        var a;

    }()
    console.log(a)
```
let const的预处理机制： 声明之前使用会报错
```js
    var a = 2;
    void function(){
        a =1;
        return;
        let a;
    }()
    console.log(a)
```


作用域：
var的作用域是函数或者body(全局上下文）
```js
var a = 2;
void function(){
    a = 1;
    {
        var a;
    }
}();
console.log(a);//2
```
let、const的作用域是花括号
```js
var a = 2;
void function(){
    a = 1;
    {
        let a;
    }
}();
console.log(a);//1
```

#### JS结构化

##### JS执行粒度
+ 宏任务
+ 微任务（Promise）
+ 函数调用（Execution Context）
+ 语句/声明（Completion Record）
+ 直接量/变量/this ...

**宏任务和微任务**

微任务：js引擎遇到一个Promise，会将整个代码分成两个任务执行，同步任务先执行，then中的回调函数，会在下个任务执行(这个任务需要等待Promise resolve)

宏任务：将拆分后的任务依次执行的过程

**事件循环**

三个阶段：

等待（wait） => 获取代码（get code） => 执行代码（execute）


