/// <summary>
/// timeline模块
/// </summary>
define([
'jquery',
'underscore',
'backbone',
'model/letter',
'plugin/count_char',
'plugin/face',
'module/common/iletter',
'plugin/dialog'],
function ($, _, Backbone, LetterModel, pluginCountChar, pluginFace, iLetter, dialog) {
    var temp = [
        '    <div class="content_wrap_left">',
        '        <div class="picture">',
    //        '            <img alt="<%=nickname%>" src="<%=config.FDFS_PATH + "\/"+(avatar_path)%>">',
'            <img alt="<%=nickname%>" src="<%=avatar_path%>">',
        '        </div>',
        '        <div class="detail">',
        '            <div class="detail_letter">',
        '                <div class="others_letter">',
        '                    <div class="letter_content">',
        '                        <input type="checkbox" value="<%=id%>">',
        '                        <div>',
        '                            <%=content%>',
        '                        </div>',
        '                        <div class="pubdate">刚刚</div>', //<%=helper.getNiceTime(created_at)%>
        '                        <span class="arrow_left"></span>',
        '                    </div>',
        '                </div>',
        '            </div>',
        '        </div>',
        '    </div>',
    ].join('');
    var LetterItem = Backbone.View.extend({
        template: _.template(temp),
        tagName: "li",
        className: "letter_detail_item",
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this.$el;
        }
    });
    var LetterDetail = Backbone.View.extend({
        initialize: function () {
            this.model.on("invalid", function (model, error) {
                dialog.alert(error);
            });
        },
        init: function () {
            this.initBindSend();
            this.initDelALl();
        },
        initDelALl: function () {
            var _this = this;
            var $delALlCon = $(".letter_del_all");
            var $del = $delALlCon.find(".btn_wrap");
            var $canel = $delALlCon.find(".btn_wrap.cancel");
            var $confirm = $delALlCon.find(".btn_wrap.confirm");
            var $messageCount = $("#message_count");

            $del.on("click", function () {
                $(".msg_body").addClass("is-del");
            });
            $canel.off("click").on("click", function () {
                $(".msg_body").removeClass("is-del");
            });
            $confirm.off("click").on("click", function () {
                var that = this;
                var data_options = $.parser.parseOptions(that, [{ lock: "boolean"}]);
                var $checkbox = $(".letter_detail_list").find("input[type='checkbox']:checked");
                var arr = $.makeArray($checkbox);
                var ids = $.map(arr, function (n) {
                    return n.value;
                });
                if (data_options.lock !== true) {
                    if (ids.length) {
                        data_options.lock = true;
                        helper.doChangeOptions($(that), data_options);
                        _this.model.set({ "ids": ids }, { silent: true });
                        _this.model.delArray(function () {
                            dialog.success("删除成功");
                            $messageCount.text($messageCount.text() * 1 - ids.length);
                            $checkbox.closest("li.letter_detail_item").remove();
                            $(".msg_body").removeClass("is-del");
                            data_options.lock = undefined;
                            helper.doChangeOptions($(that), data_options);
                        }, function (model, data) {
                            data_options.lock = undefined;
                            helper.doChangeOptions($(that), data_options);
                            dialog.alert(data["msg"]);
                        });
                    } else {
                        dialog.alert("请至少选择一封私信。");
                    }
                }
            });
        },
        initBindSend: function () {
            var _this = this;
            var $send = $(".letter_send");
            var $submitBtn = $send.find(".submitBtn");
            var $faceBtn = $send.find(".faceBtn");
            var $charCount = $send.find(".charCount");
            var $content = $send.find(".letter_input");
            var $list = $(".letter_detail_list");
            var $messageCount = $("#message_count");

            pluginCountChar($content, $charCount, 300, { text: "还剩<em>{count}</em>字", passText: "超出<em>{count}</em>字" });
            pluginFace.init($faceBtn, $content);
            $submitBtn.on("click", function () {
                var that = this;
                var data_options = $.extend({}, $.parser.parseOptions(that, [{ nickname: "string", lock: "boolean"}]));
                if (!data_options.lock === true) {
                    data_options.lock = true;
                    helper.doChangeOptions($(that), data_options);
                    var pass = $content.attr("pass");
                    _this.model.set({ id: data_options.id, nickname: "000", content: "000" }, { silent: true });
                    if (!pass) pass = 0;
                    _this.model.set({ nickname: data_options.nickname, content: $content.val(), pass: pass });
                    if (_this.model.isValid()) {
                        _this.model.add(function (model, data) {
                            $content.val('');
                            dialog.success("发送成功");
                            data_options.lock = undefined;
                            helper.doChangeOptions($(that), data_options);
                            $messageCount.text($messageCount.text() * 1 + 1);
                            data = $.parseJSON(data.res);
                            data.avatar_path = $(that).closest(".content_wrap_left").find(".picture img").attr("src");
                            var $el = new LetterItem({ model: new Backbone.Model(data) }).render();
                            $list.prepend($el);
                        }, function (model, data) {
                            data_options.lock = undefined;
                            helper.doChangeOptions($(that), data_options);
                            dialog.alert(data["msg"]);
                        });
                    } else {
                        data_options.lock = false;
                        helper.doChangeOptions($(that), data_options);
                    }
                }
            });
        },
        /// <summary>
        /// 释放
        /// </summary>
        release: function () {

        }
    });

    return new LetterDetail({
        model: new LetterModel()
    });
});