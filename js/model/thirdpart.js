/**
 * Created with JetBrains WebStorm. User: xiaoqing Date: 13-2-20 Time: 下午4:59 To
 * change this template use File | Settings | File Templates.
 */
define([ 'jquery', 'underscore', 'backbone' ], function($, _, Backbone) {
	var Model = Backbone.Model.extend({
		_cacheData : {
			bindStatus : {},
			syncStatus : {}
		},

		name2type : function(name) {
			var type = {
				tSina : 1,
				qzone : 2,
                tQQ:2
			};
			return type[name];
		},
		addBind : function(name, success) {
			/*
			 * 绑定第三方帐号绑定 type:number 1:"新浪微博", 2:"QQ"
			 */
			success = success || $.noop;
			var _this = this;
			var callback_name = "gAddBindCallback";
			var type = this.name2type(name);
			window.open('/passport/auth/' + type + '/authorize?bind=true&customerFunction=' + callback_name, '', 'height=560, width=760, left=400');
			window[callback_name] = function(data) {
				success(data);
				window[callback_name] = null;

				/* {"data":["qzone"],"msg":null,"success":true} */
				// 更新绑定状态的缓存数据
				if (_this._cacheData.bindStatus.data) {
					var dd = _this._cacheData.bindStatus.data;
					for ( var i = 0, l = dd.length; i < l; i++) {
						if (dd[i] == name) {
							return;
						}
					}
					dd.push(name);
				} else {
					_this._cacheData.bindStatus = {
						data : [ name ],
						msg : "",
						success : true
					};
				}

			};
		},
		unBind : function(name, success, error) {
			/*
			 * 解除第三方帐号绑定 type:number 1:"新浪微博", 2:"QQ"
			 */
			success = success || $.noop;
			error = error || $.noop;
			var type = this.name2type(name);
			var url = "/passport/auth/" + type + "/unbind";
			$.ajax({
				url : url,
				type : "get",
				cache : false,
				dataType : "json",
				success : function(data) {
					if (data.success) {
						success(data);
					} else {
						error(data);
					}
				},
				error : function() {
					error({
						success : false,
						msg : "网络异常"
					});
				}
			});
		},
        bindStatusAfter:function(success, data){
            var list = this.bindStatusList || [];
            for(var i= 0;i< list.length ;i++){
                var caller = list[i];
                if(success){
                     caller.success(data);
                }else{
                    caller.error(data);
                }
            }

        },
		bindStatus : function(success, error) {
			/*
			 * 获取第三方帐号的绑定状态 {"data":["qzone"],"msg":null,"success":true}
			 * qzone 包含tqq
			 */
			success = success || $.noop;
			error = error || $.noop;

			var _this = this;
			if (this._cacheData && this._cacheData.bindStatus && !$.isEmptyObject(this._cacheData.bindStatus)) {
				success(this._cacheData.bindStatus);
				return;
			}
            if(!this.bindStatusList){
                this.bindStatusList = [];
            }
            this.bindStatusList.push({
                success:success,
                error:error
            });
            if(this._doAjax){
                return;
            }
            this._doAjax = true;
			$.ajax({
				url : "/passport/auth/bindStatus",
				type : "get",
				cache : false,
				dataType : "json",
				success : function(data) {
					if (data.success) {
						_this._cacheData.bindStatus = data;
                        _this.bindStatusAfter(true, data);
					} else {
                        _this.bindStatusAfter(false, data);
					}
                    _this.doAjax = false;

				},
				error : function() {

                    _this.bindStatusAfter(false, {
                        success : false
                    });
                    _this.doAjax = false;
				}
			});
		},
		syncStatus : function(type, success, error) {
			/*
			 * 获取同步分享信息 /passport/sync/get method=get ,
			 * 参数：type='comment'|'track'|'album' 返回：{success:true, msg:'',
			 * data:[{name:'tSina',isChecked:true},{name:'tSina',isChecked:false}],isCommentAlert:true}
			 */
			success = success || $.noop;
			error = error || $.noop;
			var syncStatus = this.getSyncStatus();
			if (syncStatus && syncStatus[type]) {
				success(syncStatus[type]);
				return;
			}
			var _this = this;

			$.ajax({
				url : "/passport/new_sync/get",
				data : {
					type : type
				},
				cache : false,
				dataType : "json",
				success : function(data) {
					if (data.success) {
						syncStatus[type] = data;
						success(data);
					} else {
						syncStatus[type] = {};
						error(data);
					}

				},
				error : function() {
					error({
						success : false
					});
				}
			});
		},
		setSync : function(name, isChecked, type, success) {
			/*
			 * 设置同步分享 name = "tSina|qzone" type='comment'|'track'|'album' 返回
			 * {"msg":null,"success":true｝
			 */
			success = success || $.noop;
			var syncType = this.name2type(name),
			    url = "/passport/sync/" + syncType + "/set",
			    syncStatusData = this.getSyncStatus(type);
            $.ajax({
                url:url,
                type:"get",
                dataType:"json",
                cache:false,
                data:{
                    isChecked : isChecked,
                    type : type,
                    thirdpartyName:name
                },
                success:function(result){
                    if (result && result.success) {
                        success(result);
                    }
                }
            });
			/*
			 * syncStatusData {success:true, msg:'',
			 * data:[{name:'tSina',isChecked:true},{name:'tSina',isChecked:false}],isCommentAlert:true}
			 */
            var sdata = syncStatusData.data;
			for ( var i = 0, len = sdata.length; i < len; i++) {
				if (sdata[i].name == name) {
                    sdata[i].isChecked = isChecked;
					if (!type) {
                        sdata[i].isChecked = true;
					}
					return;
				}
			}
		},
		getSyncStatus : function(type) {

			if (type) {
				return this._cacheData.syncStatus[type];
			}
			return this._cacheData.syncStatus;
		}
	});
	return Model;
});
