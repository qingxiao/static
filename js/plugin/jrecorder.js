/*
 * jRecorder Plugin for jQuery JavaScript Library (Alpha)
 * http://www.sajithmr.me/jrecorder
 *
 * Copyright (c) 2011 - 2013 Sajithmr.ME
 * Dual licensed under the MIT and GPL licenses.
 *  - http://www.opensource.org/licenses/mit-license.php
 *  - http://www.gnu.org/copyleft/gpl.html
 *
 * Author: Sajith Amma
 * Version: 1.1
 * Date: 14 December 2011
 */

/* Code is not verified using http://www.jshint.com/ */

define(['jquery'], function ($) {
    (function ($) {
        var methods = {
            play: function (options) {
                // alert(options);
            },
            pause: function () {
            }

        };
        var jRecorderSettings = {};

        $.jRecorder = function (options, element) {
            // allow instantiation without initializing for simple inheritance
            if (typeof(options) == "string") {
                if (methods[options]) {
                    return methods[ options ].apply(this, Array.prototype.slice.call(arguments, 1));
                }
                return false;
            }

            //if the element to be appended is not defind, append to body
            if (element == undefined) {
                element = $("body");
            }

            //default settings
            var settings = {
                'rec_width': '215',
                'rec_height': '138',
                'rec_top': '0px',
                'rec_left': '0px',
                'recorderlayout_id': 'flashrecarea',
                'recorder_id': 'audiorecorder',
                'recorder_name': 'audiorecorder',
                'wmode': 'transparent',
                'bgcolor': '#ff0000',
                'swf_path': 'jRecorder.swf',
                'host': '',
                'progress_url': 'http://192.168.3.91/dtres/progress',
                'filename': 'record_file.wav',
                'progressTarget': '',
                'callback_started_recording': function () {
                },
                'callback_finished_recording': function (file, time) {
                },
                'callback_before_sending': function (file) {
                },
                'callback_stopped_recording': function (time) {
                },
                'callback_error_recording': function () {
                },
                'callback_error_loaded': function () {
                },
                'callback_activityTime': function (time) {
                },
                'callback_activityLevel': function (level) {
                },
                'callback_file_progress': function (file, obj) {
                    // if(window.console) console.info(file, obj);
                },
                'callback_file_progress_error': function (info) {
                    // if(window.console) console.info(info);
                },
                'callback_started_preview': function (starttime, totaltime) {
                },
                'callback_playing_time': function (time, totaltime) {
                },
                'callback_playing_finish': function (totaltime) {
                },
                'callback_playing_stop': function (time) {
                },
                'callback_pause_sound': function (t, totalTime) {
                },
                'callback_file_upload_error': function (file, errorCode, message) {
                },
                'cancelUpload': function () {
                },
                'callback_flash_show': function () {
                },
                'callback_flash_hide': function () {
                },
                'callback_flash_loaded':function(){},
                'debug': function () {
                    //if(window.console) console.info(arguments);
                },
                settings: {}
            };
            //if option array is passed, merget the values
            if (options) {
                $.extend(settings, options);
            }
            settings.customSettings = settings.custom_settings;

            //2012 06 19 xiaoqing
            var flashvars = ['host=', encodeURIComponent(settings['host']),
                '&progress_url=', encodeURIComponent(settings['progress_url']),
                '&filename=', encodeURIComponent(settings['filename'])
            ].join("");
            jRecorderSettings = settings;
            var htmlObj;
            if ($.browser.msie && Number($.browser.version) <= 8) {
                var objStr = '<object  name="' + settings['recorder_name'] + '" id="' + settings['recorder_id'] + '" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="' + settings['rec_width'] + '" height="' + settings['rec_height'] + '"></object>';

                var paramStr = [
                    '<param name="movie" value="' + settings['swf_path'] + '?host=' + settings['host'] + '" />',

                    '<param name="allowScriptAccess" value="always" />',
                    '<param name="bgcolor" value="' + settings['bgcolor'] + '" />',
                    '<param name="wmode" value="' + settings['wmode'] + '" />',
                    '<param name="flashvars" value="' + flashvars + '" />'
                ];

                htmlObj = document.createElement(objStr);
                for (var i = 0; i < paramStr.length; i++) {
                    htmlObj.appendChild(document.createElement(paramStr[i]));
                }
                //var divStr = ' <div id="'+ settings['recorderlayout_id'] +'" style="position:absolute;top:0px;left:0px;z-index:-1" ></div>';
                //var divObj = document.createElement(divStr);


            } else {
                var createParam = function (el, n, v) {
                    var p = document.createElement("param");
                    p.setAttribute("name", n);
                    p.setAttribute("value", v);
                    el.appendChild(p);
                };

                htmlObj = document.createElement("object");
                htmlObj.setAttribute("id", settings['recorder_id']);
                htmlObj.setAttribute("name", settings['recorder_name']);
                htmlObj.setAttribute("data", settings['swf_path'] + '?host=' + settings['host']);
                htmlObj.setAttribute("type", "application/x-shockwave-flash");
                htmlObj.setAttribute("width", settings['rec_width']); // Non-zero
                htmlObj.setAttribute("height", settings['rec_height']); // Non-zero

                createParam(htmlObj, "allowscriptaccess", "always");
                createParam(htmlObj, "bgcolor", settings['bgcolor']);
                createParam(htmlObj, "wmode", settings['wmode']);

                createParam(htmlObj, "flashvars", flashvars);
            }

            element.width(settings.rec_width);
            element.height(settings.rec_height);
            element.css({position: "absolute", top: settings['rec_top'], left: settings['rec_left'], margin: "auto"});
            element.append(htmlObj);
            jRecorderSettings.element = element;
            $.jRecorder.hide();
        };
        //xiaoqing
        $.jRecorder.show = function () {
            jRecorderSettings['callback_flash_show']();
        };

        $.jRecorder.hide = function () {
            jRecorderSettings['callback_flash_hide']();
        };
        //function call to start a recording
        $.jRecorder.record = function (max_time) {
            if(window.console) console.log("$.jRecorder.loaded", $.jRecorder.loaded);
            if (!$.jRecorder.loaded) return;
            max_time = max_time || 60;
            //change z-index to make it top
            $.jRecorder.show();
            getFlashMovie(jRecorderSettings['recorder_name']).jStartRecording(max_time);
        };

        //function call to stop recording
        $.jRecorder.stop = function () {
            getFlashMovie(jRecorderSettings['recorder_name']).jStopRecording();
        };

        $.jRecorder.playsound = function () {
            getFlashMovie(jRecorderSettings['recorder_name']).jPlaySound();
        };

        $.jRecorder.stopsound = function () {
            getFlashMovie(jRecorderSettings['recorder_name']).jStopSound();
        };

        $.jRecorder.pausesound = function () {
            getFlashMovie(jRecorderSettings['recorder_name']).jPauseSound();
        };

        //function call to send wav data to server url from the init configuration
        $.jRecorder.sendData = function (filename, parm) {
            $.jRecorder.uploaded = false;
            getFlashMovie(jRecorderSettings['recorder_name']).jSendFileToServer(filename, parm);
        };

        $.jRecorder.callback_started_recording = function () {
            jRecorderSettings['callback_started_recording']();
        };


        $.jRecorder.callback_finished_recording = function () {
            jRecorderSettings['callback_finished_recording']();
        };

        $.jRecorder.callback_error_recording = function (code) {
            $.jRecorder.hide();
            jRecorderSettings['callback_error_recording'](code);

        };

        $.jRecorder.callback_stopped_recording = function (time) {
            jRecorderSettings['callback_stopped_recording'](time);
        };


        $.jRecorder.callback_finished_sending = function () {
            $.jRecorder.uploaded = true;
            jRecorderSettings['callback_finished_sending'](arguments[0], arguments[1]);
        };

        $.jRecorder.callback_activityLevel = function (level) {
            jRecorderSettings['callback_activityLevel'](level);
        };

        $.jRecorder.callback_activityTime = function (time) {
            //put back flash while recording
            $.jRecorder.hide();
            jRecorderSettings['callback_activityTime'](time);
        };


        $.jRecorder.callback_file_progress = function (file, info, totalBytes) {
            if (typeof info == "string") {
                info = $.parseJSON(info);
            }
            if ($.jRecorder.uploaded) {
                return;
            }
            if (info.state != "uploading") {
                return;
            }
            jRecorderSettings['callback_file_progress'](file, info.received, info.size);
        };

        $.jRecorder.callback_file_progress_error = function (info) {
            jRecorderSettings['callback_file_progress_error'](info);
        };
        $.jRecorder.callback_before_sending = function (file) {
            jRecorderSettings['callback_before_sending'](file);
        };

        $.jRecorder.callback_file_upload_error = function (file, errobj) {
            errobj = errobj || {};
            jRecorderSettings['callback_file_upload_error'](file, errobj.errorID, errobj.text);
        };

        $.jRecorder.callback_flash_loaded = function (res) {
            if(window.console) console.log("loaded","loaded");
            if(res == "error"){
                jRecorderSettings['callback_error_loaded']();
                return;
            }
            $.jRecorder.loaded = true;
            jRecorderSettings['callback_flash_loaded']();
        };

        $.jRecorder.callback_playing_time = function (time, totaltime) {
            jRecorderSettings['callback_playing_time'](time, totaltime);
        };

        $.jRecorder.callback_playing_finish = function (totaltime) {
            jRecorderSettings['callback_playing_finish'](totaltime);
        };
        $.jRecorder.callback_playing_stop = function (totaltime) {
            jRecorderSettings['callback_playing_stop'](totaltime);
        };

        $.jRecorder.callback_started_preview = function (starttime, totaltime) {
            jRecorderSettings['callback_started_preview'](starttime, totaltime);
        } ;
        $.jRecorder.callback_pause_sound = function (curtime, totalTime) {
            jRecorderSettings['callback_pause_sound'](curtime, totalTime);
        };


        $.jRecorder.callback_get_progress = function (file, uuid, totalBytes) {
            var timestamp = (new Date()).valueOf();
            $.ajax({
                url: jRecorderSettings.progress_url + "?__t=" + timestamp,
                type: "get",
                success: function (result) {
                    $.jRecorder.callback_file_progress(file, result, totalBytes);
                },
                error: function (error) {
                    $.jRecorder.callback_file_progress_error(error);
                },

                beforeSend: function (xhr) {
                    xhr.setRequestHeader('X-Progress-ID', uuid);
                },
                dataType: "json"
            });
        };

        //function to return flash object from name
        function getFlashMovie(movieName) {
            // var isIE = navigator.appName.indexOf("Microsoft") != -1;
            // return (isIE) ? window[movieName] : document[movieName];
            return $("object[name=" + movieName + "]")[0];
        }
    })(jQuery);
});