学习笔记
#### [Mocha](https://mochajs.cn/#installation)
1. 初始化测试项目test-demo
    ```shell
    npm init
    ```
2. 安装mocha
    ```shell
    npm install mocha -g
    npm install mocha --save-dev
    ```
3. 业务代码add.js
    ```js
    function add(a, b) {
        return a + b;
    }
    module.exports = add;
    ```
4. mocha测试代码
    ```js
    var assert = require('assert');
    var add = require('../add.js');
    it('1 + 2 should be 3', function () {
        assert.equal(add(1, 2), 3);
    });
    ```
    运行mocha
    ```shell
    mocha
    ```
5. 使用describe进行分组
    ```js
    var assert = require('assert');
    var add = require('../add.js');
    describe("add functin testing", function () {
        it('1 + 2 should be 3', function () {
            assert.equal(add(1, 2), 3);
        });
        it('-5 + 2 should be -3', function () {
            assert.equal(add(-5, 2), -3);
        });
    })
    ```
6. 解决mocha不能使用import/export的问题
    add.js
    ```js
    export function add(a, b) {
        return a + b;
    }
    ```
    test.js
    ```js
    var assert = require('assert');
    import { add } from '../add.js';
    describe("add functin testing", function () {
        it('1 + 2 should be 3', function () {
            assert.equal(add(1, 2), 3);
        });
        it('-5 + 2 should be -3', function () {
            assert.equal(add(-5, 2), -3);
        });
    })

    ```
    使用babel
    ```shell
    npm install @babel/core @babel/register --save-deve
    ```

    配置.babelrc
    ```shell
    npm i @babel/preset-env --save-dev
    ```
    ```.babelrc
    {
        "presets":["@babel/preset-env"]
    }
    ```

    mocha调用babel
    ```shell
    ./node_modules/.bin/mocha --require @babel/register
    ```
    发现可以成功运行
7. 配置 test scripts 
    package.json
    ```json
    "scripts": {
        "test": "mocha --require @babel/register"
    }
    ```
    这样我们就可以使用`npm run test`来运行单元测试了

