/**
 * xbTab
 * TAB切换
 * @param {Object} window
 * @param {Object} undefined
 */
(function( window, undefined ) {
    "use strict";
    var xbTab = function(params,callback) {
    	this.extend(this.params, params);
        this._init(callback);
    };
    var tabItems;
    xbTab.prototype = {
        params: {
            element: false,
            index: 1, //默认选中
            repeatClick: false //是否允许重复点击
        },
        _init: function(callback) {
        	var self = this;
        	if(!self.params.element || self.params.element.nodeType!=1){
        		return;
        	}
        	tabItems = self.params.element.children;
        	if(tabItems){
        		self.setActive();
        		for(var i=0; i<tabItems.length; i++){
        			tabItems[i].setAttribute("tapmode","");
        			tabItems[i].setAttribute("data-item-order",i);
        			tabItems[i].onclick = function(e){
                        if(!self.params.repeatClick){
                            if(this.className.indexOf("xb-active") > -1)return;
                        }
        				if(callback){
                            callback({
                                index: parseInt(this.getAttribute("data-item-order"))+1,
                                dom:this
                            })
                        };
        				this.parentNode.querySelector(".xb-active").classList.remove("xb-active");
            			this.classList.add("xb-active");
        			}
        		}
        	}
        },
        setRepeat:function(value){
            var self = this;
            self.params.repeatClick = value ? value : false;
        },
        setActive: function(index){
        	var self = this;
        	index = index ? index : self.params.index;
        	var _tab = tabItems[index-1];
        	if(_tab.parentNode.querySelector(".xb-active"))_tab.parentNode.querySelector(".xb-active").classList.remove("xb-active");
        	_tab.classList.add("xb-active");
        },
        extend: function(a, b) {
			for (var key in b) {
			  	if (b.hasOwnProperty(key)) {
			  		a[key] = b[key];
			  	}
		  	}
		  	return a;
		}
    };
	window.xbTab = xbTab;
})(window);
/**
 * xbCollapse
 * 折叠菜单自动隐藏
 * @param {Object} window
 * @param {Object} undefined
 */
(function( window, undefined ) {
    "use strict";
    var xbCollapse = function(params) {
        this.init(params);
    };
    xbCollapse.prototype = {
        init: function(params,callback){
            var collapseHeader = document.querySelectorAll(".xb-collapse-header");
            if(collapseHeader.length){
                for(var i=0;i<collapseHeader.length;i++){
                    (function(e){
                        collapseHeader[e].onclick = function(){
                            if(collapseHeader[e].nextSibling.nextElementSibling.className.indexOf("xb-collapse-content") > -1){
                                if(collapseHeader[e].nextSibling.nextElementSibling.className.indexOf("xb-show") > -1){
                                    collapseHeader[e].nextSibling.nextElementSibling.classList.remove("xb-show");
                                    collapseHeader[e].classList.remove("xb-active");
                                }else{
                                    if(params.autoHide){
                                        if(document.querySelector(".xb-collapse-header.xb-active")){
                                            document.querySelector(".xb-collapse-header.xb-active").classList.remove("xb-active");
                                        }
                                        if(document.querySelector(".xb-collapse-content.xb-show")){
                                            document.querySelector(".xb-collapse-content.xb-show").classList.remove("xb-show");
                                        }
                                    }

                                    collapseHeader[e].nextSibling.nextElementSibling.classList.toggle("xb-show");
                                    collapseHeader[e].classList.toggle("xb-active");
                                }
                            }
                        }
                    })(i)
                }
            }
        }
    };
	window.xbCollapse = xbCollapse;
})(window);
/**
 * xbPullToRefresh
 * 下拉刷新
 * @param 
 */
