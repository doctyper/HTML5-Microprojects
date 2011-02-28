/*
File: global.js

About: Version
	1.0

Project: Child Mind Institute

Description:
	A common file that includes all globally shared functionality for APP

Requires:
	- LABjs <http://labjs.com/>
	- jQuery

Requires:
	- <bootstrap.js>
	
*/

/*
Class: APP
	Scoped to the APP Global Namespace
*/
var APP = window.APP || {};

// When the DOM is ready.
(function () {
	
	// Storing a variable to reference
	var $self = APP;
	
	/*
	Namespace: APP.vars
		Shared global variables
	*/
	$self.vars = {
		
		/*
		variable: queue
			Contains the functions ready to be fired on DOM ready
		*/
		queue : [],
		
		FLICKR : {
			URL : "http://www.flickr.com/services/rest/",
			KEY : "046961c920a26ba91d29424cddfb65f7",
			TAGS : ["trees", "flowers", "christmas", "cats", "architecture"],
			SEARCH : "flickr.photos.search",
			EXTRAS : ["tags", "url_s"]
		}
	};
	
	/*
	Namespace: APP.legacy
		A legacy namespace to be used if APP has any legacy dependencies
	*/
	$self.legacy = {};
	
	/*
	Namespace: APP.utils
		Shared global utilities
	*/
	$self.utils = {
		
		/*
		sub: ie6Check
		 	Adds an IE6 flag to jQuery
		*/
		ie6Check : function() {
			// Let's set a flag for IE 6
			$.extend($.browser, {
				ie6 : function () {
					return !!($.browser.msie && $.browser.version == 6);
				}()
			});
		}(),
		
		/*
		sub: queue
		 	A global initializer. Takes a function argument and queues it until <init> is fired
		
		Parameters:
			object - The function to initialize when the DOM is ready
		*/
		queue : function (object) {
			$self.vars.queue.push(object);
		},
		
		/*
		sub: init
		 	When fired, loops through $self.vars.queue and fires each queued function
		*/
		init : function(queue) {
			var object = queue || $self.vars.queue;
			
			$.each(object, function(i, obj) {
				for (var key in obj) {
					if (obj.hasOwnProperty(key) && (typeof obj[key] === "function")) {
						obj[key]();
					}
				}
			});
		},
		
		buildPhotoFilter : function (tags) {
			var filter = $('<ul></ul>').addClass("filter");
			
			$.each(tags, function (i, tag) {
				console.log(tag);
				$('<li><a data-tag="' + tag + '" href="#">' + tag + '</a></li>').appendTo(filter);
			});
			
			$self.utils.addFilterEventListeners(filter, filter.find("a"));
			
			$("section").append(filter);
		},
		
		addFilterEventListeners : function (filter, tags) {
			tags.click(function (e) {
				e.preventDefault();
				$self.utils.findBranchesWithTag($(this).data("tag"));
			});
		},
		
		buildPhotoTree : function (photos) {
			var win = $(window),
			    tree = $('<ul></ul>').addClass("tree"), branch,
			    _interval, i = 0, photo;
			
			$.each(photos, function (i, photo) {
				branch = $('<li><div></div><div></div><div></div><div></div></li>');
			
				branch.attr("id", "i_" + photo.id).data({
					tags : photo.tags,
					id : photo.id,
					background : photo.url_s
				}).css("background-size", "cover").appendTo(tree);
			});
			
			_interval = window.setInterval(function () {
				i = Math.floor(Math.random() * photos.length);
				photo = photos.splice(i, 1)[0];
				
				if (photo) {
					$self.utils.trackLoadTime("i_" + photo.id, photo.url_s);
				} else {
					window.clearInterval(_interval);
				}
			}, 0);
			
			$self.vars.tree = tree;
			$self.vars.branches = tree.find("li");

			$("section").append(tree);
			
			$self.utils.addTreeEventListeners(tree, $self.vars.branches);
		},
		
		positionTree : function () {
			var win = $(window),
			    tree = $self.vars.tree;
			
			tree.css({
				"margin-top" : -((tree.height() - win.height()) / 2),
				"margin-left" : -((tree.width() - win.width()) / 2)
			});
		},
		
		addTreeEventListeners : function (tree, branches) {
			branches.click(function () {
				branches.filter(".active").removeClass("active");
				$(this).addClass("active");
				
				branches.not(this).addClass("inactive").css("-webkit-transform", "");
			});
			
			$(window).resize($self.utils.positionTree).trigger("resize");
		},
		
		trackLoadTime : function (id, url) {
			var img = new Image(), branch;
			img.id = id;
			img.src = url;
			img.onload = function () {
				branch = $("#" + this.id);
				
				branch.css("background", "url(" + branch.data("background") + ") no-repeat center");
				branch.addClass("loaded");
			};
			delete img;
		},
		
		findBranchesWithTag : function (tag) {
			var branches = $self.vars.branches.removeClass("inactive").filter(function () {
				return !(~ $(this).data("tags").indexOf(tag));
			});
			
			console.log(branches, branches.length);
			branches.addClass("inactive");
		}
	};
	
	/*
	Namespace: APP
		Under the APP Local Namespace
	*/
	
	/*
	Function: global
	 	Takes care of a few global functionalities:
		- Fires APP.unqueue
		- Overrides the default jQuery easing
		- Adds the IE BackgroundImageCache fix
	*/
	$self.global = function () {
		var $F = $self.vars.FLICKR;
		
		$self.utils.buildPhotoFilter($F.TAGS);
		
		$.getJSON($F.URL, $.param({
			method : $F.SEARCH,
			format : "json",
			api_key : $F.KEY,
			tags : $F.TAGS.join(","),
			tag_mode : "OR",
			privacy_filter : 1,
			safe_mearch : 1,
			sort : "interestingness-desc",
			content_type : 1,
			per_page : 100,
			jsoncallback : "?",
			nojsoncallback : 1,
			extras : $F.EXTRAS.join(",")
		}), function (data) {
			$self.utils.buildPhotoTree(data.photos.photo);
		});
	};
	
	/*
	Function: header
	 	Encapsulates functionality found in the #header space
	*/
	$self.header = function() {};
	
	/*
	Callback: init
		Sends local functions to a global queuer for initialization See: <APP.utils.queue>
	*/
	$self.utils.queue($self);
	
}).call(APP);