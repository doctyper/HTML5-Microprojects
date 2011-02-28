/*
Class: iOS
	Scoped to the iOS Global Namespace
*/
var iOS = window.iOS || {};

/*
Namespace: iOS.vars
	Shared global variables
*/
iOS.vars = {};

/*
Namespace: iOS.utils
	Shared global utilities
*/
iOS.utils = {
	createClassName : function() {
		return [iOS.vars.namespace, Array.prototype.slice.call(arguments).join("-")].join("-");
	},

	/*
	Property: addClass
		Adds class name to element

	Parameters:
		elClass - the class to add.
	*/
	addClass : function(el, elClass) {
		var curr = el.className;
		if (!new RegExp(("(^|\\s)" + elClass + "(\\s|$)"), "i").test(curr)) {
			el.className = curr + ((curr.length > 0) ? " " : "") + elClass;
		}
		return el;
	},

	/*
	Property: removeClass
	 	Removes class name to element

	Parameters:
		elClass - _(optional)_ the class to remove.
	*/
	removeClass : function(el, elClass) {
		if (elClass) {
			var classReg = new RegExp(("(^|\\s)" + elClass + "(\\s|$)"), "i");
			el.className = el.className.replace(classReg, function(e) {
				var value = "";
				if (new RegExp("^\\s+.*\\s+$").test(e)) {
					value = e.replace(/(\s+).+/, "$1");
				}
				return value;
			}).replace(/^\s+|\s+$/g, "");

			if (el.getAttribute("class") === "") {
				el.removeAttribute("class");
			}
		} else {
			el.className = "";
			el.removeAttribute("class");
		}
		return el;
	},

	/*
	Property: hasClass
	 	Tests if element has class

	Parameters:
		elClass - the class to test.
	*/
	hasClass : function(el, elClass) {
		return new RegExp(("(^|\\s)" + elClass + "(\\s|$)"), "i").test(el.className);
	},

	/*
	Property: toggleClass
	 	Toggles a class on/off

	Parameters:
		elClass - the class to toggle.
	*/
	toggleClass : function(el, elClass) {
		this.hasClass(el, elClass) ? this.removeClass(el, elClass) : this.addClass(el, elClass);
		return el;
	},

	addListener : function(node, type, handler) {
		if (typeof type === typeof {} && !handler) {
			for (var key in type) {
				this.attachEvent(node, key, type[key]);
			}
		} else if (type && handler) {
			this.attachEvent(node, type, handler);
		}
	},

	attachEvent : function(node, type, handler) {
		switch (type) {
			case "tap" :
			return this.addTapListener(node, handler);

			case "touchstart" :
			return this.addTouchStartListener(node, handler);

			case "touchmove" :
			return this.addTouchMoveListener(node, handler);

			case "touchend" :
			return this.addTouchEndListener(node, handler);

			default :
			return node.addEventListener(type, handler, false);
		}

		return false;
	},

	fireEvent : function(node, type) {
		var hasTouchSupport = "createTouch" in document;

		if (type === "tap") {
			type = iOS.vars.touchend;
		}

		var EventType = (hasTouchSupport && (/touch/).test(type) ? "TouchEvents" : "MouseEvents");
		var event = document.createEvent(EventType);
		event.initEvent(type);
		node.dispatchEvent(event);
	},

	addTouchStartListener : function(node, handler) {
		node.addEventListener(iOS.vars.touchstart, handler, false);
	},

	addTouchMoveListener : function(node, handler) {
		var touchstartfired;

		this.addListener(node, "touchstart", function() {
			touchstartfired = true;
		});

		node.addEventListener(iOS.vars.touchmove, function(e) {
			if (touchstartfired) {
				handler.call(node, e);
			}
		}, false);

		this.addListener(node, "touchend", function() {
			touchstartfired = false;
		});
	},

	addTouchEndListener : function(node, handler) {
		node.addEventListener(iOS.vars.touchend, function(e) {
			handler.call(this, e);
		}, false);
	},

	addTapListener : function(node, handler) {
		var touchmovefired = 0;

		this.addListener(node, {
			touchstart : function(e) {
				touchmovefired = 0;
			},
			touchmove : function(e) {
				touchmovefired++;
			},
			touchend : function(e) {
				if (!touchmovefired || touchmovefired < 2) {
					handler.call(this, e);
				}

				touchmovefired = 0;
			}
		});
	},

	touchEvents : function() {
		var hasTouchSupport = "createTouch" in document;

		iOS.vars.touchstart = hasTouchSupport ? "touchstart" : "mousedown";
		iOS.vars.touchmove = hasTouchSupport ? "touchmove" : "mousemove";
		iOS.vars.touchend = hasTouchSupport ? "touchend" : "mouseup";
	}(),

	/*
	sub: setTransform
		Applies a matrix value to the target element
	*/
	setTransform : function(el, matrix) {
		el.style.webkitTransform = matrix;
	},

	/*
	sub: resetTransition
		Resets transition duration to a specific value or zero
	*/
	resetTransition : function(el, duration, timing, delay) {
		duration += (typeof duration === "number") ? "ms" : "";
		timing += (typeof duration === "number") ? "ms" : "";
		delay += (typeof duration === "number") ? "ms" : "";

		el.style.webkitTransitionDuration = duration;
		el.style.webkitTransitionTimingFunction = timing;
		el.style.webkitTransitionDelay = delay;
	},

	/*
	sub: getMatrix
		Returns the target element matrix
	*/
	getMatrix : function(el) {
		var transform = window.getComputedStyle(el, null).webkitTransform,
		    matrix = new WebKitCSSMatrix(transform);

		return matrix;
	},

	hideURLBar : function() {
		var events = ["load", "orientationchange"];
		for (var i = 0, j = events.length; i < j; i++) {
			window.addEventListener(events[i], function() {
				window.setTimeout(window.scrollTo, 100, 0, 0);
			}, false);
		}
	}(),

	preventTouchEvents : function() {
		document.addEventListener("DOMContentLoaded", function() {
			var body = document.body;

			document.addEventListener(iOS.vars.touchmove, function(e) {
				if (body.getAttribute("data-touch-disabled")) {
					e.preventDefault();
				}
			}, false);

			window.addEventListener("scroll", function() {
				if (body.getAttribute("data-touch-disabled")) {
					window.setTimeout(window.scrollTo, 3000, 0, 0);
				}
			}, false);
		}, false);
	}()
};

