let http = require('http');
let qs = require('querystring');
let archiver = require('archiver');

let child_process = require('child_process');

// 1. 打开 https://github.com/login/oauth/authorize，使用client_id获取用户身份
child_process.exec(`open https://github.com/login/oauth/authorize?client_id=Iv1.ecaf8559747563e0`)


// 3. 创建server,接收token后点击发布
http.createServer(function (request, response) {
    let query = qs.parse(request.url.match(/^\/\?(.+)$/)[1]);
    publish(query.token, (message) => {
        response.end(message)
    });
}).listen(8083);


function publish(token, callback) {
    let request = http.request({
        hostname: "127.0.0.1",
        port: 8082,
        path: `/publish?token=${token}`, //携带token，访问服务器的publish路由
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream',//流格式传输
        }
    }, response => {
        let body = "";
        response.on('data', function (chunk) {
            body += chunk.toString();
        })
        response.on('end', function () {
            callback(body);
        })
    })

    const archive = archiver('zip', {
        zlib: { level: 9 }// sets the compression level
    });

    archive.directory('./sample/', false);//从指定的目录下添加文件

    archive.pipe(request);//将压缩后的文件流写入request

    archive.finalize();//表示完成压缩内容的添加

    request.end();
}
