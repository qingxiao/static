requirejs.config({
    baseUrl: 'js/lib',
    shim: {
        'json2': {
            exports: 'JSON'
        },
        'underscore': {
            exports: '_'
        },
        'jquery': {
            exports: 'jQuery'
        },
        'backbone': {
            deps: ['json2','underscore', 'jquery'],
            exports: 'Backbone'
        }
    },
    paths: {
        app: '../app',
        model: '../model',
        collection: '../collection',
        view: '../view',
        page: '../page',
        plugin: '../plugin',
        template: '../template',
        text: 'text'
    }
});
require(["backbone","plugin/waterfall/model","plugin/waterfall/view"], function (Backbone, WaterfallModel, WaterfallView) {
	//this.model.cache(defaultData.pins);
	var waterfallModel = new WaterfallModel();
	var waterfall = new WaterfallView({
		model: waterfallModel,
		el:$(".waterfall-wrapper")[0],
		onChangePinIds: function(model, pinIds){
			this.$el.attr("sound_ids",pinIds);
			//player.render();
		}
	});
	setTimeout(function(){
		waterfallModel.init(defaultData);
	},200);
});