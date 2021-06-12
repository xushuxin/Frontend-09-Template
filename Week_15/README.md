学习笔记
##### 动画
帧：一秒钟刷新画面的次数

使用js实现动画的三种方案：
1. setInterval
+ 人眼能识别的最高帧率是60帧
+ 1000 / 16 = 60，设置16秒更新一次画面，就可以达到60帧（一秒钟刷新60次画面）的效果
```js
setInterval(()=>{},16)
```
2. setTimeout
```js
let tick =  () =>{
    setTimeout(tick,16)
}
```
3. requestAnimationFrame的含义是：申请浏览器执行下一帧的时候执行代码（常用）
```js
let tick =  () => {
    requestAnimationFrame(tick);
}
```


+ 对时间线进行状态管理

##### 手势(gesture)
+ 一般鼠标点击行为都比较稳，不会发生变动
    - 鼠标单击的过程其实是包含三个过程的：mousedown => mousemove => mouseup
+ 但是触屏不一样，我们的手指是软的，所以难免产生一些微小的偏移
    - 触屏点击的过程：touchstart=> touchmove => touchend

基础手势体系：
+ start 
手指按下动作
+ tap 
start之后直接没有其他操作触发
+ pan start 
    start之后移动了10px(retina屏)触发
    + pan 每移动10px就会触发一个pan
        + flick（或者swipe）手指离开且速度大于一个阈值时触发
        + pan end 手指离开时触发
+ press start
    手指按下时间超过0.5s触发
    - pan start（包括后续的pan、flick、pan end）
        press start状态下移动手指时触发 
    - press end 不移动手指，过一段时间后松开时触发

press start和press end可以决定是手指按下时触发事件还是弹起时触发

1. 对鼠标事件和touch事件统一的抽象：
```js
let el = document.documentElement;

el.addEventListener('mousedown', event =>{
    start(event)
    let mousemove = event => {
        move(event);
    }
    let mouseup = event => {
        end(event);
        el.removeEventListener("mousemove",mousemove)
        el.removeEventListener("mouseup",mouseup)
    }
    el.addEventListener("mousemove", mousemove);
    el.addEventListener("mouseup", mouseup);
})
// 因为touchmove和touchend一定会触发在touchstart之后，所以可以直接监听
// 手指可能有多点触摸，identifier标识符用于标识是哪个手指触发的touch
el.addEventListener("touchstart", event => {
    for(let touch of event.changedTouches){
        start(touch);
    }
})
el.addEventListener("touchmove", event => {
    for(let touch of event.changedTouches){
        move(touch);
    }
})
el.addEventListener("touchend", event => {
    for(let touch of event.changedTouches){
        end(touch);
    }
})

// 被一些系统事件打断时触发（比如：setTimeout(()=>alert('!!'),3000)）
el.addEventListener("touchcancel", event => {
    for(let touch of event.changedTouches){
        cancel(touch);
    }
})

let start = (point) => {
    console.log("start", point.clientX,point.clientY)
}
let move = (point) => {
    console.log("move", point.clientX,point.clientY)
}
let end = (point) => {
    console.log("end", point.clientX,point.clientY)
}
let cancel = (event) => {
    console.log("cancel", point.clientX,point.clientY)
}
```
2. 手势的逻辑
```js
let el = document.documentElement;

el.addEventListener('mousedown', event =>{
    start(event)
    let mousemove = event => {
        move(event);
    }
    let mouseup = event => {
        end(event);
        document.removeEventListener("mousemove",mousemove)
        document.removeEventListener("mouseup",mouseup)
    }
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
})
// 因为touchmove和touchend一定会触发在touchstart之后，所以可以直接监听
// 手指可能有多点触摸，identifier标识符用于标识是哪个手指触发的touch
el.addEventListener("touchstart", event => {
    for(let touch of event.changedTouches){
        start(touch);
    }
})
el.addEventListener("touchmove", event => {
    for(let touch of event.changedTouches){
        move(touch);
    }
})
el.addEventListener("touchend", event => {
    for(let touch of event.changedTouches){
        end(touch);
    }
})

// 被一些系统事件打断时触发（比如：setTimeout(()=>alert('!!'),3000)）
el.addEventListener("touchcancel", event => {
    for(let touch of event.changedTouches){
        cancel(touch);
    }
})

let handler;
let startX, startY;
let isPan = false, //用于判断是否发生过移动事件
    isPress = false,// 用于判断是否发生过presss事件
    isTap = true;//用于判断start后是否发生过其它的动作（移动、按压超过五秒）
let start = (point) => {
    startX = point.clientX, startY = point.clientY;

    isTap = true;
    isPan = false;
    isPress = false;

    handler = setTimeout(()=>{
        isPan = false;
        isTap = false;
        isPress = true;
        handler = null;//设置为null避免多次clearTimeout
        console.log("press start")
    },500)
}
let move = (point) => {
    let dx = point.clientX - startX, dy = point.clientY - startY;

    if(!isPan && dx ** 2 + dy ** 2 > 100) {//手指移动超过10px（开方耗时较大，直接用两点间距离的平方来比较）
        isTap = false;
        isPress = false;
        isPan = true;
        console.log('pan start')
        clearTimeout(handler);//清除press事件触发的定时器
    } 
    if(isPan){
        console.log(dx,dy);
        console.log('pan');
    }

}
let end = (point) => {
    if(isTap){
        console.log("tap");
        clearTimeout(handler);//清除press事件触发的定时器
    }
    if(isPan){
        console.log('pan end');
    }
    if(isPress){
        console.log('press end');
    }
}
let cancel = (event) => {
    clearTimeout(handler);//清除press事件触发的定时器
    console.log("cancel", point.clientX,point.clientY)
}
```

