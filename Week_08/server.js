const http = require('http');
http.createServer((request,response)=>{
    let body = []
    request.on('error',(err)=>{
        console.error(err);
    }).on('data',(chunk) => {
        console.log('data:',chunk);
        body.push(chunk);//获得到Buffer数据时，放入数组中（Buffer数组）
    }).on('end',() => {
        body = Buffer.concat(body).toString();//请求结束时将Buffer数组转为字符串
        console.log("body:",body);
        response.writeHead(200,{'Content-Type':'text/html'});
        response.end('Hello World\n')
    })

}).listen(8088);
console.log('server started');