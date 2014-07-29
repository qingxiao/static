/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-6-7
 * Time: 上午11:04
 * To change this template use File | Settings | File Templates.
 */


define(['jquery', 'page/page_base', "plugin/dialog", "page/upload/add_voice", "page/upload/information", "page/upload/fileprogress"],
    function ($, PageBase, dialog, addVoice, information) {


        var Page = PageBase.extend({
            init: function (data) {
                this.callParent("init");

               var $editAlbum_none = $(".editAlbum_none");
                if(cont.children().size() == 0){
                    $editAlbum_none.show();
                }else{
                    $editAlbum_none.hide();
                }

            },

            release: function () {
                this.callParent("release");
            }
        });

//todo 需要到dom去获取file信息
        var cont = $(".progressBarContainer");
        cont.bind("beforeCancel", function (evt, callback, fileProgressWrapper) {
            callback = callback || $.noop;
            var fileid = fileProgressWrapper.find(".fileid").val(),
                record_id;

            if (fileid && fileid[0] === "r") {
                record_id = fileid.replace(/\D/g, "");
                if (!record_id) {
                    return true;
                }
            } else {
                return false;
            }
            dialog.confirm("是否要删除这个声音？", function () {
                $.post("/my_tracks/" + record_id + "/destroy", function () {
                    callback();
                });
            });

            return true;
        });
        var item = cont.children();
        var file_list = [];
        var refPram = {
            singleFile: false
        };
        information.init({album:true});
        item.each(function () {
            var _this = $(this);
            var data = _this.find(".fileid").val();
            var server_id = -1;
            if (data) {
                server_id = data.replace(/\D/g, "");
            }
            var file = {
                id: _this.attr("id"),
                name: _this.find(".edit input[type=text]").val() || _this.find("input[name='files[]']").val() ||  "",
                track_data: server_id,
                uploadSuccess: true,
                transcoded: true,
                transcoding: false,
                transcodingError: false,
                isChosen: true,
                uuid: server_id
            };
            file_list.push(file);
            var progress = new FileProgress(file, "progressBarContainer", refPram);
            progress.setProgress(100);
            progress.setStatus("上传完成");
            progress.setTranscodingStatus("转码完成");
            progress.setTranscodingProgress(100);

            progress.toggleCancel(true, null, function (fileid) {
                addFileToDestory(fileid);
                addVoice.cancelFileUpload(fileid);

            });
        });
        addVoice.addFile(file_list);

        var track_destroy = $(".track_destroy");

        function addFileToDestory(fileid) {
            //这个不要了
            return;
            var file = addVoice.findFileByFileid(file_list, fileid);
            if (!file) return;
            var old = track_destroy.val();
            var new_data = (old ? (old + ",") : "") + file.track_data;
            track_destroy.val(new_data);
        }

        addVoice.setAbleUpload(true);

        var $submit_save = $("#submit_save");
        // 提交表单
        $submit_save.click(function () {
            var that = this;
            beforeSubmit(function () {
                information.submitForm(that, "/my_albums");
            });
            return false;
        });

        var submit_timer;

        function beforeSubmit(callback) {
            var returnValue = false;
            if (!information.check()) {
                return false;
            }
            information.holdSubmit(addVoice.check, callback);
        }

        var page = new Page();
        return page;
    });