3. 处理鼠标事件
+ 因为事件的触发不止一种，所以我们不能用全局变量来判断事件的状态
    - touch会有多指事件，每个手指都是单独的一次事件触发
    - 鼠标会有左、中、右，甚至前进、后退按钮，五种触发方式
    - 我们需要单独的去管理每一种触发事件的状态
+ touch事件可以通过event.identifier作为唯一标识，存储不同手指的context
+ 鼠标事件可以使用event.button作为唯一标识，存储不同按键的context
+ event.buttons 的值是通过掩码进行求和计算的：
    - 比如我同时按下鼠标的左中右键，event.button分别为 0  1  2
        则此时event.buttons = (1 << 0) + (1 << 1)  + (1 << 2) = 7
    - 中键按下时，event.buttons为4，右键按下时event.buttons为2，但是我们存储的中间和右键的key分别为 1 << 1 = 2 和 1 << 2 = 4，所以在取key时需要特殊处理这两个值
```js
let el = document.documentElement;

let isListeningMouse = false; //用于防止重复监听mouseup和mousemove事件（其实我觉得也可以把mouseup和mousemove的监听拿出来，只需要判断一下event.buttons不为0才执行逻辑就行）
el.addEventListener('mousedown', event =>{
    // console.log(event.button);
    
    let context = Object.create(null);
    // event.button:0,1,2,3,4  
    // 1 << event.button: 1,2,4,8,16
    contexts.set("mouse" +  (1 << event.button), context);

    start(event, context)
    let mousemove = event => {
        let button = 1;
        while(button <= event.buttons){

            if(button & event.buttons){//判断对应的键有没有被按下
                console.log('mousemove',button,event.buttons)
                // 中键按下时event.buttons = 4,右键按下时event.buttons = 2
                // 交换中键（2）和右键（4）的值
                let key;
                if(button === 2) key = 4
                else if(button === 4) key = 2
                else key = button

                let context = contexts.get("mouse" + key);
                move(event, context);
            }
            button = button << 1;// 2 4 8 16
        }
    }
    let mouseup = event => {
        let context = contexts.get("mouse" + (1 << event.button));
        end(event,context);
        contexts.delete("mouse" + (1 << event.button))
        console.log('mouseup',event.buttons)
        if(event.buttons === 0){ //没有键被按下时才移除监听事件
            document.removeEventListener("mousemove",mousemove)
            document.removeEventListener("mouseup",mouseup)
            isListeningMouse = false;
        }
    }
    if(!isListeningMouse){
        document.addEventListener("mousemove", mousemove);
        document.addEventListener("mouseup", mouseup);
        isListeningMouse = true;
    }
})

let contexts = new Map();//保存多个context

// 因为touchmove和touchend一定会触发在touchstart之后，所以可以直接监听
// 手指可能有多点触摸，identifier标识符用于标识是哪个手指触发的touch
el.addEventListener("touchstart", event => {
    for(let touch of event.changedTouches){
        let context = Object.create(null)
        contexts.set(touch.identifier,context);
        start(touch, context);
    }
})
el.addEventListener("touchmove", event => {
    for(let touch of event.changedTouches){
        let context = contexts.get(touch.identifier);
        move(touch, context);
    }
})
el.addEventListener("touchend", event => {
    for(let touch of event.changedTouches){
        let context = contexts.get(touch.identifier);
        end(touch, context);
        contexts.delete(touch.identifier)
    }
})

// 被一些系统事件打断时触发（比如：setTimeout(()=>alert('!!'),3000)）
el.addEventListener("touchcancel", event => {
    for(let touch of event.changedTouches){
        cancel(touch);
    }
})


let start = (point,context) => {
    context.startX = point.clientX, context.startY = point.clientY;
  
    context.isTap = true;//用于判断start后是否发生过其它的动作（移动、按压超过五秒）
    context.isPan = false;//用于判断是否发生过移动事件
    context.isPress = false;// 用于判断是否发生过presss事件

    context.handler = setTimeout(()=>{
        context.isPan = false;
        context.isTap = false;
        context.isPress = true;
        context.handler = null;//设置为null避免多次clearTimeout
        console.log("press start")
    },500)
}
let move = (point,context) => {
    let dx = point.clientX - context.startX, dy = point.clientY - context.startY;

    if(!context.isPan && dx ** 2 + dy ** 2 > 100) {//手指移动超过10px（开方耗时较大，直接用两点间距离的平方来比较）
        context.isTap = false;
        context.isPress = false;
        context.isPan = true;
        console.log('pan start')
        clearTimeout(context.handler);//清除press事件触发的定时器
    } 
    if(context.isPan){
        // console.log(dx,dy);
        console.log('pan');
    }

}
let end = (point,context) => {
    if(context.isTap){
        console.log("tap");
        clearTimeout(context.handler);//清除press事件触发的定时器
    }
    if(context.isPan){
        console.log('pan end');
    }
    if(context.isPress){
        console.log('press end');
    }
}
let cancel = (event) => {
    clearTimeout(context.handler);//清除press事件触发的定时器
    console.log("cancel", point.clientX,point.clientY)
}
```