(function(window) {
	'use strict';
	/**
	 * Extend obj function
	 *
	 * This is an object extender function. It allows us to extend an object
	 * by passing in additional variables and overwriting the defaults.
	 */
	var xbPullToRefresh = function (params,callback) {
		this.extend(this.params, params);
		this._init(callback);
	}
	var touchYDelta;
	var isLoading = false;
	var docElem = window.document.documentElement,
		loadWrapH,
		win = {width: window.innerWidth, height: window.innerHeight},
		winfactor= 0.2,
		translateVal,
		isMoved = false,
		firstTouchY, initialScroll;
	xbPullToRefresh.prototype = {
		params: {
            container: document.querySelector('.xb-refresh-content'),
			friction: 2.5,
			triggerDistance: 100,
			callback:false
        },
        _init : function(callback) {
			var self = this;
			var loadingHtml = '<div class="xb-refresh-load"><div class="xb-refresh-pull-arrow"></div></div>';
			self.params.container.insertAdjacentHTML('afterbegin', loadingHtml);
			self.params.container.addEventListener('touchstart', function(ev){
				self.touchStart(ev)
			});
			self.params.container.addEventListener('touchmove', function(ev){
				self.touchMove(ev)
			});
			self.params.container.addEventListener('touchend', function(ev){
				self.touchEnd(ev,callback);
			});
		},
		touchStart : function(ev) {
			// this.params.container.classList.remove("refreshing");
			if (isLoading) {
				return;
			}
			isMoved = false;
			this.params.container.style.webkitTransitionDuration =
		    this.params.container.style.transitionDuration = '0ms';
			touchYDelta = '';
			var touchobj = ev.changedTouches[0];
			// register first touch "y"
			firstTouchY = parseInt(touchobj.clientY);
			initialScroll = this.scrollY();
		},
		touchMove : function (ev) {
			if (isLoading) {
				ev.preventDefault();
				return;
			}
			var self = this;
			var moving = function() {
				var touchobj = ev.changedTouches[0], // reference first touch point for this event
					touchY = parseInt(touchobj.clientY);
					touchYDelta = touchY - firstTouchY;
				if ( self.scrollY() === 0 && touchYDelta > 0  ) {
					ev.preventDefault();
				}
				if ( initialScroll > 0 || self.scrollY() > 0 || self.scrollY() === 0 && touchYDelta < 0 ) {
					firstTouchY = touchY;
					return;
				}
				translateVal = Math.pow(touchYDelta, 0.85);
				self.params.container.style.webkitTransform = self.params.container.style.transform = 'translate3d(0, ' + translateVal + 'px, 0)';
				isMoved = true;
				if(touchYDelta > self.params.triggerDistance){
					self.params.container.classList.add("xb-refresh-pull-up");
					self.params.container.classList.remove("xb-refresh-pull-down");
				}else{
					self.params.container.classList.add("xb-refresh-pull-down");
					self.params.container.classList.remove("xb-refresh-pull-up");
				}
			};
			this.throttle(moving(), 20);
		},
		touchEnd : function (ev,callback) {
			var self =this;
			if (isLoading|| !isMoved) {
				isMoved = false;
				return;
			}
			// 根据下拉高度判断是否加载
			if( touchYDelta >= this.params.triggerDistance) {
				isLoading = true; //正在加载中
				ev.preventDefault();
				this.params.container.style.webkitTransitionDuration =
		    	this.params.container.style.transitionDuration = '300ms';
				this.params.container.style.webkitTransform =
				this.params.container.style.transform = 'translate3d(0,60px,0)';
				document.querySelector(".xb-refresh-pull-arrow").style.webkitTransitionDuration =
		    	document.querySelector(".xb-refresh-pull-arrow").style.transitionDuration = '0ms';
				self.params.container.classList.add("xb-refreshing");
				if(callback){
					callback({
						status:"success"
					});
				}
			}else{
				this.params.container.style.webkitTransitionDuration =
		    	this.params.container.style.transitionDuration = '300ms';
				this.params.container.style.webkitTransform =
				this.params.container.style.transform = 'translate3d(0,0,0)';
				if(callback){
					callback({
						status:"fail"
					});
				}
			}
			isMoved = false;
			return;
		},
		cancelLoading : function () {
			var self =this;
			isLoading = false;
			self.params.container.classList.remove("xb-refreshing");
			document.querySelector(".xb-refresh-pull-arrow").style.webkitTransitionDuration =
		    	document.querySelector(".xb-refresh-pull-arrow").style.transitionDuration = '300ms';
			this.params.container.style.webkitTransitionDuration =
		    	this.params.container.style.transitionDuration = '0ms';
			self.params.container.style.webkitTransform =
			self.params.container.style.transform = 'translate3d(0,0,0)';
			self.params.container.classList.remove("xb-refresh-pull-up");
			self.params.container.classList.add("xb-refresh-pull-down");
			return;
		},
		scrollY : function() {
			return window.pageYOffset || docElem.scrollTop;
		},
		throttle : function(fn, delay) {
			var allowSample = true;
			return function(e) {
				if (allowSample) {
					allowSample = false;
					setTimeout(function() { allowSample = true; }, delay);
					fn(e);
				}
			};
		},
		winresize : function () {
			var resize = function() {
				win = {width: window.innerWidth, height: window.innerHeight};
			};
			throttle(resize(), 10);
		},
		extend: function(a, b) {
			for (var key in b) {
			  	if (b.hasOwnProperty(key)) {
			  		a[key] = b[key];
			  	}
		  	}
		  	return a;
		 }
	}
	window.xbPullToRefresh = xbPullToRefresh;

})(window);
/**
 * xbPopup
 * 弹出窗口
 * @param 
 */
(function( window, undefined ) {
    "use strict";
    var xbPopup = function() {
    };
    var isShow = false;
    xbPopup.prototype = {
        init: function(params,callback){
            this.frameBounces = params.frameBounces;
            this.location = params.location;
            this.buttons = params.buttons;
            this.maskDiv;
            this.popupDiv;
            var self = this;
            self.open(params,callback);
        },
        open: function(params,callback) {
            var buttonsHtml='',locationClass = 'xb-popup-top';
        	var self = this;
            if(self.popupDiv){
                self.close();
                return;
            }
            if(!self.maskDiv){
                self.maskDiv = document.createElement("div");
                self.maskDiv.className = "xb-mask";
                document.body.appendChild(self.maskDiv);
            }
            switch (self.location) {
                case "top":
                    locationClass = 'xb-popup-top';
                    break;
                case "top-left":
                    locationClass = 'xb-popup-top-left';
                    break;
                case "top-right":
                    locationClass = 'xb-popup-top-right';
                    break;
                case "bottom":
                    locationClass = 'xb-popup-bottom';
                    break;
                case "bottom-left":
                    locationClass = 'xb-popup-bottom-left';
                    break;
                case "bottom-right":
                    locationClass = 'xb-popup-bottom-right';
                    break;
                case "center":
                    locationClass = 'xb-popup-center';
                    break;
                default:
                    locationClass = 'xb-popup-top';
                    break;
            }
            self.popupDiv = document.createElement("div");
            self.popupDiv.className = "xb-popup "+locationClass;
            if(locationClass=='xb-popup-center'){
            	self.popupDiv.innerHTML = '<div class="xb-popup-content"></div>';
            }else{
            	self.popupDiv.innerHTML = '<div class="xb-popup-arrow"></div><div class="xb-popup-content"></div>';
            }
            document.body.appendChild(self.popupDiv);
            if(self.buttons && self.buttons.length){
                buttonsHtml += '<ul class="xb-list xb-list-noborder">';
                for(var i = 0; i < self.buttons.length;i++){
                    buttonsHtml += '<li class="xb-list-item xb-list-item-middle">';
                    buttonsHtml += '<div class="xb-list-item-label-icon"><img src="'+self.buttons[i].image+'"></div>';
                    buttonsHtml += '<div class="xb-list-item-inner">'+self.buttons[i].text+'</div>';
                    buttonsHtml += '</li>';
                }
                buttonsHtml += '</ul>';
            }
            document.querySelector(".xb-popup .xb-popup-content").insertAdjacentHTML('beforeend', buttonsHtml);
            var actionsheetHeight = document.querySelector(".xb-popup").offsetHeight;
            self.maskDiv.classList.add("xb-mask-in");
            self.popupDiv.classList.add("xb-popup-in");
            self.popupDiv.addEventListener("touchmove", function(event){
                event.preventDefault();
            })
            self.maskDiv.addEventListener("touchmove", function(event){
                event.preventDefault();
            })
            if(typeof(api) != 'undefined' && typeof(api) == 'object' && self.frameBounces){
                api.setFrameAttr({
                    bounces:false
                });
            }
            var popupButtons = document.querySelectorAll(".xb-popup .xb-list-item");
            if(popupButtons && popupButtons.length > 0){
                setTimeout(function(){
                    self.maskDiv.onclick = function(){self.close();return;};
                    for(var ii = 0; ii < popupButtons.length; ii++){
                        (function(e){
                            popupButtons[e].onclick = function(){
                                if(self.buttons[e].value){
                                    var _value = self.buttons[e].value;
                                }else{
                                    var _value = null;
                                }
                                if(callback){
                                    callback({
                                        buttonIndex: e+1,
                                        buttonTitle: this.textContent,
                                        buttonValue: _value
                                    });
                                };
                                self.close();
                                return;
                            }
                        })(ii)
                    }
                }, 350)
            }
        },
        close: function(){
            var self = this;
            if(typeof(api) != 'undefined' && typeof(api) == 'object' && self.frameBounces){
                api.setFrameAttr({
                    bounces:true
                });
            }
            if(self.popupDiv){
                var actionsheetHeight = self.popupDiv.offsetHeight;
                self.popupDiv.classList.add("xb-popup-out");
                self.maskDiv.style.opacity = 0;
                setTimeout(function(){
                    if(self.maskDiv){
                        self.maskDiv.parentNode.removeChild(self.maskDiv);
                    }
                    self.popupDiv.parentNode.removeChild(self.popupDiv);
                    self.maskDiv = self.popupDiv = false;
                }, 300)
            }
        }
    };
	window.xbPopup = xbPopup;
})(window);
/**
 * xbDialog
 * 弹出dialog
 * @param {Object} window
 * @param {Object} undefined
 */
