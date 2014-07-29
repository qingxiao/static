define([], function () {
    var regexEnum =
    {
        intege: /^-?[1-9]\d*$/, //整数
        intege1: /^[1-9]\d*$/, //正整数
        intege2: /^-[1-9]\d*$/, //负整数
        num: /^([+-]?)\d*\.?\d+$/, //数字
        num1: /^[1-9]\d*|0$/, //正数（正整数 + 0）
        num2: /^-[1-9]\d*|0$/, //负数（负整数 + 0）
        decmal: /^([+-]?)\d*\.\d+$/, //浮点数
        decmal1: /^[1-9]\d*.\d*|0.\d*[1-9]\d*$/, //正浮点数
        decmal2: /^-([1-9]\d*.\d*|0.\d*[1-9]\d*)$/, //负浮点数
        decmal3: /^-?([1-9]\d*.\d*|0.\d*[1-9]\d*|0?.0+|0)$/, //浮点数
        decmal4: /^[1-9]\d*.\d*|0.\d*[1-9]\d*|0?.0+|0$/, //非负浮点数（正浮点数 + 0）
        decmal5: /^(-([1-9]\d*.\d*|0.\d*[1-9]\d*))|0?.0+|0$/, //非正浮点数（负浮点数 + 0）
        email: /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/, //邮件
        color: /^[a-fA-F0-9]{6}$/, //颜色
        url: /^http[s]?:\/\/([\w-]+\.)+[\w-]+([\w\-.\/\?\%\&\=\#]*)?$/, //url
        chinese: /^[\u4E00-\u9FA5\uF900-\uFA2D]+$/, //仅中文
        include_chinese: /[\u4E00-\u9FA5\uF900-\uFA2D]/g,

        ascii: /^[\x00-\xFF]+$/, //仅ACSII字符
        zipcode: /^\d{6}$/, //邮编
        mobile: /^1[0-9]{10}$/, //手机
        ip4: /^(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)$/, //ip地址
        notempty: /^\S+$/, //非空
        picture: /(.*)\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$/, //图片
        rar: /(.*)\.(rar|zip|7zip|tgz)$/, //压缩文件
        date: /^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/, //日期
        qq: /^[1-9]*[1-9][0-9]*$/, //QQ号码
        tel: /^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/, //电话号码的函数(包括验证国内区号,国际区号,分机号)
        username: /^\w+$/, //用来用户注册。匹配由数字、26个英文字母或者下划线组成的字符串
        letter: /^[A-Za-z]+$/, //字母
        letter_u: /^[A-Z]+$/, //大写字母
        letter_l: /^[a-z]+$/, //小写字母
        idcard: /^[1-9]([0-9]{13}|[0-9]{16})([0-9]|X)$/,    //身份证
        illchar: /[\~\`\!\@\#\$\%\^\&\*\(\)\-\=\+\\\|\'\"\;\:\.\>\,\<\/\?\~\·\！\@\#\￥\%\…\…\&\*\（\）\—\—\-\+\=\|\\\}\]\{\[\"\'\:\;\?\/\>\.\<\,]/,
        validator: function (value, type) {
            var returnValue = false;
            if (this[type]) {
                if (this[type].test(value)) {
                    returnValue = true;
                }
            }
            return returnValue;
        },
        validatorLength: function (value, minLen, maxLen) {
            var returnValue = false;
            var len = value.length;
            maxLen = maxLen || minLen;
            if (minLen > maxLen) {
                var temp = minLen;
                minLen = maxLen;
                maxLen = temp;
            }
            if (len >= minLen && len <= maxLen) {
                returnValue = true;
            }
            return returnValue;
        },
        init: function (con) {
            var that = this;

            $(con).find(".validator").each(function () {
                var _this = this;

                $(_this).data("valid", that.getvalidator($(_this)));
                $(_this).bind("blur", function () {
                    that.doVaild.call(that, _this, $(_this).val(), $(_this).data("valid"));
                });
            });
        },
        getvalidator: function (obj) {
            var validator = $(obj).attr("validator") || "";
            var msg = $(obj).attr("msg") || "";
            var require_msg = $(obj).attr("require_msg") || "";
            var require = $(obj).attr("require") || false;
            var type = validator.replace(/\[(.*?)\]/g, "") || undefined;
            var length = /\[(.*?)\]/.exec(validator) || undefined;

            if (length)
                length = length[1].split(',');

            return {
                type: type,
                length: length,
                require: require,
                msg: msg,
                require_msg: require_msg
            };
        },
        doVaild: function (obj, value, data) {
            var breturn = true;
            var length = 0;
            var msg = "";

            $("span.validator_" + $(obj).attr("id")).text("").removeClass("sp_error").addClass("sp_right");
            if (data.require && value == "") {
                breturn = false;
                msg = data.require_msg;
                $("span.validator_" + $(obj).attr("id")).text(data.require_msg).addClass("sp_error").removeClass("sp_right");
            }
            if (data.type && breturn) {
                breturn = this.validator(value, data.type);
                if (breturn == false) {
                    msg = data.msg;
                    $("span.validator_" + $(obj).attr("id")).text(data.msg).addClass("sp_error").removeClass("sp_right");
                }
            }
            if (breturn && data.length) {
                length = value.length;
                if (length < data.length[0] || length > data.length[1]) {
                    $("span.validator_" + $(obj).attr("id")).text(data.msg).addClass("sp_error").removeClass("sp_right");
                    msg = data.msg;
                    breturn = false;
                }
            }

            return {
                res: breturn,
                msg: msg
            };
        },
        doVaildR: function (con) {
            var that = this;
            var breturn = false;

            $(con).find(".validator").each(function () {
                var _this = this;

                breturn = that.doVaild.call(that, _this, $.trim( $(_this).val()), $(_this).data("valid"));
                if (!breturn.res) {
                    return false;
                }
            });

            return breturn;
        }
    };

    return regexEnum;
});
