define(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
    var gCounter = 0;
    var Model = Backbone.Model.extend({
        _pins:{},
        _gapHeight:10,
        _gapWidth:10,
        _pinWidth:200,
        _pinHeight:230,
        _containerMinWidth:830,
        _totalCount:0,
        _loadedCound:0,
        _pageSize:15,
        _pageId:0,
        gapHeight:function () {
            return this._gapHeight;
        },
        gapWidth:function () {
            return this._gapWidth;
        },
        pinWidth:function () {
            return this._pinWidth;
        },
        pinHeight:function () {
            return this._pinHeight;
        },
        pageSize:function () {
            return this._pageSize;
        },
        containerWidth:function (width) {
            var colNum = 0, containerWidth;
            width = (width > this._containerMinWidth) ? width : this._containerMinWidth;
            colNum = parseInt((width + this._gapWidth) / (this._pinWidth + this._gapWidth), 10);
            containerWidth = (this._pinWidth + this._gapWidth) * colNum - this._gapWidth;
            this.set("colNum", colNum);
            this.set("containerWidth", containerWidth);
        },
        defaults:function () {
            return {
                pinIds:[],
                colNum:0,
                containerWidth:0
            };
        },
        initialize:function (options) {
        },
        init:function (data) {
            this.data = {
                page:1,
                per_page:20,
                condition:data.condition || "",
                category:data.category,
                tag:data.tag || ""
            };

        },
        cache:function (pins) {
            var _pinIds = [],
                pinIds = this.get("pinIds"),
                _pins = {};
            _.each(pins, function (pin, key) {
                var pinId = pin.id;
                _pins[pinId] = pin;
                _pinIds.push(pinId);
            });
            _.extend(this._pins, _pins);
            this.set("pinIds", pinIds.concat(_pinIds));
            this.trigger("appendPinIds", this, _pinIds);
        },
        canGetMore:function () {
            return this._pageId < this._maxPageId;
        },

        getFirst:function (callback) {
            /* 第一次加载数据的时候 防止上次的数据冲突 */
            callback = callback || $.noop;
            gCounter++;
            this._isFirst = true;
            this.getMore(function () {
                callback();
            });
        },
        getMore:function (callback) {
            callback = callback || $.noop;
            var _this = this;
            _this._pageId = _this.data.page;
            var curCounter = gCounter;
            $.get(this.get("url"), this.data, function (result) {
                _this._maxPageId = result.maxPageId;
                if(_this._isFirst){
                    if(curCounter == gCounter){
                        _this.cache(result.list);
                        callback();
                    }
                }else{
                    _this.cache(result.list);
                    callback();
                }

            });
            _this.data.page++;
        },
        getPin:function (pinId) {
            return this._pins[pinId];
        },
        release:function () {
            this._pins = [];
        }
    });
    return Model;
});