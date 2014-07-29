/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-4-19
 * Time: 下午2:22
 * To change this template use File | Settings | File Templates.
 */
define(['jquery','backbone','model/thirdpart','plugin/dialog','module/dialogs/sync'],
    function($, Backbone, PassportModel, dialog, dialog_sync){
    var passportModel = new PassportModel();
    var ShareView = Backbone.View.extend({
        model: passportModel,
        initialize: function (options) {
            this.options = $.extend({
                $el:"",
                bindedClass:"",
                checkedClass:"on",
                checkedSuccess: $.noop
            },options);
            var $el = options.$el,
                _this = this;
            this.$el = $el;
            this.type = this.$el.find("[data-name][data-type]").attr('data-type');
            this.getBind(function(){
                _this.getChecked();
            });
            this.bindEvents();
        },
        getBind:function(callback){
            callback = callback || $.noop;
            var _this = this;
            this.model.bindStatus(function(data){
                _this.getBindCallback(data);
                callback(data);
            }, function(data){
                callback(data);
            });
        },
        getBindCallback:function(result){
            //返回已绑定的第三方名称 {"data":["qzone","tSina"],"msg":null,"success":true}
            // qzone 包含tQQ
            var data = result.data;
            for(var i=0;i<data.length;i++){
               var dd = data[i];

                var $btn = this.$el.find("[data-name="+dd+"]");
                $btn.attr("data-bind",1);
                $btn.addClass(this.options.bindedClass);
                if(dd == "qzone"){
                    $btn = this.$el.find("[data-name=tQQ]");
                    $btn.attr("data-bind",1);
                    $btn.addClass(this.options.bindedClass);
                }
            }
        },
        getChecked:function(callback){
            callback = callback || $.noop;
            var _this = this;
            this.model.syncStatus(this.type, function(data){
                _this.getCheckedCallback(data);
                callback(data);
            }, function(data){
                callback(data);
            });
        },
        getCheckedCallback:function(result){
            //{name:'tSina',isChecked:true},{name:'tSina',isChecked:false}]
            var data = result.data,
                type  = this.type,
                opts_class = this.options.checkedClass;
            for(var i=0;i<data.length;i++){
                var name = data[i].name,
                    isChecked = data[i].isChecked;

                var $btn = this.$el.find("[data-name="+name+"][data-type="+type+"]");

                /*2013.8.6*/
                if($btn.attr('data-bind')!=1){
                    continue;
                }

                if(isChecked){
                    $btn.attr("data-share",1).addClass(opts_class);
                }else{
                    $btn.attr("data-share",0).removeClass(opts_class);
                }
            }
            this.options.checkedSuccess();
        },
        setChecked:function(thirdpartyId,isChecked, type, callback){
            //name = "tSina|qzone" type='comment'|'track'|'album'
            var _this = this;
            this.model.setSync(thirdpartyId,isChecked, type, function(){
                callback();
                _this.options.checkedSuccess();
            });
        },
        addBind:function(name){
            if(!name) return;
            var is_tQQ = false;
            if(name == "tQQ"){
                name = "qzone";
                is_tQQ = true;
            }
            var _this = this;
            this.model.addBind(name, function(){
                $("[data-name="+name+"]").attr({"data-bind":1},{"data-share":1}).addClass(_this.options.checkedClass);
                if(is_tQQ){
                    $("[data-name=tQQ]").attr({"data-bind":1},{"data-share":1}).addClass(_this.options.checkedClass);
                }
            });
        },
        unBind:function(name){
            var _this = this;
            var obj = {
                tSina:"新浪微博",
                qzone:"QQ"
            };
            dialog.confirm ("是否要解除绑定,解绑后不能再用该"+obj[name]+"帐号登录？", {callback:function(){
                _this.model.unBind(name, function(data){
                    callback(data);
                }, function(data){
                    dialog.alert(data.msg);
                });

            }});
        },
        bindEvents:function(){
            var _this = this;
            this.$el.on("click","[data-name][data-type]", function(){
                var $btn = $(this),
                    name = $btn.attr("data-name"),
                    type = $btn.attr("data-type");
                if($btn.attr("data-bind") !=1 ){
                      _this.addBind(name);
                }else{
                    if($btn.attr("data-share") != 1){
                        _this.setChecked(name, true, type, function(){
                            $("[data-name="+name+"][data-type="+type+"]").attr("data-share", 1).addClass(_this.options.checkedClass);
                        });
                    }else{
                        _this.setChecked(name, false, type, function(){
                            $("[data-name="+name+"][data-type="+type+"]").attr("data-share", 0).removeClass(_this.options.checkedClass);
                        });
                    }
                }

            });
        },
        getShareData:function(callback){
            var _this = this,
                sharing_to = [],
                no_more_alert = false;

            callback = callback || $.noop;
            var $shares = this.$el.find("[data-share=1]"),
                $shareFirst = $shares.eq(0);
            if($shareFirst.size() == 0){
                callback({sharing_to:[]});
                return;
            }
            var type = $shareFirst.attr("data-type"),
                 data_name = $shareFirst.attr('data-name'),
                 sdata = _this.model.getSyncStatus(type);

            $shares.each(function(){
                var $this = $(this),
                    name = $this.attr("data-name");
                sharing_to.push(name);
            });

            var text = "温馨提示:您的评论将会被自动同步到微博、腾讯?",
                isAlert = false,
                noCheckBox = false;

            if((type=="comment" || type=="relay") && sdata.isCommentAlert){
                if(type == "relay"){
                    text = "温馨提示:您的转采将会被自动同步到微博、腾讯?";
                }
                isAlert = true;
            }
            if(type=="favorite" && sdata.isFavoriteAlert){
                //喜欢分享 只在第一次会弹出 以后都不弹出
                noCheckBox = true;
                isAlert = true;
                var msg = {
                    tSina:"新浪微博",
                    qzone:"腾讯微博"
                };
                text = "喜欢就分享一下吧，点击同步，这条消息会被同步到"+msg[data_name]+"，您可以在个人设置中设置同步开关哟。";
            }
            if(isAlert){
                dialog_sync.open({
                    noCheckBox:noCheckBox,
                    syncFn:function(isChecked){
                        if(type=="comment" || type=="relay"){
                            sdata.isCommentAlert = !isChecked;
                            callback({no_more_alert:isChecked, sharing_to:sharing_to});
                        }
                        if(type=="favorite"){
                            sdata.isFavoriteAlert = false;
                            callback({no_more_alert:true, sharing_to:sharing_to});
                        }

                    },
                    unSyncFn:function(isChecked){
                        if(type=="comment" || type=="relay"){
                            sdata.isCommentAlert = !isChecked;
                            callback({no_more_alert:isChecked, sharing_to:[]});
                        }
                        if(type=="favorite"){
                            sdata.isFavoriteAlert = false;
                            callback({no_more_alert:true, sharing_to:[]});
                        }
                        if(sdata.data){
                            for(var i=0;i<sdata.data.length;i++){
                                if(sdata.data[i].name == data_name){
                                    sdata.data[i].isChecked = false;
                                }
                            }
                        }

                        $("[data-name][data-type="+type+"]").attr("data-share", 0).removeClass(_this.options.checkedClass);
                    },
                    text:text
                });
            }else{
                 callback({sharing_to:sharing_to, no_more_alert:true});
            }

        },
        release: function () {
            var $el = this.$el;
            $el.off();
            $el.empty();
        }
    });

    return  ShareView;
});
