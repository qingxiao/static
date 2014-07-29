/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-9
 * Time: 下午3:02
 * To change this template use File | Settings | File Templates.
 */

define(["jquery", "plugin/dialog",'helper'], function ($, dialog, helper) {
    var add2album = {
        open: function (options) {
            //source, record_id, track_id, callback
            this.options = options;
            this.getAlbumList();
        },
        getAlbumList: function () {
            var _this = this;
            $.ajax({
                type: "POST",
                url: "/handle_track/album_list",
                dataType: "json",
                data: {
                    source: _this.options.source
                },
                success: function (data) {
                    data = data['response'];
                    _this.createPop(data);
                },
                error:function(){
                    dialog.alert("服务器繁忙,请稍后再试!");
                }
            });
        },
        createPop: function (data) {
            var optionsStr = '',
                _this = this;
            if (data && data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    optionsStr += '<option value="' + data[i]['id'] + '">' + data[i]['title'] + '</option>';
                }
            } else {
                var album_type = {"1": "原创", "2": "采集"};
                optionsStr += '<option value="">你没有' + album_type[this.options.source] + '专辑</option>';
            }

            var html =
                '<div class="popup_dl">' +
                    '<select>'+optionsStr+'</select>' +
                    '</div>' +
                    '<div class="operate"><a href="javascript:;" class="createBtn">创建新专辑</a><a class="confirmBtn" dialog-role="yes">确认</a></div>';
            var op = {
                dialogClass: "addtoalbum",
                header: "添加至专辑",
                content: html,
                onYes:function(){
                    var album_id = _this.$el.find("select").val();
                    _this.joinAlbum(album_id);
                    return false;
                }
            };

            var pop = new dialog.Dialog(op);
            pop.open();
            this.pop = pop;
            this.$el = pop.getEl();
            this.$el.on("click", ".createBtn", function(){
                pop.close();
                createAlbum.open(_this.options);
            });
        },
        joinAlbum:function(album_id){
            var _this = this;
            if(!album_id){
                dialog.alert("您还没有选择专辑");
                return;
            }
            $.ajax({
                type:"POST",
                url:"/handle_track/join_album",
                dataType:"json",
                data:{
                    record_id:_this.options.record_id,
                    album_id:album_id
                },
                success:function (data) {
                    _this.pop.close();
                    if (data["id"] && data["title"]) {
                        _this.options.callback(data);
                    } else {
                        if (data["error"] && data["error"] == "track_destroyed") {
                            dialog.alert("该声音已被原作者删除");
                        }
                        if (data["error"] && data["error"] == "album_full") {
                            dialog.alert("哎呀，你选择的专辑已经塞满啦");
                        }
                    }

                },
                error:function () {
                    dialog.alert("服务器繁忙,请稍后再试!");
                   // _this.pop.close();
                }
            });
        }
    };

    var createAlbum = {
        open: function (options) {
            //source, record_id, track_id, callback
            this.options = options;
            this.createPop();
        },
        createPop: function () {
            var _this = this;
            var html =
                '<div class="popup_dl"><input type="text" placeholder="专辑名称"><a class="add2album" href="javascript:;">选择已有专辑</a></div>' +
                    '<div class="popup_dl"><textarea placeholder="专辑简介"></textarea></div>' +
                    '<div class="operate"><a class="confirmBtn" href="javascript:;" dialog-role="yes">确认</a></div>';
            var op = {
                dialogClass: "createalbum",
                header: "创建新专辑",
                content: html,
                onYes:function(){
                    _this.doCreate();
                    return false;
                }
            };

            var pop = new dialog.Dialog(op);
            pop.open();
            this.pop = pop;
            this.$el = pop.getEl();
            this.$el.on("click", ".add2album", function(){
                add2album.open(_this.options);
                pop.close();

            });
        },
        doCreate:function(){
            var $el = this.$el,
                _this = this,
                album_title = $.trim($el.find("input").val()),
                 album_intro = $.trim($el.find("textarea").val());
            if(!album_title){
                dialog.alert("专辑标题不能为空");
                return;
            }
            if (helper.gblen(album_title)>40) {
                dialog.alert("标题太长，必须小于20个汉字或者40个字母");
                return;
            }
            if (helper.gblen(album_intro)> 600) {
                dialog.alert("简介不能超过300个汉字");
                return;
            }

            $.ajax({
                type:"POST",
                url:"/handle_track/join_album",
                dataType:"json",
                data:{
                    record_id:_this.options.record_id,
                    album_title:album_title,
                    album_intro:album_intro
                },
                success:function (data) {
                    if (data.res) {
                        if (data["id"] && data["title"]) {
                            _this.pop.close();
                           _this.options.callback(data);

                        } else {
                            dialog.alert("添加专辑失败");
                        }
                    } else {
                        var error = data.error;
                        if (error){
                            if(error == 'track_destroyed') {
                                dialog.alert("该声音已被原作者删除");
                             } else{
                                dialog.alert(error);
                            }
                        }else{
                            if(!data.errors){
                                data.alert("不知道什么错误");
                                return;
                            }
                            var errors = data.errors[0];
                            if (errors[0] == "dirty_words") {
                                if (errors[1]["album_intro"] == -11) {
                                    dialog.alert("添加专辑失败，简介包含敏感词");
                                } else if (errors[1]["album_title"] == -11) {
                                    dialog.alert("添加专辑失败，标题包含敏感词");
                                }
                            }
                        }
                    }
                },
                error:function () {
                    dialog.alert("服务器繁忙,请稍后再试!");
                }
            });
        }
    };
    return add2album;
});
