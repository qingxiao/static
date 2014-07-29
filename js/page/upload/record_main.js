/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 12-6-27
 * Time: 下午5:55
 * To change this template use File | Settings | File Templates.
 */


define(['jquery',
    'page/page_base',
    'plugin/swfupload/swfupload.queue',
    'plugin/jrecorder',
    'plugin/dialog',
    "page/upload/fileprogress",
    "page/upload/handlers"],
    function ($, PageBase, SWFUpload, jRecorder, dialog) {

        var image_domain = config.FDFS_PATH;

        var swf_path = "/swf/jrecord.swf";
        var flash_url = "/swf/swfupload.swf";

        var upload_url = config.UPLOAD_ROOT + '/audio/upload';
        var img_upload_url = config.DIRECT_DTRES_ROOT + "/cover/upload";
        var progress_url = config.DIRECT_DTRES_ROOT + '/progress';
        var transcoding_url = config.TRANSCODING_ROOT;
        var loading_imgurl = config.STATIC_ROOT + "/css/img/record/loading.gif";

        var checkLoginUrl = "/passport/check_me";//检查登录状态

        $(function () {
            var $record_box = $("#record_box"),
                $upload_index_loading = $("#index_loading");
            if ($record_box.hasClass("full")) {
                $('.recordBtn, .uploadBtn').click(function () {
                    dialog.alert("容量不够");
                });
                $upload_index_loading.hide();
                return;
            }
            if ($record_box.hasClass("unlogin")) {
                $('.recordBtn, .uploadBtn').click(function () {
                    login_box.open(function (data) {
                        window.location.href = window.location.href;
                        login_box.close();
                    });
                });
                $upload_index_loading.hide();
                return;
            }
            /*上传转码成功标记*/
            var mUploadSuccess = false,
                mFileList = [],
                refPram = {singleFile: true};
            //用来记录上传的声音个数
            var mTotalNum = 100,
                mMaxNum = 100,
                mTitleMaxLength = 30;

            var $pageBg = $(".pageBg"),
                $upload_index = $("#upload_index"),
                $record_box = $("#record_box"),
                $record_info = $("#record_info"),
                $record_start = $("#record_start"),
                $record_process = $("#record_process"),
                $record_end = $("#record_end"),
                $start_play_btn = $("#start_play_btn"),
                $stop_play_btn = $("#stop_play_btn"),
                $play_bar = $("#playBar"),
                $play_bar_prog = $play_bar.find(".progBar"),
                $cancel_record = $("#cancelRec"),
                $upload_tip = $(".p_tip"),
                $recordBtn = $("#recordBtn"),
                $jRecorder = $("#jRecorder"),
                $uploadBtn = $("#uploadBtn"),
                $swfupload = $("#swfupload"),
                $addAlbum = $("#addAlbum"),
                $popupAlbum = $("#popupAlbum");

            //给flash容器定位
            $swfupload.css({
                left: $uploadBtn.offset().left,
                top: $uploadBtn.offset().top,
                zIndex: 1000,
                position:"absolute"
            });
            //用js控制被flash挡住的a标签的hover效果
            $swfupload.bind({
                mouseenter: function () {
                    $uploadBtn.addClass("hover");
                },
                mouseleave: function () {
                    $uploadBtn.removeClass("hover");
                }
            });
            $jRecorder.css({
                left: $recordBtn.offset().left,
                top: $recordBtn.offset().top,
                position:"absolute",
                          width:300,
                height:300,
                zIndex:-1
            });
            function showSwfupload() {
                $swfupload.css({zIndex: 1000});
            }

            function hideSwfupload() {
                $swfupload.css({zIndex: -1});
            }
            $recordBtn.click(function () {
                prepareRecorder();
                hideSwfupload();
                pageHide($upload_index);
                pageShow($record_start);
            });

            $(".backIndex").click(function () {
                //  window.location.reload();
            });

            function reload(msg) {
                var result = confirm(msg);
                if (result) {
                    window.location.reload();
                }
            }

            function pageShow(el) {
                el.removeClass("hidden");
            }

            function pageHide(el) {
                el.addClass("hidden");
            }

            function prepareRecorder() {
                var count = 0;
                var $wave_warp = $("#wave_warp");
                var wave_warp_width = $wave_warp.width();
                var sw = function (n) {
                    if (n < 10) n = "0" + n;
                    return "" + n;
                };
                /* 70->00:01;10;*/
                var getTime = function (num) {
                    num = parseInt(num);
                    var h = parseInt(num / 3600),
                        m = parseInt(num % 3600 / 60),
                        s = parseInt(num % 3600 % 60);
                    return sw(h) + ":" + sw(m) + ":" + sw(s);
                };
                /*
                 * 录音上传配置项
                 * */
                $.jRecorder({
                    host: upload_url,
                    rec_left: "",
                    progress_url: progress_url,
                    callback_started_recording: function () {
                        count = 0;
                        pageShow($record_process);
                        pageHide($record_start);
                        $wave_warp.html("");

                    },
                    callback_stopped_recording: function (time) {
                        $("#recordFinishTime").html(getTime(time));
                        pageShow($record_end);
                        pageHide($record_process);
                    },
                    callback_activityLevel: function (level) {
                        //               callback_activityLevel(level);
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
                    callback_activityTime: function (time) {
                        $("#recordTime").html(getTime(time));
                    },
                    callback_error_recording: function (error) {
                        alert("recording error ; code:" + error);
                    },
                    callback_finished_sending: function (file, serverData) {
                        mTotalNum--;
                        this.getStats().successful_uploads = 1;
                        this.getStats().files_queued = 0;
                        file = findFileByFileid(mFileList, file.id);
                        uploadSuccess.call(this, file, serverData);
                        swfuUploadComplete = true;
                        if (swfu2 && swfu2HasFile) {
                            swfu2.startUpload();
                        }
                    },
                    callback_before_sending: function (file) {
                        mFileList.push(file);
                        this.getStats().files_queued = 1;
                        refPram.singleFile = true;
                        this.filesSelected = refPram;
                        mUploadSuccess = false;
                        uploadStart.call(this, file);
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
                        $start_play_btn.hide();
                        $stop_play_btn.show();

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
                        $start_play_btn.show();
                        $stop_play_btn.hide();
                    },
                    callback_playing_stop: function (time) {
                        this.stoped = true;
                        $play_bar_prog.stop().css('width', 0);
                        $start_play_btn.show();
                        $stop_play_btn.hide();

                    },
                    callback_pause_sound: function (curtime, totalTime) {
                        // console.log(curtime)
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
                        transcoding_url: transcoding_url,
                        transcoding_success: function () {
                            transcodingSuccess();
                        }
                    }
                }, $("#jRecorderWarp"));

                $('#readyBtn').click(function () {
                    $.jRecorder.record(3600);
                });
                $('#stopBtn').click(function () {
                    $.jRecorder.stop();
                });
                $start_play_btn.click(function () {
                    $.jRecorder.playsound();
                });
                $("#pause_sound").click(function () {
                    $.jRecorder.pausesound();
                });

                $stop_play_btn.click(function () {
                    $.jRecorder.stopsound();

                });

                $('#uploadRe').click(function () {
                    checkLogin(function () {
                        $.jRecorder.sendData("录音", {token: readCookie(config.TOKEN_LABEL), rememberMe: readCookie(config.REMEMBERME_LABEL)});
                        $.jRecorder.stopsound();
                        showRecordInfo();
                        information.setIsAlbum(false, true);
                    });

                });

                $cancel_record.click(function () {
                    var result = dialog.confirm("是否要放弃这段录音？", function () {
                        window.location.reload();
                    });
                });
            }

            /*swfupload
             * 文件上传配置项
             */

            var swfu;
            var file_types = "*.MP4;*.3GP;*.AVI;*.WMV;*.MPG;*.VOB;*.FLV;*.SWF;*.MOV:*.RMVB;*.RM;*.MPEG;*.MP3; *.WMA; *.AIFF;*.AIF;*.WAV;*.FLAC;*.OGG; *.MP2;*.AAC;*.AMR;*.M4A;";
            file_types += file_types.toLowerCase();
            var settings = {
                flash_url: flash_url,
                upload_url: upload_url,
                transcoding_url: transcoding_url,
                file_size_limit: "200 MB",
                file_types: file_types,
                file_types_description: "Audio Files",
                file_upload_limit: mTotalNum,
                file_queue_limit: mTotalNum,
                custom_settings: {
                    progressTarget: "progressBarContainer"
                },
                debug: false,

                requeue_on_error_time: 20, // second
                requeue_on_error: true,

                transcoding_success: function () {
                    transcodingSuccess();
                },
                // Button settings
                /*        button_text:"<a href='javascript:;' style='top:200px;position: absolute;'>上传声音</a>",*/
                button_width: "185",
                button_height: "85",
                button_placeholder_id: "swfuploadWarp", //"swfcontainer",
                button_cursor: SWFUpload.CURSOR.HAND,
                button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                swfupload_loaded_handler: function () {
                    $("#index_loading").remove();
                },
                file_queued_handler: function (file) {
                    /*记录一次操作需要上传的文件list*/
                    if (!this.file_queued_list) {
                        this.file_queued_list = [];
                    }
                    this.file_queued_list.push(file);

                    mFileList.push(file);
                },
                file_queue_error_handler: fileQueueError,

                file_dialog_complete_handler: function (numFilesSelected, numFilesQueued) {

                    if (numFilesSelected >= 1 && numFilesSelected <= mTotalNum) {
                        if (1 == numFilesSelected) {
                            refPram.singleFile = true;
                            information.setIsAlbum(false, true);
                        } else {
                            refPram.singleFile = false;
                            initIsAlbum();
                        }
                        this.filesSelected = refPram;
                        var _this = this;

                        checkLogin(function () {
                            fileDialogComplete.call(_this, numFilesSelected, numFilesQueued, refPram);
                            _this.startUpload();
                            $(".p_info").hide();
                            showRecordInfo();
                            $swfupload.css({zIndex: -1});
                            //两个flash总共能上传300个声音
                            mTotalNum = mTotalNum - numFilesSelected;
                            mTotalNum = mTotalNum <= 0 ? 1 : mTotalNum;
                        }, function () {
                            swfu.destroy();
                            $("#swfupload").append('<div id="swfuploadWarp"></div>');
                            swfu = new SWFUpload(settings);
                        });

                    }
                    /*todo 当上传多个文件才加载第二个文件上传的flash
                     todo  为了兼容ie 直接加载
                     */

                },
                upload_start_handler: function (file) {
                    var file_temp = findFileByFileid(mFileList, file.id);
                    if (!file_temp) return;

                    uploadStart.call(this, file);
                },
                upload_progress_handler: function (file, bytesLoaded, bytesTotal) {
                    var file_temp = findFileByFileid(mFileList, file.id);
                    if (!file_temp) return;
                    uploadProgress.call(this, file_temp, bytesLoaded, bytesTotal);
                },
                upload_error_handler: function (file, errorCode, message) {
                    if (errorCode == SWFUpload.UPLOAD_ERROR.FILE_CANCELLED) {
                        //取消上传
                        cancelFileUpload(file.id);
                    }
                    uploadError.call(this, file, errorCode, message);
                },
                upload_success_handler: function (file, serverData) {

                    /*将mFilelist里面的file替换为参数的file*/
                    var file_temp = findFileByFileid(mFileList, file.id);
                    if (!file_temp) return;
                    var sData = $.parseJSON(serverData);


                    uploadSuccess.call(this, file_temp, serverData);
                },
                upload_complete_handler: function (file) {
                    if (!this.cancelTranscoding) {
                        /*添加取消转码方法*/
                        this.cancelTranscoding = function (fileid) {
                            cancelFileUpload(fileid);
                        };
                    }
                    uploadComplete.call(this, file);
                },
                queue_complete_handler: function (numFilesUploaded) {
                    queueComplete.call(this, numFilesUploaded);
                    /* 再次上传  需要先等待第一次文件上传完成才开始上传；*/
                    swfuUploadComplete = true;
                    if (swfu2 && swfu2HasFile) {
                        swfu2.startUpload();
                    }

                }
                // Queue plugin event
            };

            swfu = new SWFUpload(settings);
            $(window).resize(function () {
                $swfupload.css({
                    left: $uploadBtn.offset().left,
                    top: $uploadBtn.offset().top
                });
                $jRecorder.css({
                    left: $recordBtn.offset().left,
                    top: $recordBtn.offset().top
                });
            });
            var swfu2,
                swfu2HasFile = false,
                swfuUploadComplete = false;

            function showRecordInfo() {
                mUploadSuccess = false;
                pageHide($record_box);
                pageShow($record_info);
                $pageBg.hide();
                setUploadTipWaiting();
                $("body").addClass("diyBody1");
                $('<div class="diyBody2"></div>').insertBefore($("body").children().first());
            }

            /* 页面完成就要加载，ie BUG*/
            setTimeout(function () {
                setRecordInfoSwf();
            }, 150);

            function setRecordInfoSwf() {
                var settings2 = $.extend({}, settings, {
                    button_width: "194",
                    button_height: "29",
                    file_upload_limit: mTotalNum,
                    file_queue_limit: mTotalNum,
                    button_placeholder_id: "swfupload2",
                    //  button_text:'<span class="theFont">上传新的声音文件并加入该专辑</span>',
                    button_text_style: ".theFont { color: #ffffff; }",
                    button_text_left_padding: 10,
                    swfupload_loaded_handler: function () {
                        //  $(".uploadBtnText").remove();
                        this.setFileQueueLimit(mTotalNum);
                        this.setFileUploadLimit(mTotalNum);
                    },
                    button_text_top_padding: 5,
                    file_dialog_complete_handler: function (numFilesSelected, numFilesQueued) {
                        if (numFilesSelected <= 0) return;

                        $(".p_info").hide();
                        swfu2HasFile = true;
                        refPram.singleFile = false;
                        fileDialogComplete.call(this, numFilesSelected, numFilesQueued, refPram);
                        if (swfuUploadComplete) {
                            this.startUpload();
                        }
                    }
                });

                swfu2 = new SWFUpload(settings2);
            }

            function findFileByUuid(fileArray, uuid) {
                for (var i = 0, l = fileArray.length; i < l; i++) {
                    var tempfile = fileArray[i];
                    if (tempfile.uuid == uuid) {
                        return tempfile;

                    }
                }
                return false;
            }

            function findFileByFileid(fileArray, fileid) {
                for (var i = 0, l = fileArray.length; i < l; i++) {
                    var tempfile = fileArray[i];
                    if (tempfile.id == fileid) {
                        return tempfile;
                        break;
                    }
                }
                return false;
            }

            function cancelFileUpload(fileid) {
                for (var i = 0, l = mFileList.length; i < l; i++) {
                    var tempfile = mFileList[i];
                    if (tempfile.id == fileid) {
                        if (tempfile.transcodeTimer) {
                            clearInterval(tempfile.transcodeTimer);
                            tempfile.transcodeTimer = null;
                        }
                        /*从mFileList中删掉选中项*/
                        mFileList.splice(i, 1);
                        /*在继续上传中增加可以上传个数*/
                        var cur_limit = swfu2.getSetting("file_upload_limit");
                        var stats = swfu2.getStats();
                        swfu2.setFileQueueLimit(0);
                        swfu2.setFileUploadLimit(mMaxNum - mFileList.length + stats.successful_uploads + stats.files_queued);
                        break;
                    }
                }
                if (mFileList.length == 0) {
                    $(".p_info").show().html("该专辑还没有任何声音");
                } else {
                    $(".p_info").hide();
                }

            }

            function setUploadTipWaiting() {
                $upload_tip.html("您的音频正在上传中，请耐心等候");
            }


            function transcodingSuccess() {
                $upload_tip.html("上传成功.");
                mUploadSuccess = true;
                myDebug('transcodingsuccess------------', mFileList);
                // console.info(mFileList);
            }

            //mUploadSuccess

            /*
             * 弹出框 将已经上传的文件加入到专辑
             *
             * */

            $addAlbum.click(function () {
                showPopupAlbum();
            });
            var $popupClose = $("#popupClose"),
                $popupX = $(".popup-close"),
                $popupOk = $("#popupOk"),
                $existFile = $("#existFile"),
                $ePopupList = $existFile.find(".popup-list ul"),
                $chosenFile = $("#chosenFile"),
                $cPopupList = $chosenFile.find(".popup-list ul");

            $popupClose.bind("click", function () {
                resetPopup();
                hidePopupAlbum();
            });

            $popupX.bind("click", function () {
                resetPopup();
                hidePopupAlbum();
            });

            var mFileChosen = [],
                mFileChosen_old = [];
            $popupOk.bind("click", function () {
                hidePopupAlbum();

                mFileChosen = [];
                $cPopupList.children("li").each(function () {
                    var $li = $(this);
                    var uuid = $li.attr("uuid");
                    /*  if(findFileByUuid(mFileList, uuid)){
                     return;
                     }*/
                    var file = {
                        id: "chosenFile_" + uuid,
                        uuid: uuid,
                        name: $li.text(),
                        uploadSuccess: true,
                        transcoded: true,
                        transcoding: false,
                        transcodingError: false,
                        isChosen: true
                    };
                    mFileChosen.push(file);
                });
                addNewFile();
            });

            //点击取消 重置popup里面的数据显示
            function resetPopup() {
                //  return;
                // $cPopupList.children("li");
                var temp = $("<ul></ul>");
                for (var i = 0; i < mFileChosen.length; i++) {
                    var f1 = mFileChosen[i];
                    for (var j = 0; j < mFileChosen_old.length; j++) {
                        var f2 = mFileChosen_old[j];
                        if (f1.id == f2.id) {
                            var li = $cPopupList.find("li[uuid='" + f1.uuid + "']");

                            li.appendTo(temp);
                        }
                    }
                }
                $cPopupList.children("li").find("span").removeClass("sp_1");
                $cPopupList.children("li").appendTo($ePopupList);
                temp.children().appendTo($cPopupList);

            }

            function addNewFile() {
                for (var i = 0; i < mFileChosen_old.length; i++) {
                    var file = mFileChosen_old[i];
                    cancelFileUpload(file.id);
                    var progress = new FileProgress(file, "progressBarContainer", 2);
                    progress.hide();
                }
                mFileChosen_old = mFileChosen.slice(0);//克隆一个新数组
                for (var i = 0; i < mFileChosen.length; i++) {
                    var file = mFileChosen[i];
                    if (findFileByUuid(mFileList, file.uuid)) {

                    } else {
                        mFileList.push(file);
                        var progress = new FileProgress(file, "progressBarContainer", 2);
                        progress.setProgress(100);
                        progress.setStatus("上传完成");
                        progress.setTranscodingStatus("转码完成");
                        progress.setTranscodingProgress(100);
                        progress.setUuid(file.uuid);
                        progress.setTrackData("track_id:" + file.uuid);
                        progress.toggleCancel(true, null, function (fileid) {
                            var file = findFileByFileid(mFileList, fileid);
                            var uuid = file.uuid;
                            var $li = $cPopupList.find("li[uuid='" + uuid + "']");
                            $ePopupList.append($li);
                            $li.find("span").removeClass("sp_1");
                            cancelFileUpload(fileid);
                        });
                    }
                }

            }

            //add
            $ePopupList.bind("click", function (event) {
                var tag = event.target;
                if (tag.tagName.toLocaleLowerCase() == "span") {
                    var $li = $(tag).parent('li');
                    $li.appendTo($cPopupList);
                    $(tag).addClass("sp_1");
                }
            });
            //del
            $cPopupList.bind("click", function (event) {
                var tag = event.target;
                if (tag.tagName.toLocaleLowerCase() == "span") {
                    $(tag).parent('li').appendTo($ePopupList);
                    $(tag).removeClass("sp_1");
                }
            });

            function showPopupAlbum() {
                var left = $addAlbum.offset().left - $popupAlbum.width() / 2,
                    top = $addAlbum.offset().top - $popupAlbum.height() / 2;
                left = left > 50 ? left : 50;
                top = top > 50 ? top : 50;
                $popupAlbum.css({left: left, top: top, position: "absolute"});
                $popupAlbum.show();
            }

            function hidePopupAlbum() {
                $popupAlbum.hide();
            }


            var $submit_save = $("#submit_save");
            var ajax_loading = false;
            /*
             提交表单 ajax 后台验证敏感词
             成功： { res: true }
             报错：{ res: false, errors: [ [title','标题填写有误'],['user_source', '来源设置有误'] ] }
             123: 新上传, m123: (移动的)track_id, r123: (专辑里原有的)record_id
             */
            $submit_save.click(function () {
                var that = this;
                beforeSubmit(function () {
                    var href = refPram.singleFile ? "/my_tracks" : "/my_albums";
                    information.submitForm(that, href);
                });
                return false;
            });

            var $cancel_save = $("#cancel_save");
            $cancel_save.click(function () {
                var $this = $(this);
                var result = dialog.confirm("是否要放弃本次操作？", {callback: function () {
                    window.location.href = $this.attr("href");
                }});
                return false;
            });


            function beforeSubmit(callback) {
                if (!information.check()) {
                    return false;
                }
                information.holdSubmit(checkFileUpload, callback);
                return true;

            }

            function checkFileUpload() {
                var infoErr = $("#infoErr");
                infoErr.html("").css({color: "red"});


                var item = $(".albumList .progressBarContainer .albumItem");
                if (item.size() > mMaxNum) {
                    infoErr.html("一次只能上传" + mMaxNum + "个声音，请删掉多余的后重试");
                    return false;
                }
                var fileArr = [];
                var l = mFileList.length;
                /*  if (l == 0) {
                 infoErr.html("没有声音，请选择声音后保存");
                 return false;
                 }*/
                for (var i = 0; i < l; i++) {
                    var ff = mFileList[i];
                    if (!ff.uuid) {
                        // infoErr.html("请等待文件上传完成");
                        information.setHoldTip();
                        return false;
                    }
                    if (ff.size > 200 * 1024 * 1024) {
                        infoErr.html("单个上传文件不能超过200M");
                        return false;
                    }
                    /*if(ff.duration > 2*60*60){
                     infoErr.html("单个上传文件不能超过2小时");
                     return false;
                     }*/
                    if (ff.transcoded && ff.uploadSuccess) {
                        fileArr.push(ff.uuid);
                    } else if (ff.transcodingError) {
                        infoErr.html("请删除转码失败的文件后重试");
                        information.unHoldSubmit();
                        return false;
                    } else {
                        //infoErr.html("请等待文件转码完成");
                        //infoErr.html("声音尚在上传中，请在上完转码完毕后保存");
                        information.setHoldTip();
                        return false;
                    }

                    if (!refPram.singleFile) {
                        if (!checkMaxLength(ff.title, mTitleMaxLength * 2)) {
                            infoErr.html("声音标题不能超过" + mTitleMaxLength + "个汉字或者" + mTitleMaxLength + "个字母");
                            return false;
                        }
                        if (!ff.title) {
                            infoErr.html("声音标题不能为空");
                            return false;
                        }
                    }

                }
                return true;
            }

            //中文长度
            function checkMaxLength(val, len) {
                var temp = val.replace(/[\u4E00-\u9FA5\uF900-\uFA2D]/g, "aa");
                return temp.length <= len;

            }

            $("#createNewAlbum").click(function () {
                createNewAlbum();
                if (window.scroll) {
                    scroll(0, 0);
                }

            });


            //新建专辑
            function createNewAlbum() {
                refPram.singleFile = false;
                var origBar = $("#singleFile").find(".progressBarContainer .progressBar").clone();
                $("#singleFile").find(".progressBarContainer").children().remove();
                var file = mFileList[0];

                var progress = new FileProgress(file, "progressBarContainer", refPram);

                origBar.removeAttr("id");
                var newBar = $("#multiFile").find(".progressBarContainer .progressBar");
                newBar.parent().append(origBar);
                newBar.remove();
                progress.toggleCancel(true, null, function (fileid) {
                    cancelFileUpload(fileid);
                });
                initIsAlbum();
                //setRecordInfoSwf();
            }

            function initIsAlbum() {
                information.setIsAlbum(true, true);
                $(".share_panel [share_type]").attr("share_type", "album");
                information.setBindShare();
                // $(".albumAction .add-album").hide();
                var image_warp = $("#imageWarp");
                if (!image_warp.attr("new_src")) {
                    image_warp.find("img").attr("src", image_warp.attr("album_src"));
                }
            }

            function checkLogin(loginFn, unloginFn) {
                /*  loginFn();
                 return;*/
                loginFn = loginFn || $.noop;
                unloginFn = unloginFn || $.noop;
                var unloginFn2 = function () {
                    login_box.open(function (data) {
                        //window.location.href = window.location.href;
                        login_box.close();
                    });
                    unloginFn();
                };
                var token = readCookie(config.TOKEN_LABEL);
                if (!token) {
                    unloginFn2();
                    return;
                }
                $.ajax({
                    type: "get",
                    url: checkLoginUrl,
                    data: {token: decodeURIComponent(token), rememberMe: 'y'},
                    dataType: "json",
                    success: function (result) {
                        if (result && result.ret == 50) {
                            unloginFn2();
                        } else {
                            loginFn();
                        }
                    },
                    error: function () {
                        unloginFn2();
                    }
                });
            }
        });
    });

