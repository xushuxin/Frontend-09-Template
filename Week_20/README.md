学习笔记
#### 持续集成

##### Git Hooks
1. 初始化一个git 项目，添加READMe.md
    ```shell
    mkdir git-demo
    cd git-demo
    git init
    touch README.md
    ```
2. 打开.git，查看hooks文件夹下的文件
    ```shell
    open .git
    ``` 
    hooks下全部都是以.sample结尾的文件,去掉sample结尾后为可执行文件

3. 我们客户端提交代码主要用到pre-commit和pre-push两个钩子，如果要对服务器端的git做处理则使用pre-receive钩子

    + pre-commit
        lint操作一般放在pre-commit钩子
        + 在hooks目录下新建一个pre-commit文件`touch pre-commit`

        + 命令行执行pre-commit文件`./pre-commit`，这时会报Permission denied错误
            - `ls -l pre-commit` 查看该文件的权限，发现没有执行的权限
            - 使用`chmod +x ./pre-commit`给文件加上执行权限（x代表执行权限）

        +  查看node脚本的位置`which node`

        + 我们想使用node来编写pre-commit的内容（sample中使用的是shell脚本编写的），在pre-commit文件顶部用`#!`来标注这个文件是用哪个脚本引擎执行的（类Linux系统的一个习惯）
            ```
            #!/usr/bin/env node 
            console.log("Hello hooks")
            ```
            命令行执行`./pre-commit`，可以看到控制台打印出Hello hooks
        + 修改README.md文件，并进行提交，发现会触发pre-commit脚本执行
            ```shell
            git add 
            git commit -m "A Sample Change"
            ```
        + 使用node的process阻止commit
            ```
            #!/usr/bin/env node
            console.log("Hello hooks")
            let process = require("process");
            process.exit(1);//阻止提交
            ```
            修改README.md，再进行提交`git add README.md` `git commit -m 'change README.md'`，发现并没有产生提交记录，`git status`可以看到代码仍处于暂存区
    + pre-push
        check操作一般放在pre-push钩子

##### [ESlint](https://eslint.org/docs/user-guide/getting-started)

1. 基本用法
    + 初始化项目，并下载eslint
        ```shell
        mkdir eslint-demo
        cd eslint-demo
        npm init
        npm install --save-dev eslint
        ```
    + 初始化eslint配置文件
        ```shell
        npx eslint --init
        ```
        or
        ```shell
        ./node_modules/.bin/eslint --init
        ```
        会有一些交互式配置，完成之后，会在当前目录下生成.eslintrc.js配置文件


    + 新建一个index.js，随便写一点代码
        ```js
        let a = 1;
        for(let i of [1,2,3]){
            console.log(i);
        }
        ```
        运行eslint
        `npx eslint ./index.js` or `./node_modules/.bin/eslint ./index.js`
        可以看到一些错误提示，根据提示修改代码，再运行eslint，就不会有错误提示了
