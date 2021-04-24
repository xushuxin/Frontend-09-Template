const http = require('http');
http.createServer((request,response)=>{
    let body = []
    request.on('error',(err)=>{
        console.error(err);
    }).on('data',(chunk) => {
        // console.log('data:',chunk);
        body.push(chunk);//获得到Buffer数据时，放入数组中（Buffer数组）
    }).on('end',() => {
        body = Buffer.concat(body).toString();//请求结束时将Buffer数组转为字符串
        response.writeHead(200,{'Content-Type':'text/html'});
        response.end(`<html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Document</title>
          <style>
            body div #myid{
                background:red;
                width:100px;
                color:red;
                height:40px;
            }
            body div .myclass{
                color:green;
                height:20px;
            }
            body div p{
                background-color:yellow;
            }
          </style>
        </head>
        <body>
            <div>
                <span id="myid" class="myclass testclass">66666</span>
                <p>why not support chinese?</p>
            </div>
        </body>
        </html>`)
    })

}).listen(8088);
console.log('server started');
