define(['jquery','underscore','backbone','plugin/waterfall/model'],function($,_,Backbone,Model){
	var View = Backbone.View.extend({
		pinTemplate: _.template(['<div id="pin<%=id%>" sound_id="<%=id%>" class="waterfall-pin">',
			         				'<div class="PinHolder">',
				    					'<img style="height: <%= imgHeight%>px;" class="PinImageImg" data-componenttype="MODAL_PIN" alt="chunky oversized sweater - fall outfit" src="http://media-cache-lt0.pinterest.com/upload/201043570835712950_jnuXktzc_b.jpg">', 
				    				'</div>',
				    				'<p class="description">chunky oversized sweater - fall outfit</p>',
				    				'<p class="stats colorless">',
				    					'<span class="LikesCount">84 likes</span>',
				    					'<span class="CommentsCount hidden"></span>',
				            			'<span class="RepinsCount">254 repins</span>',
				            		'</p>',
				    				'<div class="convo attribution clearfix">',
				    			        '<img alt="" src="http://media-cache-ec5.pinterest.com/avatars/gracereed_1348458110.jpg">',
				    			        '<p class="NoImage">',
				    			           '<a data-elementtype="PIN_USER" href="/gracereed/">Grace Reed</a> via <a data-elementtype="PIN_REPIN_USER" href="/hannahlouisec/">Hannah Chiasson</a> onto <a data-elementtype="PIN_BOARD_PIN" href="/gracereed/things-that-give-me-a-reality-check-when-i-open-my/">things that give me a reality check when I open my real closet...</a>',
				    			        '</p>',
				    			    '</div>',
				    			'</div>'].join("")),
		colTops:[],
		colLefts:[],
		initCols: function(){
			var model = this.model,
				colNum = model.get("colNum"),
				pinWidth = model.pinWidth(),
				gapWidth = model.gapWidth();
			this.colLefts = [];
			this.colTops = [];
			for(var i=0;i<colNum;i++){
				this.colTops[i] = 0;
				this.colLefts[i] = i*(pinWidth+gapWidth);
			}
		},
		render: function(model){
			var pinIds = model.get("pinIds");
			this.initCols();
			if(pinIds.length){
				this.$el.css({"visibility":"hidden","opacity":0.5});
				this.calculate(model, pinIds);
				this.$el.css("visibility","visible").animate({
				    opacity: 1
				  },200);
			}
		},
		calculate: function(model, pinIds){
			var gapHeight = model.gapHeight(),
				pinHeight = model.pinHeight(),
				colTops = this.colTops,
				colLefts = this.colLefts,
				$box = $('<div class="waterfall-pinsbox" style="opacity:0.5;"></div>');
				
			for(var i=0,len=pinIds.length;i<len;i++){
				var pinId = pinIds[i],
					pin = model.getPin(pinId),
					imgHeight = pin.imgHeight||0,
					minColTop = _.min(colTops),
					index = _.indexOf(colTops, minColTop),
					colLeft = colLefts[index],
					left = colLeft,
					top = minColTop,
					height = pinHeight + imgHeight,
					pinElement = document.getElementById("pin"+pinId);
				colTops[index] = top + height + gapHeight;
				if(pinElement){
					$(pinElement).css({
						left:left+"px",
						top:top+"px"
					});
				}else{
					var pinHtml = this.renderPin(pin);
					$(pinHtml).css({
						left:left+"px",
						top:top+"px"
					}).appendTo($box);					
				}
			}
			if($box.children().size())$box.appendTo(this.$(".waterfall-container")).animate({
			    opacity: 1
			  },200);
			this.$(".waterfall-container").height(_.max(colTops)).html();
		},
		appendPinIds: function(model, pinIds){
			this.calculate(model, pinIds);
		},
		renderPin: function(pin){
			return this.pinTemplate(pin);
		},
		renderContainer: function(model, containerWidth){
			this.$el.width(containerWidth);
		},
		onWindowResize: function(e){
			var view = e.data.view;
			view.model.containerWidth(view.$el.parent().width());			
		},
		windowScrollLocked: false,
		onWindowScroll: function(e){
			var view = e.data.view,
				minColTop = _.min(view.colTops),
				model = view.model,
				$el = view.$el;
			if(view.windowScrollLocked) return;
			if(!model.canGetMore()) return;
			if($(document).scrollTop()+$(window).height()>$el.offset().top+minColTop){
				view.windowScrollLocked = true;
				view.$(".waterfall-loading").show();
				model.getMore(function(){
					view.windowScrollLocked = false;
					view.$(".waterfall-loading").hide();
				});
			}
		},
		initialize: function(options) {
			var onChangePinIds = options.onChangePinIds || $.noop;
			if(options.pinTemplate) this.pinTemplate = options.pinTemplate;
			this.model.on("change:colNum", this.render, this);
			this.model.on("appendPinIds", this.appendPinIds, this);
			this.model.on("change:containerWidth", this.renderContainer, this);
			this.model.on("change:pinIds", onChangePinIds, this);
			var containerWidth = this.$el.width();
			this.model.containerWidth(containerWidth);
			$(window).bind("resize", {view:this}, this.onWindowResize);
			$(window).bind("scroll", {view:this}, this.onWindowScroll);
		},
		release: function(){
			this.model.release();
			$(window).unbind("resize", this.onWindowResize);
			$(window).unbind("scroll", this.onWindowScroll);
		}
	});	

	return View;
});