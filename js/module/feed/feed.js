define([
'jquery',
'underscore',
'backbone',
'model/feed'],
function ($, _, Backbone, feedModel) {
    var feedView = Backbone.View.extend({
        modelLocal: new Backbone.Model({
            appendMoreLocked: false,
            noReadNum: 0,
            onReload: function () { },
            onAppendMore: function () { }
        }),
        modelRead: new feedModel({
            groupID: "0"
        }),
        initialize: function () {
            this.model.on("change:groupID", this.doResetGroupID, this);
//            this.model.on("change:totalSize", this.doResetTotalSize, this);
            this.model.on("change:moreCount", this.doResetFeedCount, this);
            this.model.on("change:feedType", this.doResetFeedType, this);
            this.model.on("change:page", this.doResetFeedPage, this);
        },
        doResetTotalSize: function (model) {
            alert(1);
            var totalSize = model.get("totalSize");
            if (totalSize) {
                
            } else {
                this.modelLocal.set("appendMoreLocked", true);
            }
        },
        /// <summary>
        /// moreCount更改触发事件
        /// </summary>
        /// <param name="model">数据model</param>
        doResetFeedCount: function (model) {
            var _this = this;

            if (_this.model.get("moreCount") == 2) {
                _this.modelLocal.set("appendMoreLocked", true);
                _this.model.getMoreFeed(function () {
                    _this.modelLocal.get("onAppendMore")();
                });
                _this.model.set("moreCount", 0);
            } else if (_this.model.get("moreCount") == 0) {

            } else {
                _this.modelLocal.set("appendMoreLocked", true);
                _this.model.getMoreFeed(function () {
                    _this.modelLocal.get("onAppendMore")();
                    _this.modelLocal.set("appendMoreLocked", false);
                });
            }
        },
        /// <summary>
        /// 计算分页结果和moreCount的次数
        /// </summary>
        doCalcMore: function () {
            if ((this.model.get("page") - 1) * 30 + (this.model.get("moreCount") + 1) * 10 >= this.model.get("totalSize")) {
                this.modelLocal.set("appendMoreLocked", true);
                this.model.set("moreCount", 0);
            }
        },
        /// <summary>
        /// groupID更改触发事件
        /// </summary>
        /// <param name="model">数据model</param>
        doResetGroupID: function (model) {
            var _this = this;

            _this.modelRead.set("groupID", _this.modelLocal.get("groupID"));
            _this.model.set("moreCount", 0, { silent: true });
            _this.model.set("page", 1, { silent: true });
            _this.model.set("timeLine", 0, { silent: true });
            _this.modelLocal.set("appendMoreLocked", true);
            _this.modelLocal.get("onReload")();
            _this.model.getMoreFeed(function () {
                _this.modelLocal.get("onAppendMore")();
                _this.modelLocal.set("appendMoreLocked", false);
            });
        },
        /// <summary>
        /// feedType更改触发事件
        /// </summary>
        /// <param name="model">数据model</param>
        doResetFeedType: function (model) {
            this.doResetGroupID(model);
        },
        /// <summary>
        /// feedPage更改触发事件
        /// </summary>
        /// <param name="model">数据model</param>
        doResetFeedPage: function (model) {
            var _this = this;

            if (_this.model.get("page") == 0) return;
            _this.model.set("moreCount", 0, { silent: true });
            _this.model.set("timeLine", 0, { silent: true });
            _this.modelLocal.set("appendMoreLocked", true);
            _this.modelLocal.get("onReload")();
            _this.model.getMoreFeed(function () {
                _this.modelLocal.get("onAppendMore")();
                _this.modelLocal.set("appendMoreLocked", false);
            });
        },
        release: function () {
            this.model.set({
                groupID: 0,
                feedType: "sound",
                pageSize: 10,
                moreCount: 0,
                page: 1,
                timeLine: 0
            }, { silent: true });
        }
    });

    return new feedView({
        model: new feedModel({
            groupID: 0,
            feedType: "sound",
            pageSize: 10,
            moreCount: 0,
            page: 1,
            timeLine: 0
        })
    });
});