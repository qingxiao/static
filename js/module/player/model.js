define([ 'jquery', 'underscore', 'backbone', 'model/sound', 'helper' ], function($, _, Backbone, SoundModel, helper) {
	var playState = {
		STOP : 0, // 还没开始播放，或者列表播放完必
		PAUSE : 1, // 播放器处于暂停状态
		BUFFERING : 2, // 播放器处于缓冲状态
		PLAYING : 3
	// 播放器正在播放
	};
	var Model = Backbone.Model.extend({
		unPlayables : [],
		loadeds : [],
		_needLoop : false,
		_needRandom: false,
		_orderSoundIds : [],
		defaults : function() {
			return {
				volume : storageVolume(),
				soundId : "",
				soundIds : [],
				sound : {},
				preable : false,
				nextable : false,
				playable : false,
				isQuerying : false,
				playState : playState.STOP
			};
		},
		volume : function(volume) {
			if (volume !== undefined) {
				this.set("volume", volume);
				storageVolume(volume);
				if (this.smSound())
					this.smSound().setVolume(volume);
			} else {
				return this.get("volume");
			}
		},
		soundId : function(soundId) {
			if (soundId !== undefined) {
				var soundIds = this.soundIds(), index = _.indexOf(soundIds, soundId);
				if (index >= 0) {
					this.set("soundId", soundId);
					this.set("playable", this.playable());
					this.set("preable", this.preable());
					this.set("nextable", this.nextable());
				}
			} else {
				return this.get("soundId");
			}
		},
		soundIds : function(soundIds) {
			if (soundIds !== undefined) {
				this._orderSoundIds = _.uniq(soundIds);
				var ids = this._orderSoundIds;
				if(this.getNeedRandom()){
					ids = this.getRandomSoundIds(soundIds);
				}
				this.set("soundIds", ids);
				var soundId = this.soundId();
				if (soundId) {
					index = _.indexOf(ids, soundId);
					if (index !== -1) {
						this.set("playable", this.playable());
						this.set("preable", this.preable());
						this.set("nextable", this.nextable());
					}
				}
			} else {
				return this.get("soundIds");
			}
		},
		preable : function() {
			var soundIds = this.get("soundIds"), soundId = this.get("soundId"), index = _.indexOf(soundIds, soundId);
			return index > 0;
		},
		nextable : function() {
			var soundIds = this.get("soundIds"), soundId = this.get("soundId"), index = _.indexOf(soundIds, soundId);
			return index < soundIds.length - 1;
		},
		playable : function() {
			return !!this.get("soundId");
		},
		playState : function() {
			return this.get("playState");
		},
		getSoundInfo : function(soundId, success, error, needSync) {
			var _this = this;
			var soundModel = new SoundModel({
				id : soundId
			});
			soundModel.query({
				async: !needSync,
				success : function(model) {
					var sound = model.toJSON();
					//_this.set("isQuerying", false);
					if(_this.selectSoundId == model.id){
						_this.trigger("onSoundExist", sound);
						success(sound);						
					}else{
						_this.trigger("onSoundPast", sound);
					}
				},
				removed : function() {
					//_this.set("isQuerying", false);
					_this.unPlayables.push(soundId);
					_this.trigger("onSoundUnexist", soundId);
					error(soundId);
				},
				error : function() {
					//_this.set("isQuerying", false);
					error(soundId);
				}
			});

		},
		soundPlayable : function(soundId, success, error) {
			//if (this.get("isQuerying"))
			//	return;
			//this.set("isQuerying", true);
			// this.set("playState",playState.BUFFERING);
			var _this = this, needSync = false;
			success = success || $.noop;
			error = error || $.noop;
			if (_.indexOf(_this.unPlayables, soundId) !== -1) {
				//_this.set("isQuerying", false);
				_this.trigger("onSoundUnexist", soundId);
				error(soundId);
				return;
			}
			if (helper.isIDevice) {
				needSync = true;
			}
			this.getSoundInfo(soundId, success, error, needSync);
		},
		removeSmSound : function(soundId) {
			var smSound = this.getSmSoundById(soundId);
			if (smSound)
				smSound.destruct();
		},
		selectSoundId:0,
		select : function(soundId, success, error) {
			var _this = this;
			success = success || $.noop;
			this.selectSoundId = soundId;
			_this.trigger("onSoundIdSelect", soundId);
			if (soundId !== this.get("soundId"))
				this.pauseAndUnload();
			error = error || function(soundId) {
				var soundIds = _this.get("soundIds"), preSoundId = soundId, index = _.indexOf(soundIds, preSoundId);
				_this.set("soundIds", _.without(_this.soundIds(), preSoundId));
				if (index < soundIds.length - 1) {
					soundId = soundIds[index + 1];
					_this.select(soundId, success, error);
				} else {
					// console.log("error");
				}
			};
			this.soundPlayable(soundId, function(sound) {
				_this.set("soundId", soundId);
				_this.set("sound", sound);
				// _this.set("playable", _this.playable());
				// _this.set("preable", _this.preable());
				// _this.set("nextable", _this.nextable());
				success(sound);
			}, function(soundId) {
				error(soundId);
				// _this.set("soundIds",_.without(_this.soundIds(), soundId));
			});
		},
		selectPrev : function(success, error) {
			success = success || $.noop;
			error = error || $.noop;
			if (!this.preable()) {
				error();
				return;
			}
			var _this = this, soundIds = this.get("soundIds"), preSoundId = this.get("soundId"), index = _.indexOf(soundIds, preSoundId), soundId = soundIds[index - 1];
			this.select(soundId, function(sound) {
				success(sound);
			}, function(soundId) {
				_this.set("soundIds", _.without(_this.soundIds(), soundId));
				_this.selectPrev(success, error);
			});
		},
		selectNext : function(success, error) {
			success = success || $.noop;
			error = error || $.noop;
			if (!this.nextable()) {
				error();
				// console.log("error");
				return;
			}
			var _this = this, soundIds = this.get("soundIds"), preSoundId = this.get("soundId"), index = _.indexOf(soundIds, preSoundId), soundId = soundIds[index + 1];
			this.select(soundId, function(sound) {
				success(sound);
			}, function(soundId) {
				_this.set("soundIds", _.without(_this.soundIds(), soundId));
				_this.selectNext(success, error);
			});
		},
		removeSoundId : function(soundId) {
			var _this = this, nowSoundId = this.soundId();
			if (nowSoundId == soundId) {
				var smSound = this.smSound(), needPlay = smSound.playState && !smSound.paused;
				this.pauseAndUnload();
				this.selectNext(function() {
					_this.soundIds(_.without(_this.soundIds(), soundId));
					if (needPlay) {
						_this.play();
					}
				}, function() {
					_this.selectPrev(function() {
						_this.soundIds(_.without(_this.soundIds(), soundId));
						if (needPlay) {
							_this.play();
						}
					}, function() {
						_this.soundIds(_.without(_this.soundIds(), soundId));
						_this.set("soundId", "");
						_this.set("sound", {});
					});
				});
			}
		},
		prev : function() {
			var _this = this;
			this.selectPrev(function(sound) {
				_this._play(sound);
			});
		},
		next : function() {
			var _this = this;
			this.selectNext(function(sound) {
				_this._play(sound);
			});
		},
		play : function(options) {
			options = options || {};
			if (!soundManager.ok()) {
				var _this = this;
				soundManager.reboot();
				soundManager.onready(function() {
					_this._play(options);
				});
				return;
			}
			this._play(options);
		},
		_play : function(options) {
			var sound = this.get("sound"), smSound = this.getSmSoundBySound(sound);
			if (smSound.paused) {
				smSound.resume();
			} else {
				if (smSound.playState)
					return;
				var position = smSound._last_position || options.position;
				if (_.indexOf(this.loadeds, smSound.soundId) === -1) {
					position = 0;
				}
				smSound.play(_.extend(options, {
					position : position,
					volume : this.volume()
				}));
			}
		},
		pause : function() {
			if (!this.playable())
				return;
			var smSound = this.smSound();
			if (smSound.playState) {
				smSound.pause();
			}
		},
		resume : function() {
			if (!this.playable())
				return;
			var smSound = this.smSound();
			if (smSound.playState) {
				smSound.resume();
			}
		},
		stop : function() {
			if (!this.playable())
				return;
			var smSound = this.smSound();
			if (smSound && smSound.playState) {
				smSound._last_position = 0;
				if (!smSound.paused) {
					playCount.putInfo(smSound.soundId, (new Date()).getTime(), "onstop");
				}
				smSound.stop();
				smSound.unload();
			}
		},
		pauseAndUnload : function() {
			if (!this.playable())
				return;
			var smSound = this.smSound();
			if (smSound && smSound.playState) {
				smSound._last_position = smSound.position || 0;
				if (!smSound.paused) {
					playCount.putInfo(smSound.soundId, (new Date()).getTime(), "onstop");
				}
				smSound.stop();
				smSound.unload();
			}
		},
		isPaused : function() {
			return this.get("playState") === playState.PAUSE;
		},
		seek : function(position, smSound) {
			if (smSound === undefined) {
				smSound = this.smSound();
			}
			if (!this.playable())
				return;
			smSound.setPosition(position);
			smSound._last_position = position;
		},
		seekPlus : function(options) {
			var smSound = this.smSound(), position;
			options = _.extend({
				dif : 1000
			}, options);
			if (!smSound)
				return;
			position = smSound.position + options.dif;
			this.seek(position);
		},
		seekMinus : function(options) {
			options = _.extend({
				dif : -1000
			}, options);
			this.seekPlus(options);
		},
		seekInPrecent : function(precent, soundId) {
			var smSound = null;
			if (soundId !== undefined) {
				smSound = this.getSmSoundById(soundId);
			} else {
				smSound = this.smSound();
			}
			if (!smSound)
				return;
			var position = smSound._duration_net * precent;
			this.seek(position, smSound);
		},
		sound : function() {
			return this.get("sound");
		},
		getSmSoundById : function(soundId) {
			return soundManager.getSoundById("s" + soundId);
		},
		smSound : function() {
			var soundId = this.get("soundId");
			return this.getSmSoundById(soundId);
		},
		getDuration : function(soundId) {
			var smSound = soundManager.getSoundById("s" + soundId);
			if (smSound) {
				return smSound._duration_net;
			}
		},
		loopPlay: function(){
			this.setNeedLoop(true);
		},
		orderPlay: function(){
			this.setNeedLoop(false);
			this.setNeedRandom(false);
			this.soundIds(this._orderSoundIds);
		},
		randomPlay: function(){
			this.setNeedLoop(false);
			this.setNeedRandom(true);
			this.soundIds(this._orderSoundIds);
		},
		setNeedLoop : function(needLoop) {
			this._needLoop = needLoop;
		},
		getNeedLoop : function() {
			return this._needLoop;
		},
		setNeedRandom : function(needRandom){
			this._needRandom = needRandom;
		},
		getNeedRandom : function(){
			return this._needRandom;
		},
		getRandomSoundIds: function(soundIds){
			var soundId = this.get("soundId");
			var newSoundIds = _.shuffle(_.without(soundIds, soundId));
			var index = _.indexOf(soundIds, soundId);
			if(soundId && index>=0)newSoundIds.unshift(soundId);
			return newSoundIds;
		},
		getSmSoundBySound : function(sound) {
			var _this = this, soundId = sound.id, smSound = this.getSmSoundById(soundId);
			if (!smSound) {
				smSound = soundManager.createSound({
					id : "s" + soundId,
					url : sound.url,
					volume : 50,
					onplay : function() {
						_this.trigger("onSoundPlay", this.sound);
						if (this.isBuffering) {
							_this.set("playState", playState.BUFFERING);
						} else {
							_this.set("playState", playState.PLAYING);
						}
						playCount.putInfo(this.soundId, (new Date()).getTime(), "onplay");
						this.started_at = (new Date()).toString();
						// playCount.render(this.soundId);
					},
					onpause : function() {
						_this.trigger("onSoundPause", this.sound);
						playCount.putInfo(this.soundId, (new Date()).getTime(), "onpause");
						_this.set("playState", playState.PAUSE);
					},
					onresume : function() {
						_this.trigger("onSoundResume", this.sound);
						playCount.putInfo(this.soundId, (new Date()).getTime(), "onresume");
						_this.set("playState", playState.PLAYING);
					},
					onstop : function() {
						_this.trigger("onSoundStop", this.sound);
						_this.set("playState", playState.STOP);
						playCount.postInfo(this.soundId);
					},
					onfinish : function() {
						_this.trigger("onSoundFinish", this.sound);
						playCount.putInfo(this.soundId, (new Date()).getTime(), "onfinish");
						_this.set("playState", playState.STOP);
						this._last_position = 0;
						playCount.postInfo(this.soundId);
						// this.destruct();//todo 播放完后拖动有冲突
						if (_this.getNeedLoop()) {
							_this.play();
						} else {
							_this.next();
						}
					},
					onload : function(success) {
						if (!success) {
							_this.next();
						} else {
							_this.loadeds.push(this.soundId);
						}
					},
					whileloading : function() {
						_this.trigger("onSoundWhileloading", this.sound, this);
					},
					whileplaying : function() {
						if (this.paused)
							return;// 解决音频暂停时会有一些延时的问题。
						_this.trigger("onSoundWhileplaying", this.sound, this);
					},
					onbufferchange : function() {
						if (this.isBuffering) {
							playCount.putInfo(this.soundId, (new Date()).getTime(), "onbuffering");
							_this.set("playState", playState.BUFFERING);
						} else {
							playCount.putInfo(this.soundId, (new Date()).getTime(), "onplay");
							_this.set("playState", playState.PLAYING);
						}
					}
				});
				smSound.soundId = soundId; // 保存数据Id，真实的Id需要使用字符串
				smSound._duration_net = sound.duration; // 记录播放时长，读取声音文件的时长不准
				smSound._last_position = 0; // 记录上次播放的最后位置
				smSound.sound = sound; // 缓存数据
			}
			return smSound;
		}
	}, {
		playState : playState
	});
	var mainPlayer = new Model();

	function supportsStorage() {
		return ('localStorage' in window) && window['localStorage'] !== null;
	}
	function storageVolume(volume) {
		if (volume !== undefined) {
			if (supportsStorage()) {
				localStorage["mainplayer_volume"] = volume;
			}
		} else {
			if (supportsStorage()) {
				return parseInt(localStorage["mainplayer_volume"] || 50, 10);
			} else {
				return 50;
			}
		}
	}
	/*
	 * 统计播放时长
	 */
	var playCount = {
		infos : {},
		initInfo : function(soundId) {
			this.infos[soundId] = {};
		},
		putInfo : function(soundId, time, type) {
			if (!this.getInfo(soundId)) {
				this.initInfo(soundId);
			}
			this.getInfo(soundId)[time] = type;
		},
		getInfo : function(soundId) {
			return this.infos[soundId];
		},
		postInfo : function(soundId, isFinal) {
			var time = this.getInfo(soundId), duration = this.getPlayDuration(time), position = 0, smSound = soundManager.getSoundById("s" + soundId);
			this.initInfo(soundId);
			if (smSound) {
				position = smSound._last_position;
			}
			var soundModel = new SoundModel({
				id : soundId
			});
			soundModel.recordPlayInfo(duration, position, !isFinal);
		},
		// render : function(soundId) {
		// var btn = $("[sound_id=" + soundId + "]").find(".play-count").show();
		// var count = parseInt(btn.eq(0).text(), 10) + 1;
		// btn.text(count).attr("title", "播放" + count);
		// },
		getPlayDuration : function(time) {
			var duration = 0, times = _.keys(time).sort(function(a, b) {
				return a - b;
			});
			_.each(times, function(v, i) {
				var type = time[v];
				if (type == "onpause" || type == "onstop" || type == "onfinish" || type == "onbuffering") {
					if (i > 0) {
						duration += v - times[i - 1];
					}
				}
			});
			return duration;
		}
	};
	function unload() {
		var sound = mainPlayer.sound();
		if (sound && sound.id) {
			var smSound = mainPlayer.smSound();
			if (smSound.playState) {
				var soundId = sound.id;
				smSound._last_position = smSound.position;
				if (!smSound.paused)
					playCount.putInfo(soundId, (new Date()).getTime(), "onstop");
				playCount.postInfo(soundId, true);
			}
		}
	}
	if (helper.browser.safari) {
		window.onbeforeunload = function() {
			unload();
		};
	} else {
		$(window).unload(function() {
			unload();
		});
	}
	Model.mainPlayer = mainPlayer;
	window.mainPlayer = mainPlayer;
	return Model;
});