let http = require('http');
let https = require('https');
let unzipper = require('unzipper');
let qs = require('querystring');

// 2. 服务端 auth路由:接收code，用code + client_id + client_secret换token
function auth(request, response) {
    let query = qs.parse(request.url.match(/^\/auth\?(.+)$/)[1]);
    getToken(query.code, function (info) {
        // 返回给客户端一个a标签，这个a标签的href访问publish-tool/publish.js中启动的服务，并传递token
        response.end(`<a href="http://localhost:8083/?token=${info.access_token}">publish</a>`);
    });
}

function getToken(code, callback) {
    // https://github.com/login/oauth/access_token
    let request = https.request({
        hostname: 'github.com',
        path: `/login/oauth/access_token?code=${code}&client_id=Iv1.ecaf8559747563e0&client_secret=3625be3c60f8bd76504b3d315014eaa123da0fc4`,
        port: 443,
        method: 'POST'
    }, function (response) {
        let body = "";
        response.on('data', function (chunk) {
            body += chunk.toString();
        })
        response.on('end', function () {
            callback(qs.parse(body));
        })
    })
    request.end();
}

// 4. 服务端 piblish路由：用token获取用户信息，检查权限，接受发布
function publish(request, response) {
    let query = qs.parse(request.url.match(/^\/publish\?(.+)$/)[1]);
    getUser(query.token, (info) => {
        if (info.name === 'xushuxin') {//权限判断，这里可以接入权限系统
            // 获取线上服务器的html文件，向其写目标目录解压文件
            request.pipe(unzipper.Extract({ path: '../server/public' }))
            request.on('end', () => response.end('success'))
        }
    });
}


function getUser(token, callback) {
    // https://github.com/user 获取用户信息
    let request = https.request({
        hostname: 'api.github.com',
        path: `/user`,
        port: 443,
        // 传递token
        headers: {
            'User-Agent': 'xsx-toy-publish',
            Authorization: `token ${token}`
        },
        method: 'GET'
    }, function (response) {
        console.log(response)
        let body = "";
        response.on('data', function (chunk) {
            body += chunk.toString();
        })
        response.on('end', function () {
            callback(JSON.parse(body))
        })
    })
    request.end();
}

http.createServer(function (request, response) {

    if (request.url.match(/^\/auth/))
        return auth(request, response);
    if (request.url.match(/^\/publish/))
        return publish(request, response);

}).listen(8082);