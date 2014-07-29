define(['jquery','underscore','backbone'],function($,_,Backbone){
	var Model = Backbone.Model.extend({
		_pins : {},
		_gapHeight:15,
		_gapWidth:15,
		_pinWidth:222,
		_pinHeight:166,
		_containerMinWidth:933,
		_totalCount: 0,
		_loadedCound: 0,
		_pageSize: 15,
		_pageId:0,
		gapHeight: function(){
			return this._gapHeight;
		},
		gapWidth: function(){
			return this._gapWidth;
		},
		pinWidth: function(){
			return this._pinWidth;
		},
		pinHeight: function(){
			return this._pinHeight;
		},
		pageSize: function(){
			return this._pageSize;
		},
		containerWidth: function(width){
			var colNum = 0, containerWidth;
			width = (width>this._containerMinWidth)?width:this._containerMinWidth,
			colNum = parseInt((width + this._gapWidth)/(this._pinWidth+this._gapWidth),10);
			containerWidth = (this._pinWidth+this._gapWidth)*colNum - this._gapWidth;
			this.set("colNum", colNum);
			this.set("containerWidth", containerWidth);
		},
		defaults: function() {
			return {
				pinIds:[],
				colNum: 0,
				containerWidth:0
			};
		},
		initialize: function(options) {
		},
		init: function(data){
			this._totalCount = data.totalCount;
			this._pageId = data.pageId;
			this.cache(data.pins);			
		},
		cache: function(pins){
			var _pinIds = [],
				pinIds = this.get("pinIds"),
				_pins = {};
			_.each(pins, function(pin, key){
				var pinId = pin.id;
				_pins[pinId] = pin;
				_pinIds.push(pinId);
			});
			_.extend(this._pins, _pins);
			this._loadedCound += _pinIds.length;
			this.trigger("appendPinIds", this, _pinIds);
			this.set("pinIds", pinIds.concat(_pinIds));
		},
		canGetMore: function(){
			return this._loadedCound < this._totalCount; 
		},
		getMore: function(callback){
			var _this = this;
			setTimeout(function(){
				_this._pageId = window["moreData"+(_this._pageId+1)].pageId;
				_this.cache(window["moreData"+_this._pageId].pins);
				callback();
			},1000);
		},
		getPin: function(pinId){
			return this._pins[pinId];
		},
		release: function(){
			this._pins = [];
		}
	});
	return Model;
});