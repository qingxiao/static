/*
 * API
 * 对象接口
 * 	列表，自定义属性[sound_ids],声音的播放顺序将会按照这里的id排序来确定
 * 	声音，自定义属性[sound_id]
 *  特定列表的伴随形式声音， "[sound_ids] .follower"
 *  全局的伴随形式声音	".mainfollower"
 * 播放逻辑接口
 * 	"[sound_id] .player-play:not(.disabled),[sound_id].player-play:not(.disabled)" 播放按钮
 *  "[sound_id] .player-pause,[sound_id].player-pause" 暂停按钮
 *  "[sound_id] .player-pre:not(.disabled)" 上一首按钮
 *  "[sound_id] .player-next:not(.disabled)" 下一首按钮
 * 播放参数
 *  "[sound_restart=true]" 点击后重新开始播放该声音
 * 事件接口
 * 	onSoundPlay(callback)	callback参数: sound{Object}
 * 	onSoundPause(callback)	callback参数: sound{Object}
 * 	onSoundResume(callback)	callback参数: sound{Object}
 * 	onSoundStop(callback)	callback参数: sound{Object}
 * 	onSoundFinish(callback)	callback参数: sound{Object}
 * 	onSoundChange(callback)	callback参数: sound{Object}
 * 例：
 * 	$(".mainfollower").bind("onSoundChange", function(event, sound){
 *		//渲染主播放器歌曲信息
 * 	});
 *  $(".mainfollower").unbind("onSoundChange");
 * 渲染接口
 * 	样式名以"sound_"开头的元素的内容将被替换
 * 	可以通过监听"onSoundChange"事件来渲染界面
 *  刷新播放器 player.render();
 */
