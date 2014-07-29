define(['underscore','jquery','app/common','plugin/soundmanager','plugin/player','app/sound','plugin/mainplayer','jquery.easydrag'],function(_,$,common,soundManager,Player,track_m,mainPlayer) {
	var backPlayer_center = _.template(['<div class="titlebar">',
          '<a href="/sound/<%=id%>" target="_blank" class="player-title greya" title="<%= title%>"><%= cutedTitle%></a>',
          '<a <%=(common.isLogined()?"":\'target="_blank"\')%> href="<%=(common.isLogined()?"#/":"/") + categoryName%>" title="去发现更多访谈声音" class="player-square">[<%= square%>]</a>',
        '</div>',
        '<div class="from">来自 <a <%if(authorId != config.CURRENT_USER.uid){%> card="<%=authorId%>" href="<%=(common.isLogined()?"#/":"/") + authorId%>" <%}%> class="a_4 player-author  <%if (isVerified){%>add-ico-v<%}%>"><%= author%><%if (isVerified){%><u class="ico" title="喜马拉雅认证播主"></u><%}%></a>',
        	'<%if(album){%>',
        	'<span class="player-albumbox"> 的<a href="/album/<%=albumId%>"  target="_blank" class="c2 player-album">《<%= album%>》</a></span>',
        	'<%}%>',
        '</div>',
        '<div class="player-progressbar">',
          '<div class="player-seekbar" style="width:<%=player_seekbar_width%>px">',
            '<div class="player-playbar" style="width:<%=player_playbar_width%>px"><a href="javascript:;" class="btn-seek"></a></div>',
            '<div class="player-playbar-copy"><a href="javascript:;" class="btn-seek"></a></div>',
          '</div>',
        '</div>',
        '<div class="clearfix_after">',
          '<div class="player-time">',
            '<span class="player-position">00:00</span>/<span class="player-duration"><%= duration_text%></span>',
          '</div>',
          '<div class="player-volumebox">',
            '<a href="javascript:;" class="<%=player_mute?\'player-mute\':\'player-unmute\'%>"></a>',
            '<div class="player-volumebar" style="display:none;">',
              '<div class="player-volume-bg"></div>',
              '<div class="player-volume fordisplay" style="width:<%=player_volume_width%>px"></div>',
              '<div class="player-volume-cover"></div>',
            '</div>',
          '</div>',
          '<ul class="control-bar">',
            '<li class="j-button"><a href="javascript:;" class="player-commentbtn incP1" track_uid="<%= authorId %>" track_id="<%=id%>" target="_blank" title="评论"></a></li>',
            '<li class="j-button"><a href="javascript:;" class="incP2 player-sharebtn" track_uid="<%= authorId %>" track_title="<%=title%>" track_id="<%=id%>" track_intro="<%= info %>" title="分享到站外"></a></li>',
            '<li class="j-button"><a href="javascript:;" class="incP3 player-likebtn <%=isliked?\'liked\':\'\'%>" track_uid="<%= authorId %>" track_id="<%=id%>" title="<%=isliked?\'单击一下不喜欢\':\'单击一下喜欢\'%>"></a></li>',
          '</ul>',
        '</div>'].join(''));
        
	function getTime(nMSec, bAsString) {
	    var nSec = Math.floor(nMSec/1000),
	        min = Math.floor(nSec/60),
	        hour = Math.floor(min/60),
	        sec = nSec-(min*60);
	    min = min - (hour*60);
	    return (bAsString?(hour?(hour+":"):"")+((min<10?'0'+min:min)+':'+(sec<10?'0'+sec:sec)):{'min':min,'sec':sec,'hour':hour});
	}
	function Player2(options){
		mainPlayer.view(this);
		Player.call(this,options);
		//toDo 默认图片
	}
	Player2.prototype = new Player();
	Player2.prototype.init = function(){
		this.name = "mainPlayer_view";
		this.$el.attr("name",this.name);
		soundManager.playerlist[this.name] = this;
		mainPlayer.view(this);
	};
	Player2.prototype.getData = function(){
		var data = track_m.tracks[this._track_id];
		return _.extend({},data,{duration:data.duration/1000});
	};
	Player2.prototype.isFollowplayer = function(){
		return false;
	};
	Player2.prototype.play = function(){
		mainPlayer.play();
	};
	Player2.prototype.isPlaying = function () {
        return mainPlayer.isPlaying();
    };
	Player2.prototype.render = function(data){
		this._track_id = data.id;
		var container=this.$el;
		//data.duration_text = getTime(data.duration, true);
		data.player_volume_width = $(".player-volume").width();
		data.player_seekbar_width = $(".player-seekbar").width();
		data.player_playbar_width = $(".player-playbar").width();
		data.player_mute = !mainPlayer.volume();
		data.cutedTitle = common.cutString(data.title,30);
		
		container.find(".info-name a").text(data.cutedTitle).attr("href","/#/"+data.uid+"/sound/"+data.id).attr("title",data.title);
		container.find(".g-player-control").show();
		//container.find(".center").html(backPlayer_center(data));
        container.find(".g-player-like").attr({track_id:data.id});
		var likebtn = container.find(".player-likebtn");
		if(likebtn)likebtn.attr("track_id", data.id);
        container.find("track_uid").each(function(){
            $(this).attr("track_uid", data.authorId);
        });
		
		//container.find(".center").show();
		//container.find(".right").show();
	};
	Player2.prototype.rendOPerateBtnState = function(mplayer){
		if(mplayer.nextable()){
			this.$("next").removeClass("disabled").attr("title","下一首");
		}
		else{
			this.$("next").addClass("disabled").removeAttr("title");
		}
		if(mplayer.playable()){	
			var $el = this.$("operate");
			$el.removeClass("disabled");
			if($el.is(".player-play")){
				$el.attr("title","播放");
			}else{
				$el.attr("title","暂停");
			}
		}
		else{
			this.$("operate").addClass("disabled").removeAttr("title");
		}
		if(mplayer.preable()){				
			this.$("pre").removeClass("disabled").attr("title","上一首");
		}
		else{
			this.$("pre").addClass("disabled").removeAttr("title");
		}
		if(mplayer.isEmpty()){
			this.$el.addClass("player-cover");
		}else{
			this.$el.removeClass("player-cover");
		}
		this.$el.find(".center").show();
		this.$el.find(".right").show();
	};
	Player2.prototype.soundExist = function(model,track_id){
	};
	Player2.prototype.soundRemoved = function(model,track){
	};
	$(".player-soundface").bind("error", function () {
        $(this).attr("src",config.STATIC_ROOT+'/css/img/common/track_180.jpg');
    });
	$(window).bind("scroll",window_onscroll_callback);
	function window_onscroll_callback(){
		$(".g-player").toggleClass("topnav-fixed",!!$(document).scrollTop());
	}
	
	
	var volume = {
		barWidth:24,
		render: function(){
			var volume = mainPlayer.volume(),
				width = this.barWidth * volume / 100,
				off = !volume;
            $(".player-volume").width(width);
            if(off){
            	$(".volume-panel").addClass("off");
            	$(".volume-bar").css({"left":this.barWidth/2+"px","top":0}).dragOff();
            	$(".player-unmute").addClass("player-mute").removeClass("player-unmute");
            }else{
            	$(".volume-panel").removeClass("off");
            	$(".volume-bar").css({"left":width+"px","top":"2px"}).dragOn();
            	$(".player-mute").addClass("player-unmute").removeClass("player-mute");
            }
		}
	};
	$('.info-name').live({
		mouseenter: function(){
			$(this).addClass("hover");
		},
		mouseleave: function(){
			$(this).removeClass("hover");
		}
	});

    $('.player-unmute').live({
        click: function () {
        	var $el = $(this);
        	$el.data("last_volume", mainPlayer.volume());
        	mainPlayer.volume(0);
        	volume.render();
        }
    });
    $('.player-mute').live({
        click: function () {
            var $el = $(this),
            last_volume = $el.data("last_volume") || 50;
            mainPlayer.volume(last_volume);
            volume.render();
        }
    });
    $('.player-volumebar').live({
        click: function (e) {
            var $el = $(this),
				left = $el.offset().left,
				width = $el.width(),
				x = e.clientX - left,
				percent = (e.clientX - left) / width;
            if (x <= 0) {
                x = 0;
                percent = 0;
            }
            if (x >= 24) {
                x = 24;
                percent = 1;
            }
            mainPlayer.volume(parseInt(percent * 100));
            volume.render();
        }
    });
    $(".volume-bar").easydrag();
    $(".volume-bar").ondrag(function(e, element){
    	var $el = $(element),
    		position = $el.position(),
    		left = position.left;
    	if(left<0){
    		left = 0;
    	}
    	if(left>24){
    		left=24;
    	}
    	$el.css({
    		"top":"2px",
    		"left":left+"px"
    	});
    	$(".player-volume").width(left);
    	mainPlayer.volume(parseInt(left * 100/24));
    });
    volume.render();
	return Player2;
});