/* Demo Note:  This demo uses a FileProgress class that handles the UI for displaying the file name and percent complete.
 The FileProgress class is not part of SWFUpload.
 */


/* **********************
 Event Handlers
 These are my custom event handlers to make my
 web application behave the way I went when SWFUpload
 completes different tasks.  These aren't part of the SWFUpload
 package.  They are part of my application.  Without these none
 of the actions SWFUpload makes will show up in my application.
 ********************** */
function myDebug(){
    if(window.console) console.info(arguments);
}
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return encodeURIComponent(c.substring(nameEQ.length,c.length));
        if(c.indexOf(nameEQ)!= -1){
            return encodeURIComponent(c.substring(c.indexOf("=")+1,c.length));
        }
    }
    return null;
}
function fileQueued(file) {

    var progress = new FileProgress(file, this.customSettings.progressTarget, this.filesSelected, false);
    progress.setStatus("等待上传");
    progress.toggleCancel(true, this);
}

function fileQueueError(file, errorCode, message) {

    if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
        require(['plugin/dialog'],function(dialog){
            var msg = "您选择了太多文件。\n" + (message === 0 ? "你已经达到了上传限制。" : "你只能上传 " +  message + "个文件");
            dialog.alert(msg);
        });
        return;
    }

    var progress = new FileProgress(file, this.customSettings.progressTarget, this.filesSelected||{singleFile:true});
    progress.setError();
    progress.toggleCancel(true);

    switch (errorCode) {
        case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
            progress.setStatus("文件太大.");
            this.debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
            break;
        case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
            progress.setStatus("不能上传空文件.");
            this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
            break;
        case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
            progress.setStatus("未定义的文件类型.");
            this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
            break;
        default:
            if (file !== null) {
                progress.setStatus("Unhandled Error:"+message);
            }
            this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
            break;
    }
}

function fileDialogComplete(numFilesSelected, numFilesQueued, refPram) {
    if (numFilesSelected <= 0) {
        return;
    }
    this.filesSelected = refPram;

    /*将一次操作需要上传的文件进行上传*/
    if(!this.file_queued_list) return;
    for(var i = 0;i<this.file_queued_list.length;i++){
        fileQueued.call(this, this.file_queued_list[i]);
    }
    this.file_queued_list = [];

    /* I want auto start the upload and I can do that here */


}

function uploadStart(file) {

    /* 单文件和多文件上传 进度条样式不同
     single区分
     */

    var progress = new FileProgress(file, this.customSettings.progressTarget, this.filesSelected);
    progress.setStatus("开始上传");
    progress.uploadStart();
    progress.toggleCancel(true, this);

    return true;
}

function uploadProgress(file, bytesLoaded, bytesTotal) {
    var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);

    var progress = new FileProgress(file, this.customSettings.progressTarget, this.filesSelected);
    progress.setProgress(percent);
    var loaded = Math.floor(bytesLoaded * 10 / (1024 * 1024)) / 10 + "M",
        total = Math.floor(bytesTotal * 10 / (1024 * 1024)) / 10 + "M";
    progress.setStatus("上传进度:" + loaded + "/" + total);

}

