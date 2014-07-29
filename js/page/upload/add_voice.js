/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 12-7-26
 * Time: 下午4:51
 * To change this template use File | Settings | File Templates.
 */

define(['jquery',
    'plugin/swfupload/swfupload.queue',
    "page/upload/information",
    "module/dialogs/sound2album",
    "plugin/jquery.easydrag",
    "page/upload/fileprogress",
    "page/upload/handlers"], function ($, SWFUpload, information, sound2album) {

    var image_domain = config.FDFS_PATH;

    //var swf_path = config.STATIC_ROOT + "/js/lib/record/jRecord.swf";
    var swf_path = "/swf/jrecord.swf";
   // var flash_url = config.STATIC_ROOT + "/js/lib/record/swfupload.swf";
    var flash_url =  "/swf/swfupload.swf";
    var button_image_url = config.STATIC_ROOT + "/css/img/record/uploadBtn.jpg";
    var button_image_url2 = config.STATIC_ROOT + "/css/img/record/button_03.jpg";


    var upload_url = config.UPLOAD_ROOT + '/audio/upload';
    var progress_url = config.DIRECT_DTRES_ROOT + '/progress';
    var transcoding_url = config.TRANSCODING_ROOT;

    var uploaded_voice_url = "";


    /*上传转码成功标记*/
    var mUploadSuccess = false, // 貌似没用了
        mFileList = [],
        refPram = {singleFile:true};

    var $addAlbum = $("#addAlbum"),
        $popupAlbum = $("#popupAlbum");

    var mTotalNum = 100,
        mMaxNum =100,
        mMaxAlbumNum = 200,
        mTitleMaxLength = 40;

    var file_types = "*.MP4;*.3GP;*.AVI;*.WMV;*.MPG;*.VOB;*.FLV;*.MOV;*.RMVB;*.RM;*.MPEG;*.MP3;*.WMA;*.AIFF;*.AIF;*.WAV;*.FLAC;*.OGG;*.MP2;*.AAC;*.AMR;*.M4A;";
    file_types += file_types.toLowerCase();
    var settings = {
        flash_url:flash_url,
        upload_url:upload_url,
        transcoding_url:transcoding_url,
        file_size_limit:"200 MB",
        file_types:file_types,
        file_types_description:"Audio Files",
        file_upload_limit:mTotalNum,
        file_queue_limit:0,
        custom_settings:{
            progressTarget:"progressBarContainer",
            cancelButtonId:"btnCancel"
        },
        debug:false,

        requeue_on_error_time:20, // second
        requeue_on_error:true,

        transcoding_success:function () {
            transcodingSuccess();
        },
        button_width:"138",
        button_height:"35",
        button_placeholder_id:"swfuploadWarp", //"swfcontainer",
        button_cursor:SWFUpload.CURSOR.HAND,
        button_window_mode:SWFUpload.WINDOW_MODE.TRANSPARENT,
        file_queued_handler:function (file) {
            /*记录一次操作需要上传的文件list*/
            if (!this.file_queued_list) {
                this.file_queued_list = [];
            }
            this.file_queued_list.push(file);

            mFileList.push(file);
        },
        file_queue_error_handler:function(file, errorCode, message){
            if(SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT == errorCode){
                mFileList.push(file);
                if (!this.cancelTranscoding) {
                    /*添加取消转码方法*/
                    this.cancelTranscoding = function (fileid) {
                        cancelFileUpload(fileid);
                    };
                }
            }

            fileQueueError.call(this, file, errorCode, message);
        },

        file_dialog_complete_handler:function (numFilesSelected, numFilesQueued) {
        },
        upload_start_handler:function(file){
            var file_temp = findFileByFileid(mFileList, file.id);
            if (!file_temp) return;
            uploadStart.call(this, file);
        },
        upload_progress_handler:function(file, bytesLoaded, bytesTotal){
            var file_temp = findFileByFileid(mFileList, file.id);
            if (!file_temp) return;
            uploadProgress.call(this, file_temp, bytesLoaded, bytesTotal);
        },
        upload_error_handler:function(file, errorCode, message) {
            if (errorCode == SWFUpload.UPLOAD_ERROR.FILE_CANCELLED) {
                //取消上传
                cancelFileUpload(file.id);
            }
            uploadError.call(this, file, errorCode, message);
        },
        upload_success_handler:function (file, serverData) {
            /*将mFilelist里面的file替换为参数的file*/
            var file_temp = findFileByFileid(mFileList, file.id);
            if (!file_temp) return;
            uploadSuccess.call(this, file_temp, serverData);
        },
        upload_complete_handler:function (file) {
            if (!this.cancelTranscoding) {
                /*添加取消转码方法*/
                this.cancelTranscoding = function (fileid) {
                    cancelFileUpload(fileid);
                };
            }
            uploadComplete.call(this, file);
        },
        queue_complete_handler:function (numFilesUploaded) {

        }
    };
    var swfu2,
        swfu2HasFile = false;
    var gAbleUpload = false;

    var settings2 = $.extend({}, settings, {
       // button_image_url:button_image_url2,
        button_width:"138",
        button_height:"32",
        button_placeholder_id:"swfupload2",
       // button_text:'<span class="theFont">上传新的声音文件并加入该专辑</span>',
        button_text_style:".theFont { color: #ffffff; }",
        button_text_left_padding:10,
        button_text_top_padding:5,
        swfupload_loaded_handler:function(){
         //   $(".uploadBtnText").remove();
            this.setFileUploadLimit(mTotalNum);
            refPram.singleFile = false;
            this.filesSelected = refPram;
        },
        file_dialog_complete_handler:function (numFilesSelected, numFilesQueued) {
            if (numFilesSelected <= 0) return;
            swfu2HasFile = true;
            refPram.singleFile = false;
            this.filesSelected = refPram;
            fileDialogComplete.call(this, numFilesSelected, numFilesQueued, refPram);
            if(gAbleUpload){
                this.startUpload();
            }
            $(".editAlbum_none").hide();
        }
    });

    swfu2 = new SWFUpload(settings2);

    function setAbleUpload(flag){
        gAbleUpload = flag;
    }

    function startUpload(){
        if(swfu2 && gAbleUpload &&swfu2HasFile){
            swfu2.startUpload();
        }
    }


    function addFile(list){
        for(var i=0;i<mFileList.length;i++){
            list.push(mFileList[i]);

        }
        mFileList = list;
        var albumLast = mMaxAlbumNum - list.length;
        if(albumLast>100){
            albumLast = 100;
        }
        mTotalNum = albumLast;
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
                var cur_limit = swfu2.getSetting("file_upload_limit");
                var stats = swfu2.getStats();
                swfu2.setFileQueueLimit(0);
                swfu2.setFileUploadLimit(mMaxNum-mFileList.length+stats.successful_uploads+stats.files_queued);
                break;
            }
        }
        //todo
        if(mFileList.length == 0){
            $(".editAlbum_none").show().html("该专辑还没有任何声音");
        }else{
            $(".editAlbum_none").hide();
        }
    }


    function setUploadTipWaiting() {
        
    }

    function setUploadTipSuccess() {
        // $upload_tip.html("上传成功.");
    }

    function transcodingSuccess() {
        mUploadSuccess = true;
    }

    //mUploadSuccess

    /*
     * 弹出框 将已经上传的文件加入到专辑
     *
     * */

    $addAlbum.click(function () {
        sound2album.open(function($lis){
            mFileChosen = [];
            $lis.each(function () {
                var $li = $(this);
                var uuid = $li.attr("data-id"),
                    title = $li.attr('data-title');
                var file = {
                    id:"chosenFile_" + uuid,
                    uuid:uuid,
                    name:title,
                    uploadSuccess:true,
                    transcoded:true,
                    transcoding:false,
                    transcodingError:false,
                    isChosen:true
                };
                mFileChosen.push(file);
            });
            addNewFile();
        });
    });


    var mFileChosen = [],
        mFileChosen_old = [],
        fileSelected = {singleFile:false};
    function addNewFile() {
        for (var i = 0; i < mFileChosen_old.length; i++) {
            var file = mFileChosen_old[i];
            cancelFileUpload(file.id);
            var progress = new FileProgress(file, "progressBarContainer", fileSelected);
            progress.destroy();
        }
        mFileChosen_old = mFileChosen.slice(0);//克隆一个新数组
        for (var i = 0; i < mFileChosen.length; i++) {
            var file = mFileChosen[i];
            if (findFileByUuid(mFileList, file.uuid)) {

            } else {
                mFileList.push(file);
                var progress = new FileProgress(file, "progressBarContainer", fileSelected);
                progress.setProgress(100);
                progress.setStatus("上传完成");
                progress.setTranscodingStatus("转码完成");
                progress.setTranscodingProgress(100);
                progress.setUuid("m"+file.uuid);
                progress.toggleCancel(true, null, function (fileid) {
                    var file = findFileByFileid(mFileList, fileid);
                    var uuid = file.uuid;
                    sound2album.delSound(uuid);
                    cancelFileUpload(fileid);
                });
            }
            $(".editAlbum_none").hide();
        }


    }


    function check(){
        var infoErr = $("#infoErr");
        infoErr.html("").css({color:"red"});
        var item = $("#multiFile .progressBarContainer").children();
        if(item.size()>mMaxAlbumNum){
            infoErr.html("专辑内最多"+mMaxAlbumNum+"个声音，请删掉多余的后重试");
            return false;
        }
        var fileArr = [];
        var l = mFileList.length;
       /* if (l == 0) {
            infoErr.html("没有声音，请选择声音后保存");
            return false;
        }*/
        for (var i = 0; i < l; i++) {
            var ff = mFileList[i],
                $dom = $("#"+ff.id),
                progress = new FileProgress(ff, "progressBarContainer", refPram, true);
            if(ff.size>200*1024*1024){
                information.unHoldSubmit();
                infoErr.html("单个上传文件不能超过200M");
                return false;
            }
            if (!ff.uuid) {
                information.setHoldTip();
                return false;
            }

            if (ff.transcoded && ff.uploadSuccess) {
                fileArr.push(ff.uuid);
            } else if (ff.transcodingError) {
                information.setError($dom);
                infoErr.html("请删除转码失败的文件后重试");
                information.unHoldSubmit();
                return false;
            } else {
                information.setHoldTip();
                return false;
            }
            //这里与record_main里面的不一样， 这里只有专辑
            if (l >= 1) {
                if (!checkMaxLength(ff.title, mTitleMaxLength*2)) {
                    information.setError($dom);
                    information.unHoldSubmit();
                    progress.titleError();
                    return false;
                }
                if (!ff.title) {
                    information.setError($dom);
                    information.unHoldSubmit();
                    progress.titleError();
                    return false;
                }
            }
        }

        return true;
    }
    function checkMaxLength(val, len) {
        var temp = val.replace(/[\u4E00-\u9FA5\uF900-\uFA2D]/g, "aa");
        return temp.length <= len;

    }
    var oo = {};
    oo.check = check;
    oo.setAbleUpload= setAbleUpload;
    oo.addFile = addFile;
    oo.startUpload = startUpload;
    oo.cancelFileUpload = cancelFileUpload;
    oo.findFileByFileid = findFileByFileid;
    return oo;
});
