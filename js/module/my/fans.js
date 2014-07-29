/// <summary>
/// timeline模块
/// </summary>
define([
'jquery',
'underscore',
'backbone',
'model/user',
'module/common/ifollow',
'module/common/iletter',
'module/card'],
function ($, _, Backbone, UserModel, iFollow, iLetter, Card) {
    var MyFans = Backbone.View.extend({
        init: function () {
            iFollow.init();
            iLetter.init();
            Card.render({
                $container: $("#mainbox")
            });
        },
        /// <summary>
        /// 释放
        /// </summary>
        release: function () {
            iFollow.release();
            iLetter.release();
            Card.release();
        }
    });

    return new MyFans({
        model: new UserModel()
    });
});