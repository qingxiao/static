/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-23
 * Time: 上午10:24
 * To change this template use File | Settings | File Templates.
 */

define(['jquery', 'plugin/jrecorder', "page/page_base", 'plugin/dialog', "page/upload/handlers"],
    function ($, jrecorder, PageBase, dialog) {

        var swf_path = "/swf/jrecord.swf";

        var Page = PageBase.extend({
            init: function (options) {

                this.options = $.extend({
                    upload_url: "",
                    progress_url: "",
                    transcoding_url: "",
                    checkLogin: function (fn) {
                        fn.call(this);
                    },
                    beforeUpload: function () {
                    },
                    uploadSuccess: function () {
                    },
                    transcodingSuccess: function () {
                    }
                }, options);

                this.initDom();
                this.initRecorder();
                this.page.start.show();
                this.bindEvents();
                this.page.start.find(".playPanel").addClass("loadingMore");
            },
            initDom: function () {
                this.$jRecorderWarp = $("#jRecorderWarp");
                this.$wave_warp = $("#wave_warp");
                this.page = {
                    start: $("#record_start"),
                    process: $("#record_process"),
                    end: $("#record_end")
                };
                this.btns = {
                    recordStart: $('#readyBtn'),
                    recordStop: $('#stopBtn'),
                    playStart: $("#start_play_btn"),
                    playStop: $("#stop_play_btn"),
                    uploadRecord: $('#uploadRe'),
                    cancelRecord: $("#cancelRec")
                };
                var _this = this;
                $("#jRecorder").css({
                    left: _this.btns.recordStart.offset().left,
                    top: _this.btns.recordStart.offset().top,
                    position: "absolute",
                    width: 300,
                    height: 300
                });
            },
            bindEvents: function () {
                var _this = this;
                this.btns.recordStart.click(function () {
                    $.jRecorder.record(3600);
                });
                this.btns.recordStop.click(function () {
                    $.jRecorder.stop();
                });
                this.btns.playStart.click(function () {
                    $.jRecorder.playsound();
                });

                this.btns.playStop.click(function () {
                    $.jRecorder.stopsound();
                });

                this.btns.uploadRecord.click(function () {
                    _this.options.checkLogin(function () {
                        $.jRecorder.sendData("录音", {token: readCookie(config.TOKEN_LABEL), rememberMe: readCookie(config.REMEMBERME_LABEL)});
                        $.jRecorder.stopsound();

                    });

                });
                this.btns.cancelRecord.click(function () {
                    var result = dialog.confirm("是否要放弃这段录音？", function () {
                        window.location.reload();
                    });
                });
            },
            getTime: function (num) {
                /* 70->00:01;10;*/
                num = parseInt(num);
                var h = parseInt(num / 3600),
                    m = parseInt(num % 3600 / 60),
                    s = parseInt(num % 3600 % 60);
                var sw = function (n) {
                    if (n < 10) n = "0" + n;
                    return "" + n;
                };
                return sw(h) + ":" + sw(m) + ":" + sw(s);
            },

            initRecorder: function () {
                var _this = this,
                    count = 0,
                    $wave_warp = this.$wave_warp,
                    wave_warp_width = $wave_warp.width(),
                    $play_bar_prog = $("#playBar").find(".progBar");
                /*
                 * 录音上传配置项
                 * */
                $.jRecorder({
                    host: _this.options.upload_url,
                    rec_left: "",
                    progress_url: _this.options.progress_url,
                    filesSelected: {
                        singleFile: true
                    },
                    callback_started_recording: function () {
                        count = 0;
                        _this.page.process.show();
                        _this.page.start.hide();
                        $wave_warp.html("");
                    },
                    callback_stopped_recording: function (time) {
                        _this.page.end.find("#recordFinishTime").html(_this.getTime(time));
                        _this.page.process.hide();
                        _this.page.end.show();
                    },
                    callback_activityLevel: function (level) {
                        if (level <= 5) level = 5;
                        if (count % 2 == 0) {
                            $wave_warp.append("<div class='t" + (20 - Math.floor(level / 5)) + "'></div>");
                            var children = $wave_warp.children();
                            if (children.length > wave_warp_width) {
                                children.eq(0).remove();
                            }
                        }
                        count += 1;
                    },
                    callback_flash_loaded:function(){
                        _this.page.start.find(".playPanel").removeClass("loadingMore");
                    },
                    callback_activityTime: function (time) {
                        time = parseInt(time);
                        if(time>= 15*60){
                            _this.btns.recordStop.trigger("click");
                            dialog.alert("您录音时间超过了15分钟！");
                        }
                        _this.page.process.find("#recordTime").html(_this.getTime(time));
                    },
                    callback_error_loaded:function(){
                        dialog.alert("录音设备不可用");
                        _this.page.start.find(".playPanel").removeClass("loadingMore");
                    },
                    callback_error_recording: function (error) {
                        alert("recording error ; code:" + error);
                    },
                    callback_finished_sending: function (file, serverData) {
                        this.getStats().successful_uploads = 1;
                        this.getStats().files_queued = 0;
                        file = _this.options.uploadSuccess(file, serverData);
                        uploadSuccess.call(this, file, serverData);
                    },
                    callback_before_sending: function (file) {
                        this.getStats().files_queued = 1;
                        uploadStart.call(this, file);
                        _this.options.beforeUpload(file);
                        _this.page.end.hide();
                    },
                    callback_file_progress: uploadProgress,
                    upload_error_handler: function (file, errorCode, message) {
                        uploadError.call(this, file, errorCode, message);
                        setTimeout(function () {
                            $.jRecorder.sendData();
                        }, this.settings.requeue_on_error_time * 1000);
                    },
                    callback_file_upload_error: function (file, errorCode, message) {
                        this.upload_error_handler(file, errorCode, message);
                    },
                    callback_started_preview: function (start, t) {
                        _this.btns.playStart.hide();
                        _this.btns.playStop.show();

                        this.stoped = false;
                        if (start == 0) {
                            $play_bar_prog.stop().css("width", "0%");
                        }
                        this.callback_playing_time(start, t);
                    },
                    callback_playing_time: function (time, totaltime) {
                        if (totaltime <= 0) totaltime = 1;

                        if (time == totaltime) {
                            if (!this.stop) {
                                return;
                            }
                            $play_bar_prog.stop().width("100%");
                        } else {
                            time++;
                        }
                        var _this = this;
                        $play_bar_prog.stop().animate({width: time / totaltime * 100 + "%"}, 1000, "linear", function () {
                            if (_this.stoped) {
                                $play_bar_prog.stop().css('width', 0);
                            }
                        });

                    },
                    callback_playing_finish: function (totaltime) {
                        if (totaltime <= 0) totaltime = 1;
                        this.callback_playing_time(totaltime, totaltime);
                        _this.btns.playStart.show();
                        _this.btns.playStart.hide();
                    },
                    callback_playing_stop: function (time) {
                        this.stoped = true;
                        $play_bar_prog.stop().css('width', 0);
                        _this.btns.playStart.show();
                        _this.btns.playStop.hide();

                    },
                    callback_pause_sound: function (curtime, totalTime) {
                        // console.log(curtime)
                    },
                    callback_flash_show: function () {
                        $("#jRecorder").css({
                            left: _this.btns.recordStart.offset().left,
                            top: _this.btns.recordStart.offset().top,
                            zIndex: 10
                        });
                    },
                    callback_flash_hide: function () {
                        $("#jRecorder").css({
                            left: -300,
                            top: -300
                        });
                    },
                    swf_path: swf_path,
                    custom_settings: {
                        progressTarget: "progressBarContainer",
                        cancelButtonId: "btnCancel1"
                    },

                    getStats: function () {
                        return this.stats;
                    },
                    stats: {
                        files_queued: 0,
                        in_progress: 0,
                        queue_errors: 0,
                        successful_uploads: 0,
                        upload_cancelled: 0,
                        upload_errors: 0
                    },
                    settings: {
                        requeue_on_error: true,
                        requeue_on_error_time: 20,
                        transcoding_url: _this.options.transcoding_url,
                        transcoding_success: function () {
                            _this.options.transcodingSuccess();
                        }
                    }
                }, _this.$jRecorderWarp);
            },

            release: function () {
                this.callParent("release");
            }
        });
        return new Page();
    });