2. Git Hooks和ESLint相结合 [(ESLint API)](https://eslint.org/docs/developer-guide/nodejs-api)
    + 对git-demo项目进行初始化，下载ESLint并初始化ESLint配置文件
        ```shell
        cd git-demo
        npm init
        npm install eslint --save-dev
        npx eslint --init
        ```
    + 新建index.js
        ```js
        let a = 1;
        for (let i of [1, 2, 3]) {
            console.log(i);
        }
        ```
    + 修改node_modules/.bin/hooks/pre-commit
        ```js
        #!/usr/bin/env node
        let process = require("process");
        const { ESLint } = require("eslint");

        (async function main() {
            // 1. Create an instance with the `fix` option.
            const eslint = new ESLint({ fix: false });

            // 2. Lint files. This doesn't modify target files.
            const results = await eslint.lintFiles(["index.js"]);

            // 4. Format the results.
            const formatter = await eslint.loadFormatter("stylish");
            const resultText = formatter.format(results);

            // 5. Output it.
            console.log(resultText);

            for (let result of results) {
                if (result.errorCount) {//if had error
                    process.exitCode = 1;//exit code
                }
            }
        })()
        ```
    + 尝试对修改代码进行提交（记得添加.gitignore，防止提交node_modules）
        ```shell
        git status
        git add .
        git commit -m 'add index.js'
        ```
        可以发现ESLint报错了，并且终止了commit，按照错误提示修改index.js后再提交，发现可以提交成功
    + 考虑边界情况
        - 在我们的日常开发中可能会出现这种情况:比如index.js，修改之后，`git add`将Working Tree的修改添加到Index，之后又对这个文件进行了修改，这时`git commit`，我们提交的内容是Index中的内容，也就是第一次修改的内容，但是eslint并不会去区分Working Tree和Index，它只会对本地的文件进行校验，也就是以最后一次修改为准
        - 所以我们需要使用`git stash push -k`这个命令，将Working Tree的代码暂时存储起来，再运行eslint，运行完成后再恢复Working Tree的修改`git stash pop`
        - 修改hooks/pre-commit
            ```js
            #!/usr/bin/env node
            let process = require("process");
            let child_process = require("child_process");
            let util = require('util');
            const { ESLint } = require("eslint");

            const exec = util.promisify(child_process.exec);

            (async function main() {
                // 1. Create an instance with the `fix` option.
                const eslint = new ESLint({ fix: false });

                // 2. Lint files. This doesn't modify target files.
                await exec("git stash push -k");
                const results = await eslint.lintFiles(["index.js"]);
                await exec("git stash pop")

                // 4. Format the results.
                const formatter = await eslint.loadFormatter("stylish");
                const resultText = formatter.format(results);

                // 5. Output it.
                console.log(resultText);

                for (let result of results) {
                    if (result.errorCount) {//if had error
                        process.exitCode = 1;//exit code
                    }
                }
            })()
            ```
        - 这个方法仍存在一个冲突的问题，暂未解决：当Working Tree 和 Index两次修改到同一行的时候，在`git stash pop`的时候会发生冲突

#### 使用无头浏览器检查DOM
Chrome的[Headless](https://developers.google.com/web/updates/2017/04/headless-chrome)模式目前是最佳实践
1. 使用命令行打开Chrome浏览器
    Mac系统，命令行输入：
    ```shell
    alias chrome="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"
    ```
    运行`chrome`即可打开Chrome浏览器
2. 进入Headless模式
    ```shell
    chrome --headless
    ```
    运行下面的命令，可以看到控制台打印出一个空页面的dom结构
    ```shell
    chrome --headless --dump-dom about:blank
    ```
    可以将dom树写入一个文件
    ```shell
    chrome --headless --dump-dom about:blank > temp.txt
    cat temp.txt
    ```
    也可以使用node的child_process去读取这个数据，但是node有更简单的方式

3. 谷歌推出的一个包：[puppeteer](https://www.npmjs.com/package/puppeteer)
    + 对之前写的页面进行测试
        ```shell
        cd component/jsx
        npm run dev
        ```
    + 新建一个测试项目：headless-demo   
        ```shell
        mkdir headless-demo
        cd headless-demo
        npm init
        ```
        安装puppeteer
        ```
        npm install puppeteer --save-dev
        ```

    + 新建main.js，并复制文档中的Example，进行修改
        ```js
        const puppeteer = require('puppeteer');

        (async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto('http://localhost:8080/main.html');//要测试的页面地址

            const a = await page.$('.carousel');//$ === document.querySelector
            console.log(await a.asElement().boxModel())

            const imgs = await page.$$('.carousel > div');//$$ === document.querySelectorAll
            console.log(imgs);
            await browser.close();
        })();
        ```
        运行 `node main.js`，这样我们就可以获取到dom，并进行相关测试
    
    + 可以将无头浏览器的校验放到服务器端，部署之前