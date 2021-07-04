var assert = require('assert');
import { parseHTML } from '../src/parser.js';
describe("parse html", function () {
    it('<a></a>', function () {
        let tree = parseHTML('<a></a>')
        assert.equal(tree.children[0].tagName, 'a');
        assert.equal(tree.children[0].children.length, 0);
    });
    // 双引号属性
    it('<a href="//www.baidu.com"></a>', function () {
        let tree = parseHTML('<a href="//www.baidu.com"></a>');
        assert.equal(tree.children[0].tagName, 'a');
        assert.equal(tree.children[0].children.length, 0);
    })
    // 单引号属性
    it('<a href=\'//www.baidu.com\'></a>', function () {
        let tree = parseHTML('<a href=\'//www.baidu.com\'></a>');
        assert.equal(tree.children[0].tagName, 'a');
        assert.equal(tree.children[0].children.length, 0);
    });

    //无引号属性
    it('<a id=abc ></a>', function () {
        let tree = parseHTML('<a id=abc ></a>');
        assert.equal(tree.children[0].tagName, 'a');
        assert.equal(tree.children[0].children.length, 0);
    })

    it('<a href="//www.baidu.com" id ></a>', function () {
        let tree = parseHTML('<a href="//www.baidu.com" id ></a>');
        assert.equal(tree.children[0].tagName, 'a');
        assert.equal(tree.children[0].children.length, 0);
    })
    it('<a href id ></a>', function () {
        let tree = parseHTML('<a href id ></a>');
        assert.equal(tree.children[0].tagName, 'a');
        assert.equal(tree.children[0].children.length, 0);
    })

    // 自闭合标签
    it('<a id=abc />', function () {
        let tree = parseHTML('<a id=abc />');
        assert.equal(tree.children[0].tagName, 'a');
        assert.equal(tree.children[0].children.length, 0);
    })

    it('<>', function () {
        let tree = parseHTML('<>');
        assert.equal(tree.children.length, 0);
    })

    // style样式
    it(`test style`, function () {
        let tree = parseHTML(`<html><style>
                a {
                    color:red;
                }
            </style><a>aaa</a></html>`);
        // console.log(tree)
        assert.equal(tree.children[0].children[1].computedStyle.color.value, 'red');
    })

    // style样式 的选择器的优先级
    it(`test style specificity`, function () {
        let tree = parseHTML(`<html><style>
                a {
                    color:red;
                }
                #aa{
                    color:green;
                }
            </style><a id="aa">aaa</a></html>`);
        assert.equal(tree.children[0].children[1].computedStyle.color.value, 'green');
    })
    // class选择器
    it(`test style specificity`, function () {
        let tree = parseHTML(`<html><style>
                a {
                    color:red;
                }
                .aa{
                    color:green;
                }
            </style><a class="aa">aaa</a></html>`);
        assert.equal(tree.children[0].children[1].computedStyle.color.value, 'green');
    })
    // 复合选择器
    it(`test complex selector`, function () {
        let tree = parseHTML(`<html><style>
                #box a {
                    color:red;
                }
                .aa{
                    color:green;
                }
            </style><div id="box"><a class="aa">aaa</a></div></html>`);
        assert.equal(tree.children[0].children[1].children[0].computedStyle.color.value, 'red');
    })
    // 自闭合标签，无引号属性
    it(`selfCloseTag unquoted attr`, function () {
        let tree = parseHTML(`<a id=aa/>`);
        assert.equal(tree.children.length, 1);
    })
    // 无引号属性结尾无空格
    it(`unquoted attr end no space`, function () {
        let tree = parseHTML(`<a id=aa><a>`);
        assert.equal(tree.children.length, 1);
    })
    // 自闭合标签有引号属性结尾无空格
    it(`selfCloseTag unquoted attr`, function () {
        let tree = parseHTML(`<a id="aa"/>`);
        assert.equal(tree.children.length, 1);
    })
    // 属性前有多个空格
    it(`multi space before attr`, function () {
        let tree = parseHTML(`<a  id="aa"/>`);
        assert.equal(tree.children.length, 1);
    })
    // 自闭合标签无空格
    it(`multi space before attr`, function () {
        let tree = parseHTML(`<a/>`);
        assert.equal(tree.children.length, 1);
    })
})