4. 派发事件
```js
let end = (point,context) => {
    if(context.isTap){
        dispatch("tap", {});//触发自定义事件tap
        clearTimeout(context.handler);//清除press事件触发的定时器
    }
    if(context.isPan){
        console.log('pan end');
    }
    if(context.isPress){
        dispatch("pressend", {});//触发自定义事件pressend
        console.log('press end');
    }
}
function dispatch(type, properties){
    let event = new Event(type);
    console.log(event);
    for(let name in properties){
        event[name] = properties[name];
    }
    el.dispatchEvent(event)
}
// 监听tap事件的触发
document.documentElement.addEventListener('tap',(event)=>{
    console.log('tap event trigger',event)
});
```

5. 实现一个Flick事件
+ 判断速度：move的时候我们可以得到当前一次move的速度，但是如果只判断两个点之间的速度，根据浏览器的实现不同会有较大误差，所以我们需要取一段时间之内的点，求平均值
```js
let start = (point,context) => {
    context.points = [//记录当前的时间和点坐标
        {
            t:Date.now(),
            x:point.clientX,
            y:point.clientY
        }
    ]
}
let move = (point,context) => {
    context.points = context.points.filter(point => Date.now() - point.t < 500);//只留下最近半秒内的点

    context.points.push({ //每次move放入一个新的点
        t:Date.now(),
        x:point.clientX,
        y:point.clientY
    })
}
let end = (point,context) => {

    context.points = context.points.filter(point => Date.now() - point.t < 500);//只留下最近半秒内的点

    // 计算速度
    let d , v;
    if(!context.points.length){
        v = 0;
    }else{
        // 移动的距离(当前点与我们记录的points中的第一个点的距离)
        d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + (point.clientY - context.points[0].y) ** 2)
        v = d / (Date.now() - context.points[0].t);//距离除以时间求得速度
    }
    
    // 如果速度大于1.5px / ms，我们认为速度比较快
    if(v > 1.5){
        dispatch("flick", {});//触发自定义事件flick
        context.isFlick = true;
    }else{
        context.isFlick = false;
    }
}
```