(function( window, undefined ) {
    "use strict";
    var xbDialog = function() {
    };
    var isShow = false;
    xbDialog.prototype = {
        params: {
            title:'',
            msg:'',
            buttons: ['取消','确定'],
            input:false
        },
        create: function(params,callback) {
        	var self = this;
            var dialogHtml = '';
            var buttonsHtml = '';
            var headerHtml = params.title ? '<div class="xb-dialog-header">' + params.title + '</div>' : '<div class="xb-dialog-header">' + self.params.title + '</div>';
            if(params.input){
                params.text = params.text ? params.text: '';
                var msgHtml = '<div class="xb-dialog-body"><input type="text" placeholder="'+params.text+'"></div>';
            }else{
                var msgHtml = params.msg ? '<div class="xb-dialog-body">' + params.msg + '</div>' : '<div class="xb-dialog-body">' + self.params.msg + '</div>';
            }
            var buttons = params.buttons ? params.buttons : self.params.buttons;
            if (buttons && buttons.length > 0) {
                for (var i = 0; i < buttons.length; i++) {
                    buttonsHtml += '<div class="xb-dialog-btn" tapmode button-index="'+i+'">'+buttons[i]+'</div>';
                }
            }
            var footerHtml = '<div class="xb-dialog-footer">'+buttonsHtml+'</div>';
            dialogHtml = '<div class="xb-dialog">'+headerHtml+msgHtml+footerHtml+'</div>';
            document.body.insertAdjacentHTML('beforeend', dialogHtml);
            // listen buttons click
            var dialogButtons = document.querySelectorAll(".xb-dialog-btn");
            if(dialogButtons && dialogButtons.length > 0){
                for(var ii = 0; ii < dialogButtons.length; ii++){
                    dialogButtons[ii].onclick = function(){
                        if(callback){
                            if(params.input){
                                callback({
                                    buttonIndex: parseInt(this.getAttribute("button-index"))+1,
                                    text: document.querySelector("input").value
                                });
                            }else{
                                callback({
                                    buttonIndex: parseInt(this.getAttribute("button-index"))+1
                                });
                            }
                        };
                        self.close();
                        return;
                    }
                }
            }
            self.open();
        },
        open: function(){
            if(!document.querySelector(".xb-dialog"))return;
            var self = this;
            document.querySelector(".xb-dialog").style.marginTop =  "-"+Math.round(document.querySelector(".xb-dialog").offsetHeight/2)+"px";
            if(!document.querySelector(".xb-mask")){
                var maskHtml = '<div class="xb-mask"></div>';
                document.body.insertAdjacentHTML('beforeend', maskHtml);
            }
            // document.querySelector(".xb-dialog").style.display = "block";
            setTimeout(function(){
                document.querySelector(".xb-dialog").classList.add("xb-dialog-in");
                document.querySelector(".xb-mask").classList.add("xb-mask-in");
                document.querySelector(".xb-dialog").classList.add("xb-dialog-in");
            }, 10)
            document.querySelector(".xb-mask").addEventListener("touchmove", function(e){
                e.preventDefault();
            })
            document.querySelector(".xb-dialog").addEventListener("touchmove", function(e){
                e.preventDefault();
            })
            return;
        },
        close: function(){
            var self = this;
            document.querySelector(".xb-mask").classList.remove("xb-mask-in");
            document.querySelector(".xb-dialog").classList.remove("xb-dialog-in");
            document.querySelector(".xb-dialog").classList.add("xb-dialog-out");
            if (document.querySelector(".xb-dialog:not(.xb-dialog-out)")) {
                setTimeout(function(){
                    if(document.querySelector(".xb-dialog"))document.querySelector(".xb-dialog").parentNode.removeChild(document.querySelector(".xb-dialog"));
                    self.open();
                    return true;
                },200)
            }else{
                document.querySelector(".xb-mask").classList.add("xb-mask-out");
                document.querySelector(".xb-dialog").addEventListener("webkitTransitionEnd", function(){
                    self.remove();
                })
                document.querySelector(".xb-dialog").addEventListener("transitionend", function(){
                    self.remove();
                })
            }
        },
        remove: function(){
            if(document.querySelector(".xb-dialog"))document.querySelector(".xb-dialog").parentNode.removeChild(document.querySelector(".xb-dialog"));
            if(document.querySelector(".xb-mask")){
                document.querySelector(".xb-mask").classList.remove("xb-mask-out");
            }
            return true;
        },
        alert: function(params,callback){
        	var self = this;
            return self.create(params,callback);
        },
        prompt:function(params,callback){
            var self = this;
            params.input = true;
            return self.create(params,callback);
        }
    };
	window.xbDialog = xbDialog;
})(window);
/**
 * xbScroll
 * 滚动监听
 * @param {Object} window
 */
