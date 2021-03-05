学习笔记
+ `line-height:7px;vertical-align:top`解决浏览器标准模式下显示样式问题(没有看出来有什么问题)
+ 一维数组表示二维数组的技巧（行 * 行数 + 列）
+ 鼠标移动事件和点击事件的结合应用

+ 栈（push和pop、unshift和shift）和队列（push和shift、unshift和pop）
+ 深度优先搜索（栈）和广度优先搜索（队列）

+ 异步编程可以在js运行过程中给浏览器空出时间来进行ui绘制

+ async函数会先执行完同步代码，最后默认返回一个promise
  - 如果函数中编写了return:
    return的值如果是promise，默认返回的promise会采用这个promise的状态和值
    return的值不是promise，则会将这个值当做默认的promise的值（fufilled）

  <!-- 重点  -->
  - 如果async函数中有出现await，会等待await的promise状态改变,后续同步代码执行完，再改变默认返回的promise的状态(pending => fulfilled/rejected)

  - 从上可知返回的promise，会在所有await和同步代码（不报错和不reject的情况）执行完成后再改变状态

  - 如果async函数中，有语法错误或await 的promise reject，最后默认返回的promise会变为rejected状态，reason为报错原因或者reject的值

  - await的promise的结果fulfilled的value不会作为最终返回的promise的value， 但是rejected的reason则会作为返回的promsie的reason

+ 小技巧：不使用splice直接删除最小值会影响后续所有项的索引：时间复杂度O(n)，
  而是将最小项的位置赋值为最后一项，再删除最后一项，不会影响其他项：时间复杂度O(1)

+ 可以自己创建一个数据结构，暴露一个接口，通过这个接口获取到的值，是我们理想中的值，从而达到优化算法效果