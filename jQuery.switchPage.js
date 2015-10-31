//1.避免全局依赖
//2.避免第三方组件的破坏
//3.兼容$操作符号

(function($) {
	var defaults = {
		'container': '#container', // 容器
		'sections': 'section', // 子容器
		'easing': 'ease', // 特效方式， ease-in,ease-out,ease-in-out,linear 贝塞尔曲线等
		'duration': 1000, // 每次动画执行时间
		'pagination': true, // 是否显示分页
		'loop': false, // 是否循环
		'keyboard': true,  // 是否支持键盘
		'direction': 'vertical' // 页面切换方向 horizontal, vertical
	};

	var win = $(window)
		, container
		, sections
		, opts = {}
		, canScroll = true
		, iIndex = 0
		, arrElement = [];

	var SP = $.fn.switchPage = function(options) {
		opts = $.extend({}, defaults, options || {});

		container = $(opts.container),
		sections  = container.find(opts.sections);

		sections.each(function() {
			arrElement.push($(this));
			console.log($(this));
		});

		// 链式调用 返回this对象
		return this.each(function(){
			if(opts.direction == 'horizontal') {
				initLayout();
			}

			if(opts.pagination) {
				initPagination();
			}

			if(opts.keyborad) {
				keyDown();
			}
		});
	}

	// 公有方法，可在函数外部被调用: $.fn.switchPage.moveSectionUp()
	// 滚轮向上滑动事件
	SP.moveSectionUp = function() {
		if(iIndex) {
			iIndex--;
		} else if (opts.loop) {
			iIndex = arrElement.length - 1;
		}
		scrollPage(arrElement[iIndex]);
	};

	// 滚轮向下滑动事件
	SP.moveSectionDown = function() {
		if(iIndex < (arrElement.length - 1)) {
			iIndex++;
		} else if (opts.loop) {
			iIndex = 0;
		}
		scrollPage(arrElement[iIndex]);
	};

	// 私有方法
	// 页面滚动事件
	function scrollPage(element) {
		var dest = element.position();
		console.log(dest.top, dest.left);
		if (typeof dest === 'undefined') {
			return;
		}
		initEffects(dest, element);
	}

	// 重写鼠标滑动事件
	// 除火狐外都使用mousewheel事件，火狐使用DOMMouseScroll事件，为了兼容绑定2个
	$(document).on('mousewheel DOMMouseScroll', mouseWheelHandler);
	function mouseWheelHandler(e) {
		e.preventDefault();
		// 正常浏览器wheelDelta滚动一下值为120，
		// 火狐浏览器滚动时没有wheelDelta，只有detail属性，值为3，且方向相反
		var value = e.originalEvent.wheelDelta || -e.originalEvent.detail;
		var delta = Math.max(-1, Math.min(1, value));
		if(canScroll) {
			if(delta < 0) {
				SP.moveSectionDown();
			} else {
				SP.moveSectionUp();
			}
		}
		return false;
	}

	// 横向布局初始化
	function initLayout() {
		var length = sections.length,
			width  = (length*100) + '%',
			cellWidth = (100/length).toFixed(2) + '%';
		container.width(width).addClass('left');
		sections.width(cellWidth).addClass('left');
	}

	// 初始化分页
	function initPagination() {
		var length = sections.length;
		var pageHtml = '<ul id="pages"><li class="active"></li>';
		for(var i = 1; i < length; i++) {
			pageHtml += '<li></li>';
		}
		pageHtml += '</ul>';
		$('body').append(pageHtml);
	}

	// 分页事件
	function paginationHandler() {
		var pages = $('#pages li');
		pages.eq(iIndex).addClass('active').siblings().removeClass('active');
	}

	// 是否支持css的某个属性
	function isSupportCss(property) {
		var body = $('body')[0];
		for (var i = 0; i < property.length; i++) {
			if(property[i] in body.style) {
				return true;
			}
		}
		return false;
	}

	// 渲染效果
	// dest: 当前元素针对父容器所在的位置
	function initEffects(dest, element) {
		var transform  = ['-webkit-transform', '-ms-transform', '-moz-transform', 'transform'],
			transition = ['-webkit-transition', '-ms-transition', '-moz-transition', 'transition'];
			
		canScroll = false;
		// 如果浏览器支持CSS3动画，就用CSS3渲染
		if(isSupportCss(transform) && isSupportCss(transition)) {
			var translate = '';
			if(opts.direction == 'horizontal') {
				translate = '-' + dest.left + 'px, 0px, 0px';
			} else {
				translate = '0px, -' + dest.top + 'px, 0px';
			}
			container.css({
				'transition': 'all ' + opts.duration + 'ms ' + opts.easing,
				'transform': 'translate3d(' + translate + ')'
			});
			container.on('webkitTransitionEnd msTransitionend mozTransitionend transitionend', function() {
				console.log('transitionend');
				canScroll = true;
			});
		} else {
			// 如果不支持， 就用js animate 进行动画渲染
			var cssObj = (opts.direction == 'horizontal') 
					   ? { left: -dest.left }
					   : { top: -dest.top};
			container.animate(cssObj, opts.duration, function() {
				canScroll = true;
			});
		}
		element.addClass('active').siblings().removeClass('active');
		if(opts.pagination) {
			paginationHandler();
		}
	}

	// 窗口Resize
	var resizeId;
	win.resize(function(){
		clearTimeout(resizeId);
		resizeId = setTimeout(function() {
			reBuild();
		}, 500);
	});
	function reBuild() {
		var currentHeight = win.height(),
			currnetWidth  = win.width();

		var element = arrElement[iIndex];
		if(opts.direction == 'horizontal') {
			var offsetLeft = element.offset().left;
			if( Math.abs(offsetLeft) > currnetWidth / 2 && 
				iIndex < (arrElement.length - 1)) {
				iIndex++;
			}
		} else {
			var offsetTop = element.offset().top;
			if( Math.abs(offsetTop) > currentHeight / 2 && 
				iIndex < (arrElement.length -1)) {
				iIndex++;
			}
		}
		if(iIndex) {
			paginationHandler();
			var currentElement = arrElement[iIndex],
				dest = currentElement.position();
			initEffects(dest, currentElement);
		}
	}

	// 键盘绑定事件
	function keyDown() {
		var keydownId;
		win.keydown(function(e){
			clearTimeout(keydownId);
			keydownId = setTimeout(function() {
				var keyCode = e.keyCode;
				if(keyCode == 37 || keyCode == 38) {
					SP.moveSectionUp();
				} else if(keyCode == 39 || keyCode == 40) {
					SP.moveSectionDown();
				}
			}, 150);
		});
	}


})(jQuery);