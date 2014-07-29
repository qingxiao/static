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
    }
});

define(function (require) {
	require('page/page_base');
	require('page/search');
	require('page/welcome');
	require('page/download');
	require('page/404');

	require('page/center/album');
	require('page/center/fans');
	require('page/center/favorites');
	require('page/center/follow');
	require('page/center/listened');
	require('page/center/sound');

	require('page/discovery/album_sound');
	require('page/discovery/dis_album');
	require('page/discovery/dis_index');
	require('page/discovery/dis_sound');
	require('page/discovery/dis_user');
	
	require('page/final/final_album');
	require('page/final/final_sound');
	require('page/final/final_tag');
    require('page/final/sound_liker');

    require('page/home/feed');
	require('page/home/mytracks');
	require('page/home/timeline');
	
	require('page/message/comment');
	require('page/message/letter');
	require('page/message/letterdetail');
	require('page/message/like');
	require('page/message/notice');
	require('page/message/referme');
	
	require('page/my/fans');
	require('page/my/follow');
	
	require('page/passport/forget');
	require('page/passport/passport');
	
	require('page/setting/avatar');
	require('page/setting/blacklist');
	require('page/setting/message');
	require('page/setting/personal');
	require('page/setting/privacy');
	require('page/setting/sync');
	require('page/setting/password');

	require('page/upload/add_voice');
	require('page/upload/edit_album');
	require('page/upload/edit_track');
	require('page/upload/fileprogress');
	require('page/upload/handlers');
	require('page/upload/information');
	require('page/upload/record_main');
	require('page/upload/record');
	require('page/upload/upload_index');
	
	require('page/verify/addv');
});

require(["backbone", 'router'], function () {
    
});