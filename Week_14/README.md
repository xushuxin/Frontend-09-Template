学习笔记
#### 对象和组件
**对象**
+ Properties
+ Methods
+ Inherit

**组件**
+ Properties
+ Methods
+ Inherit
+ Attribute
+ Config & State
+ Event
+ Lifecycle
+ Children

**Component**
+ State 
用户的交互导致组件状态发生变化
+ Children 
子组件的状态可能受父组件State的影响
+ attribute 
使用组件的程序员，通过 attribute 更改组件的一些特征或者是特性（一般是通过声明型语言（最主流的是基于 XML 的体系，如HTML、JSX）））
+ Method 
使用组件的程序员向开发组件的程序员传递消息，比 Property 可能更复杂
+ Property 
使用组件的程序员也以使用 Property 设置属性，影响组件(attribute 和 Property作用是否完全相同，取决于组件的设计者)
+ Event 
开发组件的程序员向使用组件的程序员传递信息


**Attribute**
+ Attribute VS Property
    - Attribute 强调描述性
    - Property 强调从属关系
HTML 中的设计案例：
1. 早期 JS 中不允许关键字class作为对象的属性名，为此 HTML做了处理：
    - Attribute 仍然叫 class，但是 Property 叫 className
    - 虽然现在 JS 中已经可以使用关键字作为对象的属性名了，但是 HTML 中仍然使用 class 作为 Property，没有改过来
    ```html
    <div class="cls1 cls2"></div>
    <script>
        var div = document.getElementByTagName('div');
        div.className //cls1 cls2
    </script>
    ```
2. style作为Attribute是一个字符串，但是作为属性是一个字符串语义化后的对象
    ```html
    <div class="cls1 cls2" style="color:blue"></div>
    <script>
        var div = document.getElementByTagName('div');
        div.style //对象
    </script>
    ```
3. href属性 ，作为Attribute 时，获取的值和代码中写的一致；作为 Property，获取到的是处理过后的值
     ```html
    <a href="//m.tapbao.com"></a>
    <script>
        var a = document.getElementByTagName('a');
        a.getAttribute('href');// //m.tapbao.com
        a.href;// https://m.tapbao.com
    </script>
    ```
    修改了 Attribute，Property也会跟着改变
4. Input 的 value
    - 如果没有设置 value property，则获取的是 attribute 的值(相当于一个默认值)
    - 如果设置 value property，不会影响 attibute 的值，获取的时候优先获取 value property的值
    ```html
    <input value ="cute"/>
    <script>
        var input = document.getElementByTagName('input');
        input.value // cute
        inoute.getAttribute('value') //cute
        input.value = 'hello'
        inoput.value// hello
        inout.getAttribute('value')// cute
    </script>
    ```    
**Lifecycle**
```md
created => mount => unmount => destroyed
                    render/update
```


**Children**
+ Content 型 Children
    ```html
    <my-button><img src="{{icon}}">{{title}}</my-button>
    ```
+ Template型 Children
     ```html
    <my-list>
        <li><img src="{{icon}}">{{title}}</li>
    </my-list>
    ```


**搭建 JSX环境**
1. 初始化
+ 创建 jsx 目录
+ 初始化包管理系统
    ```shell
    npm init
    ```
+ 下载 webpack webpack-cli
    ```shell
    npm install  webpack webpack-cli --save-dev
    ```

+ 下载babel 相关包
    ```shell
    npm install babel-loader @babel/core @bable/preset-ent --save-dev
    ```
2. 新建webpack.config.js文件并添加配置
    ```js
    module.exports = {
        entry:"./main.js",
    }
    ```
    只配置一个 entry 我们就可以使用 webpack 运行以下，测试打包效果了

3. 配置 babel-loader
    ```js
    module.exports = {
        entry:"./main.js",
        module:{
            rules:[
                {
                    test:/\.js$/,
                    use:{
                        loader:'babel-loader',
                        options:{
                            presets:[
                                '@babel/preset-env'
                            ]
                        }
                    }
                }
            ]
        }
    }
    ```
4. 安装处理JSX语法需要的包并配置
    ```shell
    npm install --save-deve @babel/plugin-transform-react-jsx
    ```
    ```js
    module.exports = {
        entry:"./main.js",
        module:{
            rules:[
                {
                    test:/\.js$/,
                    use:{
                        loader:'babel-loader',
                        options:{
                            presets:['@babel/preset-env'],
                            plugins:["@babel/plugin-transform-react-jsx"]
                        }
                    }
                }
            ]
        }
    }
   ```
5. @babel/plugin-transform-react-jsx这个插件默认会把 JSX 语法转为 React.createElement处理，如果我们不想用这个默认的语法，可以自己通过配置进行定义
    ```js
    module.exports = {
        entry:"./main.js",
        module:{
            rules:[
                {
                    test:/\.js$/,
                    use:{
                        loader:'babel-loader',
                        options:{
                            presets:['@babel/preset-env'],
                            plugins:[
                                ["@babel/plugin-transform-react-jsx",{pragma:'createElement'}]
                            ]
                        }
                    }
                }
            ]
        }
    }
   ```
   如上，配置后，JSX 语法默认会被转化后传入createElment方法处理

6. 在默认的打包输出目录 dist 目录新建一个 main.html，script引入打包后的main.js