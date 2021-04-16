学习笔记
#### 浏览器的基础渲染流程
1. 输入URL，发送HTTP请求，解析HTTP回应，获得HTML（HTTP）
2. 对HTML进行解析，生成DOM树（parse）
3. 进行css属性计算，得到带样式的DOM树(css computing)
4. 进行布局，计算每个元素的位置（layout）
5. 渲染，把DOM树画到一张图片（Btimap）上，然后通过操作系统和硬件驱动提供的API接口，展示到屏幕上（render）

#### 有限状态机
+ 每一个状态都是一个机器
    - 在每一个机器里，我们可以做计算、存储、输出...
    - 所有的这些机器接受的输入是一致的
    - 状态机的每一个机器本身没有状态，如果我们用函数来表示的话，它应该是纯函数
+ 每一个机器知道下一个状态(两种)
    1. 每个机器都有确定的下一个状态（Moore型）
    2. 每个机器根据输入决定下一个状态（Mealy型）**实用**

    ##### JS中的有限状态机（Mealy型）

    ```js
    //每个函数是一个状态
    function state(input){
        //在函数中，可以自由的编写代码，处理每个状态的逻辑
        return next;//返回值作为下一个状态
    }
    <!-- 调用 -->
    while(input){
        //获取输入
        state = state(input);//把状态机的返回值作为下一个状态
    }
    ```

    使用状态机处理字符串(找到字符abcdef)
    ```js
    console.log(match('i love abcdefg'))
    function match(str){
        let state = start;
        for(let c  of str){
           state = state(c);
        }
        return state === end;//最终状态函数为end，表示已匹配结束
    }
    function start(c){
        if(c === 'a'){
            return foundA;
        } else{
            return start;
        }
    }
    function foundA(c){
        if(c === 'b'){
            return foundB;
        }else{
            return start(c);//reConsume（重新使用）
        }
    }
    function foundB(c){
        if(c === 'c'){
            return foundC;
        }else{
            return start(c);
        }
    }
    function foundC(c){
        if(c === 'd'){
            return foundD
        }else{
            return start(c);
        }
    }
    function foundD(c){
        if(c === 'e'){
            return foundE;
        }else{
            return start(c)
        }
    }
    function foundE(c){
        if(c === 'f'){
            return end;
        }else{
            return start(c);
        }
    }
    function end(c){
        return end;
    }
    ```
#### 了解HTTP协议
+ 文本型协议（所有内容都是字符串）
+ HTTP request构成：
    request line（请求行）：`POST / HTTP/1.1`
    - method (POST/GET/DELETE...)
    - path（路径）默认为/
    - 版本 如：HTTP/1.1
    
    headers（请求头）
        - 包含多行，每一行是以冒号分割的`key:value`键值对 
        - 行数不固定，以一个空白行为结束标志

    body（请求体）
        - 格式由headers的Content-Type来决定格式
+ HTTP请求中所有换行都是以`\r\n`两个字符组成的
+ HTTP response构成：
    status line：` HTTP/1.1 200 OK`
    - 版本号，如：HTTP/1.1
    - 状态码，如：200
    - 状态文本，如：OK

    headers
    - 格式与request一致

    body
    - 格式由headers的Content-Type来决定格式
    - 一种典型的格式：chunked body（node默认返回的）
        十六进制的数字单独占一行，后面跟着内容部分，后面又跟着一个十六进制的数字，直到最后有一个十六进制的0，会得到空的chunk，0之后就是整个body的结尾了

#### 实现一个HTTP请求
第一步
+ 设计一个HTTP请求的类
+ content-type是一个必要字段，要有默认值
+ body是键值对格式
+ 不同的content-type影响body的格式

第二步 send函数总结
+ 在Request的构造器中收集必要的信息
+ 设计一个send函数，把请求真实发送到服务器
+ send函数应该是异步的，所以返回Promise

第三步 发送请求
+ 设计支持已有的connection或者自己新建connection
+ 收到数据传给parser
+ 根据parser的状态resolve Promise

第四步 Response解析
+ Response必须分段构造，所以我们要用一个ResponseParser来装配
+ ResponseParser分段处理ResponseText，用状态机来分析文本结构
第五步 BodyParser总结
+ Response的body可能根据Content-Type有不同的结构，因此我们会采用子Parser的结构来解决问题
+ 以TrunkedBodyParser为例（还有很多其他类型的parser），我们同样使用状态机来处理body的格式
