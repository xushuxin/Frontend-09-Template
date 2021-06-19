学习笔记


##### 给组件加入children机制
+ 内容型
特点：组件内部直接放元素，内部放几个元素，实际渲染的就是那些元素
使用：
```js
let b = <Button>
    button content
</Button>;
b.mountTo(document.body);
```
实现：见button.js

+ 模板型
特点：组件内部放的是模板函数，组件内部去根据模板函数生成元素并添加到组件内部
使用：
```js
let c = <List data={imgs}>
    {
        (record)=> <div>
            <img style="width:100px;height:80px;vertical-align:middle;" src={record.img} />
            <a href={record.url}>{record.title}</a>
        </div>
    }
</List>;
c.mountTo(document.body);
```
实现：见list.js