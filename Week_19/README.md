学习笔记
#### 发布系统
+ 线上服务系统：给真正的用户提供线上服务
+ 发布系统：程序员向线上服务系统发布
+ 发布工具：命令行工具，用于和发布系统对接
发布系统和线上服务系统可以同级部署，也可以是两个独立的集群


##### 单机同级部署发布系统

**一、初始化Server**
1. 下载虚拟机和虚拟机操作系统镜像
   + Oracle VM VirtualBox 下载地址： https://www.virtualbox.org/
   + Ubuntu 20.04.1 LTS (Focal Fossa) 下载地址： https://releases.ubuntu.com/20.04/
2. 安装虚拟机，新建一个虚拟电脑
   + 类型选择Liniux
   + 版本选择Ubuntu（64-bit）
   + 内存2G
   + 创建虚拟硬盘
   + 动态分配
   + 硬盘10G

   ![image-20210706073409365](/Users/xushuxin/Library/Application Support/typora-user-images/image-20210706073409365.png)
3. 启动虚拟电脑 ，安装操作系统镜像
   + 修改镜像地址为 http://mirrors.aliyun.com/ubuntu
   + 勾选下载Open SSH

4. 安装完成后重启虚拟机，登录
5. 使用ubuntu的包管理工具apt
   + 下载node、npm
   ```shell
   sudo apt install node
   sudo apt install npm
   ```
   查看版本
   ```shell
   node --version
   npm --version
   ```
   下载node的版本管理工具，可以切换node版本
   ```shell
   sudo npm install -g n
   ```
   下载并切换到最新版本node
   ```shell
   sudo n latest
   ```
   设置环境变量
   ```shell
   PATH="$PATH"
   ```
   **二、利用Express，搭建线上服务器**
   1. 初始化项目
      依次执行以下命令
      ```shell
      mkdir server
      cd server
      npx express-generator
      npm install
      ```
   2. 运行项目
      ```
      npm start
      ```
      浏览器打开localhost:3000,查看效果
   3. 删除无用低码
      + 我们只需要public目录
      + 删除app.js中routes和views相关代码
      + 删除routes和views文件夹
      + public目录下新建一个index.html，随便写一些内容，重启项目
   4. 将当前电脑上server的代码部署到虚拟机服务器上

      虚拟机操作
      + OpenSSH包用于计算机之间加密传输文件
         - 我们在安装虚拟机时已经勾选安装了，如果没有安装，可以使用`apt install openssh-server`命令安装
      + 启动SSH服务
         - `service ssh start`，输入虚拟机密码，这时SSH服务就已经启动了
         - SSH服务默认监听的是22端口，我们可以通过远程登录到虚拟机
      + 新建一个server目录，用于接收文件

      当前电脑操作
      + 配置虚拟机的端口转发，指定当前宿主电脑的8022端口（或者任意不常用的端口）转发到虚拟机的22端口（设置-网络-高级-端口转发）
      + 使用scp命令将项目所有文件传输到虚拟机上指定目录（注意：scp命令mac上自带，如果是其它系统需要自己安装一下scp命令）
         ```shell
         cd server
         scp -P 8022 -r ./* xushuxin@127.0.0.1:/home/xushuxin/server
         ```
         输入scp命令后，输入yes，然后填写虚拟机密码，然后就可以看到当前目录下的文件都被传输到虚拟机上了

         注：`/home/xushuxin`这个路径我们可以在虚拟机中输入`pwd`命令查看到
   5. 启动虚拟机上server服务

      ```shell
      cd server
      npm run start
      ```

      + 我们再配置一个端口转发：宿主电脑8080端口 => 虚拟机的3000端口

      + 打开浏览器访问localhost:8080端口，就可以看到虚拟机服务器上的内容了
      + 这样我们就有了一个纯粹的线上服务

