const net = require('net');//TCP/IP包，用于创建TCP连接
const parser = require('./parser.js');
class Request{
    constructor(options){
        this.method = options.method || 'GET';//默认GET请求
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || '/';
        this.body = options.body || {};
        this.headers = options.headers || {};

        if(!this.headers['Content-Type']){
            this.headers['Content-Type'] = "application/x-www-form-urlencoded";
        }

        if(this.headers['Content-Type'] === 'application/json'){
            this.bodyText = JSON.stringify(this.body);
        }else if(this.headers['Content-Type'] === 'application/x-www-form-urlencoded'){
            this.bodyText = Object.entries(this.body).map(([key,value]) => `${key}=${encodeURIComponent(value)}`).join('&')
        }
        //请求体的长度
        this.headers['Content-Length'] = this.bodyText.length;//请求体的长度
    }
    send(connection){
        return new Promise((resolve,reject)=>{
            const parser = new ResponseParser();
            //如果传入连接，直接写入数据即可
            if(connection){
                connection.write(this.toString())
            }else{// 否则我们创建一个connection
                connection = net.createConnection({
                    host:this.host,
                    port:this.port
                },()=>{//创建完成连接之后写入数据
                    connection.write(this.toString());
                })
            }
            // 监听数据的接收,传递给ResponseParser解析
            connection.on('data',(data) => {
                parser.receive(data.toString());
                if(parser.isFinished){//如果解析完成
                    resolve(parser.response);//resolve 解析后的结果
                    connection.end();//关闭连接
                }
            })

            //监听连接的错误事件
            connection.on('error',(err)=>{
                reject(err);//reject 错误信息
                connection.end();//关闭连接
            })
        })
    }
    //将请求的数据组装成HTTP请求报文
    toString(){
        const { method, path, headers, bodyText } = this;
        //HTTP协议是以\r\n作为换行符的，模板字符串可以换行，所以\r加换行等同于\r\n
        return `${method} ${path} HTTP/1.1\r
${Object.entries(headers).map(([key,value])=> `${key}: ${value}`).join('\r\n')}\r
\r
${bodyText}`
    }
}

class ResponseParser{
    constructor(){
        this.WAITTING_STATUS_LINE = 0;
        this.WAITTING_STATUS_LINE_END = 1;
        this.WAITTING_HEADER_NAME = 2;
        this.WAITTING_HEADER_SPACE = 3;
        this.WAITTING_HEADER_VALUE = 4;
        this.WAITTING_HEADER_LINE_END = 5;
        this.WAITTING_HEADER_BLOCK_END = 6;
        this.WAITTING_BODY = 7;

        this.current = this.WAITTING_STATUS_LINE;//初始化curent为初始状态
        this.statusLine = '';
        this.headers = {};
        this.headerName = '';
        this.headerValue = '';
        this.bodyParser = null;

    }

    get isFinished(){
        return this.bodyParser && this.bodyParser.isFinished;
    }

    get response(){
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
        return {
            statusCode:RegExp.$1,//正则对象上也存在匹配的结果
            statusText:RegExp.$2,
            headers:this.headers,
            body:this.bodyParser.content.join('')
        }
    }

    receive(str){
        for(let i = 0;i < str.length;i++){
            this.receiveChar(str.charAt(i));
        }
    }

