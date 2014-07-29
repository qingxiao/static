define([
'jquery',
'underscore',
'backbone',
'model/feed_group',
'module/feed_group/group'],
function ($, _, Backbone, feedGroupModel, feedGroupModule) {
    var template = [
        '<label><input type="checkbox" <% if(checked){ %> checked <%}%> value="<%=id%>" class="checkbox">&nbsp;<%=title%></label>',
        '<% if(id==-1){%> ',
        '<div class="listenhelp">',
		'	<a class="grouphelp"></a>',
		'	<div class="grouphelp_txt">',
		'		把最想听的加入必听组，可以在手机客户端实时收到更新通知哦！',
		'		<span class="arrow_grouphelp"><i></i></span>',
		'	</div>',
		'</div>',
		'<%}%>',
        ''
        ].join('');
    var groupView = Backbone.View.extend({
        template: _.template(template),
        tagName: "span",
        render: function () {
            var _this = this;

            _this.$el.html(_this.template(_this.model.toJSON()));
            this.undelegateEvents();
            this.delegateEvents(this.events);

            return _this.$el;
        }
    });

    return groupView;
});