6. 封装
+ 监听逻辑：Listener
    ```js
    // 监听
    export class Listener {
        constructor(el, recognizer) {
            let isListeningMouse = false; //用于防止重复监听mouseup和mousemove事件（其实我觉得也可以把mouseup和mousemove的监听拿出来，只需要判断一下event.buttons不为0才执行逻辑就行）

            let contexts = new Map();//保存多个context

            el.addEventListener('mousedown', event => {

                let context = Object.create(null);
                // event.button:0,1,2,3,4  
                // 1 << event.button: 1,2,4,8,16
                contexts.set("mouse" + (1 << event.button), context);

                recognizer.start(event, context)
                let mousemove = event => {
                    let button = 1;
                    while (button <= event.buttons) {

                        if (button & event.buttons) {//判断对应的键有没有被按下
                            // 中键按下时event.buttons = 4,右键按下时event.buttons = 2
                            // 交换中键（2）和右键（4）的值
                            let key;
                            if (button === 2) key = 4
                            else if (button === 4) key = 2
                            else key = button

                            let context = contexts.get("mouse" + key);
                            recognizer.move(event, context);
                        }
                        button = button << 1;// 2 4 8 16
                    }
                }
                let mouseup = event => {
                    let context = contexts.get("mouse" + (1 << event.button));
                    recognizer.end(event, context);
                    contexts.delete("mouse" + (1 << event.button))
                    if (event.buttons === 0) { //没有键被按下时才移除监听事件
                        document.removeEventListener("mousemove", mousemove)
                        document.removeEventListener("mouseup", mouseup)
                        isListeningMouse = false;
                    }
                }
                if (!isListeningMouse) {
                    document.addEventListener("mousemove", mousemove);
                    document.addEventListener("mouseup", mouseup);
                    isListeningMouse = true;
                }
            })


            // 因为touchmove和touchend一定会触发在touchstart之后，所以可以直接监听
            // 手指可能有多点触摸，identifier标识符用于标识是哪个手指触发的touch
            el.addEventListener("touchstart", event => {
                for (let touch of event.changedTouches) {
                    let context = Object.create(null)
                    contexts.set(touch.identifier, context);
                    recognizer. start(touch, context);
                }
            })
            el.addEventListener("touchmove", event => {
                for (let touch of event.changedTouches) {
                    let context = contexts.get(touch.identifier);
                    recognizer.move(touch, context);
                }
            })
            el.addEventListener("touchend", event => {
                for (let touch of event.changedTouches) {
                    let context = contexts.get(touch.identifier);
                    recognizer.end(touch, context);
                    contexts.delete(touch.identifier)
                }
            })

            // 被一些系统事件打断时触发（比如：setTimeout(()=>alert('!!'),3000)）
            el.addEventListener("touchcancel", event => {
                for (let touch of event.changedTouches) {
                    recognizer.cancel(touch);
                }
            })
        }
    }
    ```