    receiveChar(char){
        //先进入到状态行的匹配
        if(this.current === this.WAITTING_STATUS_LINE){
            if(char === '\r'){//如果遇到回车符，表示状态行将要结束
                this.current = this.WAITTING_STATUS_LINE_END;
            }else{// 拼接保存状态行的字符
                this.statusLine += char;
            }
        //状态行结束标识查找
        }else if(this.current === this.WAITTING_STATUS_LINE_END){
            //如果状态行结束了，我们下一个要查找的时header的name
            if(char  === '\n'){
                this.current = this.WAITTING_HEADER_NAME;
            }
        // header name的查找
        }else if(this.current === this.WAITTING_HEADER_NAME){
            // 每一个header属性的冒号后面都有一个空格
            if(char === ':'){
                this.current = this.WAITTING_HEADER_SPACE;
            }else if(char === '\r'){//回车符说明所有的header name已查找完了
                this.current = this.WAITTING_HEADER_BLOCK_END;
                //到这里我们根据headers中的Transfer-Encoding的值来进行body解析
                //node的Transfer-Encoding默认是chunked
                if(this.headers['Transfer-Encoding'] === 'chunked')
                    this.bodyParser = new TrunkedBodyParser();
            }else{
                this.headerName += char;//拼接保存headerName
            }
        // 查找空格
        }else if(this.current === this.WAITTING_HEADER_SPACE){
            //如果查找到空格,进入查找headerValue
            if(char === ' '){
                this.current = this.WAITTING_HEADER_VALUE;
            }
        //查找headerValue
        }else if(this.current === this.WAITTING_HEADER_VALUE){
            if(char === '\r'){
                this.current = this.WAITTING_HEADER_LINE_END;
            }else{
                this.headerValue += char;//拼接保存headerValue
            }
        //进入header行结束标识查找
        }else if(this.current === this.WAITTING_HEADER_LINE_END){
            //header一行结束，进行下一行headerName的查找
            if(char === '\n'){
                //保存这一行，header属性键值对，重置headerName,和headerValue
                this.headers[this.headerName] = this.headerValue;
                this.headerName = '';
                this.headerValue = '';
                //进入下一个header name查找
                this.current = this.WAITTING_HEADER_NAME;
            }
        //如果在查找headerName时，查找到了\r，表示header整个查找完毕，进入header区域的结束标识查找
        }else if(this.current === this.WAITTING_HEADER_BLOCK_END){
            if(char === '\n'){
                this.current = this.WAITTING_BODY;
            }
        //进入请求体的查找
        }else if(this.current === this.WAITTING_BODY){
            this.bodyParser.receiveChar(char);
        }
    }
}

class TrunkedBodyParser{
    constructor(){
        this.WAITTING_LENGTH = 0;//读取请求体的状态
        this.WAITTING_LENGTH_LINE_END = 1;//
        this.READING_TRUNK = 2;
        this.WAITTING_NEW_LINE = 3;
        this.WAITTING_NEW_LINE_END = 4;
        this.length = 0;
        this.content = [];
        this.isFinished = false;
        this.current = this.WAITTING_LENGTH;
    }

    receiveChar(char){
        if(this.current === this.WAITTING_LENGTH){
            if(char === '\r'){
                if(this.length === 0){
                    this.isFinished = true;
                    return;
                }
                this.current = this.WAITTING_LENGTH_LINE_END;
            }else{
                this.length *=16;
                this.length += parseInt(char,16);
            }
        }else if(this.current === this.WAITTING_LENGTH_LINE_END){
            if(char === '\n'){
                this.current = this.READING_TRUNK;
            }
        }else if(this.current === this.READING_TRUNK){
            this.content.push(char);
            this.length --;
            if(this.length === 0){
                this.current = this.WAITTING_NEW_LINE;
            }
        }else if(this.current === this.WAITTING_NEW_LINE){
            if(char === '\r'){
                this.current = this.WAITTING_NEW_LINE_END;
            }
        }else if(this.current === this.WAITTING_NEW_LINE_END){
            if(char === '\n'){
                this.current = this.WAITTING_LENGTH;
            }
        }
    }
}

//使用void可以让js殷勤把后面的内容识别为表达式（算数运算符，位运算都可以）
void async function(){
    let request = new Request({
        method:'POST',
        host:'127.0.0.1',
        port:'8088',
        path:'/',
        headers:{
            ['X-Foo2']:'customed'
        },
        body:{
            name:'winter',
            age:'33',
            sex:'0',
            nation:'han',
            home:'anhui',
        }
    })
    let response = await request.send();
    let dom  = parser.parseHTML(response.body);
   console.log(JSON.stringify(dom,null,"    "));
}()