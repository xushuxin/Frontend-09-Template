const TICK = Symbol('tick');
const TICK_HANDLER = Symbol('tick-handler');
const ANIMATIONS = Symbol('animations');
const START_TIME = Symbol('start-time');
const PAUSE_START = Symbol('pause-start');
const PAUSE_TIME = Symbol('pause-time');

export class Timeline{
    constructor(){
        this.state = "inited";//初始化状态
        this[ANIMATIONS] = new Set();
        this[START_TIME] = new Map();
        this.time = 0;
    }
    // 开始
    start(){
        if(!this.state === "inited") return;//如果没有初始化就不执行
        this.state = "started";
        let startTime = Date.now();
        this[PAUSE_TIME] = 0;
        this[TICK] = () => {
            for(let animation of this[ANIMATIONS]){
                //如果中间添加的动画，开始时间就取添加动画的时间
                if(this[START_TIME].get(animation) !== undefined){
                    startTime = this[START_TIME].get(animation)
                }
                let t = Date.now() - startTime - this[PAUSE_TIME] - animation.delay;//减去暂停的时长和延迟的时间
                if(t > animation.duration){
                    t = animation.duration;//保证最后不超出范围
                    this[ANIMATIONS].delete(animation);//删除动画
                }
                this.time = t;
                if(t > 0){
                    animation.receive(t)
                }
                
            }
           this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
        }
        this[TICK]();
    }

    getTime(){ // 获取时间线运行时间
        return this.time;
    }
   /*  // 播放速率
    get rate(){}
    set rate(){} */

    // 暂停
    pause(){
        if(this.state !== "started") return;
        this.state = "paused";
        this[PAUSE_START] = Date.now();//暂停开始的时间
        cancelAnimationFrame(this[TICK_HANDLER])
    }
    // 恢复
    resume(){
        if(this.state !== "paused") return;
        this.state = "started";
        this[PAUSE_TIME] = Date.now() - this[PAUSE_START];//暂停的时长
        this[TICK]();
    }

    // 重置
    reset(){
        this.pause();
        this.state = "inited";
        this.time = 0;
        this[PAUSE_START] = 0;
        this[PAUSE_TIME] = 0;
        this[ANIMATIONS] = new Set();
        this[START_TIME] = new Map();
        this[TICK_HANDLER] = null;
    }

    // 添加一个动画
    add(animation,startTime){
        if(arguments.length <2){
            startTime = Date.now();
        }
        this[ANIMATIONS].add(animation);
        this[START_TIME].set(animation,startTime);//保存动画的开始时间
    }
}

/* 属性动画 */
export class Animation {
    constructor(object,property,startValue,endValue,duration,delay,timingFunction,template){
        this.object =object;//dom的style
        this.property = property;//css属性
        this.startValue = startValue;//开始值
        this.endValue = endValue;//结束值
        this.duration = duration;//持续时间
        this.delay = delay;//延迟
        this.timingFunction = timingFunction || (v =>v);//时间曲线
        this.template = template || (v =>v);//模板，将值转为样式代码
    }
    receive(time){
        let range = this.endValue - this.startValue;//开始和结束时的属性值之差
        let progress = this.timingFunction(time / this.duration);//时间曲线函数处理后的进度
        this.object[this.property] = this.template(this.startValue + range * progress);//按照运行时间和总时间的比例设置对象的属性值
    }
}