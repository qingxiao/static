/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-6-4
 * Time: 下午1:50
 * To change this template use File | Settings | File Templates.
 */
define(["jquery", "plugin/dialog", "plugin/zero_clipboard"], function ($, dialog) {
    ZeroClipboard.setMoviePath('/swf/zero_clipboard.swf');
    var share = {
        open: function (track_id, track_uid, callback) {
            this.callback = callback || $.noop;
            this.createPop(track_id, track_uid);
        },
        createPop: function (track_id, track_uid) {
            var pop = this.createPop1(track_id, track_uid);

            pop.open();
        },
        createPop2: function (text) {
            var html =
                '<div class="popup_dl"></div>' +
                    '<div class="popup_dl">' +
                    '<span>地址</span><input type="text" class="j-text-url"><a class="copylinkBtn">复制地址</a>' +
                    '</div>' +
                    '</div>' +
                    '<div class="operate"><a class="confirmBtn" dialog-role="close">确认</a></div>';
            var op = {
                dialogClass: "sharetoFriend",
                header: "复制链接",
                content: html
            };
            var host = window.location.host;
            var flash_path = config.PLAYER_PATH || ("http://" + host + "/js/player" + "_" + host.split(".")[0] + ".swf"),
                flash_url = flash_path + (flash_path.indexOf("?") > 0 ? "&" : "?") + "id=" + 0,
                html_url = '<object type="application/x-shockwave-flash" id="ximalaya_player" data="' + flash_url + '" width="255" height="34"></object>';

            var pop = new dialog.Dialog(op);

            this.pop = pop;
            var $el = pop.getEl();
            $el.find(".j-text-url").val(text);

            $el.find(".copylinkBtn").each(function () {
                var _this = $(this);
                _this.parent().css("position", "relative");
                var clip = new ZeroClipboard.Client();

                var loaded = false;
                clip.addEventListener("load", function () {
                    loaded = true;
                });
                clip.addEventListener("mouseDown", function () {
                    if (!loaded) {
                        return;
                    }
                    var $input = _this.parent().find("input");
                    var val = $input.val();
                    if (!val || _this.hasClass("already")) {
                        return;
                    }
                    clip.setText(val);

                });
                clip.addEventListener("complete", function () {
                    var $input = _this.parent().find("input[type='text']");
                    $input.select();

                    _this.text("复制成功");
                    _this.addClass("already");
                    setTimeout(function () {
                        _this.text("复制地址");
                        _this.removeClass("already");
                        pop.close();
                    }, 1000);
                });
                clip.glue(_this[0], _this.parent()[0], { fontSize: "0", lineHeight: _this.height() });
            });

            return pop;
        },
        createPop1: function (track_id, track_uid, text) {
            var html =
                '<div class="popup_dl"><strong>分享给站外好友：</strong></div>' +
                    '<div class="popup_dl">' +
                    '<span>网页地址</span><input type="text" class="j-track-url"><a class="copylinkBtn">复制地址</a>' +
                    '</div>' +
                    '<div class="popup_dl"><strong>把声音贴到blog或BBS：</strong></div>' +
                    '<div class="popup_dl">' +
                    '<span>flash地址</span><input type="text" class="j-flash-url"><a class="copylinkBtn">复制地址</a>' +
                    '</div>' +
                    '<div class="popup_dl">' +
                    '<span>html地址</span><input type="text"  class="j-html-url"><a class="copylinkBtn">复制地址</a>' +
                    '</div>' +
                    '<div class="operate"><a class="confirmBtn" dialog-role="close">确认</a></div>';
            var op = {
                dialogClass: "sharetoFriend",
                header: "分享给好友",
                content: html
            };
            var host = window.location.host,
                track_url = "http://" + host + "/" + track_uid + "/sound/" + track_id;

            var flash_path = config.PLAYER_PATH || ("http://" + host + "/js/player" + "_" + host.split(".")[0] + ".swf"),
                flash_url = flash_path + (flash_path.indexOf("?") > 0 ? "&" : "?") + "id=" + track_id,
                html_url = '<object type="application/x-shockwave-flash" id="ximalaya_player" data="' + flash_url + '" width="255" height="34"></object>';

            var pop = new dialog.Dialog(op);

            this.pop = pop;
            var $el = pop.getEl();
            $el.find(".j-track-url").val(track_url);
            $el.find(".j-flash-url").val(flash_url);
            $el.find(".j-html-url").val(html_url);
            text = text || "";
            $el.find(".j-text-url").val(text);

            $el.find(".copylinkBtn").each(function () {
                var _this = $(this);
                _this.parent().css("position", "relative");
                var clip = new ZeroClipboard.Client();

                var loaded = false;
                clip.addEventListener("load", function () {
                    loaded = true;
                });
                clip.addEventListener("mouseDown", function () {
                    if (!loaded) {
                        return;
                    }
                    var $input = _this.parent().find("input");
                    var val = $input.val();
                    if (!val || _this.hasClass("already")) {
                        return;
                    }
                    clip.setText(val);

                });
                clip.addEventListener("complete", function () {
                    var $input = _this.parent().find("input[type='text']");
                    $input.select();

                    _this.text("复制成功");
                    _this.addClass("already");
                    setTimeout(function () {
                        _this.text("复制地址");
                        _this.removeClass("already");
                    }, 1000);
                });
                clip.glue(_this[0], _this.parent()[0], { fontSize: "0", lineHeight: _this.height() });
            });

            return pop;
        }
    };
    return share;
});
