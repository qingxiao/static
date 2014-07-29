define(['underscore','jquery'],function(_,$) {
	var track = {
		tracks:{
			74729 : {
				"id" : 74729,
				"url" : "http://fdfs.xmcdn.com/group1/M01/04/9E/wKgDrlDKutOTmbuoABhobLmJ-P4856.mp3",
				"duration" : "200.06"
			},
			73074 : {
				"id" : 73074,
				"url" : "http://fdfs.xmcdn.com/group1/M00/04/84/wKgDrVDJeYXD2v3UACYzLQ9Omro677.mp3",
				"duration" : "312.86"
			},
			71332 : {
				"id" : 71332,
				"url" : "http://fdfs.xmcdn.com/group1/M01/04/68/wKgDrlDII7nCmWWeAIShmvR5pBw026.mp3",
				"duration" : "1086.45"
			},
			68940 : {
				"id" : 68940,
				"url" : "http://fdfs.xmcdn.com/group1/M01/04/41/wKgDrlDGxxyCJYNeABYEXkSgIzY483.mp3",
				"duration" : "180.29"
			},
			67400 : {
				"id" : 67400,
				"url" : "http://fdfs.xmcdn.com/group1/M00/04/2A/wKgDrlDFjjuBofuwABzargrdFuc211.mp3",
				"duration" : "236.3"
			},
			63765 : {
				"id" : 63765,
				"url" : "http://fdfs.xmcdn.com/group1/M01/03/FA/wKgDrlDBmzDQ_T6dAB234PzmrXw847.mp3",
				"duration" : "243.8"
			},
			60327 : {
				"id" : 60327,
				"url" : "http://fdfs.xmcdn.com/group1/M01/03/D3/wKgDrVDABESTMKpWACIhKifd4bQ627.mp3",
				"duration" : "279.51"
			},
			59189 : {
				"id" : 59189,
				"url" : "http://fdfs.xmcdn.com/group1/M00/03/C4/wKgDrlC-5oeiFqydACB_8T7OOSk895.mp3",
				"duration" : "266.16"
			},
			57614 : {
				"id" : 57614,
				"url" : "http://fdfs.xmcdn.com/group1/M01/03/AF/wKgDrVC9ij7iZScGACYZKB0Fng8433.mp3",
				"duration" : "313.05"
			},
			55974 : {
				"id" : 55974,
				"url" : "http://fdfs.xmcdn.com/group1/M01/03/96/wKgDrlC8HgfAmPMYABIU_LNJDo8605.mp3",
				"duration" : "148.13"
			}
		},
		_lastPlayInfo:{},
		lastPlayInfo:function(info){
			if(info){
				this._lastPlayInfo = _.extend({
					last_rk: this._lastPlayInfo.last_rk
				},info);
			}else{
				return this._lastPlayInfo;
			}
		},
		/*
		 * 从获取指定的track的信息
		 * id 					{String}	track的id
		 * success				{Function}	成功回调
		 * options.isForcible	{Boolean} 	默认：false
		 * options.404			{Function}	404回调
		 */
		getById:function(id, success, options){
			var that = this;
			if(!id)return; 
			options = (typeof (options) == "object") ? options : {};
            op = _.extend({
            	isForcible: false,
                404: $.noop,
                beforeSend:$.noop
            }, options);
            if (this.tracks[id] && !op.isForcible) {
                success(this.tracks[id]);
                return;
            }
            if (this.tracks[id] === false){
            	op["404"]();
            	return;
            }
			$.ajax({
				url:'/tracks/'+id+'.json',
				dataType: "json",
				beforeSend: function(){
					op.beforeSend();
				},
				statusCode: {
				    404: function() {
				    	that.tracks[id] = false;
				    	op["404"]();
				    }
				},
				success:function(data){
					if(!data||!data.id){
						that.tracks[id] = false;
				    	op["404"]();
				    	return;
					}
					var _data = {
							id:data.id,
							url :config.FDFS_PATH+"/"+(data.play_path_64||data.play_path_32||data.play_path_128||data.play_path),
							duration:parseInt(data.duration*1000),
							title:data.title,
							author:data.nickname,
							authorId:data.uid,
							album:data.album_title,
							albumId:data.album_id,
							cover_url:data.cover_url,
							soundface:data.cover_url_142,
							soundface_middle:data.cover_url_142,
							square:data.category_title,
							squareId:data.category_id,
							categoryName:data.category_name,
							isliked:data.is_favorited,
							info:data.intro,
							isVerified:data.is_v,
              createAt:data.created_at,
              playCount:data.play_count,
              commentCount:data.comments_count,
              shareCount:data.shares_count,
              favoriteCount:data.favorites_count
						};
					that.tracks[id] = _data;
					success(_data);
				}
			});
		},
		//++
		isExist: function(id, success, error){
			this.getById(id, function(track){
				success(track);
			},{
				404:function(){
					erorr();
				}
			});
		},
		isRemoved:function(id){
			return this.tracks[id]===false;
		},
		remove:function(id){
			this.tracks[id]=false;
		},
		like:function(id, isToLike, success){
			if (this.tracks[id] === false && isToLike){
				dialog.alert("该声音不存在");
            	return;
            }
			var that = this;
			$.ajax({
				url:isToLike?'/favorites/create':'/favorites/destroy',
				data:{track_id:id},
				type:"post",
				dataType: "json",
				success:function(data){
					if(data.res===false){
						dialog.alert(data.msg);
                    	return;
                    }
					var track = that.tracks[id];
					if(track){
						track.isliked = isToLike;
					}
					success.call(that,data);
				}
			});	
		},
		/*
		 * 统计播放次数
		 * last_id:上一个声音的id
		 * last_started_at:上一个声音的开始时间
		 * last_duration:上一个声音的播放时长
		 */
		recordPlayInfo:function(id){
			var _this = this;
			$.ajax({
				url:'/tracks/'+id+'/play',
				data:{
					last_id:this._lastPlayInfo.id,
					//last_started_at:(this._lastPlayInfo.started_at)?(new Date((new Date((new Date(this._lastPlayInfo.started_at))).getTime()-config.TIME_GAP))).toString():undefined,
					last_duration:this._lastPlayInfo.duration,
					last_rk: this._lastPlayInfo.last_rk
				},
				type:"post",
				dataType: "json",
				success:function(data){
					if(data&&data.rk)_this._lastPlayInfo.last_rk = data.rk;
				}
			});	
		},
        /*
        * 获得登陆用户所有的声音
        */
        getTrackList: function (success) {
            var that = this;

            $.ajax({
                url: '/my_tracks.json',
                type: "get",
                dataType: "json",
                success: function (data) {
                    success.call(that, data);
                }
            });
        }
	};
	return track;
});