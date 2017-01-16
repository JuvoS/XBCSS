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
                default:
                    locationClass = 'xb-popup-top';
                    break;
            }
            self.popupDiv = document.createElement("div");
            self.popupDiv.className = "xb-popup "+locationClass;
            self.popupDiv.innerHTML = '<div class="xb-popup-arrow"></div><div class="xb-popup-content"></div>';
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