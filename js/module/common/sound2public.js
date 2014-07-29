/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-7-2
 * Time: 下午3:02
 * To change this template use File | Settings | File Templates.
 */
define(['jquery', 'plugin/dialog', 'model/sound'],
    function ($,dialog, SoundModel) {
        var soundModel = new SoundModel();
        $(document).on("click", ".privacyIcon", function(){
            var $btn = $(this),
                record_id = $btn.attr("record_id"),
                tip =  "要公开这个声音吗？<br/><font style='color:grey;'>（公开后，无法再设置为私密）</font>";
            dialog.confirm(tip,function(){
                soundModel.setPublic(record_id, function(data){
                    dialog.success("操作成功");
                    $btn.hide();
                },function(data){
                    dialog.alert(data.msg || "操作失败");
                });
            });
            return false;
        });
    });