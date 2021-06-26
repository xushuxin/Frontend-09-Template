学习笔记
[YEOMAN](https://yeoman.io/authoring/index.html)
1. 初始化 
```shell
npm init
``` 
2. 安装yeoman-generator
```shell
npm install yeoman-generator
```
3. 初始化目录结构
```md
├───package.json
└───generators/
    ├───app/
    │   └───index.js
    └───router/
        └───index.js
```
+ generator/app/index.js是必须的
+ router是为了创建比较复杂的generators来使用的，我们暂时不用创建

4. 重写constructor
    toolchain/generators/app/index.js
    ```js
    var Generator = require('yeoman-generator');

    module.exports = class extends Generator {
        // The name `constructor` is important here
        constructor(args, opts) {
            // Calling the super constructor is important so our generator is correctly set up
            super(args, opts);
        }
        method1() {
            this.log('method 1 just ran');
        }

        method2() {
            this.log('method 2 just ran');
        }
    };
    ```
    添加到原型上的每个方法都会在调用生成器后运行，通常是按照顺序运行的，但是，一些特殊的方法名称会触发特定的运行顺序

5. 修改package name为`generator-`前缀
    + yeoman规定package name必须以`generator-开头`，否则无法被yeoman运行
    + keywords必须包含"yeoman-generator"，仓库必须有description才能被generators page检索到

6. 使用npm link进行本地开发调试
    npm link 可以生成一个全局的npm包，并且链接到当前目录，方便本地开发调试
    ```shell
    cd toolchain
    npm link
    ```

7. 全局安装yeoman的命令行yo
    ```shell
    npm i -g yo
    ```
    
8. 运行`yo name` 命令
    ```js
    yo toolchain
    ```
    + name为page name中`generator-`后面的部分
    + 这个命令会调用toolchain/generators/app/index.js中导出的Generator

9. [用户交互](https://yeoman.io/authoring/user-interactions.html)
    + 异步的method 
        async & await
    + this.prompt 
        用于让用户通过命令行输入信息
    ```js
    async prompting() {
        const answers = await this.prompt([
            {
                type: "input",
                name: "name",
                message: "Your project name",
                default: this.appname // Default to current folder name
            },
            {
                type: "confirm",
                name: "cool",
                message: "Would you like to enable the Cool feature?"
            }
        ]);

        this.log("app name", answers.name);
        this.log("cool feature", answers.cool);
    }
    ```
    运行 `yo toolchain`查看效果

10. [文件系统](https://yeoman.io/authoring/file-system.html)
    + 创建文件夹templates：generators/app/templates（模板文件必须放在这里）
    + 创建模板文件t.html：generators/app/templates/t.html

    t.html
    ```html
    <html>
        <head>
            <title><%= title %></title>
        </head>
    </html>
    ```
    给generators/app/index.js中的Generator类添加写文件的方法
    ```js
     // 文件操作
    writing() {
        this.fs.copyTpl(
            this.templatePath('t.html'),
            this.destinationPath('public/index.html'),
            { title: 'Templating with Yeoman' }
        );
    }
    ```
    + this.copyTpl方法用于根据模板文件在目标文件路径生成目标文件
    + 第一个参数：templatePath指定模板文件的相对路径（相对于template目录）
    + 第二个参数：destinationPath指定生成的文件的相对路径（相对于运行yo name的目录）
    + 第三个参数：一个对象，属性名会自动匹配模板中的同名变量，并替换为值

    test
    ```shell
    cd ..
    mkdir demo
    cd demo
    yo toolchain 
    ```
    可以看到当前demo目录下生成了public目录，并且生成了index.html文件，并且`<%= title %>`被替换为了实际传入的title的值`Templating with Yeoman`

11. [依赖系统](https://yeoman.io/authoring/dependencies.html)
    ```js
    // 初始化依赖
    initPackage() {
        const pkgJson = {
            devDependencies: {
                eslint: '^3.15.0'
            },
            dependencies: {
                react: '^16.2.0'
            }
        };

        // Extend or create package.json file in destination path
        this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);

        // 已弃用，会自动下载
        // this.npmInstall(['lodash'], { 'save-dev': true });
    }
    ```

#### 自己手动搭建一个vue脚手架
1. 创建一个generator-vue目录，在之前的代码基础上进行改造
2. 并初始化一个vue-demo项目，用于
```shell
mkdir vue-demo
cd vue-demo
npm init
```
3. 实现 
+ 根据用户交互录入的信息，初始化package.json
+ 下载相关依赖
+ 根据模板文件在项目对应目录下生成需要的文件
    ```js

    var Generator = require('yeoman-generator');

    module.exports = class extends Generator {
        // The name `constructor` is important here
        constructor(args, opts) {
            // Calling the super constructor is important so our generator is correctly set up
            super(args, opts);
        }

        // 初始化package.json
        async initPackage() {
            const answers = await this.prompt([
                {
                    type: "input",
                    name: "name",
                    message: "Your project name",
                    default: this.appname // Default to current folder name
                },
            ]);
            const pkgJson = {
                "name": answers.name,
                "version": "1.0.0",
                "description": "",
                "main": "generators/app/index.js",
                "scripts": {
                    "test": "echo \"Error: no test specified\" && exit 1"
                },
                "author": "",
                "license": "ISC"
            };

            // Extend or create package.json file in destination path
            this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
            //下载需要的依赖
            this.npmInstall(['webpack@4.44.0', 'vue-loader', 'vue-template-compiler',
                'vue-style-loader', 'css-loader', 'copy-webpack-plugin@6.0.3'], { 'save-dev': true });
            this.npmInstall(['vue'], { 'save-dev': false });


            // 拷贝vue模板
            this.fs.copyTpl(
                this.templatePath('HelloWorld.vue'),
                this.destinationPath('src/HelloWorld.vue')
            )
            // 拷贝入口文件
            this.fs.copyTpl(
                this.templatePath('main.js'),
                this.destinationPath('src/main.js')
            )
            // 拷贝HTML
            this.fs.copyTpl(
                this.templatePath('index.html'),
                this.destinationPath('src/index.html'),
                { title: answers.name }
            )
            // 拷贝webapck配置文件
            this.fs.copyTpl(
                this.templatePath('webpack.config.js'),
                this.destinationPath('webpack.config.js')
            )
        }
    };
    ```

#### webpack
1. 安装
    ```shell
    npm install --save-dev webpack webpack-cli
    ```
    也可以只安装 webpack-cli，使用npx调用webpack
    ```shell
    npx webpack
    ```

#### Babel
**babel作为一个独立的工具使用**
1. 全局安装babel 
    ```shell
    npm install --g @babel/core @babel/cli
    ```
2. 新建src/sample.js
    ```js
    for (let a of [1, 2, 3]) {
        console.log(a);
    }
    ```
3. 命令行运行babel对sample.js进行处理
    ```shell
    babel ./src/sample.js >1.text
    ```
    结果发现生成的1.text文件和sample.js的内容一样，这还是因为我们没有进行相关配置
3. babel的配置
    在根目录下创建.babelrc文件(babel运行时会自动去读取配置)
    ```.babelrc
    {
        "presets":["@babel/preset-env"]
    }
    ```
    下载 @babel/preset-env
    ```shell
    npm install --save-dev @babel/preset-env
    ```
    现在我们再次运行一次babel，发现babel会去读取配置文件，并对sample.js进行处理了
    ```shell
    babel ./src/sample.js
    ```
**babel结合webpack使用**
一般通过babel-loader来进行babel配置，babel-loader会对每个匹配的文件执行babel操作
例如：之前的组件的项目中，我们对每个js文件使用babel-loader进行处理，支持jsx语法，而js语法的转化处理我们一般使用presets来进行配置
```js
module:{
    rules:[
        {
            test:/\.js$/,
            use:{
                loader:'babel-loader',
                options:{
                    presets:[ '@babel/preset-env' ],
                    plugins:[
                        ["@babel/plugin-transform-react-jsx",{pragma:'createElement'}]
                    ]
                }
            }
        }
    ]
}
```