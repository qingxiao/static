/*
 * 缓存策略
 */
define([ 'jquery', 'underscore', 'backbone' ], function($, _, Backbone) {
	function Cache(options) {
		options = _.extend({
			data : null,//预先缓存一些数据
			keys : []//额外判断数据是否存在的主键
		}, options);
		this.cached = new Backbone.Collection(options.data);
		this.keys = options.keys;
		this.removed = [];
	}
	Cache.prototype = {
		/*
		 * 缓存数据 新的model，添加到cache中 已经有的model,将cache中原有的替换掉 保留cache中原来就有的
		 */
		cache : function(models) {
			this.cached.set(models, {
				remove : false
			});
		},
		/*
		 * 获取全部数据
		 * @return {Backbone.Collection}
		 */
		getCached : function() {
			return this.cached;
		},
		/*
		 * 获取特定集合数据
		 * @return {Backbone.Collection}
		 */
		getCachedByIds : function(ids) {
			var models = [];
			for ( var i = 0, len = ids.length; i < len; i++) {
				var id = ids[i], model = this.cached.get(id);
				models.push(model);
			}
			return new Backbone.Collection(models);
		},
		/*
		 * 根据id，获取特定数据
		 * @return {Backbone.Model}
		 */
		getCachedById: function(id){
			return this.cached.get(id);
		},
		/*
		 * 获取特定数据
		 * @return {Backbone.Model}
		 */
		get : function(model) {
			var id = model.id, keys = this.keys;
			if (id) {
				return this.getCachedById(id);
			} else {
				for ( var i = 0, len = keys.length; i < len; i++) {
					var key = keys[i], val = model.get(key), res;
					res = this.cached.find(function(model) {
						return model.get(key) == val;
					});
					if (res)
						return res;
				}
			}
		},
		/*
		 * 标记该数据被删除
		 */
		markRemoved : function(model) {
			var id = model.id, keys = this.keys;
			if (id) {
				this.removed.push(id);
			} 
			for ( var i = 0, len = keys.length; i < len; i++) {
				var key = keys[i], val = model.get(key);
				if(val)this.removed.push(val);
			}
		},
		/*
		 * 判断数据是否被删除
		 * @return {Backbone.Boolean}
		 */
		isRemoved : function(model) {
			var id = model.id, keys = this.keys, vals = [];
			if (id) {
				vals.push(id);
			} 
			for ( var i = 0, len = keys.length; i < len; i++) {
				var key = keys[i], val = model.get(key);
				if(val)vals.push(val);
			}
			return !!_.intersection(this.cached.removed, vals).length;
		}
	};
	return Cache;
});