define(['jquery', 'underscore', 'backbone', 'app/sound', 'plugin/player/model', 'app/sound', 'plugin/dialog','plugin/login_box','plugin/comment2d', 'plugin/helper', 'jquery.easydrag'],
    function ($, _, Backbone, soundModel, PlayerModel, sound, dialog, login_box, Comment2D) {
    mainPlayer = PlayerModel.mainPlayer;
    var playState = PlayerModel.playState;
    var player = {
        share: function (id) {
            //转发  在sound播放器下面展示  详见app/event/forward
        },
        share_pop: function (id) {
            //转发  弹出框  详见app/event/forward
        },
        forward_more: function(){
            //更多  分享网址   详见app/event/forward
        },
        comment: function ($el, track) {
            var	comment2d = followPlayer.comment2D(),
	            commentbar = $el.find(".player-commentbar"),
	            comments = comment.comments[soundId],
	            duration = data.duration,
	            width = commentbar.width(),
	            left = $el.find(".player-playbar").width(),
	            position = left / width * duration,
	            num = position * comments.length / duration;
	
	        comment2d.setEditable(true);
	        Comment2D.isOnEdit = true;
	        comment2d.setToManual();
	        soundPop.data("j-pop-mouseenter", true);
	        comment2d.showPopManual(num, position);
	        return false;
        },
        like: function ($sound, $el, track, callback) {
            callback = callback || $.noop;
            sound.like(track.id, !track.isliked, function (data, track) {
                callback();
                if (track.favoriteCount > 0) {
                    $("[sound_id=" + track.id + "]").find(".like-count").text(track.favoriteCount).show();
                } else {
                    $("[sound_id=" + track.id + "]").find(".like-count").text(track.favoriteCount).hide();
                }
                if (track.isliked) {
                    $("[sound_id=" + track.id + "]").find(".player-likebtn").each(function () {
                        $(this).addClass("liked");
                        $(this).find("a").addClass("liked");
                    });
                    (function () {
                        var count = 0;
                        var offset = $el.offset();
                        var div = $("<div style='top:" + (offset.top - 50) + "px" + ";left:" + (offset.left+10) + "px" + ";width:50px;height:50px;position:absolute;z-index:100000;overflow:hidden;'><img src='" + config.STATIC_ROOT + "/css/img/add1.png'></div>").appendTo($(document.body));

                        function AddOne(el) {
                            el.css({
                                top: offset.top - 5 * count,
                                opacity: (1.0 - count / 10)
                            });
                            count++;
                            setTimeout(function () {
                                if (count == 5) {
                                    el.remove();
                                    el = null;
                                    return;
                                }
                                AddOne(el);
                            }, 150);
                        }
                        AddOne(div);
                    })();
                } else {
                    $("[sound_id=" + track.id + "]").find(".player-likebtn").each(function () {
                        $(this).removeClass("liked");
                        $(this).find("a").removeClass("liked");
                    });
                }
            });
        },
        rendPreBtn: function () {
            this.$sound().find(".player-pre").toggleClass("disabled", !mainPlayer.preable());
        },
        rendNextBtn: function () {
            this.$sound().find(".player-next").toggleClass("disabled", !mainPlayer.nextable());
        },
        rendPlayBtn: function () {
            this.$sound().find(".player-play").toggleClass("disabled", !mainPlayer.playable());
        },
        rendPlayState: function () {
            var $playbtn = this.$playbtn(),
				_playState = mainPlayer.playState();
            $(".player-pause,.player-loading").addClass("player-play").removeClass("player-pause").removeClass("player-loading");
            if (playState.STOP == _playState || playState.PAUSE == _playState) {
                //$playbtn.addClass("player-play").removeClass("player-pause").removeClass("player-loading");
            } else if (playState.PLAYING == _playState) {
                $playbtn.addClass("player-pause").removeClass("player-play").removeClass("player-loading");
            } else if (playState.BUFFERING == _playState) {
                $playbtn.addClass("player-loading").removeClass("player-play").removeClass("player-pause");
            }
        },
        rendPlayInfo: function (sound) {
            var $sound = this.$sound();
            _.each(sound, function (val, key) {
                $sound.find(".sound_" + key).html(val);
            });
            //console.log("刷新当前播放的声音信息");
        },
        render: function () {
        	if(!mainPlayer.soundId())return;
            this.refreshElements();
            this.rendPreBtn();
            this.rendNextBtn();
            this.rendPlayBtn();
            this.rendPlayState();
            this.rendPlayInfo();
        
        },
        removeSound: function(soundId){
        	mainPlayer.removeSound(soundId);
        },
        $sounds: function () {
        	return $("[sounds]:has(.j-sound-working)");
        },
        $soundsFace: function () {
        	return $(".j-sound-working.follower").add(".mainfollower");
        },
        $sound: function (soundId) {
        	return $(".j-sound-working");
        },
        $playbtn: function () {
        	return $(".j-sound-working .player-operate");
        },
        $soundsFaceRefresh: function () {
            var soundId = mainPlayer.soundId();
            this.$soundsFace().attr("sound_id", soundId);
        },
        onChangePreable: function (mainPlayer, able) {
            this.rendPreBtn();
        },
        onChangePlayable: function (mainPlayer, able) {
            this.rendPlayBtn();
        },
        onChangeNextable: function (mainPlayer, able) {
            this.rendNextBtn();
        },
        onChangePlayState: function (mainPlayer, playState) {
            this.rendPlayState();
        },
        onChangeSoundId: function () {
            this.refreshElements();
        },
        refresh$sounds: function(){
        	var soundIds = this._$soundsWorking.attr("sound_ids").split(",");
        	mainPlayer.soundIds(soundIds);
        },
        refreshElements: function(){
        	//var t = (new Date()).getTime();
        	var soundId = mainPlayer.soundId();
        	$(".j-sound-working").removeClass("j-sound-working");
        	$("[sound_id=" + soundId + "]").addClass("j-sound-working");
        	$("[sounds]").has(".j-sound-working").find(".follower").add(".mainfollower").attr("sound_id", soundId).addClass("j-sound-working");
        	$(".player-play").addClass("player-operate");
        	$("[sound_restart]").removeClass(".player-operate");
        	//$(".footer").text((new Date()).getTime()-t);
        	
        	Comment2D.refresh();
        },
        init: function(){
        	this.render();
        },
        onChangeSound: function (mainPlayer, sound) {
            this.rendPlayInfo(sound);
            this.$sound(sound.id).trigger("onSoundChange", [sound]);
        },
        onChangePlayCount: function (mainPlayer, soundId) {
            var $count = this._getSoundInfoPart(soundId, "count"),
				count = parseInt($count.text(), 10) + 1;
            $count.text(count).attr("title", "播放" + count);
        },
        _getSoundInfo: function (soundId) {
            return {
                id: sound_id,
                title: this._getSoundInfoPartVal(soundId, "title")
            };
        },
        _getSoundInfoPart: function (soundId, part) {
            var $sound = $("[sound_id=" + soundId + "]");
            return $sound.find(".sound_" + part);
        },
        _getSoundInfoPartVal: function (soundId, part) {
            return this._getSoundInfoPart(soundId, part).text();
        },
        onSoundPlay: function (sound) {
            var _this = this;
            setTimeout(function () {
                _.each(_this.$sound(), function (el, key) {
                    var $sound = $(el),
					soundId = $sound.attr("sound_id");
                    $("[sound_id!=" + soundId + "]").removeClass("open");
                    if (!$sound.is(".open") && $sound.find(".info").size()) {
                        $sound.find(".info").click();
                    }
                });
            }, 0);
            this.$sound(sound.id).trigger("onSoundPlay", [sound]);
        },
        onSoundPause: function (sound) {
            this.$sound(sound.id).trigger("onSoundPause", [sound]);
        },
        onSoundResume: function (sound) {
            this.$sound(sound.id).trigger("onSoundResume", [sound]);
        },
        onSoundStop: function (sound) {
            this.$sound(sound.id).trigger("onSoundStop", [sound]);
        },
        onSoundFinish: function (sound) {
            _.each(this.$sound(), function (el, key) {
                var $sound = $(el);
                if ($sound.find(".player-playbar").size()) {
                    $sound.find(".player-playbar").width(0);
                    $sound.find(".player-position").text("00:00");
                }
            });
            this.$sound(sound.id).trigger("onSoundFinish", [sound]);
        },
        onSoundWhileplaying: function (sound, smSound) {
            _.each(this.$sound(), function (el, key) {
                var $sound = $(el);
                if ($sound.find(".player-playbar").size()) {
                    var p = smSound.position / smSound._duration_net, width = $sound.find(".player-progressbar").width();
                    $sound.find(".player-playbar").width(parseInt(p * width));
                    $sound.find(".player-position").text(helper.getTime(smSound.position));
                }
                var $commentbar = $sound.find(".player-commentbar").eq(0);
                if ($commentbar.size()){
                	var comment2d = Comment2D.getInstanceByContainer($commentbar);
                	comment2d.showPopAuto(smSound.position / 1000);
                }
            });
        },
        onSoundWhileloading: function (sound, smSound) {
            _.each(this.$sound(), function (el, key) {
                var $sound = $(el);
                if ($sound.find(".player-seekbar").size()) {
                    var p = smSound.bytesLoaded / smSound.bytesTotal, width = $sound.find(".player-progressbar").width();
                    $sound.find(".player-seekbar").width(parseInt(p * width));
                }
            });
        },
        _$soundsWorking:null,
        $soundsWorking:function($el){
        	this._$soundsWorking = $el;
        },
        release: function(){
        	Comment2D.release();
        }
    };
    mainPlayer.on("change:preable", player.onChangePreable, player);
    mainPlayer.on("change:playable", player.onChangePlayable, player);
    mainPlayer.on("change:nextable", player.onChangeNextable, player);
    mainPlayer.on("change:isQuerying", player.onChangeIsQuerying, player);
    mainPlayer.on("change:playState", player.onChangePlayState, player);
    mainPlayer.on("change:soundId", player.onChangeSoundId, player);
    mainPlayer.on("change:sound", player.onChangeSound, player);
    //mainPlayer.on("change:playCount", player.onChangePlayCount, player);

    mainPlayer.on("onSoundPlay", player.onSoundPlay, player);
    mainPlayer.on("onSoundPause", player.onSoundPause, player);
    mainPlayer.on("onSoundResume", player.onSoundResume, player);
    mainPlayer.on("onSoundStop", player.onSoundStop, player);
    mainPlayer.on("onSoundFinish", player.onSoundFinish, player);
    mainPlayer.on("onSoundWhileplaying", player.onSoundWhileplaying, player);
    mainPlayer.on("onSoundWhileloading", player.onSoundWhileloading, player);

    //player.render();
    /*
    * 播放逻辑
    */
    $("[sound_id] .player-pause,[sound_id].player-pause").live("click", function () {
        mainPlayer.pause();
        $(".player-pause,.player-loading").addClass("player-play").removeClass("player-pause").removeClass("player-loading");
    });
    $("[sound_id] .player-play:not(.disabled),[sound_id].player-play:not(.disabled)").live("click", function () {
    	//var t = (new Date()).getTime();
        var $el = $(this),
			options = {},
			$sound = $el.closest("[sound_id]"),
			soundId = $sound.attr("sound_id"),
			$sounds = $sound.parents("[sound_ids]"),
			soundIds = [];
        player.$soundsWorking($sounds);
        if ($sounds.size()) {
            soundIds = $sounds.attr("sound_ids").split(",");
        } else {
            soundIds = [soundId];
        }
        if(!$el.is("[sound_restart=true]"))$el.addClass("player-pause").removeClass("player-play").removeClass("player-loading");
        mainPlayer.soundIds(soundIds);
        mainPlayer.soundId(soundId);
        if ($el.is("[sound_restart=true]")) {
            mainPlayer.stop({
                position: 0
            });
            options = {
                position: 0
            };
        }
        mainPlayer.play(options);
        //$(".footer").text((new Date()).getTime()-t);
    });
    $("[sound_id] .player-pre:not(.disabled)").live("click", function () {
        mainPlayer.prev();
    });
    $("[sound_id] .player-next:not(.disabled)").live("click", function () {
        mainPlayer.next();
    });
    $(".player-seekbar:not(.disabled)").live("click", function (e) {
        var $seekbar = $(this),
			$progressbar = $seekbar.parents(".player-progressbar"),
			$sound = $seekbar.parents("[sound_id]").eq(0),
			soundId = $sound.attr("sound_id"),
			left = $seekbar.offset().left,
            width = $progressbar.width(),
            percent = (e.clientX - left) / width;
        $(".player-playbar", $progressbar).css({ width: (e.clientX - left) + "px" });
        mainPlayer.seekInPrecent(percent, soundId);
        return false;
    });
    /*
    *  业务逻辑
    */


    $("[sound_id] .player-sharebtn").live("click", function () {
        var $el = $(this),
			$sound = $el.parents("[sound_id]").eq(0),
			soundId = $sound.attr("sound_id");
        player.share(soundId, $el, $sound);
    });
    $("[sound_id] .player-sharebtn-pop").live("click", function () {

        var $el = $(this),
            $sound = $el.parents("[sound_id]").eq(0),
            soundId = $sound.attr("sound_id");
        if (!helper.isLogin()) {
            sound.getInfo(soundId, function (track) {
                login_box.setFollowsId(track.uid);
                login_box.open(function (data) {
                    login_box.close();
                    window.location.href = window.location.href;
                });
            });
            return false;
        }
        player.share_pop(soundId, $el, $sound);
    });
    $("[sound_id] .player-likebtn").live("click", function () {
        var $el = $(this),
			$sound = $el.closest("[sound_id]"),
			soundId = $sound.attr("sound_id");

        sound.getInfo(soundId, function (track) {
            if (!helper.isLogin()) {
                login_box.setFollowsId(track.uid);
                login_box.setLikeSoundId(soundId);
                login_box.open(function (data) {
                    login_box.close();
                    player.like($sound, $el, track, function(){
                        window.location.href = window.location.href;
                    });

                });
                return false;
            }
            player.like($sound, $el, track);
        }, function () {
            dialog.alert("该声音不存在");
        });
    });
    /*
    $("[sound_id] .player-commentbtn").live("click", function () {
        var $el = $(this),
			$sound = $el.closest("[sound_id]"),
			soundId = $sound.attr("sound_id");

        sound.getInfo(soundId, function (track) {
            if (!helper.isLogin()) {
                login_box.setFollowsId(track.uid);
                login_box.open(function (data) {
                    login_box.close();
                    window.location.href = window.location.href;
                });
                return false;
            }
            player.comment($el, track);
        }, function () {
            dialog.alert("该声音不存在!");
        });
    });
    */

    $("[sound_id] .player-forward").live({
        mouseenter:function(){
            var $el = $(this),
                $sound = $el.closest("[sound_id]"),
                soundId = $sound.attr("sound_id");

            sound.getInfo(soundId, function (track) {
                player.forward_more($sound, soundId, track.uid);
                $el.addClass("hover");
            }, function () {
                dialog.alert("该声音不存在!");
            });

        },
        mouseleave:function(){
            $(this).removeClass("hover");
        }
    });
    /******展开详情******/
    var info_template = _.template(['<div class="line"></div>',
	        	                    '<div class="infobox-content">',
	        	                    '<%if(soundface_middle.indexOf("/css/")==-1){%>',
	        	                    '<img style="cursor: pointer;" popsrc="<%=cover_url%>" alt="简介" src="<%= soundface_middle?(soundface_middle):(config.STATIC_ROOT+\'/css/img/common/track_180.jpg\')%>">',
	        	                    '<%}else{%>',
	        	                    '<img src="<%= soundface_middle?(soundface_middle):(config.STATIC_ROOT+\'/css/img/common/track_180.jpg\')%>">',
	        	                    '<%}%>',
	        	                    '<%if(info){%>',
	        	                    '<p><%=info%></p>',
	        	                    '<%}%>',
	        	                    '</div>'].join(''));
    $("[sound_id] .info").live("click", function () {
        var $el = $(this),
			$sound = $el.parents("[sound_id]").eq(0),
			soundId = $sound.attr("sound_id");
        if ($sound.is(".open")) {
            $sound.removeClass("open");
        }
        else {
            $sound.addClass("open");
            var infobox = $sound.find(".infobox");
            soundModel.getInfo(soundId, function (data) {
                infobox.html(info_template(data));
            }, {
                404: function () {
                    //player.soundRemoved(mainPlayer, soundId);
                    infobox.html('<div class="line"></div>该声音不存在');
                }
            });
        }
    });
    /*
    * 键盘事件
    */
    $(window).keydown(function (event) {
        if (event.keyCode === 32) {
            if (mainPlayer.isPaused()) {
                mainPlayer.play();
            } else {
                mainPlayer.pause();
            }
        }
        if (event.keyCode === 39) {
            mainPlayer.next();
        }
        if (event.keyCode === 37) {
            mainPlayer.prev();
        }
    });

    /*
    * 声音模块
    */
    var volume = {
        barWidth: 24,
        render: function () {
            var volume = mainPlayer.volume(),
            	width = this.barWidth * volume / 100,
				off = !volume;
            $(".player-volume").width(width);
            if (off) {
                $(".volume-panel").addClass("off");
                $(".volume-bar").css({ "left": this.barWidth / 2 + "px", "top": 0 }).dragOff();
                $(".player-unmute").addClass("player-mute").removeClass("player-unmute");
            } else {
                $(".volume-panel").removeClass("off");
                $(".volume-bar").css({ "left": width + "px", "top": "2px" }).dragOn();
                $(".player-mute").addClass("player-unmute").removeClass("player-mute");
            }
        }
    };
    volume.render();
    //mainPlayer.on("change:volume", volume.render, volume);
    $('.player-unmute').live({
        click: function () {
            var $el = $(this);
            $el.data("last_volume", mainPlayer.volume());
            mainPlayer.volume(0);
            volume.render();
        }
    });
    $('.player-mute').live({
        click: function () {
            var $el = $(this),
            last_volume = $el.data("last_volume") || 50;
            mainPlayer.volume(last_volume);
            volume.render();
        }
    });
    $('.player-volumebar').live({
        click: function (e) {
            var $el = $(this),
				left = $el.offset().left,
				width = $el.width(),
				x = e.clientX - left,
				percent = (e.clientX - left) / width;
            if (x <= 0) {
                x = 0;
                percent = 0;
            }
            if (x >= 24) {
                x = 24;
                percent = 1;
            }
            mainPlayer.volume(parseInt(percent * 100));
            volume.render();
        }
    });
    $(".volume-bar").easydrag();
    $(".volume-bar").ondrag(function (e, element) {
        var $el = $(element),
    		position = $el.position(),
    		left = position.left;
        if (left < 0) {
            left = 0;
        }
        if (left > 24) {
            left = 24;
        }
        $el.css({
            "top": "2px",
            "left": left + "px"
        });
        $(".player-volume").width(left);
        mainPlayer.volume(parseInt(left * 100 / 24));
    });
    /******** 主播放器 *******/
    $(".mainfollower").bind("onSoundChange", function (event, sound) {
        var $el = $(this),
    		cutedTitle = helper.cutString(sound.title, 30);
        $el.find(".info-name a").text(cutedTitle).attr("href", "/#/" + sound.uid + "/sound/" + sound.id).attr("title", sound.title);
        $el.find(".g-player-control").show();
    });
    $('.mainfollower .info-name').live({
        mouseenter: function () {
            $(this).addClass("hover");
        },
        mouseleave: function () {
            $(this).removeClass("hover");
        }
    });
    $(window).bind("scroll", window_onscroll_callback);
    function window_onscroll_callback() {
        $(".g-player").toggleClass("topnav-fixed", !!$(document).scrollTop());
    }
    return player;
});