#### code coverage
计算代码测试的覆盖率
[nyc](https://www.npmjs.com/package/nyc)
1. 下载nyc
    ```shell
    npm install nyc --save-dev
    ```
    运行指令
    ```shell
    ./node_modules/.bin/nyc ./node_modules/.bin/mocha --require @babel/register
    ```
    先不使用import的方式导入文件，在add.js添加一个mul方法并导出
    ```js
    function add(a, b) {
    return a + b;
    }

    function mul(a, b) {
        return a * b;
    }
    module.exports.add = add;
    module.exports.mul = mul;
    ```
    此时再运行下面的指令，发现覆盖率不是100%了
    ```shell
    ./node_modules/.bin/nyc ./node_modules/.bin/mocha
    ```
    我们在test.js中引入mul方法，并进行测试
    ```js
    var assert = require('assert');
    var add = require('../add.js').add;
    var mul = require('../add.js').mul;
    describe("add functin testing", function () {
        it('1 + 2 should be 3', function () {
            assert.equal(add(1, 2), 3);
        });
        it('-5 + 2 should be -3', function () {
            assert.equal(add(-5, 2), -3);
        });
        it('-5 * 2 should be -10', function () {
            assert.equal(mul(-5, 2), -10);
        });
    })
    ```
    测试重新运行上面的指令，发现覆盖率又变为100%了
2. 解决babel对计算代码测试覆盖率的影响
    + 如果我们使用import/export来导入方法，会发现下面的指令会报错
    ```shell
    ./node_modules/.bin/mocha 
    ```
    + 我们需要使用给babel和nyc分别安装一个插件来解决
        - babel的插件：[babel-plugin-istanbul](https://www.npmjs.com/package/babel-plugin-istanbul)
        - nyc的插件：[nyc-config-babel](https://www.npmjs.com/package/@istanbuljs/nyc-config-babel)
    ```shell
    npm i babel-plugin-istanbul @istanbuljs/nyc-config-babel --save-dev
    ```
    配置.babelrc的plugins
    ```.babelrc
    {
        "presets":["@babel/preset-env"],
        "plugins": ["istanbul"]
    }
    ```
    新建并配置.nycrc
    ```.nycrc
    {
        "extends": "@istanbuljs/nyc-config-babel"
    }
    ```
    这时候我们运行
    ```shell
    ./node_modules/.bin/nyc ./node_modules/.bin/mocha
    ```
    发现可以正常运行，这样就实现了对babel后的代码进行测试覆盖率检测(通过sourcemap进行追踪)

    不过经过自己测试，发现执行以下命令实现的效果一样，不需要安装上面的两个包：
    ```shell
     ./node_modules/.bin/nyc ./node_modules/.bin/mocha --require @babel/register
    ```
3. 将nyc命令配置到scripts
    package.json
    ```json
    "scripts": {
        "test": "mocha --require @babel/register",
        "coverage": "nyc mocha"
    }
    ```
    在写代码时，我们执行`npm run test`可以检测代码是否正确

    在写测试用例时我们执行`npm run coverage`可以检测代码的测试覆盖率

#### 实例：对html-parser进行单元测试
1. 新建一个项目html-parser
2. 初始化：`npm init`
3. 新建src目录，并复制之前我们写的parseHTML的代码parser.js到src目录下
4. 复制之前的package.json中的devDependencies和scripts，替换当前的package.json的对应部分
```json
    "scripts": {
        "test": "mocha --require @babel/register",
        "coverage": "nyc mocha",
        "coverage2": "nyc mocha --require @babel/register"
    },
    "devDependencies": {
        "@babel/core": "^7.14.6",
        "@babel/register": "^7.14.5",
        "@babel/preset-env": "^7.14.7",
        "@istanbuljs/nyc-config-babel": "^3.0.0",
        "babel-plugin-istanbul": "^6.0.0",
        "mocha": "^9.0.1",
        "nyc": "^15.1.0"
    }
```
5. 复制.nycrc和.babelrc两个文件到当前项目根目录
6. 新建test目录，并新建一个测试文件parser-test.js(在进行单元测试时，mocha会自己到test到目录下找所有的js文件执行)
parser-test.js
```js
var assert = require('assert');
import { parseHTML } from '../src/parser.js';
describe("parse html", function () {
    it('<a>abc</a>', function () {
        parseHTML('<a>abc</a>')
        assert.equal(1, 1);
    });

})
```
7. 运行`npm run test`，成功执行单元测试
8. 运行`npm run coverage`，发现测试的覆盖率目前很低

9. 配置VSCODE本地调试环境
laynch.json
```json
{
    // 使用 IntelliSense 了解相关属性。 
    // 悬停以查看现有属性的描述。
    // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "启动程序",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "runtimeArgs":[//提供给当前运行的程序的参数
                "--require",
                "@babel/register"
            ],
            "sourceMaps": true,//使用了babel,需要sourceMap才可以正常断点
            "args":[],//提供给nodejs的命令行参数
            "program": "${workspaceFolder}/node_modules/.bin/mocha"//启动调试时运行的程序
        }
    ]
}
```
10. 给.babelrc也加上sourceMaps
```.babelrc
{
    "presets":["@babel/preset-env"],
    "plugins": ["istanbul"],
    "sourceMaps": "inline"
}
```
这样我们就可以进行本地调试了
11. 根据npm run coverage 的结果我们进行测试用例编写
+ Funcs调用达到100%,Lines达到90%算比较合格的单元测试
+ Uncovered Line可以让我们知道哪些行代码还没有测试

#### 将单元测试集成到generator中
1. 复制之前的generator-vue到当前目录，修改为generator-toytool(包括package.json中的name)
2. 下载单元测试需要的相关依赖 
./generator-toytool/generators/app/index.js
```js
 // 安装单元测试相关的依赖
this.npmInstall(['mocha', 'nyc', '@babel/core', '@babel/register', '@babel/preset-env', '@istanbuljs/nyc-config-babel', 'babel-plugin-istanbul'], { 'save-dev': true });
```
3. 将.babelrc和.nycrc文件拷贝到templates目录下作为模板，并添加如下代码
./generator-toytool/generators/app/index.js
```js
// 拷贝.babelrc配置文件
this.fs.copyTpl(
    this.templatePath('.babelrc'),
    this.destinationPath('.babelrc')
)
// 拷贝.nycrc配置文件
this.fs.copyTpl(
    this.templatePath('.nycrc'),
    this.destinationPath('.nycrc')
)
```
4. 单元测试的示例文件
+ 在templates目录下创建单元测试的示例文件sample-test.js
    ```js
    var assert = require('assert');
    describe("test cases:", function () {
        it('1 + 1 == 2', function () {
            assert.equal(1 + 1, 2);
        });
    })
    ``` 
+ 脚手架将sample-test.js模板文件拷贝到生成的项目目录
    ```js
    // 拷贝单元测试示例文件
    this.fs.copyTpl(
        this.templatePath('sample-test.js'),
        this.destinationPath('test/sample-test.js')
    )
    ```
5. babel-loader
+ 下载babel-loader
    ```js
    this.npmInstall(['babel-loader'], { 'save-dev': true }); 
    ```
+ 添加上babel-loader的配置
    templates/webpack.config.js
    ```js
    {
        test: /\.js$/, use: [
            {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        ]
    }
    ```

6. package.json生成配置修改scripts
添加test、coverage、build等脚本
```js
const pkgJson = {
    "name": answers.name,
    "version": "1.0.0",
    "description": "",
    "main": "generators/app/index.js",
    "scripts": {
        "test": "mocha --require @babel/register",
        "coverage": "nyc mocha",
        "build": "webpack"
    },
    "author": "",
    "license": "ISC"
};
```
7. 本地调试
+ 将本地全局的generator-toytool link到当前generator-toytool目录
    在generator-toytool根目录运行
    ```shell
    npm link
    ```
+ 新建一个demo项目myvueapp，并进入项目根目录
运行
```shell
yo toytool
```
+ 初始化完成后依次测试 test、coverage、build脚本
```shell
npm run test
```
```shell
npm run coverage
```
```shell
npm run build
```