function uploadSuccess(file, serverData) {

    serverData = $.parseJSON(serverData);
    var progress = new FileProgress(file, this.customSettings.progressTarget, this.filesSelected, false);

    if(serverData.ret == 50){
        //未登录
        progress.setError();
        progress.setStatus("上传失败,请重新登录");
        return;
    }
    //progress.setComplete();
    if(!serverData.status){
        if(this.upload_error_handler){
            this.upload_error_handler(file, null, serverData.msg);
        }else{
            uploadError.call(this, file, null, serverData.msg);
        }
        return;
    }
    progress.setProgress(100);
    progress.setStatus("上传完成");

    if (!this.settings.transcoding_url) return;
    var url = this.settings.transcoding_url;


    progress.setTranscodingStatus("等待转码");
    var _this = this;
    if(!serverData || !serverData.data || !serverData.data[0]){
        return;
    }
    var server_msg = serverData.data[0];
    file.uploadSuccess = true;
    file.transcoding = false;
    file.transcoded = false;
    file.transcodingError = false;
    if(server_msg.uploadTrack){
        file.uuid = server_msg.uploadTrack.id;
    }
    //todo 旧的 将要删掉
    if(!file.uuid){
        file.uuid = server_msg.id;
    }
    progress.setUuid(file.uuid);

    var _this = this;
    var timer = setInterval(function () {
        var progress = new FileProgress(file, _this.customSettings.progressTarget, _this.filesSelected, true);
        progress.toggleCancel(true, _this);
        $.ajax({
            type:"GET",
            url:url,
            dataType:"json",
            data:{id: file.uuid,__t:(new Date()).valueOf()},
            success:function (data, textStatus, jqXHR) {

                /*	{"state":"success","value":100, duration:1000}
                 {"state":"success","value":100}
                 {"state":"error",  "value":"error info"}
                 */

                if(!file.transcodeTimer) return;
                if(data.duration){
                    file.duration = data.duration;
                }
                switch (data.state) {
                    case "success":
                      //  progress.toggleCancel(false);
                        clearInterval(timer);
                        progress.setTranscodingStatus("转码完成");
                        progress.setTranscodingProgress(100);
                        if(!_this.transcodings) _this.transcodings = 0;
                        file.transcoding = false;
                        file.transcoded = true;
                        file.transcodingError = false;
                        /*_this.transcodings++;
                        var stats = _this.getStats();
                        if(stats.files_queued==0 && stats.successful_uploads == _this.transcodings){
                            _this.settings.transcoding_success();
                        }*/
                        _this.settings.transcoding_success();
                        break;
                    case "error":
                        clearInterval(timer);
                        progress.setTranscodingStatus("转码失败:" + data.value);
                        progress.setTranscodingError();
                        file.transcoding = false;
                        file.transcoded = false;
                        file.transcodingError = true;
                        break;
                    case "processing":
                        file.transcoding = true;
                        if(parseInt(data.value) >= 100){
                            return;
                        }
                        progress.setTranscodingProgress(data.value);
                        progress.setTranscodingStatus("转码进度:" + data.value + "%");
                        break;
                    case "queueing":
                        file.transcoding = true;
                        progress.setTranscodingStatus("等待转码");
                        break;
                    default:
                        break;
                }

            },
            error:function (jqXHR, textStatus, errorThrown) {
                clearInterval(timer);
                progress.setTranscodingStatus("转码失败:" + textStatus);
                progress.setTranscodingError();
                file.transcoding = false;
                file.transcoded = false;
                file.transcodingError = true;
                myDebug("error Transcoding", file);
            }

        });
    }, 1500);
    file.transcodeTimer = timer;
}


function uploadError(file, errorCode, message) {

    var progress = new FileProgress(file, this.customSettings.progressTarget, this.filesSelected);
    progress.setError();
    progress.toggleCancel(true, this);

    if (this.settings.requeue_on_error && errorCode != SWFUpload.UPLOAD_ERROR.FILE_CANCELLED ) {

        var time = this.settings.requeue_on_error_time;
        var old_timer =   progress.getOnErrorTimer();
        if (old_timer) {
            clearInterval(old_timer);
        }
        var _this = this;
        var timer = setInterval(function () {
            time--;
            progress.setStatus("上传失败，将在 " + time + "秒后重试");
            if (time <= 0) {
                clearInterval(progress.getOnErrorTimer());
            }
        }, 1000);
        progress.setOnErrorTimer(timer);
    }

    switch (errorCode) {
        case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
            progress.setStatus("上传出错: " + message);
            this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
            break;
        case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
            progress.setStatus("上传失败.");
            this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
            break;
        case SWFUpload.UPLOAD_ERROR.IO_ERROR:
            progress.setStatus("Server (IO) Error");
            this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
            break;
        case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
            progress.setStatus("Security Error");
            this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
            break;
        case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
            progress.setStatus("Upload limit exceeded.");
            this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
            break;
        case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
            progress.setStatus("Failed Validation.  Upload skipped.");
            this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
            break;
        case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
            // If there aren't any files left (they were all cancelled) disable the cancel button
            if (this.getStats().files_queued === 0) {
                //document.getElementById(this.customSettings.cancelButtonId).disabled = true;
            }
            progress.setStatus("Cancelled");
            progress.setCancelled();
            break;
        case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
            progress.setStatus("Stopped");
            break;
        default:
            progress.setStatus("Unhandled Error: " + errorCode);
            this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
            break;
    }

}

function uploadComplete(file) {
    if (this.getStats().files_queued === 0) {
        //	document.getElementById(this.customSettings.cancelButtonId).disabled = true;
    }
}

// This event comes from the Queue Plugin
function queueComplete(numFilesUploaded) {
    //var status = document.getElementById("divStatus");
    //status.innerHTML = numFilesUploaded + " file" + (numFilesUploaded === 1 ? "" : "s") + " uploaded.";
}

