/*
 * 声音
 */
define([ 'jquery', 'underscore', 'backbone', './cache' ], function($, _, Backbone, Cache) {
	var cache = new Cache();
	var Model = Backbone.Model.extend({
		defaults : {
			id : "",
			url : "",
			duration : 0,
			isFavorited : false,
			favoritesCount : 0,
			title : "",
			author : "",
			authorId : "",
			album : "",
			albumId : "",
			coverUrl : "",
			soundface : "",
			soundfaceMiddle : "",
			square : "",
			squareId : "",
			categoryName : "",
			info : "",
			haveMoreIntro : "",
			isVerified : false,
			uid : "",
			createAt : "",
			playCount : 0,
			commentCount : 0,
			shareCount : 0,
			timeUntilNow : "",
			waveform : "",
			uploadId : ""
		},
		fetch : function(options) {
			options = options || {};
			error = options.error || $.noop;
			success = options.success || $.noop;
			_.extend(options, {
				url : '/tracks/' + this.id + '.json'
			});
			Backbone.Model.prototype.fetch.call(this, options);
		},
		parse : function(data) {
			return {
				id : data.id,
				url : config.FDFS_PATH + "/" + (data.play_path_64 || data.play_path_32 || data.play_path_128 || data.play_path),
				duration : parseInt(data.duration * 1000, 10),
				isFavorited : data.is_favorited,
				favoritesCount : data.favorites_count,
				title : data.title,
				author : data.nickname,
				authorId : data.uid,
				album : data.album_title,
				albumId : data.album_id,
				coverUrl : data.cover_url,
				soundface : data.cover_url_142,
				soundfaceMiddle : data.cover_url_142,
				square : data.category_title,
				squareId : data.category_id,
				categoryName : data.category_name,
				info : data.short_intro,
				haveMoreIntro : data.have_more_intro,
				isVerified : data.is_v,
				uid : data.uid,
				createAt : data.created_at,
				playCount : data.play_count,
				commentCount : data.comments_count,
				shareCount : data.shares_count,
				timeUntilNow : data.time_until_now,
				waveform : data.waveform,
				uploadId : data.upload_id
			};
		},
		/*
		 * 喜欢
		 */
		like : function(success, error) {
			var _this = this, favoritesCount = this.get("favoritesCount"), isFavorited = this.get("isFavorited");
			success = success || $.noop;
			error = error || $.noop;
			_this.save({
				isFavorited : !isFavorited,
				favoritesCount : favoritesCount + (isFavorited ? -1 : 1)
			}, {
				url : isFavorited ? '/favorites/destroy' : '/favorites/create',
				type : "post",
				data : {
					track_id : this.id,
					no_more_alert : true,
					is_sharing : true
				},
				success : function(model, response, options) {
					if (response.res == false) {
					    error(model, response);
						return;
					}
					success(model, response, options);
				}
			});
		},
		/*
		 * 取消喜欢
		 */
		unlike : function(success, error) {
			this.like(success, error);
		},
        /*
        * 删除声音  只有自己的可以删除
        * */
        destroy:function(success, error){
            success = success || $.noop;
            error = error || $.noop;
            $.ajax({
                url: "/my_tracks/" +this.id + "/destroy",
                type:"post",
                success:function(response){
                    if(response.res){
                         success(response);
                    }else{
                        error(response);
                    }
                },
                error:function(){
                    error({msg:"服务器繁忙,请稍后再试!"});
                }
            });
        },
        /*
        * 取消私密声音
        * */
        setPublic:function(record_id, success, error){
            success = success || $.noop;
            error = error || $.noop;
            $.ajax({
                url: "/handle_track/set_public",
                data: { record_id: record_id },
                type: "POST",
                success: function (data) {
                    if (data.res) {
                       success(data);
                    }else{
                       error(data);
                    }
                },
                error: function (a, b, c) {
                    error({msg:"服务器繁忙,请稍后再试!"});
                }
            });
        },
  		/*
		 * 记录播放信息 duration {Number} 播放时长，单位毫秒 position {Number} 播放位置，单位毫秒 async {Boolean} 是否异步发送到服务端, 在刷新浏览器和关闭浏览器的情况下需要同步发送
		 */
		recordPlayInfo : function(duration, position, async) {
			if (async !== false) {
				async = true;
			}
			$.ajax({
				url : '/tracks/' + this.id + '/play',
				data : {
					played_secs : Math.floor(parseInt(position, 10) / 1000),
					duration : Math.floor(parseInt(duration, 10) / 1000)
				},
				timeout:3000,
				async : async,
				type : "post"
			});
		}
	}, {
		cache : cache
	});
	/*
	var data = [ {
		"created_at" : "2012-12-19T15:44:17+08:00",
		"updated_at" : "2013-03-27T14:54:14+08:00",
		"id" : 70184,
		"uid" : 10,
		"nickname" : "woshifeifei",
		"avatar_path" : null,
		"is_v" : false,
		"is_public" : true,
		"is_publish" : true,
		"user_source" : 2,
		"category_id" : 4,
		"tags" : "",
		"title" : "我的歌声里223",
		"intro" : "",
		"cover_path" : "",
		"duration" : "150.25",
		"download_path" : "group1/M00/00/06/wKgD3lDRcDbjGtHdABJY5qJxtlw063.mp3",
		"play_path" : "group1/M00/00/06/wKgD3lDRcDbjGtHdABJY5qJxtlw063.mp3",
		"play_path_32" : "group1/M01/00/06/wKgD3lDRcDaj9qheAAAAAAAAAAA421.mp3",
		"play_path_64" : "group1/M00/00/06/wKgD3lDRcDbjGtHdABJY5qJxtlw063.mp3",
		"play_path_128" : null,
		"singer" : null,
		"singer_category" : null,
		"author" : null,
		"composer" : null,
		"arrangement" : null,
		"post_production" : null,
		"lyric" : null,
		"lyric_path" : null,
		"language" : null,
		"resinger" : null,
		"announcer" : null,
		"access_password" : null,
		"allow_download" : null,
		"allow_comment" : null,
		"is_crawler" : false,
		"inet_aton_ip" : null,
		"upload_source" : 2,
		"longitude" : null,
		"latitude" : null,
		"album_id" : 70081,
		"album_title" : "三十六计古今谈之无中生",
		"album_cover_path" : "group1/M01/00/01/wKgDplDRPATx6izgAAAPWQWvwoo218.jpg",
		"transcode_state" : 2,
		"music_category" : null,
		"short_intro" : "",
		"dig_status" : 0,
		"approved_at" : "2013-03-27T14:54:14+08:00",
		"is_deleted" : false,
		"mp3size" : null,
		"mp3size_32" : null,
		"mp3size_64" : null,
		"cover_url" : null,
		"cover_url_142" : "http://static.test.ximalaya.com/css/img/common/track_180.jpg",
		"formatted_created_at" : "12月19日 15:44",
		"is_favorited" : false,
		"play_count" : 17,
		"comments_count" : 0,
		"shares_count" : 0,
		"favorites_count" : 0,
		"have_more_intro" : false,
		"time_until_now" : "3月前",
		"category_name" : "entertainment",
		"category_title" : "综艺娱乐",
		"played_secs" : null,
		"waveform" : "http://local.ximalaya.com:9098/b.js",
		"upload_id" : "2"
	}, {
		"created_at" : "2012-12-19T15:44:17+08:00",
		"updated_at" : "2013-03-27T14:54:14+08:00",
		"id" : 70183,
		"uid" : 10,
		"nickname" : "woshifeifei",
		"avatar_path" : null,
		"is_v" : false,
		"is_public" : true,
		"is_publish" : true,
		"user_source" : 2,
		"category_id" : 4,
		"tags" : "",
		"title" : "为爱痴狂22",
		"intro" : "",
		"cover_path" : "",
		"duration" : "142.41",
		"download_path" : "group1/M00/00/06/wKgDplDRcDWxs6F4ABFkAJwuX28132.mp3",
		"play_path" : "group1/M00/00/06/wKgDplDRcDWxs6F4ABFkAJwuX28132.mp3",
		"play_path_32" : "group1/M01/00/06/wKgDplDRcDajShPNAAAAAAAAAAA673.mp3",
		"play_path_64" : "group1/M00/00/06/wKgDplDRcDWxs6F4ABFkAJwuX28132.mp3",
		"play_path_128" : null,
		"singer" : null,
		"singer_category" : null,
		"author" : null,
		"composer" : null,
		"arrangement" : null,
		"post_production" : null,
		"lyric" : null,
		"lyric_path" : null,
		"language" : null,
		"resinger" : null,
		"announcer" : null,
		"access_password" : null,
		"allow_download" : null,
		"allow_comment" : null,
		"is_crawler" : false,
		"inet_aton_ip" : null,
		"upload_source" : 2,
		"longitude" : null,
		"latitude" : null,
		"album_id" : 70081,
		"album_title" : "三十六计古今谈之无中生",
		"album_cover_path" : "group1/M01/00/01/wKgDplDRPATx6izgAAAPWQWvwoo218.jpg",
		"transcode_state" : 2,
		"music_category" : null,
		"short_intro" : "",
		"dig_status" : 0,
		"approved_at" : "2013-03-27T14:54:14+08:00",
		"is_deleted" : false,
		"mp3size" : null,
		"mp3size_32" : null,
		"mp3size_64" : null,
		"cover_url" : null,
		"cover_url_142" : "http://static.test.ximalaya.com/css/img/common/track_180.jpg",
		"formatted_created_at" : "12月19日 15:44",
		"is_favorited" : false,
		"play_count" : 20,
		"comments_count" : 0,
		"shares_count" : 0,
		"favorites_count" : 1,
		"have_more_intro" : false,
		"time_until_now" : "3月前",
		"category_name" : "entertainment",
		"category_title" : "综艺娱乐",
		"played_secs" : null,
		"waveform" : "http://local.ximalaya.com:9098/a.js",
		"upload_id": "1"
	} ];
	var data2 = [];
	for ( var i = 0, len = data.length; i < len; i++) {
		data2.push(Model.prototype.parse(data[i]));
	}
	cache.cache(data2);
	window.Model = Model;
	*/
	return Model;
});