(function(window) {
	'use strict';
	var isToBottom = false,isMoved = false;
	var xbScroll = function (params,callback) {
		this.extend(this.params, params);
		this._init(params,callback);
	}
	xbScroll.prototype = {
		params: {
			listren:false,
            distance: 100
        },
		_init : function(params,callback) {
			var self = this;
			if(self.params.listen){
				document.body.addEventListener("touchmove", function(e){
					self.scroll(callback);
				});
				document.body.addEventListener("touchend", function(e){
					self.scroll(callback);
				});
			}
			window.onscroll = function(){
				self.scroll(callback);
			}
		},
		scroll : function (callback) {
			var self = this;
			var clientHeight = document.documentElement.scrollTop === 0 ? document.body.clientHeight : document.documentElement.clientHeight;
			var scrollTop = document.documentElement.scrollTop === 0 ? document.body.scrollTop : document.documentElement.scrollTop;
			var scrollHeight = document.documentElement.scrollTop === 0 ? document.body.scrollHeight : document.documentElement.scrollHeight;

			if (scrollHeight-scrollTop-self.params.distance <= window.innerHeight) {
	        	isToBottom = true;
	        	if(isToBottom){
	        		callback({
	        			"scrollTop":scrollTop,
	        			"isToBottom":true
	        		})
	        	}
	        }else{
	        	isToBottom = false;
	        	callback({
        			"scrollTop":scrollTop,
        			"isToBottom":false
        		})
	        }
		},
        extend: function(a, b) {
			for (var key in b) {
			  	if (b.hasOwnProperty(key)) {
			  		a[key] = b[key];
			  	}
		  	}
		  	return a;
		}
	}
	window.xbScroll = xbScroll;
})(window);
/**
 * xbToast
 * toast弹出
 * @param {Object} window
 * @param {Object} undefined
 */
(function( window, undefined ) {
    "use strict";
    var xbToast = function() {
        // this.create();
    };
    var isShow = false;
    xbToast.prototype = {
        create: function(params,callback) {
            var self = this;
            var toastHtml = '';
            switch (params.type) {
                case "success":
                    var iconHtml = '<i class="xb-iconfont xb-icon-correct"></i>';
                    break;
                case "fail":
                    var iconHtml = '<i class="xb-iconfont xb-icon-close"></i>';
                    break;
                case "custom":
                    var iconHtml = params.html;
                    break;
                case "loading":
                    var iconHtml = '<div class="xb-toast-loading"></div>';
                    break;
            }

            var titleHtml = params.title ? '<div class="xb-toast-content">'+params.title+'</div>' : '';
            toastHtml = '<div class="xb-toast">'+iconHtml+titleHtml+'</div>';
            if(document.querySelector(".xb-toast"))return;
            document.body.insertAdjacentHTML('beforeend', toastHtml);
            var duration = params.duration ? params.duration : "2000";
            self.show();
            if(params.type == 'loading'){
                if(callback){
                    callback({
                        status: "success"
                    });
                };
            }else{
                setTimeout(function(){
                    self.hide();
                }, duration)
            }
        },
        show: function(){
            var self = this;
            document.querySelector(".xb-toast").style.display = "block";
            document.querySelector(".xb-toast").style.marginTop =  "-"+Math.round(document.querySelector(".xb-toast").offsetHeight/2)+"px";
            if(document.querySelector(".xb-toast"))return;
        },
        hide: function(){
            var self = this;
            if(document.querySelector(".xb-toast")){
                document.querySelector(".xb-toast").parentNode.removeChild(document.querySelector(".xb-toast"));
            }
        },
        remove: function(){
            if(document.querySelector(".xb-dialog"))document.querySelector(".xb-dialog").parentNode.removeChild(document.querySelector(".xb-dialog"));
            if(document.querySelector(".xb-mask")){
                document.querySelector(".xb-mask").classList.remove("xb-mask-out");
            }
            return true;
        },
        success: function(params,callback){
            var self = this;
            params.type = "success";
            return self.create(params,callback);
        },
        fail: function(params,callback){
            var self = this;
            params.type = "fail";
            return self.create(params,callback);
        },
        custom:function(params,callback){
            var self = this;
            params.type = "custom";
            return self.create(params,callback);
        },
        loading:function(params,callback){
            var self = this;
            params.type = "loading";
            return self.create(params,callback);
        }
    };
    window.xbToast = xbToast;
})(window);
/**
 * xbActionsheet
 * 底部弹起选框
 * @param {Object} window
 * @param {Object} undefined
 */
