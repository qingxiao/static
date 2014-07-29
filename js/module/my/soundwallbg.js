/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-16
 * Time: 下午4:36
 * To change this template use File | Settings | File Templates.
 */
define(["jquery", "underscore", 'backbone', 'module/uploadimg', 'plugin/dialog', 'model/setting', 'plugin/jquery.easydrag'],
    function ($, _, Backbone, UploadImg, dialog, SettingModel) {
        var settingModel = new SettingModel();
        var Background = Backbone.View.extend({
            init: function () {
                this.$el = $(".picWall");
                var $uploadBtn = this.$el.find(".uploadCoverBtn");
                if($uploadBtn.size() == 0){
                    return;
                }
                this.$img = this.$el.find(".cover-image img");
                this.saveData = {
                    uploadTrackId: "",
                    y: 0
                };
                this.bindEvents();
                this.initUploadImg();
                this.copyStatus();
            },
            copyStatus: function () {
                var $img = this.$img;
                this._oldStatus = {
                    src: $img.attr("src"),
                    top: $img.position().top
                };
            },
            initUploadImg: function () {
                var _this = this,
                    $cover_image = this.$el.find(".cover-image");
                new UploadImg({
                    url: "/dtres/picture/upload",
                    $el: _this.$el.find(".uploadCoverBtn"),
                    beforeUpload: function (file) {
                        $cover_image.addClass("loadingMore");
                        _this.$img.attr("src", "");
                    },
                    success: function (data, file) {
                        var uploadTrack = data.data[0].uploadTrack;
                        _this.$img[0].onload  = function(){
                            _this.$img.css("top", 0);
                            _this.saveData.uploadTrackId = uploadTrack.id;
                            _this.startDrag();
                            $cover_image.removeClass("loadingMore");
                            _this.$el.addClass("is-save");
                            _this.$img[0].onload = null;
                        };
                        _this.$img.attr("src", config.FDFS_PATH + "/" + uploadTrack.url);

                    }
                });
            },
            startDrag: function () {
                var $img = this.$img,
                    _this = this;
                $img.ondrag(function (e, el) {
                    $img.css("left", 0);
                    var top = $img.position().top,
                        height = $img.height();
                    if (top > 0) {
                        $img.css("top", 0);
                    }
                    if (top + height < 250) {
                        $img.css("top", 250 - height);
                    }
                });

                $img.easydrag();
            },
            cancelChange: function () {
                var s = this._oldStatus,
                    $img = this.$img;
                $img.attr("src", s.src);
                $img.css("top", s.top);
                this.stopDrag();

            },
            bindEvents: function () {
                var _this = this,
                    $el = this.$el;
                $el.on("click", ".confirmBtn2", function () {
                    _this.saveChange();
                });
                $el.on("click", "#moveImg", function () {
                    _this.startDrag();
                });
                $el.on("click", ".cancelBtn2", function () {
                    _this.cancelChange();
                });
            },
            saveChange: function () {
                var _this = this;
                this.saveData.y = this.$img.position().top;
                settingModel.background(this.saveData, function () {
                    _this.saveData.uploadTrackId = "";
                    dialog.success("保存成功");
                    _this.stopDrag();
                    _this.copyStatus();
                }, function () {

                });
            },
            stopDrag: function () {
                this.$img.dragOff();
                this.$img.css("cursor", "default");
                this.$el.removeClass("is-save");
            },
            release: function () {
                  this.$el.off();
            }
        });
        var bg = new Background();
        return bg;
    });