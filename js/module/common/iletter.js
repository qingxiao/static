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
    var template = [
        '   <dl class="popup_dl">',
		'		<dt>发给</dt>',
		'		<dd><input type="text" value="<%=nickname%>" /></dd>',
		'	</dl>',
		'	<dl class="popup_dl">',
		'		<dt>内容</dt>',
		'		<dd><textarea><%=content%></textarea></dd>',
		'	</dl>',
		'	<div class="popup_btm">',
		'		<div class="fr">',
		'			<span class="charCount">还剩<em>300</em>字</span>',
		'			<a class="faceBtn" href="javascript:;"></a>',
        '			<a class="hidden" dialog-role="close" href="javascript:;"></a>',
		'			<a class="submitBtn" href="javascript:;"><span>发送</span></a>',
		'		</div>',
		'    </div>'
    ].join('');
    var iLetterView = Backbone.View.extend({
        template: _.template(template),
        initialize: function () {
            this.model.on("invalid", function (model, error) {
                dialog.alert(error);
            });
            this.render();
        },
        events: {
            "keyup input[type='text']": "doKeyPress",
            "click input[type='text']": "doKeyPress",
            "blur input[type='text']": "doBlur",
            "click .submitBtn": "doSubmitLetter"
        },
        doBlur: function () {
            setTimeout(function () {
                iLetterbox.$el.hide();
            }, 200);
        },
        doSubmitLetter: function () {
            var _this = this;
            var nickname = _this.$(".popup_dl input").val();
            var content = _this.$(".popup_dl textarea").val();
            var pass = _this.$(".popup_dl textarea").attr("pass");

            if (!pass) pass = 0;
            _this.model.set({ nickname: nickname, content: content, pass: pass });
            if (_this.model.isValid()) {
                _this.undelegateEvents();
                _this.model.add(function () {
                    _this.$("[dialog-role='close']").click();
                    dialog.success("发送成功");
                    _this.delegateEvents(_this.events);
                }, function (model, data) {
                    if (data) {
                        dialog.alert(data["msg"]);
                    }
                    _this.delegateEvents(_this.events);
                });
            }
        },
        doKeyPress: function (e) {
            var $el = $(e.currentTarget);

            switch (e.keyCode) {
                case 13: //enter
                case 38: // up
                case 40: //down
                    iLetterbox.doChangeIndex(e.keyCode, $el);
                    break;
                default:
                    iLetterbox.bind($el);
                    break;
            }

            return false;
        },
        init: function () {
            this.release();
            $(".sendLetterBtn").on("click", [this], this.doSendLetter);
        },
        bind: function ($el) {
            $el.on("click", [this], this.doSendLetter);
        },
        bindDel: function ($el) {
            $el.on("click", [this], this.doDelLetter);
        },
        doSendLetter: function (e) {
            //var $this = $(this);
            var view = e.data[0];
            var data_options = $.extend({}, $.parser.parseOptions(this, [{ nickname: "string"}]));

            view.model.set({ nickname: "", content: "", pass: 0 }, { silent: true });
            if (data_options.nickname) {
                view.model.set("nickname", data_options.nickname);
            }
            view.render();
            view.doShowDialog();
        },
        doDelLetter: function (e) {
            var $this = $(this);
            var view = e.data[0];
            var data_options = $.extend({}, $.parser.parseOptions(this, [{ id: "number"}]));

            if (data_options.id && data_options.lock !== true) {
                data_options["lock"] = true;
                helper.doChangeOptions($this, data_options);
                view.model.set({ id: data_options.id, nickname: "000", content: "000" }, { silent: true });
                view.model.delAll(function () {
                    data_options["lock"] = undefined;
                    helper.doChangeOptions($this, data_options);
                    $this.closest(".msg_notice_item").slideUp();
                }, function (model, data) {
                    data_options["lock"] = undefined;
                    helper.doChangeOptions($this, data_options);
                    dialog.alert(data["msg"]);
                });
            }
        },
        doShowDialog: function () {
            var _this = this, op = $.extend({
                id: "dialog_letter",
                dialogClass: "letter",
                header: "发私信",
                content: _this.$el,
                onYes: function () {
                    return true;
                }
            }, {});
            var pop = new dialog.Dialog(op);
            pop.open();
        },
        render: function () {
            this.$el.empty().html(this.template(this.model.toJSON()));
            pluginCountChar(this.$(".popup_dl textarea"), this.$(".charCount"), 300, { text: "还剩<em>{count}</em>字", passText: "超出<em>{count}</em>字" });
            pluginFace.init(this.$(".faceBtn"), this.$(".popup_dl textarea"));
            this.undelegateEvents();
            this.delegateEvents(this.events);
        },
        release: function () {
            $(".sendLetterBtn").off("click");
            this.$el.empty();
        }
    });

    return new iLetterView({
        model: new LetterModel()
    });
});