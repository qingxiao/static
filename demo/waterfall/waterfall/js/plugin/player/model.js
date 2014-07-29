define(['jquery','underscore','backbone','app/sound'],function($,_,Backbone,soundModel){
	//console.log(new Backbone.Model());
	var playState = {
		STOP: 0,		//还没开始播放，或者列表播放完必
		PAUSE: 1,		//播放器处于暂停状态
		BUFFERING: 2,	//播放器处于缓冲状态
		PLAYING: 3		//播放器正在播放
	};
	var Model = Backbone.Model.extend({
		unPlayables: [],
		defaults: function() {
			return {
				volume: storageVolume(),
				soundId: "",
				soundIds: [],
				sound:{},
				preable: false,
				nextable:false,
				playable: false,
				isQuerying: false,
				playState: playState.STOP
			};
		},
		volume: function(volume){
			if(volume !== undefined){
				this.set("volume",volume);
				storageVolume(volume);
				if(this.smSound())this.smSound().setVolume(volume);
			}else{
				return this.get("volume");
			}
		},
		soundId: function(){
			return this.get("soundId");
		},
		soundIds: function(soundIds){
			if(soundIds!==undefined){
				this.set("soundIds",_.uniq(soundIds));
				//var soundId = this.soundId();
				//if(soundId){
				//	index = _.indexOf(soundIds, soundId);	
				//	if(index!==-1){
				//		this.set("playable", this.playable());
				//		this.set("preable", this.preable());
				//		this.set("nextable", this.nextable());
				//	}
				//}
			}else{
				return this.get("soundIds");
			}
		},
		removeSoundId: function(soundId){
			var _this = this,
				nowSoundId = this.soundId();
			if(nowSoundId == soundId){
				this.pauseAndUnload();
				this.selectNext(function(){
					_this.soundIds(_.without(_this.soundIds(), soundId));
				}, function(){
					_this.selectPrev(function(){
						_this.soundIds(_.without(_this.soundIds(), soundId));
					}, function(){
						_this.soundIds(_.without(_this.soundIds(), soundId));
						_this.set("soundId","");
						_this.set("sound",{});
					});
				});
			}
			this.soundIds(_.without(this.soundIds(), soundId));
		},
		preable: function(){
			var soundIds = this.get("soundIds"),
				soundId = this.get("soundId"),
				index = _.indexOf(soundIds, soundId);
			return index > 0;
		},
		nextable: function(){
			var soundIds = this.get("soundIds"),
				soundId = this.get("soundId"),
				index = _.indexOf(soundIds, soundId);
			return index < soundIds.length-1;
		},
		playable: function(){
			return !!this.get("soundId");
		},
		playState: function(){
			return this.get("playState");
		},
		soundPlayable: function(soundId, success, error){
			if(this.get("isQuerying")) return;
			this.set("isQuerying", true);
			//this.set("playState",playState.BUFFERING);	
			var _this = this;
			success = success || $.noop;
			error = error || $.noop;
			if(_.indexOf(_this.unPlayables, soundId)!== -1){
				error();
				return;
			}
			this.pauseAndUnload();
			soundModel.isExist(soundId,function(track){
				_this.set("isQuerying", false);
				//_this.set("playState",playState.PLAYING);
				success(track);
			},function(){
				_this.set("isQuerying", false);
				//_this.set("playState",playState.STOP);	
				_this.unPlayables.push(soundId);
				error();
			});
		},
		//removeSmSound: function(soundId){
		//	var smSound = this.getSmSoundById(soundId);
		//	if(smSound)smSound.destruct();
		//},
		select: function(soundId, success, error){
			var _this = this;
			success = success||$.noop;
			error = error||function(){
				_this.selectNext(success, error);
			};
			this.soundPlayable(soundId, function(sound){
				_this.set("sound",sound);
				_this.set("soundId",soundId);
				//_this.set("playable", _this.playable());
				//_this.set("preable", _this.preable());
				//_this.set("nextable", _this.nextable());
				success(sound);
			}, function(){
				_this.set("soundIds",_.without(_this.soundIds(), _this));
				error();
			});
		},
		selectPrev: function(success, error){
			success = success||$.noop;
			error = error||$.noop;
			if(!this.preable()) {
				error();
				return;
			}
			var _this = this,
				soundIds = this.get("soundIds"),
				preSoundId = this.get("soundId"),
				index = _.indexOf(soundIds, preSoundId),
				soundId = soundIds[index-1];
			this.select(soundId, function(sound){
				success(sound);
			}, function(){
				_this.selectPrev(success, error);
			});
		},
		selectNext: function(success, error){
			success = success||$.noop;
			error = error||$.noop;
			if(!this.nextable()){
				error();
				return;
			}
			var _this = this,
				soundIds = this.get("soundIds"),
				preSoundId = this.get("soundId"),
				index = _.indexOf(soundIds, preSoundId),
				soundId = soundIds[index+1];
			this.select(soundId, function(sound){
				success(sound);
			}, function(){
				_this.selectNext(success, error);
			});
		},
		prev: function(){
			var _this = this;
			this.selectPrev(function(sound){
				_this._play(sound);
			});
		},
		next: function(){
			var _this = this;
			this.selectNext(function(sound){
				_this._play(sound);
			});
		},
		play: function(options){
			options = options||{};
			if(!soundManager.ok()) {
				var _this = this;
				soundManager.reboot();
				soundManager.onready(function(){
					_this._play(options);
				});
				return;
			}
			this._play(options);
		},
		_play: function(options){
			var sound = this.get("sound"),
			smSound = _this.getSmSoundBySound(sound);
			if(smSound.paused){
				smSound.resume();
			}else{
				var position = smSound._last_position||options.position;
				smSound.play(_.extend(options,{position:position,volume:_this.volume()}));					
			}			
		},
		pause: function(){
			if(!this.playable()) return;
			var smSound = this.smSound();
			if(smSound.playState){
				smSound.pause();
			}
		},
		resume: function(){
			if(!this.playable()) return;
			var smSound = this.smSound();
			if(smSound.playState){
				smSound.resume();
			}
		},
		stop: function(){
			if(!this.playable()) return;
			var smSound = this.smSound();
			if(smSound&&smSound.playState){
				smSound._last_position = 0;
				smSound.stop();
				smSound.unload();
			}
		},
		pauseAndUnload: function(){
			if(!this.playable()) return;
			var smSound = this.smSound();
			if(smSound&&smSound.playState){
				smSound._last_position = smSound.position||0;
				smSound.stop();
				smSound.unload();
			}
		},
		isPaused: function(){
			return this.get("playState") === playState.PAUSE;
		},
		seek: function(position, smSound){
			if(smSound === undefined){
				smSound = this.smSound();
			}
			if(!this.playable()) return;
			smSound.setPosition(position);
			smSound._last_position = position;
		},
		seekInPrecent: function(precent, soundId){
			var smSound = null;
			if(soundId !== undefined){
				smSound = this.getSmSoundById(soundId);				
			}else{
				smSound = this.smSound();
			}
			if(!smSound) return;
			var	position = smSound._duration_net * precent;
			this.seek(position, smSound);
		},
		sound: function(){
			return this.get("sound");
		},
		getSmSoundById: function(soundId){
			return soundManager.getSoundById("s"+soundId);
		},
		smSound: function(){
			var soundId = this.soundId();
			return this.getSmSoundById(soundId);
		},
		getSmSoundBySound: function(sound){
			var _this = this,
				soundId = sound.id,
				smSound = this.getSmSoundById(soundId);
			if(!smSound){
				smSound = soundManager.createSound({
					id: "s"+soundId,
					url: sound.url,
					volume:50,
					onplay: function(){
						_this.trigger("onSoundPlay",this.sound);
						if(this.isBuffering){
							_this.set("playState",playState.BUFFERING);							
						}else{
							_this.set("playState",playState.PLAYING);	
						}
						playCount.putInfo(this.id, (new Date()).getTime(), "onplay");	
						this.started_at = (new Date()).toString();
						playCount.render(this.soundId);
					},
					onpause: function(){
						_this.trigger("onSoundPause",this.sound);
						playCount.putInfo(this.soundId, (new Date()).getTime(), "onpause");
						_this.set("playState",playState.PAUSE);
					},
					onresume: function(){
						_this.trigger("onSoundResume",this.sound);
						playCount.putInfo(this.soundId, (new Date()).getTime(), "onresume");
						_this.set("playState",playState.PLAYING);
					},
					onstop:function(){
						_this.trigger("onSoundStop",this.sound);
						playCount.putInfo(this.soundId, (new Date()).getTime(), "onstop");
						_this.set("playState",playState.STOP);
						playCount.postInfo(this.soundId);
					},
					onfinish:function(){
						_this.trigger("onSoundFinish",this.sound);
						playCount.putInfo(this.soundId, (new Date()).getTime(), "onfinish");
						_this.set("playState",playState.STOP);
						this._last_position = 0;
						playCount.postInfo(this.soundId);
						this.destruct();//todo 播放完后拖动有冲突
						_this.next();
					},
					onload: function(success){
						if(!success){
							_this.next();
						}
					},
					whileloading: function(){
						_this.trigger("onSoundWhileloading",this.sound, this);
					},
					whileplaying:function(){
						if(this.paused) return;//解决音频暂停时会有一些延时的问题。
						_this.trigger("onSoundWhileplaying",this.sound, this);
					},
					onbufferchange:function(){
						if(this.isBuffering){
							playCount.putInfo(this.soundId, (new Date()).getTime(), "onbuffering");
							_this.set("playState",playState.BUFFERING);							
						}else{
							playCount.putInfo(this.soundId, (new Date()).getTime(), "onplay");
							_this.set("playState",playState.PLAYING);	
						}
					}
				});
				smSound.soundId = soundId;					//保存数据Id，真实的Id需要使用字符串
				smSound._duration_net = sound.duration;		//记录播放时长，读取声音文件的时长不准
				smSound._last_position = 0;					//记录上次播放的最后位置
				smSound.sound = sound;						//缓存数据
			}
			return smSound;
		}
	},{
		playState:playState
	});
	var mainPlayer = new Model();
	
	function supportsStorage(){
		return ('localStorage' in window)&& window['localStorage']!==null;
	}
	function storageVolume(volume){
		if(volume !== undefined){
			if(supportsStorage()){
				localStorage["mainplayer_volume"] = volume;				
			}
		}else{
			return parseInt(localStorage["mainplayer_volume"]||50,10);
		}
	}
	/*
	 * 统计播放时长
	 */
	var playCount = {
			infos : {},
			initInfo : function(soundId){
				this.infos[soundId] = {};
			},
			putInfo :function(soundId,time, type){
				if(!this.getInfo(soundId)){
					this.initInfo(soundId);
				}
				this.getInfo(soundId)[time] = type;
			},
			getInfo: function(soundId){
				return this.infos[soundId];
			},
			postInfo: function(soundId, isFinal){
				var time = this.getInfo(soundId),
					duration = this.getPlayDuration(time);
				this.initInfo(soundId);
				soundModel.recordPlayInfo(soundId, duration, !isFinal);
			},
			render: function(soundId){
				var btn = $("[sound_id="+soundId+"]").find(".play-count").show();
				var count = parseInt(btn.eq(0).text()) + 1;
				btn.text(count).attr("title","播放"+count);			
			},
			getPlayDuration: function(time){
				var duration = 0,
					times = _.keys(time).sort(function(a,b){return a-b;});
				_.each(times,function(v,i){
					var type = time[v];
					if(type == "onpause"||type == "onstop"||type == "onfinish"||type=="onbuffering"){ 
						if(i>0){
							duration += v - times[i-1];							
						}
					}
				});
				return duration;
			}
	};
	function unload(){
		var sound = mainPlayer.sound();
		if(sound){
			var soundId = sound.id;
			playCount.putInfo(soundId, (new Date()).getTime(), "onstop");
			playCount.postInfo(soundId, true);
		}
	}
	if ($.browser.safari) {
		window.onbeforeunload = function() {
			unload();
		};
	}else{
		$(window).unload(function(){
			unload();
		});
	}
	Model.mainPlayer = mainPlayer;
	window.mainPlayer = mainPlayer;
	return Model;
});