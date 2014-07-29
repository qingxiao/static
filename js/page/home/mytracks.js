define(['jquery',"page/page_base"],function($, PageBase) {
	 var Page = PageBase.extend({
        init:function(){
            this.callParent("init");
        },
        release:function(){
            this.callParent("release");
        }
	 });
	return new Page();
});