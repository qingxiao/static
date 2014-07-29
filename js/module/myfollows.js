/// <summary>
/// 我的关注页面  人物分组
/// </summary>
define([
    'jquery',
    'underscore',
    'model/feed',
    'plugin/dialog',
    'model/user'
    ],
	function ($, _, feedModel, plugin, userModel) {
	    var feed = new feedModel();
	    var iuser = new userModel();
	    /*分组管理*/
	    var feed_group = {
	        events: {
	            onLoadSuccess: function () { },
	            onCloseWindow: function () { },
	            onAddGroup: function () { },
	            onAddGroupSuccess: function () { },
	            onError: function () { },
	            onDelGroupSuccess: function () { }
	        },
	        isInit: false,
	        nowobj: null,
	        follow_group: follow_group,
	        li_html: "<li class='group_edit'>" +
                            "<span class='fr'>" +
                                "<a class='action-btn' action-type='group_edit' group_id='{1}' href='javascript:;'>编辑</a>" +
                                "<a class='action-btn' action-type='group_del' group_id='{1}'  href='javascript:;'>删除</a>" +
                                "<a class='edit-btn' action-type='group_add_submit' group_id='{1}' href='javascript:;'>保存</a>" +
                                "<a class='edit-btn' action-type='group_add_cancel' group_id='{1}'  href='javascript:;'>取消</a>" +
                            "</span>" +
                            "<span class='fl'>" +
                                "<span class='group-name' name='feed_group'>{0}</span><input maxlength='8' group_id='{1}' type='text' name='feed_group_name'>" +
                            "</span>" +
                        "</li>",
	        groupmanager_html: "" +
                "<div class='for'>" +
                    "<p>" +
                        "<span action-type-mouse='group_showinfo'>为什么要设置分组？</span>" +
                    "</p>" +
                    "<ul>" +
                        "<li class='new-item'>" +
                            "<div class='item-info' action-type='group_add'>" +
                                "<span class='fl'>" +
                                    "+创建新分组" +
                                "</span>" +
                            "</div>" +
                            "<div class='item-edit'>" +
                                "<span class='fr'>" +
                                    "<a class='btn-save' action-type='sumbit_group_add' href='javascript:;'>保存</a>" +
                                    "<a action-type='cancel_group_add' href='javascript:;'>取消</a>" +
                                "</span>" +
                                "<span class='fl'>" +
                                    "<input type='text' maxlength='8' id='new_group'>" +
                                "</span>" +
                            "</div>" +
                        "</li>" +
                    "</ul>" +
                "</div>" +
            "<div class='help-info rt'>" +
				"<p>将关注的账号加入分组，可以帮助你更有效率地浏览关注的声音流和新鲜事。</p>" +
				"<span class='arrow'>" +
					"<i></i>" +
				"</span>" +
			"</div>",
	        groupmanager_dialog: null,
	        bind: function () {
	            var _this = this;

	            $("[action-type]").unbind().bind("click", function () {
	                _this[$(this).attr("action-type")].call(_this, this);
	            });
	            $("[action-type-mouse]").unbind().bind("mouseenter", function () {
	                _this[$(this).attr("action-type-mouse")].call(_this, this);
	            });
	            $("li.group_edit").unbind().bind({
	                mouseenter: function () {
	                    $(this).addClass("hover");
	                },
	                mouseleave: function () {
	                    $(this).removeClass("hover");
	                }
	            });
	            $(".feed-group .type-group").unbind().bind({
	                mouseenter: function () {
	                    $(this).addClass("hover");
	                    return false;
	                },
	                mouseleave: function () {
	                    $(this).removeClass("hover");
	                    return false;
	                }
	            });

	        },
	        init: function () {
	            var _this = this;

	            //if (!_this.isInit) {
	            _this.isInit = true;
	            feed_group_mini.init();
	            follow_group.init();
	            feed_search.init();
	            $(".feed-group .type-group .type-name").unbind().bind("click", function () {
	                _this.doManagerGroup();
	            });
	            this.follow_group = follow_group;
	            $("[listitem]").unbind();
	            //qunit.init(_this);
	            //}
	        },
	        group_showinfo: function (obj) {
	            var el = this.groupmanager_dialog.getEl().find(".help-info");

	            el.show();
	            $(obj).bind("mouseout", function () {
	                el.hide();
	                $(this).unbind("mouseout");
	            });
	        },
	        /*编辑分组*/
	        group_edit: function (obj) {
	            var li = $(obj).closest("li"),
                    span = li.find(".fl span"),
	                input = li.find(".fl input");
	            if (this.nowobj) {
	                this.group_add_cancel();
	            }
	            this.nowobj = obj;
	            li.addClass("edit");
	            input.val(span.text());
	            span.attr("oldtxt", span.text()).text("");
	        },
	        /*提交编辑分组*/
	        group_add_submit: function (obj) {
	            var li = $(this.nowobj).closest("li"),
                    span = li.find(".fl span"),
	                input = li.find(".fl input"),
	                title = input.val(),
                    group_id = $(obj).attr("group_id");

	            if (title != "" && group_id) {
	                feed.editGroup({
	                    success: function () {
	                        li.removeClass("edit");
	                        span.removeAttr("oldtxt").text(title);
	                    },
	                    error: function () { },
	                    data: {
	                        title: title
	                    },
	                    id: group_id
	                });
	            }
	        },
	        /*取消编辑分组*/
	        group_add_cancel: function () {
	            var li = $(this.nowobj).closest("li"),
                    span = li.find(".fl span");

	            li.removeClass("edit");
	            span.text(span.attr("oldtxt"));
	            span.removeAttr("oldtxt");
	        },
	        /*删除分组*/
	        group_del: function (obj) {
	            var li = $(obj).closest("li");
	            var group_id = $(obj).attr("group_id");
	            var _this = this;

	            plugin.confirm("真的要删除分组？", {
	                callback: function () {
	                    if (group_id) {
	                        feed.deleteGroup({
	                            success: function (data) {
	                                li.remove();
	                                _this.groupmanager_dialog.setPosition();
	                                _this.events.onDelGroupSuccess(data);
	                                plugin.success("删除成功");
	                            },
	                            error: function (data) {
	                                plugin.alert(data.msg);
	                                _this.events.onError();
	                            },
	                            id: group_id
	                        });
	                    }
	                }
	            });
	        },
	        /*添加分组*/
	        group_add: function (obj) {
	            if (this.nowobj) {
	                this.group_add_cancel();
	            }
	            this.nowobj = obj;
	            $(obj).closest("li").addClass("hover edit");
	            this.events.onAddGroup();
	        },
	        /*取消添加分组*/
	        cancel_group_add: function () {
	            $("#new_group").val('');
	            $(this.nowobj).closest("li").removeClass("hover edit");
	            this.groupmanager_dialog.setPosition();
	        },
	        /*添加分组提交*/
	        sumbit_group_add: function (obj) {
	            var title = $("#new_group").val();
	            var _this = this;

	            if (title != "") {
	                feed.createGroup({
	                    success: function (data) {
	                        if (data.id) {
	                            var li = $(_this.li_html.format("", data.id));
	                            li.find("span[name='feed_group']").text(title);
	                            $(obj).closest("li").before(li);
	                            _this.cancel_group_add();
	                            _this.events.onAddGroupSuccess(data);
	                            _this.bind();
	                        }
	                        else {
	                            plugin.alert(data.msg);
	                        }
	                    },
	                    error: function () {
	                        _this.events.onError();
	                    },
	                    data: {
	                        title: title
	                    }
	                });
	            }
	        },
	        /*分组管理按钮*/
	        doManagerGroup: function () {
	            var _this = this;
	            var op = {
	                dialogClass: "gPopup grouping",
	                caption: "管理分组",
	                content: _this.groupmanager_html,
	                width: 400,
	                overlayerConfig: {
	                    clickClose: false,
	                    opacity: 0.1
	                },
	                fixed: false
	            };
	            _this.groupmanager_dialog = new plugin.Dialog(op);
	            _this.groupmanager_dialog.open();
	            var el = _this.groupmanager_dialog.getEl();
	            el.find(".choose").click(function () {
	                _this.doClose();
	                //_this.groupmanager_dialog.remove();
	            });
	            var li = el.find("li.new-item"), newli;
	            feed.getGroup({
	                success: function (data) {
	                    //	                    li.before(_this.li_html.format("必听组", -1));
	                    for (var i = 0; i < data.length; i++) {
	                        newli = $(_this.li_html.format("", data[i].id));
	                        newli.find("span[name='feed_group']").text(decodeURIComponent(data[i].title));
	                        li.before(newli);
	                    }
	                    _this.events.onLoadSuccess(data);
	                    _this.groupmanager_dialog.setPosition();
	                    _this.bind();
	                },
	                error: function () {
	                    _this.events.onError();
	                }
	            });
	        },
	        doClose: function () {
	            this.groupmanager_dialog.close();
	            this.events.onCloseWindow();
	        }
	    };
	    /*关注后的分组*/
	    var follow_group = {
	        nowobj: null,
	        uid: 0,
	        groupmanager_dialog: null,
	        selectgroup: [],
	        selectgrouptext: [],
	        is_auto_push: false,
	        li_html: "<li><label for=''>" +
                                    "<input type='checkbox' action-type-follow='group_select' value='{1}' name='group_id'>" +
                                    "&nbsp;&nbsp;<span name='follow_group'>{0}</span>" +
                                "</label>" +
                            "</li>",
	        groupmanager_html: "" +
                    "<div class='for'>" +
                        "<p>" +
                            "<span>为<span class='feed_nickname'>XXX</span>设置分组</span>" +
	                                    "<span class='help1' style='font-weight:bold;'>           为什么要设置分组？</span>" +
                        "</p>" +
                        "<ul>" +
                            "<li class='new-item'>" +
                                "<div class='item-info' action-type-follow='group_add'>" +
                                    "<span class='fl'>" +
                                        "+创建新分组" +
                                    "</span>" +
                                "</div>" +
                                "<div class='item-edit'>" +
                                    "<span class='fr'>" +
                                        "<a class='btn-save' action-type-follow='sumbit_group_add' href='javascript:;'>保存</a>" +
                                        "<a action-type-follow='cancel_group_add' href='javascript:;'>取消</a>" +
                                    "</span>" +
                                    "<span class='fl'>" +
                                        "<input type='text' maxlength='8' id='new_feed_group' />" +
                                    "</span>" +
                                "</div>" +
                            "</li>" +
                        "</ul>" +
                        "<div class='btnPanel'>" +
                            "<div class='fr'>" +
                                "<a href='javascript:;' action-type-follow='doFollowGroup' class='a_btn'>确认</a>" +
                                "<a href='javascript:;' action-type-follow='doClose' class='a_cancel'>取消</a>" +
                            "</div>" +
                        "</div>" +
                    "</div>" +
                "<div class='help-info rt'><p>把最想听的加入必听组，可以在手机客户端实时收到更新通知喔！</p><span class='arrow'><i></i></span></div>",
	        bind: function () {
	            var _this = this;

	            $("[action-type-follow]").unbind().bind("click", function () {
	                _this[$(this).attr("action-type-follow")].call(_this, this);
	            });
	        },
	        init: function () {

	        },
	        /*关注后添加分组*/
	        doShowFollowGroup: function (uid) {
	            var _this = this;
	            var op = {
	                dialogClass: "gPopup attention-success",
	                caption: "关注成功",
	                content: _this.groupmanager_html,
	                width: 400,
	                overlayerConfig: {
	                    clickClose: false,
	                    opacity: 0.1
	                },
	                fixed: false
	            };
	            iuser.getById(uid, function (user) {
	                _this.groupmanager_dialog = new plugin.Dialog(op);
	                _this.groupmanager_dialog.open();
	                var el = _this.groupmanager_dialog.getEl();
	                el.find(".choose").click(function () {
	                    _this.doClose();
	                });
	                el.find(".feed_nickname").text(user.nickname).css({ 'font-weight': 'bold', 'color': '#4694a9' });

	                var li = el.find("li.new-item"), newli;
	                _this.uid = uid;
	                feed.getGroup({
	                    success: function (data) {
	                        //加入特别关注不仅可以分组查看，还会在手机客户端收到实时更新推送
	                        li.before(_this.li_html.format("必听组 <u class='help'></u>", -1));
	                        for (var i = 0; i < data.length; i++) {
	                            newli = $(_this.li_html.format("", data[i].id));
	                            newli.find("span[name='follow_group']").text(decodeURIComponent(data[i].title));
	                            li.before(newli);
	                        }
	                        _this.groupmanager_dialog.setPosition();
	                        el.find(".help").bind("mouseover", function () {
	                            el.find(".help-info").show().removeClass("tip");
	                            el.find(".help-info p").text("把最想听的加入必听组，可以在手机客户端实时收到更新通知喔！");
	                        }).bind("mouseout", function () {
	                            el.find(".help-info").hide();
	                        });
	                        el.find(".help1").bind("mouseover", function () {
	                            el.find(".help-info").show().addClass("tip");
	                            el.find(".help-info p").text("将关注的账号加入分组，可以帮助你更有效率地浏览关注的声音流和新鲜事！");
	                        }).bind("mouseout", function () {
	                            el.find(".help-info").hide();
	                        });
	                        _this.bind();
	                    },
	                    error: function () { }
	                });
	            }, {});
	        },
	        group_select: function (obj) {
	            var val = $(obj).val();
	            var text = $(obj).parent().text();
	            var index_val = $.inArray(val, this.selectgroup);
	            var index_text = $.inArray(text, this.selectgrouptext);

	            if (val == -1) {
	                this.is_auto_push = ($(obj).attr("checked") == "checked");
	                return;
	            }
	            if ($(obj).attr("checked")) {
	                this.selectgroup.push(val);
	                this.selectgrouptext.push(text);
	            } else {
	                if (index_val >= 0) {
	                    this.selectgroup.splice(index_val, 1);
	                }
	                if (index_text >= 0) {
	                    this.selectgrouptext.splice(index_text, 1);
	                }
	            }
	        },
	        doFollowGroup: function (obj) {
	            var _this = this;

	            if (_this.uid) {
	                if (_this.selectgroup.length == 0 && _this.is_auto_push == false) {
	                    _this.doClose();
	                    return;
	                }
	                feed.followGroups({
	                    success: function (data) {
	                        if (data.groups != undefined) {
	                            if (data.error) {
	                                plugin.alert(data["error"]);
	                                return;
	                            }
	                            plugin.alert("设置成功!");
	                            _this.doClose();
	                        }
	                        else {
	                            plugin.alert(data["error"]);
	                        }
	                    },
	                    error: function () { },
	                    data: {
	                        "following_uid": _this.uid,
	                        "following_group_ids[]": _this.selectgroup,
	                        "is_auto_push": _this.is_auto_push
	                    }
	                });
	            }
	        },
	        /*取消添加分组*/
	        cancel_group_add: function () {
	            $("#new_feed_group").val('');
	            $(this.nowobj).closest("li").removeClass("edit");
	        },
	        /*添加分组提交*/
	        sumbit_group_add: function (obj) {
	            var title = $("#new_feed_group").val();
	            var _this = this;

	            if (title != "") {
	                feed.createGroup({
	                    success: function (data) {
	                        if (data.id) {
	                            var li = $(_this.li_html.format("", data.id));
	                            li.find("span[name='follow_group']").text(title);
	                            $(obj).closest("li").before(li);
	                            _this.cancel_group_add();
	                            _this.groupmanager_dialog.setPosition();
	                            _this.bind();
	                        }
	                        else {
	                            plugin.alert(data.msg);
	                        }
	                    },
	                    error: function () {
	                        plugin.alert("error");
	                    },
	                    data: {
	                        title: title
	                    }
	                });
	            }
	        },
	        /*添加分组*/
	        group_add: function (obj) {
	            this.nowobj = obj;
	            $(obj).closest("li").addClass("edit");
	        },
	        doClose: function () {
	            if (this.groupmanager_dialog) {
	                this.groupmanager_dialog.close();
	                this.groupmanager_dialog = null;
	                this.selectgroup = [];
	                this.selectgrouptext = [];
	                this.uid = 0;
	            }
	        }
	    };
	    /*修改分组*/
	    var feed_group_mini = {
	        isInit: false,
	        hidetimeid: 0,
	        hidetime: 200,
	        nowobj: null,
	        is_auto_push: false,
	        old_is_auto_push: false,
	        texts: [],
	        vals: [],
	        old_texts: [],
	        old_vals: [],
	        callback: null,
	        group_container: null,
	        li_html: "<li><label for=''><input type='checkbox' value='{1}' name='gid' action-type-mini='select'><span name='feed_group_mini'>{0}</span></label></li> ",
	        group_html: "<div class='feed_group_mini' style='position:absolute; z-index:10000;'><a class='type-name'>" +
                  "<em>未分组</em>" +
                  "<u class='arrow'></u>" +
                  "</a>" +
	        	  "<div class='list-group' >" +
                  "<ul>" +
                    "<li class='new-item'>" +
                      "<div class='item-info' action-type-mini='addGroup'>" +
                        "+创建新分组" +
                      "</div>" +
                      "<dl class='item-edit'>" +
                        "<dd>" +
                          "<input type='text' name='new_troup' maxlength='8' /></dd>" +
                        "<dd>" +
                          "<a class='btn-save' href='javascript:;' action-type-mini='submit'>保存</a>" +
                          "<a href='javascript:;' action-type-mini='cancel'>取消</a>" +
                        "</dd>" +
                      "</dl>" +
                    "</li>" +
                  "</ul>" +
                "</div></div>",
	        bind: function () {
	            var _this = this;

	            $("[action-type-mini]").unbind().bind("click", function () {
	                _this[$(this).attr("action-type-mini")].call(_this, this);
	            });
	        },
	        init: function () {
	            var _this = this;

	            $('.myfans_unit .type-group .type-name').unbind().bind('click', function () {
	                _this.showGroupInfo(this);
	            });
	        },
	        /* 点击分组信息，弹出层（分组列表） */
	        showGroupInfo: function (obj) {
	            var _this = this;

	            if (_this.nowobj == obj) return;
	            if (_this.nowobj) {
	                _this.hidetime = 0;
	                _this.callback = function () {
	                    _this.showGroupInfoS(obj);
	                    _this.callback = null;
	                };
	            } else {
	                _this.showGroupInfoS(obj);
	            }
	        },
	        showGroupInfoS: function (obj) {
	            var _this = this;

	            _this.group_container = $(obj).closest(".type-group");
	            _this.group_container.closest(".myfans_unit").css({
	                "z-index": 2,
	                "position": "relative"
	            });
	            _this.group_container.closest(".myfans_unit").nextAll().css({
	                "z-index": 1,
	                "position": "relative"
	            });
	            _this.uid = $(obj).attr("uid");
	            _this.is_auto_push = $(obj).attr("is_auto_push");
	            _this.old_is_auto_push = _this.is_auto_push;

	            _this.doInitData({
	                callBack: function () {
	                    _this.nowobj = obj;
	                    $(_this.nowobj).css("width", "auto");
	                    _this.group_container.addClass("hover");
	                    //取得当前下拉列表中的值
	                    _this.currentgids = $(_this.nowobj).attr("fg_ids");
	                    if (_this.currentgids) {
	                        _this.vals = $(_this.nowobj).attr("fg_ids").split(',');
	                        _this.texts = $(_this.nowobj).attr("title").split(",");
	                        _this.old_texts = $(_this.nowobj).attr("fg_ids").split(',');
	                        _this.old_vals = $(_this.nowobj).attr("title").split(",");
	                    }
	                    _this.doInitCheckBox();
	                    //事件
	                    _this.group_container.unbind("mouseleave").unbind("mouseenter");
	                    _this.group_container.bind("mouseleave", function () {
	                        $(obj).trigger("focus");
	                    });
	                    _this.group_container.bind("mouseover", function () {
	                        //$(obj).closest(".myfans_unit").removeClass("hover");
	                        clearTimeout(_this.hidetimeid);
	                        $(obj).trigger("blur");
	                        clearTimeout(_this.hidetimeid);
	                    });
	                    $(obj).bind("focus", function () {
	                        clearTimeout(_this.hidetimeid);
	                    });
	                    $(obj).bind("blur", function () {
	                        _this.hidetimeid = setTimeout(function () {
	                            _this.doBlur();
	                        }, _this.hidetime);
	                    }).focus();
	                }
	            });
	        },
	        doInitCheckBox: function () {
	            var _this = this;

	            //初始化checkbox
	            _this.group_container.find("input[name='gid']").each(function () {
	                $(this).removeAttr("checked");
	                if ($(this).val() == -1 && _this.is_auto_push == "true") {
	                    $(this).attr("checked", "checked");
	                }
	                if (jQuery.inArray($(this).val(), _this.vals) >= 0) {
	                    $(this).attr("checked", "checked");
	                }
	            });
	            _this.select();
	        },
	        doInitData: function (options) {
	            var _this = this;
	            var li = _this.group_container.find("li.new-item"), newli;

	            _this.group_container.find("ul li").not(".new-item").remove();
	            feed.isFetched = false;
	            feed.getGroup({
	                success: function (data) {
	                    li.before(_this.li_html.format("必听组", -1));
	                    for (var i = 0; i < data.length; i++) {
	                        newli = $(_this.li_html.format("", data[i].id));
	                        newli.find("span[name='feed_group_mini']").text(decodeURIComponent(data[i].title));
	                        li.before(newli);
	                    }
	                    _this.bind();
	                    options.callBack();
	                },
	                error: function () { }
	            });
	        },
	        doRollBack: function () {
	            this.texts = this.old_texts;
	            this.vals = this.old_vals;
	            this.is_auto_push = this.old_is_auto_push;
	            this.doInitCheckBox();
	        },
	        //下拉框消失
	        doBlur: function () {
	            var _this = this;

	            _this.hidetime = 200;
	            feed.followGroups({
	                success: function (data) {
	                    if (data.groups != undefined) {
	                        if (data.error) {
	                            //_this.doRollBack();
	                            _this.group_container.find("input[type='checkbox'][value=-1]").click();
	                            _this.select();
	                            plugin.alert(data["error"]);
	                            //return;
	                        }
	                        $(_this.nowobj).find("em").text(data.groups);
	                        _this.old_texts = [];
	                        _this.old_vals = [];
	                    }
	                    else {
	                        _this.doRollBack();
	                        plugin.alert(data["error"]);
	                    }
	                    _this.doClose();
	                },
	                error: function () {
	                    _this.doClose();
	                },
	                data: {
	                    "following_uid": _this.uid,
	                    "following_group_ids[]": _this.vals,
	                    "is_auto_push": _this.is_auto_push == undefined ? false : _this.is_auto_push
	                }
	            });
	        },
	        doClose: function () {
	            var _this = this;
	            _this.texts = [];
	            _this.vals = [];
	            _this.group_container.removeClass("hover");
	            _this.cancel();
	            _this.hidetime = 200;
	            _this.uid = 0;
	            $(_this.nowobj).attr("is_auto_push", _this.is_auto_push);
	            _this.is_auto_push = false;
	            $(_this.nowobj).unbind("blur").unbind("focus");
	            $(_this.nowobj).css("width", "auto");
	            _this.nowobj = null;
	            if (_this.callback) {
	                _this.callback();
	            }
	        },
	        /* 选择分组信息后触发 */
	        select: function (obj) {
	            var objtext = ""; //= $(obj).parent().text();
	            var objval = ""; //= $(obj).val();
	            var _this = this;

	            if (_this.uid) {//&& obj && objval
	                _this.texts = [];
	                _this.vals = [];
	                _this.is_auto_push = false;
	                $(_this.group_container).find("input[name='gid']").each(function () {
	                    if ($(this).attr("checked")) {
	                        objtext = $(this).parent().text();
	                        objval = $(this).val();
	                        _this.texts.push(objtext);
	                        _this.vals.push(objval);
	                        if (objval == -1) {
	                            _this.is_auto_push = true;
	                        }
	                    }
	                });
	                _this.doCheckWord();
	            } else {
	                _this.doCheckWord();
	            }
	        },
	        doCheckWord: function () {
	            var _this = this;
	            var isover = false;
	            var text = "";

	            //字数判定
	            if (_this.texts.length > 0) {
	                for (var i = 0; i < _this.texts.length; i++) {
	                    if (_this.texts[i].length + text.length + (i > 0 ? 1 : 0) <= 8 && !isover) {
	                        if (i > 0) text += ",";
	                        text += _this.texts[i];
	                    }
	                    else {
	                        isover = true;
	                    }
	                }
	                $(_this.nowobj).attr("fg_ids", _this.vals.join(","));
	                $(_this.nowobj).attr("title", _this.texts.join(","));
	            } else {
	                $(_this.nowobj).removeAttr("fg_ids");
	                $(_this.nowobj).removeAttr("title");
	                text = "未分组";
	            }
	            $(_this.group_container).find(".type-name em").text(text);
	        },
	        /* 添加新组按钮 */
	        addGroup: function () {
	            this.group_container.find("li.new-item").addClass("edit");
	        },
	        /* 提交新组 */
	        submit: function () {
	            var _this = this;
	            var groupname = this.group_container.find("input[name='new_troup']"), li;
	            var title = groupname.val();

	            if (title) {
	                feed.createGroup({
	                    success: function (data) {
	                        if (data.id) {
	                            li = $(_this.li_html.format("", data.id));
	                            li.find("span[name='feed_group_mini']").text(title);
	                            _this.group_container.find("li.new-item").before(li);
	                            groupname.val("");
	                            _this.cancel();
	                            _this.bind();
	                        }
	                        else {
	                            plugin.alert(data.msg);
	                        }
	                    },
	                    error: function () {
	                        plugin.alert("error");
	                    },
	                    data: {
	                        title: title
	                    }
	                });
	            }
	        },
	        /* 取消新建组别 */
	        cancel: function () {
	            this.group_container.find("li.new-item").removeClass("edit");
	        }
	    };
	    /*修改分组*/
	    var feed_search = {
	        hidetimeid: 0,
	        hidetime: 500,
	        nowobj: null,
	        group_container: null,
	        li_html: "<li><a isid='true' href='javascript:;' group_id='{1}' action-type-search='search' class='feed_search_a'>{0}</a></li> ",
	        group_html: "<div class='list-group' style='position:absolute; z-index:10; width:110px'>" +
                  "<ul>" +
                  "</ul>" +
                "</div>",
	        bind: function () {
	            var _this = this;

	            $("[action-type-search]").off().on({
	                click: function () {
	                    _this[$(this).attr("action-type-search")].call(_this, this);
	                },
	                mouseenter: function () {
	                    $(this).addClass("hover");
	                },
	                mouseleave: function () {
	                    $(this).removeClass("hover");
	                }
	            });
	        },
	        init: function () {
	            var _this = this;

	            $('.feed-group a.a-more').off().on('mouseover', function () {
	                _this.showGroupInfo(this);
	            });
	            _this.group_container = $(_this.group_html);
	            $(document.body).append(_this.group_container);
	            _this.group_container.hide();
	            _this.bind();
	        },
	        search: function (obj) {
	            var group_id = $(obj).attr("group_id");
	            var isid = $(obj).attr("isid");
	            var type = $(obj).attr("type");

	            if (isid && group_id) {
	                this.doBlur();
	                location.hash = "#" + config.CURRENT_USER.uid + "/follow?following_group_id=" + group_id;
	                return;
	            }
	            if (!isid) {
	                this.doBlur();
	                location.hash = "#" + config.CURRENT_USER.uid + "/follow?" + type;
	            }
	            //	            $("[action-type-search].select").removeClass("select");
	            //	            $(obj).addClass("select");
	        },
	        /* 点击分组信息，弹出层（分组列表） */
	        showGroupInfo: function (obj) {
	            var offset = $(obj).parent().offset();
	            var offset1 = $(obj).closest(".avatar_box").offset();
	            var _this = this;

	            if (_this.nowobj) return;
	            _this.doInitData({
	                callBack: function () {
	                    if (_this.nowobj) {
	                        _this.hidetime = 0;
	                        $(_this.nowobj).blur();
	                        _this.nowobj = null;
	                    }
	                    _this.nowobj = obj;
	                    $(_this.nowobj).parent().addClass("show");
	                    //定位
	                    _this.group_container.show().css({
	                        left: offset.left - offset1.left - 1,
	                        top: offset.top - offset1.top + 22
	                    });
	                    $("#feednav div.avatar_box").prepend(_this.group_container);
	                    //事件
	                    _this.group_container.unbind("mouseleave").unbind("mouseenter");
	                    _this.group_container.bind("mouseleave", function () {
	                        $(obj).trigger("mouseleave");
	                    });
	                    _this.group_container.bind("mouseenter", function () {
	                        clearTimeout(_this.hidetimeid);
	                        $(obj).triggerHandler("mouseleave");
	                        clearTimeout(_this.hidetimeid);
	                    });
	                    $(obj).bind("mouseenter", function () {
	                        clearTimeout(_this.hidetimeid);
	                    });
	                    $(obj).bind("mouseleave", function () {
	                        _this.hidetimeid = setTimeout(function () {
	                            _this.doBlur();
	                        }, 500);
	                    });
	                }
	            });
	        },
	        doInitData: function (options) {
	            var _this = this;
	            var li = _this.group_container.find("ul"), newli;

	            _this.group_container.find("li").remove();
	            feed.getGroup({
	                success: function (data) {
	                    if (data.length > 0) {
	                        //li.before(_this.li_html.format("必听组 <u class='help'></u>", -1));
	                        for (var i = 0; i < data.length; i++) {
	                            newli = $(_this.li_html.format("", data[i].id));
	                            newli.find("a.feed_search_a").text(decodeURIComponent(data[i].title));
	                            li.append(newli);
	                        }
	                        _this.bind();
	                        options.callBack();
	                    }
	                },
	                error: function () { }
	            });
	        },
	        //下拉框消失
	        doBlur: function () {
	            var _this = this;

	            _this.group_container.hide();
	            $(_this.nowobj).unbind("mouseleave").unbind("mouseenter");
	            $(_this.nowobj).parent().removeClass("show");
	            _this.nowobj = null;
	            $(document.body).prepend(_this.group_container);
	        }
	    };
	    feed_group.init();

	    return feed_group;
	}
);