(function( window, undefined ) {
    "use strict";
    var xbActionsheet = function() {
    };
    var isShow = false;
    xbActionsheet.prototype = {
        init: function(params,callback){
            this.frameBounces = params.frameBounces;
            this.title = params.title;
            this.buttons = params.buttons;
            this.cancelTitle = params.cancelTitle;
            this.destructiveTitle = params.destructiveTitle;
            this.maskDiv;
            this.actionsheetDiv;
            var self = this;
            self.open(params,callback);
        },
        open: function(params,callback) {
            var titleHtml='',buttonsHtml='',destructiveHtml='',cancelHtml='',btnHtml='';
        	var self = this;
            if(self.actionsheetDiv || (!self.title && !self.buttons && !self.cancelTitle && !self.destructiveTitle))return;
            if(!self.maskDiv){
                self.maskDiv = document.createElement("div");
                self.maskDiv.className = "xb-mask";
                document.body.appendChild(self.maskDiv);
            }
            self.actionsheetDiv = document.createElement("div");
            self.actionsheetDiv.className = "xb-actionsheet";
            document.body.appendChild(self.actionsheetDiv);
            if(self.title){
                titleHtml = '<div class="xb-actionsheet-title xb-border-b xb-font-size-12">'+self.title+'</div>';
            }
            if(self.buttons && self.buttons.length){
                for(var i = 0; i < self.buttons.length;i++){
                    if(i == self.buttons.length-1){
                        buttonsHtml += '<div class="xb-actionsheet-btn-item">'+self.buttons[i]+'</div>';
                    }else{
                        buttonsHtml += '<div class="xb-actionsheet-btn-item xb-border-b">'+self.buttons[i]+'</div>';
                    }
                }
            }
            if(self.destructiveTitle){
                destructiveHtml = '<div class="xb-actionsheet-btn-item xb-border-t xb-text-danger">'+self.destructiveTitle+'</div>';
            }else{
                var destructiveHtml = '';
            }
            if(self.title || (self.buttons && self.buttons.length)){
                btnHtml = '<div class="xb-actionsheet-btn">'+titleHtml+''+buttonsHtml+''+destructiveHtml+'</div>';
            }
            if(self.cancelTitle){
                cancelHtml = '<div class="xb-actionsheet-btn"><div class="xb-actionsheet-btn-item">'+self.cancelTitle+'</div></div>';
            }
            self.actionsheetDiv.insertAdjacentHTML('beforeend', btnHtml+cancelHtml);
            var actionsheetHeight = document.querySelector(".xb-actionsheet").offsetHeight;
            self.maskDiv.classList.add("xb-mask-in");
            self.actionsheetDiv.style.webkitTransform = self.actionsheetDiv.style.transform = "translate3d(0,0,0)";
            self.actionsheetDiv.style.opacity = 1;
            self.actionsheetDiv.addEventListener("touchmove", function(event){
                event.preventDefault();
            })
            self.maskDiv.addEventListener("touchmove", function(event){
                event.preventDefault();
            })
            if(typeof(api) != 'undefined' && typeof(api) == 'object' && self.frameBounces){
                api.setFrameAttr({
                    bounces:false
                });
            }
            var actionsheetButtons = document.querySelectorAll(".xb-actionsheet-btn-item");
            if(actionsheetButtons && actionsheetButtons.length > 0){
                setTimeout(function(){
                    self.maskDiv.onclick = function(){self.close();return;};
                    for(var ii = 0; ii < actionsheetButtons.length; ii++){
                        (function(e){
                            actionsheetButtons[e].onclick = function(){
                                if(callback){
                                    callback({
                                        buttonIndex: e+1,
                                        buttonTitle: this.textContent
                                    });
                                };
                                self.close();
                                return;
                            }
                        })(ii)
                    }
                }, 350)
            }
        },
        close: function(){
            var self = this;
            if(typeof(api) != 'undefined' && typeof(api) == 'object' && self.frameBounces){
                api.setFrameAttr({
                    bounces:true
                });
            }
            if(self.actionsheetDiv){
                var actionsheetHeight = self.actionsheetDiv.offsetHeight;
                self.actionsheetDiv.style.webkitTransform = self.actionsheetDiv.style.transform = "translate3d(0,"+actionsheetHeight+"px,0)";
                self.maskDiv.style.opacity = 0;
                setTimeout(function(){
                    if(self.maskDiv){
                        self.maskDiv.parentNode.removeChild(self.maskDiv);
                    }
                    self.actionsheetDiv.parentNode.removeChild(self.actionsheetDiv);
                    self.actionsheetDiv = self.maskDiv = false;
                }, 300)
            }
        }
    };
	window.xbActionsheet = xbActionsheet;
})(window);
/**
 * xbLazyload
 * 懒加载
 * @param {Object} window
 * @param {Object} undefined
 */