**三、实现一个发布系统**
   1. 用Node.js启动一个简单的Server
      - 创建一个publish-server和一个publish-tool，publish-server负责向线上服务器传输文件
         ```shell
         mkdir publish-server
         mkdir publish-tool
         ```
      - 分别进入两个项目，初始化项目`npm init`
      - 在publish-server中创建server.js
         ```js
         let http = require('http');
         http.createServer(function (req, res) {
            console.log(req);
            res.end('Hello World');
         }).listen(8082);
         ```
      - 启动服务后，在浏览器输入localhost:8082就能看到返回的结果了  
   2. 编写简单的发送请求功能
      - 在publish-tool目录下新建publish.js
         ```js
         let http = require('http');
         
         let request = http.request({
            hostname: "127.0.0.1",
            port: 8082
         }, response => {
            console.log(response);
         })
         
         request.end();
         ```
      - 运行`node publish`，可以看到response，并且publish-server也接收到了请求  
   3. 简单了解Node.js的流    
      可读流，主要有data和end事件
      - data是读取到数据的事件，可能会触发多次
      - end是表示流中数据已读取完成
      - http的服务器端接收到的request就是一个可读流
      ```js
      let fs = require('fs');
      
      let file = fs.createReadStream("./package.json");
      
      file.on('data', chunk => {
         console.log(chunk.toString());
      })
      file.on('end', chunk => {
         console.log('read finish');
      })
      ```
      可写流，主要有write和end方法
      - write是向流中写数据
      - end是表示不再向流中写数据
      - http的请求端request就是一个可写流

      客户端：publish-tool/publish.js
      ```js
      let http = require('http');
      let fs = require('fs');
      
      let request = http.request({
         hostname: "127.0.0.1",
         port: 8082,
         method: 'POST',
         headers: {
            'Content-Type': 'application/octet-stream'//流格式传输
         }
      }, response => {
         console.log(response);
      })
      
      //向request写文件
      let file = fs.createReadStream("./package.json");
      
      file.on('data', chunk => {
         request.write(chunk);
      })
      file.on('end', chunk => {
         console.log('write finish');
         request.end(chunk);
      })
      ```
      服务端：publish-server/server.js
      ```js
      let http = require('http');
      http.createServer(function (request, response) {
         request.on('data', (chunk) => {
            console.log(chunk.toString());
         })
         request.on('end', (chunk) => {
            response.end('success');
         })
      }).listen(8082);
      ```
      服务端启动服务 `node server`
      
      客户端执行 `node publish`

      可以看到服务端接收到客户端传输的文件内容
   4. 改造Server
      服务端：
      - 修改publish-server/server.js，获取线上服务器的html文件，向其写数据

         ```js
         let http = require('http');
         let fs = require('fs');

         http.createServer(function (request, response) {
            // 获取线上服务器的html文件，向其写数据
            let outFile = fs.createWriteStream("../server/public/index.html")
            request.on('data', (chunk) => {
               outFile.write(chunk);
            })
            request.on('end', (chunk) => {
               outFile.end();
               response.end('success');
            })
         }).listen(8082);
         ```
      客户端：
      - 新建一个sample.html
         ```html
         <html>
         <head>
            <title>Hello World</title>
         </head>
         <body>
            <h1>Hello World</h1>
         </body>
         </html>
         ```
      - 修改publish-tool/publish.js
         ```js
         let http = require('http');
         let fs = require('fs');
         
         let request = http.request({
            hostname: "127.0.0.1",
            port: 8082,
            method: 'POST',
            headers: {
               'Content-Type': 'application/octet-stream'//流格式传输
            }
         }, response => {
            console.log(response);
         })
         
         //向request写文件
         let file = fs.createReadStream("./sample.html");
         
         file.on('data', chunk => {
            request.write(chunk);
         })
         file.on('end', chunk => {
            console.log('write finish');
            request.end(chunk);
         })
         ```

      服务端启动服务 `node server`
      
      客户端执行 `node publish`

      启动线上服务器 `npm start`，浏览器输入localhost:3000

      可以看到线上服务器的index.html内容变成和sample.html中的一样
   5. 配置command，并通过command将代码复制到虚拟机，并在虚拟机启动发布服务
      当前电脑操作：
      publish-server/package.json
         ```json
         "scripts": {
            "start" : "node server.js",
            "publish":"scp -P 8022 -r ./* xushuxin@127.0.0.1:/home/xushuxin/public-server"
         }
         ```
      server/package.json
         ```json
         "scripts": {
            "start": "node ./bin/www",
            "publish":"scp -P 8022 -r ./* xushuxin@127.0.0.1:/home/xushuxin/server"
         }
         ```
      虚拟机操作：
      + 创建public-server目录
      ```shell
      cd .. 
      mkdir public-server
      ```
      当前电脑操作:
      + publish-server目录下运行`npm run publish`，将当前项目传输到服务器

      虚拟机操作：
      + 启动线上服务器
         ```shell
         cd server
         npm start&
         ```
      + 启动发布服务器
         ```shell
         cd public-server
         npm start&
         ```
      + 这样虚拟机上两个服务都启动了，因为是虚拟机，public-server监听的时8082端口，所以我们还需要配置一个端口8882转发到虚拟机的8082端口
      + 与此用时，还要修改一下publish-tool/publish.js中发送http请求的端口为8882
      + 此时我们运行 `node publish`，就可以把index.html文件发布到线上服务器了，通过浏览器打开localhost:8080，就可以看到线上服务器的html已经和sample.html一样了
   6. 实现多文件发布
      + 使用pipe来改造request和response
         - 客户端 修改publish-tool/publish.js
            ```js
            let http = require('http');
            let fs = require('fs');
            
            let request = http.request({
               hostname: "127.0.0.1",
               port: 8082,
               method: 'POST',
               headers: {
                  'Content-Type': 'application/octet-stream'//流格式传输
               }
            }, response => {
               console.log(response);
            })
            
            //向request写文件
            let file = fs.createReadStream("./sample.html");
            file.pipe(request);
            file.on('end', () => request.end());
            ```
         - 服务端 修改publish-server/server.js
            ```js
            let http = require('http');
            
            let fs = require('fs');
            
            http.createServer(function (request, response) {
               // 获取线上服务器的html文件，向其写数据
               let outFile = fs.createWriteStream("../server/public/index.html")
               request.pipe(outFile)
               request.on('end', () => response.end('success'))
            }).listen(8082);
            ```
         - test
            + 修改publish-tool/sample.html
            + nodemon启动publish-server/server.js
            + node启动publish-tool/publish.js
            + 查看server/public/index.html，内容变成和sample.html一致
      + 获取文件的大小（fs.stat读取文件信息） 
         - 修改publish-tool/publish.js
         ```js
         let http = require('http');
         let fs = require('fs');
         
         fs.stat("./sample.html", (err, stats) => {
            let request = http.request({
               hostname: "127.0.0.1",
               port: 8082,
               method: 'POST',
               headers: {
                     'Content-Type': 'application/octet-stream',//流格式传输
                     'Content-Length': stats.size
               }
            }, response => {
               console.log(response);
            })
         
            let file = fs.createReadStream("./sample.html");
         
            file.pipe(request);
         
            file.on('end', () => request.end());
         })
         ```
      + 创建一个sample文件夹，并将sample.html和一些图片放入该文件夹
      + publish-tool下载压缩用的依赖包[archiver](https://www.npmjs.com/package/archiver)
         ```shell
         npm install archiver --save
         ```
         - 修改publish-tool/publish.js
         ```js
         let http = require('http');
         let fs = require('fs');
         let archiver = require('archiver');
         
         let request = http.request({
            hostname: "127.0.0.1",
            port: 8082,
            method: 'POST',
            headers: {
               'Content-Type': 'application/octet-stream',//流格式传输
            }
         }, response => {
            console.log(response);
         })
         
         const archive = archiver('zip', {
            zlib: { level: 9 }// sets the compression level
         });
         
         archive.directory('./sample/', false);//从指定的目录下添加文件
         
         archive.pipe(request);//将压缩后的文件流写入request
         
         archive.finalize();//表示完成压缩内容的添加
         ```
      + publish-server下载解压缩用的依赖包[unzipper](https://www.npmjs.com/package/unzipper)
         ```shell
         npm install unzipper --save
         ```
         - 修改publish-server/server.js 
         ```js
         let http = require('http');
         let unzipper = require('unzipper');
         http.createServer(function (request, response) {
            // 获取线上服务器的html文件，向其写目标目录解压文件
            request.pipe(unzipper.Extract({ path: '../server/public' }))
            request.on('end', () => response.end('success'))
         }).listen(8082);
         ```
         这样我们就实现了多文件的发布
   7. 用GitHub OAuth做一个登陆实例   
      + 打开github首页右上角Settings - Developer settings - New GitHub App，创建一个App
         填写：
         - GitHub App name：toy-publish（如果已存在就重新命名）
         - Homepage URL：http://localhost
         - Callback URL：http://localhost:8082/auth
         - Expire user authorization tokens取消勾选
         - Webhook Active取消勾选
         - Where can this GitHub App be installed?：选择Any account
         - 点击Create GitHub App按钮提交
         - 提交完我们就可以看到创建好的app，Client ID可以用于获取github身份
      + 文档地址：https://docs.github.com/cn/developers/apps/building-oauth-apps/authorizing-oauth-apps
         1. 客户端 使用client_id来登录和授权
            publish-tool/publish.js
         2. 服务端 auth路由:接收code，用code + client_id + client_secret换token
            publish-server/server.js
         3. 客户端 创建server,接收token后点击发布
            publish-tool/publish.js
         4. 服务端 publish路由：用token获取用户信息，检查权限，接受发布
            publish-server/server.js


      
