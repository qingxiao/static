define(['underscore', 'backbone', 'jquery', 'model/app', 'plugin/soundManager', 'model/sound', 'collection/sound'], function (_, Backbone, $, app, soundManager, soundModel, soundList) {
    /*
    * 播放规则：1.如果用户手动暂停，保留声音。
    */
    var Player = Backbone.View.extend({
        el: document.getElementById("j_player"),
        maxLengthOfLastSounds: 5,
        //SMSounds: [],
        _needWhileplaying: false,
        _playTimeoutId:null,
        events: {
            "click .player-play": "play",
            "click .player-pre": "pre",
            "click .player-next": "next",
            "click .player-pause": "pause"
        },
        initialize: function () {
            this.model.on('change:sound', this.onChangeSound, this);
            this.model.get("_lastSounds").on("add", this.onLastSoundsAdd, this);
            this.model.get("_lastSounds").on("remove", this.onLastSoundsRemove, this);
            this.model.get("sounds").on("add", this.onSoundsAdd, this);
            this.model.get("sounds").on("remove", this.onSoundsRemove, this);
        },
        _play: function () {
            var sound = this.model.get("sound"),
				smSound = this.getSMSound(sound);
            sound.timing[(new Date()).getTime()] = "onplay";
            if(this._playTimeoutId)clearTimeout(this._playTimeoutId);
            this._playTimeoutId = setTimeout(function(){
            	soundManager.stopAll();
            	smSound.play({position:smSound._last_position});
            },1000);
            this.model.set("playState", 1);
            this.model.set("playEnd", false);
        },
        play: function (sound) {
            var now = this.model.get("sound");
            if (sound && sound != now) {
                this.model.set("sound", sound);
            } else {
                this.resume();
            }
        },
        //播放器续播和声音续播要区分概念
        resume: function () {
            var sound = this.model.get("sound"),
				smSound = this.getSMSound(sound);
            if (smSound.paused) {
                sound.timing[(new Date()).getTime()] = "onresume";
                smSound.resume();
                this.model.set("playState", 1);
            }
        },
        pre: function () {
            var sound = this.preSound();
            if (sound) {
                this.model.set("sound", sound);
            }
        },
        next: function () {
            var sound = this.nextSound();
            if (sound) {
                this.model.set("sound", sound);
            }
        },
        preSound: function () {
            var model = this.model,
				now = model.get("sound"),
				sounds = model.get("sounds"),
				index = sounds.indexOf(now);
            if (index - 1 >= 0) {
                return sounds.at(index - 1);
            }
        },
        nextSound: function () {
            var model = this.model,
				now = model.get("sound"),
				sounds = model.get("sounds"),
				index = sounds.indexOf(now);
            if (index + 1 <= sounds.length - 1) {
                return sounds.at(index + 1);
            } else {
                var smSound = this.getSMSound(now);
                sound.timing[(new Date()).getTime()] = "onstop";
                //console.log("已到播放列表尾");
                if (!smSound.playState) {
                    this.model.set("playEnd", true);
                    this.model.set("playState", 0);
                }
            }
        },
        pause: function (sound) {
            sound = sound || this.model.get("sound");
            if (!sound) return;
            var smSound = this.getSMSound(sound);
            //如果正在播放那么暂停播放
            //if (smSound.playState) {
                sound.timing[(new Date()).getTime()] = "onpause";
                if(sound == this.model.get("sound")){
                	smSound.pause();
                }else{
                	//smSound._last_position = smSound.position||smSound._last_position;
                	//smSound.stop();
                	//smSound.unload();
                }
            //}
            this.model.set("playState", 2);
        },
        render: function () {

        },
        listendRecord: function (data) {
            $.ajax({
                url: '/mobile/listened/record',
                data: data,
                type: "post",
                dataType: "json"
            });
        },
        onChangeSound: function (model, sound) {
            var lastSound = this.model.previous("sound"),
				data = {};
            data.currentTrackId = sound.get("trackId");
            if (lastSound) {
                //this.pause(lastSound);
                this.stopSound(lastSound);
                data.lastTrackId = lastSound.id;
                data.listenedTime = getPlayDuration(lastSound.timing);
                data.listenedPosistion = this.getSMSound(lastSound).position;
                lastSound.timing = {};
            }
            this.listendRecord(data);
            this._play();
            this.render();
        },
        stopSound: function(sound){
			var last = this.getSMSound(sound||this.model.get("sound"));
			if(last){
				last._last_position = last.position||last._last_position;;
				//last.stop();
				//last.unload();
				last.destruct();
			}
		},
        onLastSoundsAdd: function () {
            var lastSounds = this.model.get("_lastSounds"),
				sound = lastSounds.at(0);
            if (this.maxLengthOfLastSounds < lastSounds.length) {
                lastSounds.remove(sound);
            }
        },
        onLastSoundsRemove: function (sound) {
            this.reomveSound(sound);
        },
        onSoundsAdd: function () {

        },
        onSoundsRemove: function (sound) {
            this.reomveSound(sound);
        },
        reomveSound: function (sound) {
            sound.timing[(new Date()).getTime()] = "onfinish";
            var trackId = sound.get("trackId"),
			smSound = soundManager.getSoundById(trackId);
            delete smSound.sound;
            smSound.destruct();
        },
        getSMSound: function (sound) {
            var that = this,
				data = sound.toJSON(),
				trackId = data.trackId,
				smSound = soundManager.getSoundById(trackId);
				//SMSounds = this.SMSounds,
				//smSound = _.find(SMSounds, function (smSound) { return smSound.id == trackId; });
            if (!smSound) {
                sound.timing = {};
                if (!data.playUrl) data.playUrl = "";
                smSound = soundManager.createSound({
                    id: trackId,
                    url: data.playUrl.indexOf("http://") >= 0 ? data.playUrl : config.FDFS_PATH + "/" + data.playUrl,
                    volume: that.volume,
                    //sound: sound,
                    onfinish: function () {
                        that.next();
                    },
                    whileplaying: function () {
                        if (this.paused) return; //解决音频暂停时会有一些延时的问题。
                        that.onWhileplaying(this);
                    }
                });
                smSound.duration_net = parseInt(data.duration)*1000;
                smSound.maxLoadedPersent = 0;
                //this.SMSounds.push(smSound);
            }
            smSound.timing = {};
            return smSound;
        },
        needWhileplaying: function (whileplaying) {
            if (whileplaying !== undefined) {
                this._needWhileplaying = whileplaying;
            } else {
                return this._needWhileplaying;
            }
        },
        onWhileplaying: function (sound) {
            if (!this._needWhileplaying) return;
            var p = sound.position / sound.duration_net, 
            	width = $("body").width(),
            	p2 = sound.bytesLoaded / sound.bytesTotal;
            $(".player-playbar").width(p*width);
            if(sound.bytesLoaded)p=p2;
            if(p>sound.maxLoadedPersent){
            	sound.maxLoadedPersent = p;
            }else{
            	p = sound.maxLoadedPersent;
            }
            $(".player-forseek").width(p*width);
			$(".player-seekbar").width(p*width);
			//p = p * 100;
            //$(".player-playbar").css({width: p + "%"});
			//$(".player-seekbar").css({width: p + "%"});
        },
        setPosition: function (percent, sound) {
            var smSound = this.getSMSound(sound || this.model.get("sound"));
            smSound.setPosition(smSound.duration_net * percent);
            smSound._last_position = smSound.duration_net * percent;
        }
    });
    function getPlayDuration(time) {
        var duration = 0,
			times = _.keys(time).sort(function (a, b) { return a - b; });
        _.each(times, function (v, i) {
            var type = time[v];
            if (type == "onpause" || type == "onstop") {
                duration += v - times[i - 1];
            }
        });
        return duration;
    }
    function stopStrack(sound) {
        var playDuration = getPlayDuration(sound.timing);
        track_m.lastPlayInfo({
            id: sound.id,
            duration: playDuration,
            started_at: sound.started_at
        });
    }
    function startStrack(sound) {
        track_m.recordPlayInfo(sound.id);
        var btn = $(".play-count[track_id=" + sound.id + "]").show();
        var count = parseInt(btn.text()) + 1;
        btn.text(count).attr("title", "播放" + count);
    }
    var player = new Player({
        model: new Backbone.Model({
            volume: 50,
            _lastSounds: new soundList(),
            playEnd: true,
            playState: 0,  //0停止，1正在播放，2暂停
            sound: null,
            sounds: new soundList()
        })
    });
    window.player = player;
    return player;
});