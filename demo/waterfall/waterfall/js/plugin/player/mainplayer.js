define(['underscore','backbone','plugin/soundmanager','app/sound'],function(_,BackBone,soundManager,track_m) {
	var player = {
		_history : [],
		_now : "",
		_volume:(storage_volume()!==undefined && !isNaN(storage_volume()))?storage_volume():50,
		_future : [],
		_view:null,
		_sound:null,
		_followView:null,//PO
		_hasPlayed: false,
		preable:function(){
			return !!this._history.length;
		},
		nextable:function(){
			return !!this._future.length;
		},
		playable:function(){
			return !!this._now;
		},
		isEmpty:function(){
			return !this.nextable()&&!this.playable()&&!this.preable();
		},
		track_id:function(){
			return this.getTrackIdById(this._now);
		},
		hasPlayed:function(){
			return this._hasPlayed;
		},
		/*
		 * 播放上一首，如果可以播放，将now设置为当前声音的id，否则继续查找上一首
		 */
		pre:function(){
			if(!this.preable())return;
			var id = this._history.pop(),
				that = this,
				last = this._now;
			this.now(id,function(data){
				if(last) {
					that._future = _.without(that._future,last);
					that._future.unshift(last);
				}
				that.play(id);
			},function(){
				that.pre();
			});
		},
		/*
		 * 播放指定的声音，如果可以播放，将now设置为当前声音的id，否则继续查找下一首
		 */
		play:function(id){
			var that = this;
			if(!id){
				id = this._now;
			}
			this.now(id,function(data){
				var sound = that.getSound(data);
				that.sound(sound);
				sound.duration_net = data.duration;
				sound.play({position:sound._last_position});
				that.trigger("onbufferchange",that, this);
				that.trigger("onplay",that);
				sound.setVolume(that._volume);
				if(_.indexOf(that._future,id)>=0){
					that._future = _.without(that._future,id);
				}
				if(!that.nextable()){
					that.trigger("onfinish",that);
				}
				that._hasPlayed = true;
			},function(){
				that.next();
			});
		},
		/*
		 * 播放下一首，如果可以播放，将now设置为当前声音的id，否则继续查找下一首
		 */
		next:function(){
			if(!this.nextable()){
				//this.trigger("change:playlist", this);
				this.trigger("onfinish",this);
				return;
			}
			var that=this,id = this._future.shift(),
				last = this._now;
			this.now(id,function(data){
				if(last) {
					that._history = _.without(that._history,last);
					that._history.push(last);
				}
				that.play(id);
			},function(){
				that.next();
			});
		},
		/*
		 * 设置声音，
		 * 设置成功触发"change:now"事件
		 * 设置不成功触发"erorr:now"事件
		 * this._query_locked,用来锁住请求
		 */
		_query_locked:false,
		now:function(id,success,erorr){
			if(this._query_locked) return;
			this._query_locked = true;
			var that = this,
				success = success||$.noop,
				error = error||$.noop,
				track_id = this.getTrackIdById(id);
			track_m.getById(track_id,function(track){
				that._query_locked = false;
				if(id != that._now){
					var last = that._now;
					that._now = id;
					that.trigger("change:now",that,track,id,last);
					that.trigger("soundExist",that, id, track);
					if(last&&that._now&&!that.isFromSameFollowView([last, that._now])){
						that.trigger("change:followView",that, that.getFollowView(last), that.getFollowView(that._now));
					}
				}
				success(track);
				that.trigger("change:playlist", that);
			},{
				404:function(){
					that._query_locked = false;
					that.trigger("soundRemoved",that, id);
					erorr();
				}
			});
		},
		/*
		 * 初始化播放列表
		 * 如果正在播放，直接将未播放列表替换
		 * 
		 *
		 */
		init:function(list,success){
			success = success||$.noop;
			if(!list.length){
				this.trigger("change:playlist", this);
				return;
			}
			if(this.isPlaying()){
				this._future = list;
				this.trigger("change:playlist", this);
				success();
				return;
			}
			var that=this,id = list.shift(),
				last = this._now;
			if(id == this._now){
				this._future = list;
				this.trigger("change:playlist", this);
				success();
				return;
			}
			this.now(id,function(data){
				//console.log(list)
				if(last) {
					that._history = _.without(that._history,last);
					that._history.push(last);
				}
				that._future = list;
				success();
			},function(){
				that.init(list,success);
			});
		},
		default_list:function(){
			var that = this;
			if(isOnFeedPage){
				if(this.view())this.view().rendOPerateBtnState(this);
				return;
			}
			$.ajax({
				url:"feed/playList",
				pageSize:10,
				dataType:"json",
				success:function(data){
					var list = [];
					_.each(data.feedData, function(feedData){
						if(feedData.type == "fu"){
							_.each(feedData.datas, function(_data){
								list.push(that.createId(_data.id,_data.toTid));
							});
						}
					});
					that.init(list);
				}
			});	
		},
		pause:function(){
			if(this._sound && this.isPlaying()){
				this._sound.pause();
				this.trigger("onpause",this,this._sound);
			}
		},
		stop:function(){
			if(this._sound){
				this._sound.destruct();
			}
		},
		setPosition: function(sound,percent){
			sound.setPosition(sound.duration_net * percent);
			sound._last_position = sound.duration_net * percent;
		},
		getTrackIdById:function(id){
			return id.replace(/\[.*\]/,"");
		},
		getFollowViewNameById:function(id){
			if(id)return id.replace(/\[(.*)\].*/,"$1");
		},
		createId:function(name,track_id){
			return '['+name+']'+track_id;
		},
		isFromSameFollowView:function(Ids){
			var that = this,
				followViews = _.map(Ids, function(id){ return that.getFollowViewNameById(id); });
			return _.union(followViews).length === 1;
		},
		splice:function(index, num ,datas){
			var future = _.flatten(this._future.splice(index, num, datas));
			this._future = future;
		},
		append:function(datas){
			this.splice(this._future.length, 0, datas);
		},
		future:function(datas){
			if(datas){
				this._future = datas;
				this.trigger("change:playlist", this);
			}else{
				return this._future;
			}
		},
		sound:function(sound){
			if(sound){
				var last = this._sound;
				if(last != sound){
					this._sound = sound;
					if(last && last.playState){
						//last.pause();
						//last.unload();
						//if(last.bytesLoaded*3>last.bytesTotal){
							last._last_position = last.position||last._last_position;
						//	last.pause();							
						//}else{
							last.stop();
							last.unload();
						//}
					}
					//that.trigger("change:sound",that, sound, last);
				}
			}else{
				return this._sound;
			}
		},
		stopSound: function(){
			var last = this._sound;
			if(last && last.playState){
				last._last_position = last.position;
				last.stop();
				last.unload();
			}
		},
		view:function(view){
			if(view){
				var last = this._view;
				if(last != view){
					this._view = view;
				}
			}else{
				return this._view;
			}
		},
		followView:function(followView){
			if(followView === undefined){
				return this._followView;				
			}else{
				this.trigger("change:followView",this, this.getFollowView(), followView);
				this._followView = followView;
			}
		},
		getFollowView:function(id){
			id = id||this._now;
			var name = this.getFollowViewNameById(id),
				$el = $("[name='"+name+"']");
			if($el.size()){
				return soundManager.getPlayer($el);
			}
		},
		isPlaying:function(){
			if(this._sound){
				return (this._sound.playState===1)&&!this._sound.paused;
			}else{
				return false;
			}
		},
		getSound: function(data){
			var that = this,
				sound = soundManager.soundlist[data.id];
			if(!sound){
				sound = soundManager.createSound({
					id: data.id,
					url: data.url,
					volume: that._volume,
					onplay: function(){
						var _this = this;
						playCount.putInfo(this.id, (new Date()).getTime(), "onplay");				
						that.trigger("onsoundplay",that, this);
						playCount.render(this.id);
					},
					onpause: function(){
						playCount.putInfo(this.id, (new Date()).getTime(), "onpause");
						that.trigger("onsoundpause",that, this);
					},
					onresume: function(){
						playCount.putInfo(this.id, (new Date()).getTime(), "onresume");
						//var last = that.sound();
						//if(last&&last.id&&last.id!=this.id){
							//playCount.postInfo(this.id);						
						//}
						that.trigger("onsoundresume",that, this);
					},
					onstop:function(){
						playCount.putInfo(this.id, (new Date()).getTime(), "onstop");
						playCount.postInfo(this.id);
					},
					onfinish:function(){
						playCount.putInfo(this.id, (new Date()).getTime(), "onfinish");
						playCount.postInfo(this.id);
						that.trigger("onsoundfinish",that, this);
						this._last_position = 0;
					},
					whileplaying:function(){
						if(this.paused) return;//解决音频暂停时会有一些延时的问题。
						that.trigger("whileplaying",that, this);
					},
					onbufferchange:function(){
						if(this.isBuffering){
							playCount.putInfo(this.id, (new Date()).getTime(), "onbuffering");
						}else{
							playCount.putInfo(this.id, (new Date()).getTime(), "onplay");
						}
						that.trigger("onbufferchange",that, this);
					}
				});
				sound.timing = {};
				soundManager.soundlist[data.id] = sound;
			}
			return sound;
		},
		volume:function(volume){
			if(volume===undefined){
				return this._volume;
			}else{
				this._volume = volume;
				storage_volume(volume);
				if(this._sound)this._sound.setVolume(volume);
			}
		}
	};
	_.extend(player, Backbone.Events);
		
	function supports_storage(){
		return ('localStorage' in window)&& window['localStorage']!==null;
	}
	function storage_volume(volume){
		if(supports_storage()){
			if(volume !== undefined){
				localStorage["mainplayer_volume"] = volume;				
			}else{
				return parseInt(localStorage["mainplayer_volume"],10);
			}
		}
	}
	
	player.on("onbufferchange", function(model, sound){
		var view = model.view(),
			followView = model.followView();
		if(sound.isBuffering){
			$(".player-loading").removeClass("player-loading").addClass("player-play");
			if(view){
				view.$("operate").addClass("player-loading").removeClass("player-pause").removeClass("player-play");
			}
			if(followView){
				followView.$("operate").addClass("player-loading").removeClass("player-pause").removeClass("player-play");
			}
		}else{
			if(view){
				view.$("operate").removeClass("player-loading").removeClass("player-play").addClass("player-pause");
			}
			if(followView){
				followView.$("operate").removeClass("player-loading").removeClass("player-play").addClass("player-pause");
			}
		}
	});
	player.on("change:playlist",function(model){
		//console.log("change:playlist");
		if(model.view())model.view().rendOPerateBtnState(model);
		//if(model.followView())model.followView().rendOPerateBtnState(model);
	});
	player.on("change:now",function(model, track,now,last){
		var lastSound = soundManager.soundlist[model.getTrackIdById(last)],
			followView = model.getFollowView();
		if(model.view())model.view().render(track);
		if(followView){
			model.followView(followView);
			followView.render(track);
		}
	});
	player.on("whileplaying",function(model, sound){
		//console.log("whileplaying");
		if(model.view())model.view().rendWhileplaying(sound);
		if(model.followView())model.followView().rendWhileplaying(sound);
	});
	player.on("onsoundplay",function(model, sound){
		//console.log("onsoundplay");
		if(model.view())model.view().onSoundPlay(model,sound);
		if(model.getFollowView())model.getFollowView().onSoundPlay(model,sound);
	});
	player.on("onsoundresume",function(model, sound){
		//console.log("onsoundresume");
		if(model.view())model.view().onSoundResume(model,sound);
		if(model.getFollowView())model.getFollowView().onSoundResume(model,sound);
	});
	player.on("onsoundfinish",function(model, sound){
		//console.log("onsoundfinish");
		if(model.view())model.view().onSoundFinish(model,sound);
		if(model.getFollowView())model.getFollowView().onSoundFinish(model,sound);
		player.next();
	});	
	player.on("onsoundpause",function(model, sound){
		//console.log("onsoundpause");
		if(model.view())model.view().onSoundPause(model,sound);
		if(model.getFollowView())model.getFollowView().onSoundPause(model,sound);
	});	
	player.on("soundRemoved",function(model, id){
		//console.log("soundRemoved");
		if(model.view())model.view().soundRemoved(model,  model.getTrackIdById(id));
		if(model.getFollowView(id))model.getFollowView(id).soundRemoved(model, model.getTrackIdById(id));
	});
	player.on("soundExist",function(model, id, track){
		//console.log("soundExist");
		if(model.view())model.view().soundExist(model, track);
		if(model.getFollowView(id))model.getFollowView(id).soundExist(model, track);
	});
	player.on("onplay",function(model){
		//console.log("onplay");
		if(model.view())model.view().onplay(model);
		if(model.getFollowView())model.getFollowView().onplay(model);
	});
	player.on("onpause",function(model, sound){
		//console.log("onpause");
		if(model.view())model.view().onpause(model,sound);
		if(model.getFollowView())model.getFollowView().onpause(model,sound);
	});
	player.on("change:followView",function(model, followView , last){
		//console.log("change:followView");
		if(followView)followView.rendOperateBtns(model);
		if(last)last.rendOperateBtns(model);
	});
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
		postInfo: function(soundId){
			var _this = this,
				time = this.getInfo(soundId),
				duration = this.getPlayDuration(time);
			_this.initInfo(soundId);
			//console.log(soundId);
			//console.log(duration);
			track_m.recordPlayInfo(soundId, duration);
		},
		render: function(soundId){
			var btn = $(".play-count[track_id="+soundId+"]").show();
			var count = parseInt(btn.eq(0).text()) + 1;
			btn.text(count).attr("title","播放"+count);			
		},
		getPlayDuration: function(time){
			var duration = 0,
				times = _.keys(time).sort(function(a,b){return a-b;});
			_.each(times,function(v,i){
				var type = time[v];
				if(type == "onpause"||type == "onstop"||type == "onfinish"||type=="onbuffering"){ 
					duration += v - times[i-1];
				}
			});
			return duration;
		}
	};
	$(window).unload(function(){
		var sound = player.sound();
		if(sound){
			var soundId = sound.id;
			playCount.putInfo(soundId, (new Date()).getTime(), "onstop");
			playCount.postInfo(soundId);
		}
	});
	
	window.player = player;
	return player;
});