/*
 * 基本播放器视图，包含播放器视图基本功能
 */
define([ 'jquery', 'underscore', 'backbone', './model', 'module/wave' ], function($, _, Backbone, Model, wave) {
	var mainPlayer = Model.mainPlayer;
	var playState = Model.playState;
	var View = Backbone.View.extend({
		_isFollower : false, // 是否是伴随式播放器
		_$soundIds : null, // 所在的列表
		_$playbtn : null, // 播放按钮
		_soundId : "", // 声音id
		_$progressbar : null, // 进度条
		_$commentbar : null, // 评论条
		_$seekbar : null, // 下载进度条
		_$playbar : null, // 播放进度条
		_$position : null, // 时间进度
		_$wavebox : null, //波形容器
		_$nonius: null, //游标，在seek时用
		_$noniusTime : null, //游标内乘放时间的容器
		_$commentbarBtn : null,
		_$noniusCover : null,
		events : helper.getEvents({
			"START_EV .playBtn:not(.disabled)" : "play",
			"START_EV .pauseBtn:not(.disabled)" : "pause",
			"click .player_progressbar" : "seek"
		}),
		initialize : function() {
			var $el = this.$el;
			this._soundId = $el.attr("sound_id");
			this._$soundIds = $el.closest("[sound_ids]");
			this._$playbtn = $el.find(".playBtn,.pauseBtn");
			this._$progressbar = $el.find(".player_progressbar");
			this._$commentbar = $el.find(".player_commentbar");
			this._$seekbar = this._$progressbar.find(".player_seekbar");
			this._$playbar = this._$progressbar.find(".player_playbar");
			this._$position = $el.find(".sound_position");
			this._$wavebox = $el.find(".player_wavebox");
			this._$nonius = $el.find(".player_nonius");
			this._$noniusTime = $el.find(".player_nonius_time");
			this._$noniusCover = $el.find(".player_nonius_cover");
			this._$commentbarBtn = $el.find(".player_commentbarBtn");

			// 进度条事件
			if (this._$seekbar.size()) {
				_.extend(this.events, {
					"mousemove .player_progressbar" : "onSeekbarMousemove"
				});
			}
			if (this._$nonius.size()){
				_.extend(this.events, {
					"mouseenter .player_progressbar" : "onSeekbarMouseenter",
					"mouseleave .player_progressbar" : "onSeekbarMouseleave"
				});
			}
			if (this._$progressbar.size()) {
				mainPlayer.on("onSoundWhileplaying", this.onSoundWhileplaying, this);
			}
			if (this._$commentbarBtn.size()){
				_.extend(this.events, {
					"click .player_commentbarBtn" : "onCommentbarBtnClick"
				});
			}

			mainPlayer.on("change:playState", this.rendPlaybtn, this);
			mainPlayer.on("onSoundUnexist", this.onSoundUnexist, this);
			mainPlayer.on("onSoundIdSelect", this.onSoundIdSelect, this);

			mainPlayer.on("onSoundPlay", this.onSoundPlay, this);
			mainPlayer.on("onSoundPause", this.onSoundPause, this);
			mainPlayer.on("onSoundResume", this.onSoundResume, this);
			mainPlayer.on("onSoundStop", this.onSoundStop, this);
			mainPlayer.on("onSoundFinish", this.onSoundFinish, this);
			
			mainPlayer.on("onSoundPast", this.onSoundPast, this);

			if (mainPlayer.soundId() == this._soundId) {
				this.rendPlaybtn();
			}
		},
		isOnPlaying : function(){
			return this._$playbtn.is(".pauseBtn");
		},
		onCommentbarBtnClick : function(){
			this.$el.toggleClass("is-player-commentbarHidden", !this.$el.is(".is-player-commentbarHidden"));
			wave.render({$container: this.$el, isManual: true});
		},
		seekbarMouseenterTimeoutId:null,
		onSeekbarMouseenter: function(){
			var _this = this;
			if(_this.seekbarMouseenterTimeoutId){
				clearTimeout(_this.seekbarMouseenterTimeoutId);
			}
			_this.seekbarMouseenterTimeoutId = setTimeout(function(){
				if (_this.isOnPlaying())_this._$nonius.fadeIn(200);				
			},200);
		},
		onSeekbarMouseleave: function(){
			clearTimeout(this.onSeekbarMousemoveTimeoutId);
			if(this.seekbarMouseenterTimeoutId){
				clearTimeout(this.seekbarMouseenterTimeoutId);
			}
			if (this.isOnPlaying())this._$nonius.hide();
		},
		onSoundIdSelect : function(soundId) {
			if (soundId != this._soundId)  return;
			this.$el.trigger("onSoundIdSelect", [ soundId ]);
		},
		onSoundPlay : function(sound) {
			if (mainPlayer.soundId() != this._soundId)  return;
			this.$el.trigger("onSoundPlay", [ sound ]);
		},
		onSoundPause : function(sound) {
			if (mainPlayer.soundId() != this._soundId)  return;
			this.$el.trigger("onSoundPause", [ sound ]);
		},
		onSoundResume : function(sound) {
			if (mainPlayer.soundId() != this._soundId)  return;
			this.$el.trigger("onSoundResume", [ sound ]);
		},
		onSoundStop : function(sound) {
			if (mainPlayer.soundId() != this._soundId)  return;
			this.$el.trigger("onSoundStop", [ sound ]);
		},
		onSoundFinish : function(sound) {
			if (mainPlayer.soundId() != this._soundId)  return;
			if (this._$playbar.size()) {
				this._$playbar.width(0);
				this._$position.text("00:00");
				this._$nonius.hide();
			}
			this.$el.trigger("onSoundFinish", [ sound ]);
		},
		getSoundId : function() {
			return this._soundId;
		},
		render : function() {
		},
		/*
		 * 快进
		 */
		seek : function(e) {
			if (!this.isOnPlaying()){
				this.play();
				return;
			}
			var $progressbar = this._$progressbar, soundId = this._soundId, left = $progressbar.offset().left, width = $progressbar.width(), percent = (e.clientX - left) / width;
			mainPlayer.seekInPrecent(percent, soundId);
			return false;
		},
		/*
		 * 快进辅助
		 */
		_lastLeft:0,
		onSeekbarMousemoveTimeoutId:-1,
		onSeekbarMousemove : function(e) {
			var _this = this;
			clearTimeout(this.onSeekbarMousemoveTimeoutId);
			this.onSeekbarMousemoveTimeoutId = setTimeout(function(){  
				var $progressbar = _this._$progressbar, left = e.clientX - $progressbar.offset().left, width = $progressbar.width(), soundId = _this._soundId;
				if(Math.abs(left-_this._lastLeft) < 1) return false;
				if (soundId === undefined)
					return;
				if (!_this.isOnPlaying())
					return;
				if(left<0 || left>width) return;
				var timeWidth = 38;
				if(_this._$nonius.is(".is-long")){
					timeWidth = 48;
				}
				if(left<timeWidth/2-4){
					_this._$noniusTime.css("left",-left-4);
				}else if(left > width - (timeWidth/2 - 4)){
					_this._$noniusTime.css("left",(width-left+4-timeWidth));
				}else{
					_this._$noniusTime.css("left",-timeWidth/2);
				}
				_this._$nonius.css("left",left);				
				
			    _this._$noniusCover.css({
			    	width:left+"px",
			    	left:-left+"px"
			    });
				mainPlayer.getSoundInfo(soundId, function(sound) {
					var duration = sound.duration,position = left / width * duration, oneHour = 60*60*1000;
					if(duration>oneHour)_this._$nonius.toggleClass("is-long", position>=oneHour);
					_this._$noniusTime.text(helper.getTime(position)); 
				});
			},0);
		},
		/*
		 * 声音不存在时的处理函数
		 */
		onSoundUnexist : function(soundId) {
			if (soundId != this._soundId)
				return false;
			var $el = this.$el;
			this._$playbtn.addClass("disabled playBtn").removeClass("pauseBtn player-loading").attr("title", "无法播放").css({
				"cursor" : "default"
			});
			this._$commentbar.addClass("disabled");
			$el.find(".middlePlayer").addClass("disabled").attr("title", "无法播放");
			$el.find(".sound_bottom").html('');
			return true;
		},
		/*
		 * 正在播放事件的处理函数
		 */
		onSoundWhileplaying : function(sound, smSound) {
			if (!this.isWorking())
				return false;
			if (helper.isWindowBusy())
				return false;
			var $progressbar = this._$progressbar;
			if (!$progressbar.size())
				return false;
			var $playbar = this._$playbar, $seekbar = this._$seekbar, width = $progressbar.width();
			if ($playbar.size()) {
				var p = smSound.position / smSound._duration_net;
				p = p>1?1:p;
				$playbar.css("width", 100 * p + "%");
				this._$position.text(helper.getTime(smSound.position));
			}
			if ($seekbar.size()) {
				var p = smSound.bytesLoaded / smSound.bytesTotal;
				p = p>1?1:p;
				$seekbar.css("width", 100 * p + "%");
			}
			return true;
		},
		/*
		 * 判断是否需要渲染按钮
		 */
		isWorking : function() {
			var soundId = mainPlayer.soundId();
			if (soundId == this._soundId) {
				return true;
			}
		},
		/*
		 * 渲染播放按钮
		 */
		rendPlaybtn : function() {
			if (!this.isWorking())
				return false;
			var $playbtn = this._$playbtn, _playState = mainPlayer.playState();
			if (playState.STOP == _playState || playState.PAUSE == _playState) {
                //todo 可以写成方法调用 传入dom
				$playbtn.addClass("playBtn").removeClass("pauseBtn player-loading").attr("title", "播放");
				this._$progressbar.attr("title","点击播放");
			} else if (playState.PLAYING == _playState) {
				$playbtn.addClass("pauseBtn").removeClass("playBtn player-loading").attr("title", "暂停");
			} else if (playState.BUFFERING == _playState) {
				$playbtn.addClass("player-loading").removeClass("playBtn pauseBtn").attr("title", "加载中");
			}
			return true;
		},
		onSoundPast: function(sound){
			if (sound.id != this._soundId)
				return false;
			var $playbtn = this._$playbtn;
			$playbtn.addClass("playBtn").removeClass("pauseBtn player-loading").attr("title", "播放");
			this._$progressbar.attr("title","点击播放");
			return true;
		},
		/*
		 * 播放
		 */
		play : function() {
			var _this = this, $el = this.$el, soundId = $el.attr("sound_id"), soundIds = [];
			if (!$el.is("[sound_restart=true]")) {
				this._$playbtn.addClass("player-loading").removeClass("playBtn pauseBtn").attr("title", "加载中");
				this._$progressbar.attr("title","");
			}
			$(".j-player-soundIdsWorking").removeClass("j-player-soundIdsWorking");
			if (this._$soundIds.size()) {
				soundIds = this._$soundIds.addClass("j-player-soundIdsWorking").attr("sound_ids").split(",");
			} else {
				soundIds = [ soundId ];
			}
			mainPlayer.soundIds(soundIds);
			mainPlayer.select(soundId, function(sound) {
				var options = _this.getPlayOptions();
				mainPlayer.play(options);
			});
		},
		/*
		 * 获取播放参数
		 */
		getPlayOptions : function() {
			var options = {};
			if (this.$el.is("[sound_restart=true]")) {
				mainPlayer.stop({
					position : 0
				});
				options.position = 0;
			}
			return options;
		},
		/*
		 * 暂停
		 */
		pause : function() {
			this._$playbtn.addClass("playBtn").removeClass("pauseBtn player-loading").attr("title", "播放");
			mainPlayer.pause();
		},
		/*
		 * 释放
		 */
		release : function() {
			this.$el.off();
			this.undelegateEvents();
			mainPlayer.off(null, null, this);
		}
	});
	/*
	 * 键盘事件
	 */
	$("body").keydown(function(event) {
		var tagName = event.target.tagName;
		if (tagName == "INPUT" || tagName == "TEXTAREA") {
			return;
		}
		// 空格
		if (event.keyCode === 32) {
			if (mainPlayer.isPaused()) {
				mainPlayer.play();
			} else {
				mainPlayer.pause();
			}
			return false;
		}
        // todo 可以用switch
		// 右
		if (event.keyCode === 39) {
			mainPlayer.seekPlus();
			return false;
		}
		// 左
		if (event.keyCode === 37) {
			mainPlayer.seekMinus();
			return false;
		}
		// 下
		if (event.keyCode === 40) {
			mainPlayer.next();
			return false;
		}
		// 上
		if (event.keyCode === 38) {
			mainPlayer.prev();
			return false;
		}
	});
	return View;
});