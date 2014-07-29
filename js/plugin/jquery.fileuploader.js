/*
 * jQuery.fn.fileuploader -  文件异步上传
 * By Jacky.Wei
 	使用方法：
	$("#formId").fileuploader({
		//文件域配置					  	
		file :{
			name : "filea", //file的name属性
			id :"iframe_" + 0 // iframe的id
		},
		//文件类型配置
		filetype : ["gif","jpg","jpeg","png"],
		
		//所在form的选择器
		parentform : "#form1",
		
		//提交url
		action : "upload.php",
		
		//上传之前的动作
		beginupload : function(){
			$("#loading").html("正在上传......");
		},
		
		//上传操作成功的动作(data为json数据)
		success : function(data){
			var hidden = $("#imghidden_" + i);
			thumbcon.html("<img src='" + data.file + "' width='120' height='90' />");
			//alert(data.file)
			hidden.val(data.file);
		},
		
		//文件类型不合要求
		onfileTypeError : function(types){
			alert("文件格式只能是" + types)
		}
	});
*/
define('fileuploader',['jquery'], function($){
(function($){
	function getJsonStrFrom(str){
		var ret = "";
		var pat = /{.*}/;
		var res = str.match(pat);
		if(res !== null){
			ret = res[0];
		};
		return ret;
	};
	//简单判断字符串是否是是json格式
	function isjson(str){
		return /^{.*}$/.test(str);
	};
		  
    $.array = {
		//判断元素是否在数组内
        arrayIn: function(a, b) {
            var ret = false;
            for (var i = 0, len = a.length; i < len; i++) {
                if (a[i] === b) {
                    ret = true;
                    break;
                }
            };
            return ret;
        }
	};
	$.fn.fileuploader = function(options){
		var set = $.extend({
			file :{
				name : "filename",
				id :"fileid0"	
			},
			filetype : ["gif","jpg","jpeg","png","bmp"],
			parentform : null,
			action : "upload.php",
			beginupload : function(){
				
			},
			success : function(data){
				//alert(data.msg)
			},
			
			onfileTypeError : function(types){
				alert("文件格式只能是" + types);
			}
		},options);
		return this.each(function(){
			var t = $(this), _t = this, form = null, file = null,postwinname = "ajaxpost" + set.file.id, postwinid = "ajaxpostid" + set.file.id, postwin = null;
			var formattr = null;
			//执行初始化
			function init(){
				
				cacheformattr();
				
				t.css({cursor : "pointer", overflow:"hidden", position : "relative"}).
				prepend("<input hidefocus='true' type='file' id='" + set.file.id+ "' name='" + set.file.name + "' />");
				file = $("#" + set.file.id);
				file.css({opacity : 0}).css({
					fontSize : "118px",
					margin : "0",
					padding : "0",
					cursor : "pointer",
					position : "absolute",
					right : "0",
					top : "0",
					fontFamily : "Arial"
				});
				
				file[0].onchange = __changed;
			};
			//file onchage事件
			function __changed(){
				checkfile(function(){
					set.beginupload();
					createpostwin();
					submitform();
				});
			};
			//检测文件类型是否合法
			function checkfile(call){
				call = call || function(){};
				var val = $("#" + set.file.id).val().toLowerCase();
				var type = val.split(/\//); 
				if($.array.arrayIn(set.filetype,"jpg") && !$.array.arrayIn(set.filetype,"jpeg")){
					set.filetype.push("jpeg");
				};
				if($.array.arrayIn(set.filetype,"jpeg") && !$.array.arrayIn(set.filetype,"jpg")){
					set.filetype.push("jpg");
				};
				var types = set.filetype.join("|").toLowerCase();
				var reg = new RegExp("" + types + "$");
				if(reg.test(val.toLowerCase())){
					call();
				}else{
					set.onfileTypeError(types);
					//alert("文件格式只能是 " + types);
					return ;
				};
			};
			//模拟ajax : 提交表单后每隔一毫秒获取iframe 内html是否是json格式（或者其他格式 ，团队先约定好） ，若是json格式则表示请求成功 
			function request(){
				var auto = setInterval(function(){
					var doc = postwin[0].contentWindow.document; 
					if(doc && doc.getElementsByTagName("body").length > 0){
						//var html = $(postwin[0].contentWindow.document).find("body").html().toLowerCase();
						//html = html.replace("<pre>","").replace("</pre>","");
						var jsonStr = getJsonStrFrom($(doc).find("body").html());
                        /*xiaoqing 20120911 字符串可能包含一些未知的标签 把最后的<后面的东西去掉*/
                        var idx = jsonStr.indexOf("<");
                        if(idx>0){
                            jsonStr = jsonStr.substring(0, idx);
                        }

						if(isjson(jsonStr)){
							clearInterval(auto);
							auto = null;

							set.success(eval("(" + jsonStr + ")"));
							postwin.remove();
							init();
						};
					};
					 
				}, 100);
			};
			//创建表单post窗口
			function createpostwin(){
				$("#" + postwinid).remove();
				var iframe = $("<iframe  style='display : none;' id='" + postwinid + "' name='" + postwinname  + "'></iframe>");
				$("body").append(iframe);
				postwin = $("#" + postwinid);
			};
			//提交表单过程
			function submitform(){
				if(form !== null){
					var _form = form[0];
					form.attr({
						action : set.action,
						method : "post",
						enctype : "multipart/form-data",
						encoding : "multipart/form-data",//兼容 ie版本
						target : postwinname
					});
					_form.submit();
					file.remove();
					request();
					resetparentform();
				};
			};
			//iframe创建之前下获取页面form属性，待表单提交后恢复之
			function cacheformattr(){
				
				if(set.parentform !== null){
					formattr ={};
					form = $(set.parentform);
					if(form.attr("enctype")){
						formattr.enctype = form.attr("enctype"); 
					};
					if(form.attr("encoding")){
						formattr.encoding = form.attr("encoding"); 
					};
					if(form.attr("action")){
						formattr.action = form.attr("action"); 
					};
					if(form.attr("target")){
						formattr.target = form.attr("target"); 
					};
					if(form.attr("method")){
						formattr.method = form.attr("method"); 
					};
				};
				
			};
			
			function debugObj(obj){
				var str = "";
				for(var key in obj){
					str += key + "=" + obj[key] + "&";
				};
				if(str !== ""){
					str = str.slice(0, -1);
				};
				return str;
			};
			
			//恢复表单属性
			function resetparentform(){
				
				if(set.parentform !== null){
					var form = $(set.parentform);
					$.each(formattr,function(key,val){
						form.attr(key,val);
					});
					 
					if(!formattr.target){
						form.removeAttr("target");	
					};
					if(!formattr.action){
						form.removeAttr("action");	
					};
					if(!formattr.enctype){
						try{
							form.removeAttr("enctype");	
						}catch(e){
						}
					};
					
					if(!formattr.method){
						form.removeAttr("method");	
					};
					
					if(!formattr.encoding){
						
						try{
							form.removeAttr("encoding");	
						}catch(e){
						}
						
					};
					 
				};
			};
			init();
		});
	};
})(jQuery);
});