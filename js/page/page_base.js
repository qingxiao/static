/**
 * Created with JetBrains WebStorm. User: xiaoqing Date: 12-11-27 Time: 上午11:44
 * To change this template use File | Settings | File Templates.
 */
//define([ "jquery", "underscore", "backbone", "router", 'module/player/player', 'module/card', 'plugin/common', 'module/common' ], function($, _, Backbone, router, card, player) {
define(["jquery", "underscore", "backbone", "router", 'module/player/player', 'module/card', 'module/default_image', 'module/common/iverify', 'module/common', 'plugin/common', 'module/header_search'],
    function ($, _, Backbone, router, player, card, defaultImage, iverify) {
        var PageBase = Backbone.View.extend({
            el: "#mainbox",
            init: function () {
                router.setPage(this);
                player.init();
                card.render();
                defaultImage.render();
                iverify.init();
                helper.doCheckVersion();
            },
            release: function () {
                player.release();
                card.release();
                defaultImage.release();
                this.unbindEvents();
                if (this.$el) {
                    this.$el.empty();
                }
                iverify.release();
                $("#bdshare_pop").hide();
            },
            render: function () {
            },
            afterRender: function () {
                player.init();
                card.render();
                defaultImage.render();
            },
            bindEvents: function () {
            },
            unbindEvents: function () {
                this.$el.unbind();
                this.$el.undelegate();
            },
            callParent: function (methodName, args) {
                if (!methodName)
                    return false;
                var parentClass = this.constructor.__super__;
                if (!(methodName in parentClass)) {
                    return false;
                }
                return parentClass[methodName].apply(this, args || []);
            }
        });
        return PageBase;
    });