+ 识别逻辑：Recognizer
    ```js
    // 识别
    export class Recognizer {
        constructor(dispatcher) {
            this.dispatcher= dispatcher;
        }
        start (point, context){
            context.startX = point.clientX, context.startY = point.clientY;
        
            context.points = [//记录当前的时间和点坐标
                {
                    t: Date.now(),
                    x: point.clientX,
                    y: point.clientY
                }
            ]
        
            context.isTap = true;//用于判断start后是否发生过其它的动作（移动、按压超过五秒）
            context.isPan = false;//用于判断是否发生过移动事件
            context.isPress = false;// 用于判断是否发生过presss事件
        
            context.handler = setTimeout(() => {
                context.isPan = false;
                context.isTap = false;
                context.isPress = true;
                context.handler = null;//设置为null避免多次clearTimeout
                this.dispatcher.dispatch("press", {});//触发自定义事件press
            }, 500)
        }
        move (point, context) {
            let dx = point.clientX - context.startX, dy = point.clientY - context.startY;
        
            if (!context.isPan && dx ** 2 + dy ** 2 > 100) {//手指移动超过10px（开方耗时较大，直接用两点间距离的平方来比较）
                context.isTap = false;
                context.isPress = false;
                context.isPan = true;
                context.isVertical = Math.abs(dx) < Math.abs(dy);
                this.dispatcher.dispatch("panstart", {//触发自定义事件panstart
                    startX:context.startX,
                    startY:context.startY,
                    clientX:point.clientX,
                    clientX:point.clientX,
                    isVertical: context.isVertical
                });
                clearTimeout(context.handler);//清除press事件触发的定时器
            }
            if (context.isPan) {
                this.dispatcher.dispatch("pan", {//触发自定义事件pan
                    startX:context.startX,
                    startY:context.startY,
                    clientX:point.clientX,
                    clientX:point.clientX,
                    isVertical: context.isVertical
                });
            }
        
            context.points = context.points.filter(point => Date.now() - point.t < 500);//只留下最近半秒内的点
        
            context.points.push({ //每次move放入一个新的点
                t: Date.now(),
                x: point.clientX,
                y: point.clientY
            })
        }
        end (point, context) {
            if (context.isTap) {
                this.dispatcher.dispatch("tap", {})
                clearTimeout(context.handler);//清除press事件触发的定时器
            }
            if (context.isPress) {
                this.dispatcher.dispatch("pressend", {});//触发自定义事件pressend
            }
        
            context.points = context.points.filter(point => Date.now() - point.t < 500);//只留下最近半秒内的点
        
            // 计算速度
            let d, v;
            if (!context.points.length) {
                v = 0;
            } else {
                // 移动的距离(当前点与我们记录的points中的第一个点的距离)
                d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + (point.clientY - context.points[0].y) ** 2)
                v = d / (Date.now() - context.points[0].t);//距离除以时间求得速度
            }
        
            // 如果速度大于1.5px / ms，我们认为速度比较快
            if (v > 1.5) {
                context.isFlick = true;
                this.dispatcher.dispatch("flick", {//触发自定义事件flick
                    startX:context.startX,
                    startY:context.startY,
                    clientX:point.clientX,
                    clientX:point.clientX,
                    isVertical: context.isVertical,
                    isFlick: context.isFlick,
                    velocity:v //速度
                });
            } else {
                context.isFlick = false;
            }

            if (context.isPan) {
                this.dispatcher.dispatch("panend", {//触发自定义事件panend
                    startX:context.startX,
                    startY:context.startY,
                    clientX:point.clientX,
                    clientX:point.clientX,
                    isVertical: context.isVertical,
                    isFlick: context.isFlick
                });
            }
        }
        cancel (event){
            clearTimeout(context.handler);//清除press事件触发的定时器
            this.dispatcher.dispatch("cancel", {});//触发自定义事件pressend
        }
    }
    ```
+ 分发逻辑：Dispatcher
    ```js
    //分发
    export class Dispatcher{
        constructor(el){
            this.el = el;
        }
        dispatch(type, properties) {
            let event = new Event(type);
            for (let name in properties) {
                event[name] = properties[name];
            }
        
            this.el.dispatchEvent(event)
        }
    }
    ```

+ 最终的调用顺序
    ```js
    export function enableGesture(el) {
        new Listener(el,new Recognizer(new Dispatcher(el)));
    }
    ```