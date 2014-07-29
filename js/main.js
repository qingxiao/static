requirejs.config({
	baseUrl: config.STATIC_PATH +'/js/lib',
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
        model: '../model',
        module: '../module',
        collection: '../collection',
        page: '../page',
        plugin: '../plugin',
        router: '../router'
    },
    urlArgs:config.ASSETS_VERSION
});

require(["backbone", 'router'], function () {
    
});