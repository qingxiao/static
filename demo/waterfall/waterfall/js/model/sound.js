define(['jquery','underscore','backbone','app/sound'],function($,_,Backbone,soundModel){
	console.log(new Backbone.Model());
	var playState = {
		STOP: 0,		//还没开始播放，或者列表播放完必
		PAUSE: 1,		//播放器处于暂停状态
		BUFFERING: 2,	//播放器处于缓冲状态
		PLAYING: 3		//播放器正在播放
	};
	var Model = Backbone.Model.extend({
		defaults: function() {
			return {
				history:[],
				playlist:[],
				sound: "",
				sounds: [],
				preable: false,
				nextable:false,
				playable: false,
				isQuerying: false,
				playState: playState.STOP
			};
		},
		initialize: function(){
			this.on("change:history", this._onChangeHistory, this);
			this.on("change:sound", this._onChangeSound, this);
			this.on("change:playlist", this._onChangePlaylist, this);
		},
		_onChangeHistory: function(){
			this.set("preable", this.preable());
			this.set("nextable", this.nextable());
		},
		_onChangeSound: function(model, sound){
			this.trigger("begin_change:sound", model, sound);
			var preSound = model.previous("sound"),
				sounds = model.sounds(),
				history = this.history();
			history.push(sound);
			this.pauseAndUnload(preSound);
			this.set("playable", this.playable());
			this.trigger("change:history", this, history);//手动触发
			
			/*var history = this.history(),
				sounds = this.sounds(),
				playlist = this.playlist(),
				preSound = model.previous("sound");		
			if(_.indexOf(sounds,sound) && _.indexOf(sounds,preSound) < _.indexOf(sounds,sound)){
				if(preSound)history.push(preSound);				
			}
			if(_.indexOf(history, sound)>=0){
				this.set("history",_.without(history, sound));
			}
			this.pauseAndUnload(preSound);
			this.set("playable", this.playable());
			this.trigger("change:history", this, history);//手动触发
			*/
			//this.trigger("end_change:sound", model, sound);
		},
		_onChangePlaylist: function(){
			this.set("nextable", this.nextable());
		},
		history: function(history){
			if(history!==undefined){
				this.set("history",history);
			}else{
				return this.get("history");
			}
		},
		playlist: function(playlist){
			if(playlist!==undefined){
				this.set("playlist",playlist);
			}else{
				return this.get("playlist");
			}
		},
		sound: function(sound){
			if(sound!==undefined){
				var sounds = this.sounds(),
				index = _.indexOf(sounds, sound);
				if(index>=0){
					//var playlist = Array.prototype.slice.call(sounds, index+1);
					this.set("sound",sound);	
					//this.set("playlist",playlist);
				}
			}else{
				return this.get("sound");
			}
		},
		sounds: function(sounds){
			if(sounds!==undefined){
				this.set("sounds",sounds);
			}else{
				return this.get("sounds");
			}
		},
		preable: function(){
			var history = this.get("history"),
				sound = this.get("sound"),
				index = _.indexOf(history, sound);
			return index > 0;
		},
		nextable: function(){
			var history = this.get("history"),
				sound = this.get("sound"),
				index = _.indexOf(history, sound);
			if(index !== -1 && index+1< history.length){
				return true;
			}
			return this.get("playlist").length;
		},
		playable: function(){
			return !!this.get("sound");
		},
		playState: function(){
			return this.get("playState");
		},
		soundPlayable: function(soundId, success, error){
			if(this.get("isQuerying")) return;
			this.set("isQuerying", true);
			var _this = this;
			success = success || $.noop;
			error = error || $.noop;
			soundModel.isExist(soundId,function(track){
				_this.set("isQuerying", false);
				success(track);
			},function(){
				_this.set("isQuerying", false);
				erorr();
			});
		},
		removeSmSound: function(soundId){
			var smSound = soundManager.getSoundById(soundId);
			if(smSound)smSound.destruct();
		},
		_toHistory: function(){
			this.sound(this.get("playlist").shift());
		},
		pre: function(){
			if(!this.preable()) return;
			var history = this.get("history"),
				sound = this.get("sound"),
				index = _.indexOf(history, sound);
			this.set("sound", history[index-1]);
			this.trigger("change:history", this, history);//手动触发
			this.play();
		},
		next: function(){
			if(!this.nextable()) return;
			var history = this.get("history"),
				sound = this.get("sound"),
				index = _.indexOf(history, sound);
			if(index !== -1 && index+1< history.length){
				this.sound("sound", history[index+1]);
			}else{
				this.sound("sound", this.get("playlist").shift());
			}
			this.trigger("change:playlist", this, playlist);//手动触发
			this.play();
		},
		play: function(){
			if(!this.playable()) return;
			var _this = this,
				soundId = this.get("sound");
			this.soundPlayable(soundId, function(sound){
				var smSound = _this.getSmSoundBySound(sound);
				if(smSound.paused){
					smSound.resume();
				}else{
					smSound.play({position:smSound._last_position});					
				}
			}, function(){
				_this.removeSmSound(soundId);
				_this.next();
			});
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
		stop: function(soundId){
			if(!this.playable()) return;
			var smSound = this.smSound(soundId);
			if(smSound&&smSound.playState){
				smSound._last_position = smSound.position||0;
				smSound.stop();
				smSound.unload();
			}
		},
		pauseAndUnload: function(soundId){
			if(!this.playable()) return;
			this.stop(soundId);
		},
		seek: function(position){
			if(!this.playable()) return;
			var smSound = this.smSound();
			smSound.setPosition(position);
			smSound._last_position = position;
		},
		/*
		 * 获取当前smSound
		 */
		smSound: function(soundId){
			return soundManager.getSoundById(soundId||this.sound());
		},
		/*
		 * 获取当前smSound的数据
		 */
		soundModel: function(soundId){
			var smSound = this.smSound(soundId);
			return smSound.sound;
		},
		getSmSoundBySound: function(sound){
			var _this = this,
				soundId = sound.id,
				smSound = soundManager.getSoundById(soundId);
			if(!smSound){
				smSound = soundManager.createSound({
					id: soundId,
					url: sound.url,
					onfinish: function(){
						this._last_position = 0;
						_this.set("playState",playState.STOP);
					},
					onplay: function(){
						this.timing[Date.now()] = "onplay";
						_this.set("playState",playState.PLAYING);
					},
					onpause: function(){
						this.timing[Date.now()] = "onpause";
						_this.set("playState",playState.PAUSE);
					},
					onresume: function(){
						this.timing[Date.now()] = "onresume";
						_this.set("playState",playState.PLAYING);
					},
					onstop:function(){
						this.timing[Date.now()] = "onstop";
						_this.set("playState",playState.STOP);
					},
					onfinish:function(){
						this.timing[Date.now()] = "onfinish";
						_this.set("playState",playState.STOP);
						this._last_position = 0;
						_this.next();
					},
					onbufferchange:function(){
						if(this.isBuffering){
							_this.set("playState",playState.BUFFERING);							
						}else{
							_this.set("playState",playState.PLAYING);	
						}
					}
				});
				smSound.timing = {};
				smSound._duration_net = sound.duration;
				smSound._last_position = 0;
				smSound.sound = sound;
			}
			return smSound;
		}
	},{
		playState:playState
	});
	return Model;
});