(function( window, undefined ) {
    "use strict";
    var _loadImgNodes;
    var xbLazyload = function(params) {
        this.errorImage = params.errorImage||false;
        this._init(params);
    };
    xbLazyload.prototype = {
        _init: function(params) {
            var self = this;
            _loadImgNodes = document.querySelectorAll('[data-src]');
            self._judgeImages();
            window.addEventListener('scroll', function(){
                _loadImgNodes = document.querySelectorAll('[data-src]');
                self._judgeImages();
            }, false);
        },
        _judgeImages:function() {
            var self = this;
            if(_loadImgNodes.length){
                for(var i = 0;  i < _loadImgNodes.length; i++){
                    if (_loadImgNodes[i].getBoundingClientRect().top < window.innerHeight) {
                        self._loadImage(_loadImgNodes[i]);
                    }
                }
            }
        },
        _loadImage:function(el){
            var self = this;
            var img = new Image();
            img.src = el.getAttribute('data-src');
            el.src = el.getAttribute('data-src');
            el.removeAttribute("data-src");
            // // 图片加载失败
            img.onerror = function() {
                el.src = self.errorImage || el.getAttribute('src');
                el.removeAttribute("data-src");
            };
        }
    }
    window.xbLazyload = xbLazyload;
})(window);
/**
 * xbListSwipe
 * 右滑菜单
 * @param {Object} window
 */
 (function(window) {
	"use strict";
	var translateVal,
		friction = 1,
		firstTouchX,
		firstTouchxy,
		firstTouchY,
		firstTouch,
		firstTouchTime,
		touchXDelta,
		handleTranslateVal;
	var TranslateZero = "translate3d(0,0,0)",
		TranslateCent = "translate3d(100%,0,0)";
	var swipeHandle = false,
		btnWidth = false,
		swipeBtnsRight = false;
	var isMoved = false,isOpened=false;
	var d = false;
	var xbListSwipe = function (callback) {
		this._init(callback);
	}
	xbListSwipe.prototype = {
		// var self = this;
		_init: function(callback){
			var self = this;
			// var d = document.querySelectorAll("selectors")
			window.addEventListener('touchstart', function(event){
				// 如果已经打开，将已经打开的关闭
				if(isOpened && swipeHandle){
					// isOpened = false;
					self.setTranslate(swipeHandle,"0px");
					swipeHandle.classList.remove("xb-swipe-opened");
					return;
				}else{
					var target = event.target;
					// 过滤点击
					for(; target && target !== document; target = target.parentNode){
						// console.log(target.classList)
						if (target.classList){
							if (target.classList.contains("xb-swipe-handle")) {
								swipeHandle = target;
								firstTouch = event.changedTouches[0];
								firstTouchX = firstTouch.clientX;
								firstTouchY = firstTouch.clientY;
								firstTouchTime = event.timeStamp;
								if(swipeHandle.className.indexOf("xb-swipe-opened") > -1){
								// 	console.log(1)
									// self.setTranslate(swipeHandle,"0px");
									// swipeHandle.classList.remove("xb-swipe-opened");
									event.preventDefault();
									return;
								}else{
									// setTimeout(function(){
										self.toggleEvents(swipeHandle,callback);
									// }, 100)

								}

							}
						}
					}
				}
				// if(swipeHandle){
				// 	event.preventDefault();
				// 	self.setTranslate(swipeHandle,"0px");
				// 	swipeHandle.classList.remove("xb-swipe-opened");
				// 	swipeHandle = false;
				// 	return;
				// }
				// isMoved = false;
				// swipeHandle = false;
			})
		},
		toggleEvents:function(element,callback){
			if(!swipeHandle){
				return;
			}
			var self = this;
			self.setTransform(element,300);
			element.addEventListener('touchstart', function(event){
				// if(element.className.indexOf("xb-swipe-opened") > -1){
				// 	self.setTranslate(element,"0px");
				// 	element.classList.remove("xb-swipe-opened");
				// 	return;
				// }
				//:active样式引起列表背景色冲突

				element.parentNode.style.backgroundColor = "#ffffff";
				if(!element.nextSibling)return;
			},false)
			element.addEventListener('touchmove', function(event){
				event.preventDefault();
				if(document.querySelector(".xb-swipe-opened")){
					event.preventDefault();
					if(swipeHandle != document.querySelector(".xb-swipe-opened")){
						self.setTranslate(document.querySelector(".xb-swipe-opened"),"0px");
			        	document.querySelector(".xb-swipe-opened").classList.remove("xb-swipe-opened");
			        	isOpened = false;
			        	event.stopPropagation()
			        	return;
					}
				}
				// self.getAngle(event)
				self.setTransform(element,0);
				// if(element.className.indexOf("xb-swipe-opened") > -1)return;

				if(element.parentNode.querySelector(".xb-swipe-btn")){
					btnWidth = element.parentNode.querySelector(".xb-swipe-btn").offsetWidth;
				}
				// 列表触摸滑动时如果有已经显示的将其关闭，并退出。
				var touchMoveObj = event.changedTouches[0],
					touchX = touchMoveObj.clientX;
				touchXDelta = -Math.pow(firstTouchX-touchX, 0.85);
				handleTranslateVal = touchXDelta/friction;
				// touchXDelta = touchX - firstTouchX;
				// handleTranslateVal = touchXDelta/0.15;
				// console.log(handleTranslateVal)
		        var moveX = touchMoveObj.clientX - firstTouchX;
		        var moveY = touchMoveObj.clientY - firstTouchY;
		        var direction = self.getDirection(moveX,moveY);
		        var angle = self.getAngle(Math.abs(moveX),Math.abs(moveY));
		        // console.log(isMoved);

		        // // 解决滑动屏幕返回时事件冲突，主要针对部分特殊机型
		        // if(touchMoveObj.screenX < 0){
		        // 	firstTouchxy = '';
		        // }
		        if(direction == "right"){
		        	isMoved = false;
		        	event.preventDefault();
		        }
		        if(direction == "top" || direction == "down"){
		        	isMoved = false;
		        	return;
		        }
		        if(angle <= 15 && direction === 'left'){
		        	event.preventDefault()
		        	isMoved = true;
		        }
		        // console.log(handleTranslateVal)
		        // if(isMoved)self.setTranslate(element,""+(handleTranslateVal+10)+"px");
		        if((event.timeStamp - firstTouchTime) >= 100 && touchXDelta < 0 && touchMoveObj.screenX > 0 && isMoved){
		        	// event.stopPropagation();
		        	// element.classList.add("xb-swipe-moving");
		        	// event.preventDefault();
		        	if(element.className.indexOf("xb-swipe-opened") <= -1){
						if((handleTranslateVal+10) > -btnWidth){
				        	self.setTranslate(element,""+(handleTranslateVal+10)+"px");
				        }
					}else{
						return
					}

			    }
			},false)
			element.addEventListener('touchend', function(event){
				self.setTransform(element,300);
				var touchEndObj = event.changedTouches[0];
				var touchEndxy = {
						x: touchEndObj.clientX || 0,
						y: touchEndObj.clientY || 0
					};
				var toucheEndX = touchEndObj.clientX - firstTouchX;
		        var toucheEndY = touchEndObj.clientY - firstTouchY;
		        var direction = self.getDirection(toucheEndX,toucheEndY);
		        // element.classList.remove("xb-swipe-moving");
	        	if(direction=='left' && handleTranslateVal < (-btnWidth/3) && isMoved){
		        	self.setTranslate(element,""+-btnWidth+"px");
		        	element.classList.add("xb-swipe-opened");
		        	callback({
		        		'status':true,
		        		'dom':element
		        	})
		        	// isOpened = true;
				}else{
					element.classList.remove("xb-swipe-opened");
		        	self.setTranslate(element,"0px");
		        	isOpened = false;
				}
				// isMoved = false;
				console.log(isOpened)
			},true)
		},
		setTransform : function (el,value){
			el.style.webkitTransitionDuration = el.style.transitionDuration = value+'ms';
		},
		setTranslate : function (el,value){
			if(el)el.style.webkitTransform = el.style.transform = "translate3d("+value+",0,0)";
		},
		getDistance : function(p1, p2, props) {
			if (!props) { props = ['x', 'y'];}
			var x = p2[props[0]] - p1[props[0]];
			var y = p2[props[1]] - p1[props[1]];
			return Math.sqrt((x * x) + (y * y));
		},
		getAngle:function(moveX, moveY){
		       // var x = Math.abs(x1 - x2);
		       // var y = Math.abs(y1 - y2);
		       var z = Math.sqrt(moveX*moveX + moveY*moveY);
		       return  Math.round((Math.asin(moveY / z) / Math.PI*180));
		},
		getDirection : function(x, y) {
			if (x === y) { return '';}
			if (Math.abs(x) >= Math.abs(y)) {
	            return x > 0 ? 'right' : 'left';
	        } else {
	           	return y > 0 ? 'down' : 'up';
	        }
		}
	}
	window.xbListSwipe = xbListSwipe;
})(window);
/**
 * xbSkin
 * 主题切换
 * @param {Object} window
 * @param {Object} undefined
 */
