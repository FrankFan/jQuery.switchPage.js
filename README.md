# jQuery.switchPage.js

## 知识点
1. 通过css使div全屏
2. 实现jQuery插件开发
3. 重写鼠标滚动事件
4. 切屏动画实现

## 开发过程

在sublime text 下开发，安装emmet插件，快速书写html代码

```html
! + tab : 快速生成html5文档结构 

#container>section#section$*4  + tab 快速生成DOM结构

```

## jQuery组件开发

一、类级别的组件开发：即给jQuery命名空间下添加新的全局函数，称为静态方法。

```javascript
jQuery.foo = function() {
    // do something
}
// 使用 $.foo() 进行调用
```

例如 `$.Ajax()` 、 `$.extend()` 方法

二、对象级别组件开发：即挂在jQuery原型下的方法，这样通过选择器获取的jQuery对象实例也能共享该方法，也称为动态方法。

```javascript
$.fn.foo = function() {
    // do something
}

// $.fn === $.prototype
```

例如： `addClass()`、`attr()`等方法，需要创建实例来调用。


```javascript
(function($){
    //1.避免全局依赖
    //2.避免第三方组件的破坏
    //3.兼容$操作符号
})(jQuery);

```