/*
Namespace: iOS.PageControl
	Under the iOS.PageControl Local Namespace
*/
iOS.PageControl = function (control, options) {
	return this.init(control, options);
};

iOS.PageControl.prototype = {

	/*
	Namespace: iOS.PageControl.vars
		Shared local variables
	*/
	vars : {},

	/*
	Namespace: iOS.PageControl.utils
		Shared local utilities
	*/
	utils : {
		applyOptions : function(options, vars) {
			for (var key in options) {
				vars[key] = options[key];
			}

			return vars;
		},

		getTouchObject : function(e) {
			return e.touches ? e.touches[0] : e;
		},

		getActiveElement : function(list, target) {
			while (target && target.parentNode !== list) {
				target = target.parentNode;
			}

			return target;
		},

		addEventListeners : function(control, list, items, icons) {
			var $self = this;

			var matrix, pMatrix, touch, startX, currX, diffX,
			    startY, currY, diffY, touches, touchMoveEventFired,
			    directionX, oldX, touchEndFired, activeElement,
			    elementWidth, elementThreshold, lockHorizontal;

			iOS.utils.addListener(list, {
				touchstart : function(e) {
					if (!("createTouch" in document)) {
						e.stopPropagation();
						e.preventDefault();
					}

					activeElement = $self.getActiveElement(list, e.target);

					if (!activeElement) {
						return;
					}

					touchEndFired = false;
					lockHorizontal = false;

					currX = null;
					diffX = null;

					currY = null;
					diffY = null;

					touches = 0;

					touch = $self.getTouchObject(e);

					startX = touch.pageX;
					startY = touch.pageY;

					matrix = iOS.utils.getMatrix(list);

					elementWidth = elementWidth || activeElement.offsetWidth;
					elementThreshold = elementThreshold || elementWidth / 12;

					iOS.utils.resetTransition(list, 0);
					iOS.utils.setTransform(list, matrix.translate(0, 0, 0));
				},

				touchmove : function(e) {
					if (!touch || touchEndFired || !activeElement) {
						return;
					}

					touch = $self.getTouchObject(e);

					currX = touch.pageX;
					currY = touch.pageY;

					directionX = (currX > oldX) ? "left" : "right";
					oldX = currX;

					diffX = (currX - startX);
					diffY = (currY - startY);

					if (!lockHorizontal && Math.abs(diffY) > 10) {
						activeElement = null;
						return;
					} else {
						lockHorizontal = true;
						e.preventDefault();
					}

					iOS.utils.setTransform(list, matrix.translate(diffX, 0, 0));
				},

				touchend : function(e) {
					if (!activeElement) {
						return;
					}

					touchEndFired = true;

					var element = activeElement,
					    difference = Math.abs(diffX),
					    getSibling = (difference > elementThreshold);

					if (getSibling) {
						element = $self.findSibling(activeElement, diffX < 0);
					}

					$self.flagActiveItem(element, items, icons);
					$self.animateTo(element, control, list, difference);
				}
			});
			
			$("a", list).each(function (i, link) {
				iOS.utils.addListener(link, {
					click : function(e) {
						e.preventDefault();
					},

					tap : function() {
						window.location.href = this.getAttribute("href");
					}
				});
			});
			
			list.addEventListener("webkitTransitionEnd", $self.roundMatrixValues, false);
		},

		prepForTransforms : function (control) {
			var all = $("*", control);
			
			control.style.webkitTransform = "translate3d(0, 0, 0)";
			
			all.each(function (i, el) {
				el.style.webkitTransform = "translate3d(0, 0, 0)";
			});
		},
		
		sizeToFit : function(control, list, items) {
			var width = 0;
			
			control.style.overflow = "hidden";
			
			items.each(function (i, el) {
				var itemWidth = el.offsetWidth;
				el.style.cssFloat = el.style.styleFloat = "left";
				el.style.width = itemWidth + "px";
				
				width += itemWidth;
			});
			
			list.style.width += width + "px";
		},

		createPageIndicators : function(control, items) {
			var controller = $('<div class="page-indicators"></div>'),
			    icons = [];

			for (var i = 0, j = items.length; i < j; i++) {
				icons.push('<li></li>');
			}

			controller.html('<ul>' + icons.join("") + '</ul>');
			controller.find("li").eq(0).addClass("active");
			// controller.innerHTML = '<ul>' + icons.join("") + '</ul>';
			// iOS.utils.addClass(controller.querySelector("li"), "active");
			// control.appendChild(controller);
			
			$(control).append(controller);

			return $("li", controller);
		},

		findSibling : function(element, next) {
			var sib = element;

			if (next) {
				sib = sib.nextSibling;

				while (sib && sib.nodeType != 1) {
					sib = sib.nextSibling;
				}
			} else {
				sib = sib.previousSibling;

				while (sib && sib.nodeType != 1) {
					sib = sib.previousSibling;
				}
			}

			return sib || element;
		},

		animateTo : function(element, control, list, offset) {
			var matrix = iOS.utils.getMatrix(list),
			    elementOffset = element.getBoundingClientRect().left - control.offsetLeft;

			iOS.utils.resetTransition(list, 350);
			iOS.utils.setTransform(list, matrix.translate(-(elementOffset), 0, 0));
		},

		roundMatrixValues : function(e) {
			if (e.target === this) {
				var matrix = iOS.utils.getMatrix(this);

				for (var key in matrix) {
					if (typeof matrix[key] === "number") {
						matrix[key] = Math.floor(matrix[key]);
					}
				}

				iOS.utils.resetTransition(this, 0);
				iOS.utils.setTransform(this, matrix);
			}
		},

		flagActiveItem : function(element, items, icons) {
			var i, j, index;

			for (i = 0, j = items.length; i < j; i++) {
				if (items[i] === element) {
					index = i;
					break;
				}
			}

			if (icons[index]) {
				for (i = 0, j = icons.length; i < j; i++) {
					iOS.utils.removeClass(icons[i], "active");
				}

				iOS.utils.addClass(icons[index], "active");
			}
		},

		enable : function(control) {
			iOS.utils.addClass(control, "enabled");
		}
	},

	/*
	Function: iOS.PageControl.init
	 	A sample function
	*/
	init : function(control, options) {
		var utils = this.utils,
		    vars = this.vars;
		
		if (control.nodeName) {
			control = $(control);
		}

		if (options) {
			utils.applyOptions(options, vars);
		}

		var list = $("ul", control).eq(0),
		    items = $("*:not(li) > ul > li", control);

		if (items.length < 2) {
			return;
		}

		var icons = utils.createPageIndicators(control, items);

		utils.prepForTransforms(control);
		utils.addEventListeners(control, list, items, icons);
		utils.sizeToFit(control, list, items);
		utils.flagActiveItem(items[0], items, icons);
		utils.enable(control);
	}

};
