define([
'jquery',
'underscore',
'backbone',
'model/letter',
'plugin/dialog',
'module/common/iletterbox',
'plugin/count_char',
'plugin/face',
'plugin/dialog',
'plugin/jquery.parser'],
function ($, _, Backbone, LetterModel, dialog, iLetterbox, pluginCountChar, pluginFace, dialog) {
    var VerifyView = Backbone.View.extend({
        initialize: function () {
            this.model.on("invalid", function (model, error) {
                dialog.alert(error);
            });
            this.render();
        },
        init: function () {
            this.release();
            $("i.VIcon").on("click", [this], this.gotoVerigy);
            $("span.BVIcon").on("click", [this], this.gotoVerigy);
        },
        gotoVerigy: function (e) {
            location.href = "/verify";
            e.preventDefault();
            return false;
        },
        render: function () {

        },
        release: function () {
            $("i.VIcon").off("click");
            $("span.BVIcon").off("click");
        }
    });

    return new VerifyView({
        model: new Backbone.Model()
    });
});