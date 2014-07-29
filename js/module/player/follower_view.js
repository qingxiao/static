/*
 * 伴随式试图，随着声音切换，刷新界面
 */
define([ 'jquery', 'underscore', 'backbone', './model', './view', 'module/wave', 'module/comment2d/comment2d', 'model/sound' ], function($, _, Backbone, Model, PlayerView, wave, comment2d,SoundModel) {
	var mainPlayer = Model.mainPlayer;
	var View = PlayerView.extend({
		initialize : function() {
			var $el = this.$el;
			var $soundIds = $el.closest("[sound_ids]");
			var soundId = mainPlayer.soundId();
			var soundIds = [];
			var needRender = false;
			var self = this;
			if($soundIds.size()){
				soundIds = $soundIds.attr("sound_ids").split(",");
				if(_.indexOf(soundIds, soundId)>=0){
					$el.attr("sound_id", soundId);
					needRender = true;
				}
			}
			PlayerView.prototype.initialize.apply(this, arguments);
			mainPlayer.on("change:sound", function(model, sound) {
				this.render(model, sound);
			}, this);
			mainPlayer.on("change:soundIds", function(model, soundIds) {
				if (this._$soundIds.is(".j-player-soundIdsWorking")) {
					this._$soundIds.attr("sound_ids", soundIds);
				}
			}, this);
			if(needRender){
				var soundModel = new SoundModel({
					id : soundId
				});
				soundModel.query({
					success : function(model) {
						var sound = model.toJSON();
						self.render(model, sound, true);
					}
				});
			}
		},
		/*
		 * 判断是否需要渲染视图
		 */
		needRender : function() {
			var soundId = mainPlayer.soundId(), soundIds = [];
			soundIds = this._$soundIds.attr("sound_ids").split(",");
			if (_.indexOf(soundIds, soundId) !== -1) {
				return true;
			}
		},
		/*
		 * 渲染视图
		 */
		render : function(model, sound, needRender) {
			if(!needRender){
				if (!this.needRender())
					return false;				
			}
			var uploadId = sound.uploadId;
			var soundWave = config.FDFS_PATH+"/" + sound.waveform;
			if(sound.id != this._soundId || needRender){
				var $el = this.$el;
				this._soundId = sound.id;
				this.$el.attr("sound_id", sound.id);
				if(this._$commentbar && this._$commentbar.is(":visible")){
					this.getComment2dView().$el.data("chunkNumBinded", false);
					comment2d.render([this.getComment2dView()]);
				}
				if($el.is(".j-sound_detail")){
					sound.durationStr = helper.getTime(sound.duration);
					_.each(sound, function(val, name){
						var $part = $el.find(".j-sound_"+name);
						$part.text(val);
						if(name == "title"){
							$part.attr("title",val);
							var href = $part.attr("href").replace(/\d+$/,sound.id);
							$part.attr("href", href);
						}
					});
				}
				if(this._$likebtn) this._$likebtn.toggleClass("is-sound-liked", sound.isFavorited);
			}
			if((this._$wavebox && this._$wavebox.is(":visible") && uploadId != this._$wavebox.attr("sound_uploadid")) || needRender){
				this._$wavebox.closest(".player_progressbar").data("drawed", false);
				this._$wavebox.attr("sound_uploadid", uploadId).attr("sound_wave", soundWave);				
				wave.render({$container: this.$el});
			}
			PlayerView.prototype.render.apply(this, arguments);
		},
		onSoundUnexist: function(){
			
		}
	});
	return View;
});