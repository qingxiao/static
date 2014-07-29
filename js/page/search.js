define(["jquery", "module/header_search", "helper", "page/page_base",
    "module/common/ifollow", "module/common/iletter", "module/player/player","plugin/jquery_ujs", "plugin/jquery.selecter"],
    function ($, header_search, helper, PageBase, ifollow, iletter, player) {
    var Page = PageBase.extend({
        init:function () {
            this.callParent("init");
            this.$searchUserPage = $("#searchUserPage");
            this.initSearch();
            this.bindEvents();
            ifollow.init();
            iletter.bind($(".sendLetterBtn"));
            iletter.bind($(".radioLetterIcon").parent());
        },
        initSearch:function () {
            var search = header_search({
                $el:$(".searchContent .searchBar ")

            });
            search.setScope($(".searchTab .tab_item.on").attr("data-scope"));
            $(".searchField button").on("click", function(){
                search.chooseResult(true);
            });

        },
        bindEvents:function () {

            var $searchUserPage = this.$searchUserPage,
                _this = this;
            $searchUserPage.find(".selecter").selecter();
            // 绑定搜索事件 父节点
            $searchUserPage.on("click", ".searchTab [data-scope]", function () {
                var scope = $(this).attr("data-scope");
                gsearch(scope);
            });


            //用户列表
            $searchUserPage.find(".follow_list").on({
                mouseenter:function(){
                    var $li = $(this),
                        $ul = $li.parent();
                    $ul.find(".on").removeClass("on");
                    $li.addClass("on");
                }
            }, "li");

            $searchUserPage.find(".radioUserListItem").on("click", function (e) {
                var href = $(this).find(".radioUserPanel .userface").attr("href");
                if (href) {
                    location.href = href;
                }
                return false;
            });

            // 绑定搜索事件 子节点
            $searchUserPage.on("click", ".gSearch-sub-voice", function () {
                gsearch("voice", $(this).attr('name'));
            });
            $searchUserPage.on("click", ".gSearch-sub-album", function () {
                gsearch("album", $(this).attr('name'));
            });
            $searchUserPage.on("click", ".gSearch-sub-tag", function () {
                gsearch("tag", $(this).attr('name'));
            });
            $searchUserPage.on("click", ".gSearch-sub-user", function () {
                gsearch("user", $(this).attr('name'));
            });

            $("#sub_voice_user_source").on("change", function () {
                var ele = $(".gSearch-sub-voice.on");
                gsearch("voice", ele.attr('name'));
            });


            $("#sub_voice_category_id").on("click", "a", function () {
                var $a = $(this);
                if($a.hasClass("more")){
                    return;
                }
                $("#sub_voice_category_id").attr('data-value', $a.attr("data-value"));

                var ele = $(".gSearch-sub-voice.on");
                gsearch("voice", ele.attr('name'));
            });


            $("#sub_album_category_id").on("click", "a", function () {
                var $a = $(this);
                if($a.hasClass("more")){
                    return;
                }
                $("#sub_album_category_id").attr('data-value', $a.attr("data-value"));
                var ele = $(".gSearch-sub-album.on");
                gsearch("album", ele.attr('name'));
            });

            $("#sub_voice_category_id, #sub_album_category_id").on("click", ".more", function () {
                var $more = $(this);
                $more.parent().find(".more-category").removeClass("hidden");
                $more.hide();
            });

            $("#sub_album_user_source").on("change", function () {
                var ele = $(".gSearch-sub-album.on");
                gsearch("album", ele.attr('name'));
            });

            $("#sub_user_gender,#sub_user_isVerified").on("change", function () {
                var ele = $(".gSearch-sub-user.on");
                gsearch("user", ele.attr('name'));
            });

            $searchUserPage.on("click", ".miniPlayBtn3", function(){
                var $this = $(this),
                    $parent = $this.closest(".soundReport"),
                     $expandbox_player_entry =  $parent.find(".expandbox_player_entry");
                if($this.attr("data-inited")){
                    if($expandbox_player_entry.size()>0){
                        $parent.addClass("is-soundReport-expand");
                        $expandbox_player_entry.slideDown();
                        $expandbox_player_entry.find(".playBtn").trigger("click");
                    }
                    return;
                }
                $this.attr("data-inited", true);
                var sound_id = $this.attr("track_id");
                _this.initPlayer($parent, sound_id, $this);
            });
            $searchUserPage.on("click", ".miniPauseBtn3", function(){
                var $this = $(this),
                    $parent = $this.closest(".soundReport");
                $parent.find(".pauseBtn").trigger("click");
            });

        },
        initPlayer:function($container, sound_id, $btn){
             var $expandbox_player_entry = $container.find(".expandbox_player_entry");
            $.get("sounds/"+sound_id+"/expend_box", function(html){
                $expandbox_player_entry.hide().html(html);
                $container.addClass("is-soundReport-expand");
                $expandbox_player_entry.slideDown();
                player.render({$container:$container});
                $container.find(".playBtn").trigger("click");
                $container.on({
                    onSoundPlay:function(){
                        $btn.removeClass().addClass("miniPauseBtn3");
                    },
                    onSoundPause:function(){
                        if(window.console) console.log("pause");
                        $btn.removeClass().addClass("miniPlayBtn3");
                    },
                    onSoundFinish:function(){
                        if(window.console) console.log("finish");
                        $btn.removeClass().addClass("miniPlayBtn3");
                    },
                    onSoundStop:function(){
                        if(window.console) console.log("stop");
                        $btn.removeClass().addClass("miniPlayBtn3");
                        $expandbox_player_entry.slideUp(function(){
                            $container.removeClass("is-soundReport-expand");
                        });
                    },
                    onSoundResume:function(){
                        if(window.console) console.log("resume");
                        $btn.removeClass().addClass("miniPauseBtn3");
                    }
                });
            });
        },
        unbindEvents:function () {
            this.$searchUserPage.off();
            this.$searchUserPage.empty();
        },
        release:function () {
            this.callParent("release");
            this.unbindEvents();
        }
    });

    function gsearch(scope, sort, page) {
        var condition = $.trim($("#gSearch-input").val());
        sort = sort || "";
        var reg = /[\u4e00-\u9fa5]/g;
        var temp_str = condition.replace(reg, "aa");
        if (temp_str.length > 70) {
            condition = condition.substring(0, 30);
            $("#gSearch-input").val(condition);
        }
        if (!scope) {
            scope = "voice";
        }
        var fq = get_fq(scope);
        if (page == null)
            page = 1;

        var data = {
            "q":condition,
            "qf":scope,
            "sort":sort,
            "fq":fq,
            "page":page
        };
        var parm = [];
        for (var nn in data) {
            parm.push(nn + "=" + encodeURIComponent(data[nn]));
        }
        var temp = "";
        if (helper.isLogin()) {
            temp = "/#";
        }
        window.location.href = temp + "/s?" + parm.join("&");
    }

    // 获取搜索范围
    function get_fq(scope) {
        var fq = "";
        if (scope == "voice") {
            var category_id = $("#sub_voice_category_id").attr("data-value");
            var user_source = $("#sub_voice_user_source").selecter("val");
            if (category_id && category_id != "") {
                if (category_id == "6") {
                    fq += "category_id:[19 TO 24]"; // 音乐取子类范围
                } else {
                    fq += "category_id:" + category_id;
                }
            }
            if (user_source && user_source != "") {
                if (fq != "")
                    fq += " AND ";
                fq += "user_source:" + user_source;
            }
        }
        if (scope == "album") {
            var category_id = $("#sub_album_category_id").attr("data-value");
            var user_source = $("#sub_album_user_source").selecter("val");
            if (category_id && category_id != "") {
                if (category_id == "6") {
                    fq += "category_id:[19 TO 24]"; // 音乐取子类范围
                } else {
                    fq += "category_id:" + category_id;
                }
            }
            if (user_source && user_source != "") {
                if (fq != "")
                    fq += " AND ";
                fq += "user_source:" + user_source;
            }
        }
        if (scope == "user") {
            var gender = $("#sub_user_gender").selecter("val");
            if (gender && gender != "")
                fq += "gender:" + gender;
            var isVerified = $("#sub_user_isVerified").selecter("val");
            if (isVerified && isVerified != "") {
                if (fq != "")
                    fq += " AND ";
                fq += "isVerified:" + isVerified;
            }
        }
        return fq;
    }

    var page = new Page();
    return page;
});