(function(window, undefined) {
	"use strict";
	var xbSkin = function(params) {
		this.extend(this.params, params);
		this._init();
	};
	var fileRef;
	xbSkin.prototype = {
		params: {
			name: "", //主题名字
			skinPath: "", //主题路径
			default: false, //默认是否立即使用
			beginTime: "", //开始时间
			endTime: "" //结束时间
		},
		_init: function() {
			var self = this;
			if(!self.params.name) return;
			if(!self.params.skinPath) return;
			fileRef = document.createElement('link');
			fileRef.setAttribute("rel", "stylesheet");
			fileRef.setAttribute("type", "text/css");
			fileRef.setAttribute("xb-skin-name", self.params.name);
			fileRef.setAttribute("href", self.params.skinPath);
			if(self.params.default) {
				document.getElementsByTagName("head")[0].appendChild(fileRef);
			} else {
				if(!self.params.beginTime || !self.params.endTime) return;
				if(!self.check(self.params.beginTime, self.params.endTime)) return;
				var _date = new Date();
				if(_date.getMinutes() < 10) {
					var nowM = "0" + _date.getMinutes();
				} else {
					var nowM = _date.getMinutes();
				}
				var nowTime = _date.getHours() + ":" + nowM;
				var b = parseInt(self.params.beginTime.replace(":", ''));
				var e = parseInt(self.params.endTime.replace(":", ''));
				var n = parseInt(nowTime.replace(":", ''));
				if(b > e) {
					if(n >= b || n <= e) self.setSkin();
				} else if(b < e) {
					if(n >= b && n <= e) self.setSkin();
				} else {
					self.removeSkin();
				}
			}
		},
		setSkin: function() {
			document.getElementsByTagName("head")[0].appendChild(fileRef);
		},
		removeSkin: function() {
			var self = this;
			if(document.querySelector("link[xb-skin-name='" + self.params.name + "']"))
				document.querySelector("link[xb-skin-name='" + self.params.name + "']").parentNode.removeChild(document.querySelector("link[xb-skin-name='" + self.params.name + "']"));
		},
		check: function(beginTime, endTime) {
			var strb = beginTime.split(":");
			if(strb.length != 2) return false;
			var stre = endTime.split(":");
			if(stre.length != 2) return false;
			var b = new Date();
			var e = new Date();
			b.setHours(strb[0]);
			b.setMinutes(strb[1]);
			e.setHours(stre[0]);
			e.setMinutes(stre[1]);
			if(strb[0] > 24 || strb[0] < 0 || stre[0] > 24 || stre[0] < 0) return false;
			if(strb[1] > 59 || strb[1] < 0 || stre[1] > 59 || stre[1] < 0) return false;
			return true;
		},
		extend: function(a, b) {
			for(var key in b) {
				if(b.hasOwnProperty(key)) {
					a[key] = b[key];
				}
			}
			return a;
		}
	};
	window.xbSkin = xbSkin;
})(window);
/*sideout*/
! function(t) {
	if("object" == typeof exports && "undefined" != typeof module) module.exports = t();
	else if("function" == typeof define && define.amd) define([], t);
	else {
		var e;
		"undefined" != typeof window ? e = window : "undefined" != typeof global ? e = global : "undefined" != typeof self && (e = self), e.Slideout = t()
	}
}(function() {
	var t, e, n;
	return function i(t, e, n) {
		function o(r, a) {
			if(!e[r]) {
				if(!t[r]) {
					var u = typeof require == "function" && require;
					if(!a && u) return u(r, !0);
					if(s) return s(r, !0);
					var l = new Error("Cannot find module '" + r + "'");
					throw l.code = "MODULE_NOT_FOUND", l
				}
				var h = e[r] = {
					exports: {}
				};
				t[r][0].call(h.exports, function(e) {
					var n = t[r][1][e];
					return o(n ? n : e)
				}, h, h.exports, i, t, e, n)
			}
			return e[r].exports
		}
		var s = typeof require == "function" && require;
		for(var r = 0; r < n.length; r++) o(n[r]);
		return o
	}({
		1: [function(t, e, n) {
			"use strict";
			var i = t("decouple");
			var o = t("emitter");
			var s;
			var r = false;
			var a = window.document;
			var u = a.documentElement;
			var l = window.navigator.msPointerEnabled;
			var h = {
				start: l ? "MSPointerDown" : "touchstart",
				move: l ? "MSPointerMove" : "touchmove",
				end: l ? "MSPointerUp" : "touchend"
			};
			var f = function v() {
				var t = /^(Webkit|Khtml|Moz|ms|O)(?=[A-Z])/;
				var e = a.getElementsByTagName("script")[0].style;
				for(var n in e) {
					if(t.test(n)) {
						return "-" + n.match(t)[0].toLowerCase() + "-"
					}
				}
				if("WebkitOpacity" in e) {
					return "-webkit-"
				}
				if("KhtmlOpacity" in e) {
					return "-khtml-"
				}
				return ""
			}();

			function c(t, e) {
				for(var n in e) {
					if(e[n]) {
						t[n] = e[n]
					}
				}
				return t
			}

			function p(t, e) {
				t.prototype = c(t.prototype || {}, e.prototype)
			}

			function d(t) {
				while(t.parentNode) {
					if(t.getAttribute("data-slideout-ignore") !== null) {
						return t
					}
					t = t.parentNode
				}
				return null
			}

			function _(t) {
				t = t || {};
				this._startOffsetX = 0;
				this._currentOffsetX = 0;
				this._opening = false;
				this._moved = false;
				this._opened = false;
				this._preventOpen = false;
				this.panel = t.panel;
				this.menu = t.menu;
				this._touch = t.touch === undefined ? true : t.touch && true;
				this._side = t.side || "left";
				this._easing = t.fx || t.easing || "ease";
				this._duration = parseInt(t.duration, 10) || 300;
				this._tolerance = parseInt(t.tolerance, 10) || 70;
				this._padding = this._translateTo = parseInt(t.padding, 10) || 256;
				this._orientation = this._side === "right" ? -1 : 1;
				this._translateTo *= this._orientation;
				if(!this.panel.classList.contains("slideout-panel")) {
					this.panel.classList.add("slideout-panel")
				}
				if(!this.panel.classList.contains("slideout-panel-" + this._side)) {
					this.panel.classList.add("slideout-panel-" + this._side)
				}
				if(!this.menu.classList.contains("slideout-menu")) {
					this.menu.classList.add("slideout-menu")
				}
				if(!this.menu.classList.contains("slideout-menu-" + this._side)) {
					this.menu.classList.add("slideout-menu-" + this._side)
				}
				if(this._touch) {
					this._initTouchEvents()
				}
			}
			p(_, o);
			_.prototype.open = function() {
				var t = this;
				this.emit("beforeopen");
				if(!u.classList.contains("slideout-open")) {
					u.classList.add("slideout-open")
				}
				this._setTransition();
				this._translateXTo(this._translateTo);
				this._opened = true;
				setTimeout(function() {
					t.panel.style.transition = t.panel.style["-webkit-transition"] = "";
					t.emit("open")
				}, this._duration + 50);
				return this
			};
			_.prototype.close = function() {
				var t = this;
				if(!this.isOpen() && !this._opening) {
					return this
				}
				this.emit("beforeclose");
				this._setTransition();
				this._translateXTo(0);
				this._opened = false;
				setTimeout(function() {
					u.classList.remove("slideout-open");
					t.panel.style.transition = t.panel.style["-webkit-transition"] = t.panel.style[f + "transform"] = t.panel.style.transform = "";
					t.emit("close")
				}, this._duration + 50);
				return this
			};
			_.prototype.toggle = function() {
				return this.isOpen() ? this.close() : this.open()
			};
			_.prototype.isOpen = function() {
				return this._opened
			};
			_.prototype._translateXTo = function(t) {
				this._currentOffsetX = t;
				this.panel.style[f + "transform"] = this.panel.style.transform = "translateX(" + t + "px)";
				return this
			};
			_.prototype._setTransition = function() {
				this.panel.style[f + "transition"] = this.panel.style.transition = f + "transform " + this._duration + "ms " + this._easing;
				return this
			};
			_.prototype._initTouchEvents = function() {
				var t = this;
				this._onScrollFn = i(a, "scroll", function() {
					if(!t._moved) {
						clearTimeout(s);
						r = true;
						s = setTimeout(function() {
							r = false
						}, 250)
					}
				});
				this._preventMove = function(e) {
					if(t._moved) {
						e.preventDefault()
					}
				};
				a.addEventListener(h.move, this._preventMove);
				this._resetTouchFn = function(e) {
					if(typeof e.touches === "undefined") {
						return
					}
					t._moved = false;
					t._opening = false;
					t._startOffsetX = e.touches[0].pageX;
					t._preventOpen = !t._touch || !t.isOpen() && t.menu.clientWidth !== 0
				};
				this.panel.addEventListener(h.start, this._resetTouchFn);
				this._onTouchCancelFn = function() {
					t._moved = false;
					t._opening = false
				};
				this.panel.addEventListener("touchcancel", this._onTouchCancelFn);
				this._onTouchEndFn = function() {
					if(t._moved) {
						t.emit("translateend");
						t._opening && Math.abs(t._currentOffsetX) > t._tolerance ? t.open() : t.close()
					}
					t._moved = false
				};
				this.panel.addEventListener(h.end, this._onTouchEndFn);
				this._onTouchMoveFn = function(e) {
					if(r || t._preventOpen || typeof e.touches === "undefined" || d(e.target)) {
						return
					}
					var n = e.touches[0].clientX - t._startOffsetX;
					var i = t._currentOffsetX = n;
					if(Math.abs(i) > t._padding) {
						return
					}
					if(Math.abs(n) > 20) {
						t._opening = true;
						var o = n * t._orientation;
						if(t._opened && o > 0 || !t._opened && o < 0) {
							return
						}
						if(!t._moved) {
							t.emit("translatestart")
						}
						if(o <= 0) {
							i = n + t._padding * t._orientation;
							t._opening = false
						}
						if(!(t._moved && u.classList.contains("slideout-open"))) {
							u.classList.add("slideout-open")
						}
						t.panel.style[f + "transform"] = t.panel.style.transform = "translateX(" + i + "px)";
						t.emit("translate", i);
						t._moved = true
					}
				};
				this.panel.addEventListener(h.move, this._onTouchMoveFn);
				return this
			};
			_.prototype.enableTouch = function() {
				this._touch = true;
				return this
			};
			_.prototype.disableTouch = function() {
				this._touch = false;
				return this
			};
			_.prototype.destroy = function() {
				this.close();
				a.removeEventListener(h.move, this._preventMove);
				this.panel.removeEventListener(h.start, this._resetTouchFn);
				this.panel.removeEventListener("touchcancel", this._onTouchCancelFn);
				this.panel.removeEventListener(h.end, this._onTouchEndFn);
				this.panel.removeEventListener(h.move, this._onTouchMoveFn);
				a.removeEventListener("scroll", this._onScrollFn);
				this.open = this.close = function() {};
				return this
			};
			e.exports = _
		}, {
			decouple: 2,
			emitter: 3
		}],
		2: [function(t, e, n) {
			"use strict";
			var i = function() {
				return window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(t) {
					window.setTimeout(t, 1e3 / 60)
				}
			}();

			function o(t, e, n) {
				var o, s = false;

				function r(t) {
					o = t;
					a()
				}

				function a() {
					if(!s) {
						i(u);
						s = true
					}
				}

				function u() {
					n.call(t, o);
					s = false
				}
				t.addEventListener(e, r, false);
				return r
			}
			e.exports = o
		}, {}],
		3: [function(t, e, n) {
			"use strict";
			var i = function(t, e) {
				if(!(t instanceof e)) {
					throw new TypeError("Cannot call a class as a function")
				}
			};
			n.__esModule = true;
			var o = function() {
				function t() {
					i(this, t)
				}
				t.prototype.on = function e(t, n) {
					this._eventCollection = this._eventCollection || {};
					this._eventCollection[t] = this._eventCollection[t] || [];
					this._eventCollection[t].push(n);
					return this
				};
				t.prototype.once = function n(t, e) {
					var n = this;

					function i() {
						n.off(t, i);
						e.apply(this, arguments)
					}
					i.listener = e;
					this.on(t, i);
					return this
				};
				t.prototype.off = function o(t, e) {
					var n = undefined;
					if(!this._eventCollection || !(n = this._eventCollection[t])) {
						return this
					}
					n.forEach(function(t, i) {
						if(t === e || t.listener === e) {
							n.splice(i, 1)
						}
					});
					if(n.length === 0) {
						delete this._eventCollection[t]
					}
					return this
				};
				t.prototype.emit = function s(t) {
					var e = this;
					for(var n = arguments.length, i = Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++) {
						i[o - 1] = arguments[o]
					}
					var s = undefined;
					if(!this._eventCollection || !(s = this._eventCollection[t])) {
						return this
					}
					s = s.slice(0);
					s.forEach(function(t) {
						return t.apply(e, i)
					});
					return this
				};
				return t
			}();
			n["default"] = o;
			e.exports = n["default"]
		}, {}]
	}, {}, [1])(1)
});