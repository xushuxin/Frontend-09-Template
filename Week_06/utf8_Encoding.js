function UTF8_Encoding(string){
    let bitStr = '';
    var buf;
    for(let c of string){
        let code = c.charCodeAt();
        let bitCode =code.toString(2);
        let encode;
        //前面补0
        while(bitCode.length%8){
            bitCode='0'+bitCode;
        }
        if(code>=0&&code<=127){
            encode = bitCode;
        }else if(code>=128&&code<=2047){
            //utf8编码，第一个字节0前面有几个1表示占用几个字节
            //后面每个字节都是10开头
            encode = '110'+bitCode.slice(0,5)+'10'+bitCode.slice(5);
        }else if(code>=2048&&code<=65535){
            encode = '1110'+bitCode.slice(0,4)+'10'+bitCode.slice(4,10) + '10'+bitCode.slice(10);
        }else if(code>=65535&&code<=1114111){
            encode = '11110'+bitCode.slice(0,3)+'10'+bitCode.slice(3,9) + '10'+bitCode.slice(9,15) + '10'+bitCode.slice(15);
        }
        bitStr += encode;
    }
    //根据二进制字符串的长度开辟空间存储
    let len = bitStr.length
    buf = new ArrayBuffer(len);
    let view = new Int8Array(buf,0,len);
    for(var i = 0;i<buf.byteLength;i++){
        view[i] = bitStr[i]
    }
    return buf;
}

UTF8_Encoding('哈哈哈')
