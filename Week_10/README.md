学习笔记
#### 排版布局
##### 第一步 预处理
+ 处理 flexDirection 和 wrap相关的属性
+ 把具体的width、height、right、left、top、bottom等抽象成main、cross等相关属性

##### 第二步 收集元素
分行算法
+ 根据主轴尺寸，把元素进行分进行（剩余空间不足以显示当前项则换行）
+ 如果设置了no-wrap(默认的)，所有元素则强制分配进第一行

##### 第三步 计算主轴
+ 找出所有flex元素
+ 把主轴方向的剩余尺寸按比例分配给这些元素（覆盖设置尺寸）
+ 若剩余空间为负数，将所有flex元素主轴尺寸设置为0，等比压缩剩余元素
+ 如果没有flex元素，根据justify-content来计算主轴方向上每个元素的位置

问题：
1. 有两个换行的判断逻辑，个人觉得有点问题

①

修改前
```js
 if(itemStyle.flex){//如果子元素有flex属性，表示该元素可伸缩，则这个元素一定可以放进第一行，不管剩余多少空间
    flexLine.push(item);
// TODO 这里可能有问题 isAutoMainSize的判断（父元素设置了nowrap和主轴尺寸按理说也能进这个逻辑才对）
}else if(style.flexWrap === 'nowrap' && isAutoMainSize){//如果设置了不换行，并且父元素没有设置主轴尺寸，也是所有子元素放入第一行
    mainSpace -= itemStyle[mainSize];// 主轴剩余的空间减去当前放入第一行的元素主轴尺寸
    if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)){//如果子元素在交叉轴方向有设置尺寸
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);//交叉轴的空间取子元素交叉轴方向的尺寸最大的
        flexLine.piush(item);//当前元素放入第一行
    }
} 
```
修改后
```js
 if(itemStyle.flex){//如果子元素有flex属性，表示该元素可伸缩，则这个元素一定可以放进第一行，不管剩余多少空间
    flexLine.push(item);
 // 只要是nowrap都可以进这个逻辑，而和父元素自动撑开无关
}else if(style.flexWrap === 'nowrap'){//如果设置了不换行，并且父元素没有设置主轴尺寸，也是所有子元素放入第一行
    mainSpace -= itemStyle[mainSize];// 主轴剩余的空间减去当前放入第一行的元素主轴尺寸
    if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)){//如果子元素在交叉轴方向有设置尺寸
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);//交叉轴的空间取子元素交叉轴方向的尺寸最大的
        flexLine.piush(item);//当前元素放入第一行
    }
} 
```
②

修改前
```js
//TODO isAutoMainSize 这里可能有问题（父元素主轴的尺寸自动撑开，但是设置了wrap，按理说不能进这个逻辑才对,只要设置了wrap，就会出现多行的情况）
if(style.flexWrap === 'nowrap' || isAutoMainSize){ //如果设置了不换行，(或者主轴的尺寸自动撑开) 
    // 第一行（总共只有一行）的交叉轴尺寸，优先取用户设置的交叉轴尺寸，没有再取当前行最大子元素的交叉轴尺寸
    flexLine.crossSpace = style[crossSize] !== undefined ?style[crossSize] : crossSpace
}else{//换行的情况
    flexLine.crossSpace = crossSpace;// 保存最后一行的交叉轴尺寸（这时的flexLine对应多行中最后一行的容器）
}
```
修改后
```js
//是否换行只和flexWrap有关
if(style.flexWrap === 'nowrap'){ //如果设置了不换行，(或者主轴的尺寸自动撑开) 
    // 第一行（总共只有一行）的交叉轴尺寸，优先取用户设置的交叉轴尺寸，没有再取当前行最大子元素的交叉轴尺寸
    flexLine.crossSpace = style[crossSize] !== undefined ?style[crossSize] : crossSpace
}else{//换行的情况
    flexLine.crossSpace = crossSpace;// 保存最后一行的交叉轴尺寸（这时的flexLine对应多行中最后一行的容器）
}
```
2. 在根据justify-content计算元素位置时，老师好像没有根据方向去加减step
修改后代码：
```js
 if(style.justifyContent === 'space-around'){//两端对齐，前后各留间隔的一半
    var step = mainSpace / items.length * mainSign;//计算间隔时，要把前后的间隔一起算上，总共有元素数量个间隔，平分
    var currentMain = mainSign * step / 2 + mainBase;//起始的位置要想结束方向偏移1/2间隔（最后剩余的也正好是1/2间隔）
}

for(var i = 0;i <items.length;i++){
    var item = items[i];
    itemStyle[mainStart] = currentMain;//修改当前元素的起始位置
    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];//修改当前元素的结束位置（起始坐标 加上/减去 主轴尺寸）
    currentMain = itemStyle[mainEnd] + mainSign * step; //计算下一个元素的起始位置，要考虑到间隔和方向
}
```

##### 第四步 计算交叉轴

+ 根据每一行中最大元素尺寸计算行高
+ 根据行高flex-align和item-align，确定元素具体位置

##### 第五步 绘制单个元素

+ 绘制需要依赖一个图形环境
+ 这里采用了npm包images
+ 绘制在一个viewport上进行
+ 与绘制相关的属性：background-color、border、background-image等

##### 第六步 绘制DOM树

+ 递归调用子元素的绘制方法完成DOM树的绘制
+ 忽略一些不需要绘制的节点
+ 实际浏览器中，文字绘制是难点，需要依赖字体库，我们这里忽略
+ 实际浏览器中，还会对一些图层做compositing（合成），我们这里也忽略了




