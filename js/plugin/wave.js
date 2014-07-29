define([ "jquery", "underscore", "backbone", "helper" ], function ($, _, Backbone, helper) {

    var wave = {
        draw:function (data, options) {
            //data->{width:1800,height:140,samples:[小于等于heiht的长width的数组]}
            var defaults = {
                width:600,
                height:35,
                color:"#00ccff",
                top:15,
                wrapClass:""
            };
            options = $.extend(defaults, options);
            var canvas = document.createElement("canvas");
            var rel;
            if (canvas.getContext) {
                rel = this.drawInCavas(data, options);
            } else {
                rel = this.drawInVml(data, options);
            }
            return rel;
        },
        drawInVml:function (data, options) {
            var width = options.width || data.width,
                height = options.height || data.height,
                color = options.color,
                ratio_w = width / data.width,
                ratio_h = (height - options.top) / data.height,
                wave_path = data.samples;
            var h = 0,
                paths = [],
                part = 4;
            for (var i = 0, len = width, base = len / part; i < len; i++) {
                var path = "";
                h = Math.round((wave_path[Math.round(i / ratio_w)]) * ratio_h);
                path += ' m' + i + ',0' + ' l' + i + ',' + Math.ceil(height - h);
                //path += ' m' + i + ',' + Math.ceil(height / 2 + h) + ' l' + i + ',' + Math.ceil(height);

                var idx = Math.floor(i / base);
                if (!paths[idx]) {
                    paths[idx] = "";
                }
                paths[idx] = paths[idx] + path;
            }

            var shapes = "";
            for (var j = 0; j < part; j++) {
                paths[j] += " e";
                shapes += '<v:shape  class="vml" style="width: ' + width + 'px; height: ' + height + 'px;" coordsize="' + [width, height].join(",") + '" ' +
                    ' strokecolor="' + color + '" path="' + paths[j] + '"></v:shape>';
            }
            shapes = '<div class="'+options.wrapClass+'">' + shapes + '</div>';
            return shapes;
        },
        drawInCavas:function (data, options) {
            var width = options.width || data.width,
                height = options.height || data.height,
                color = options.color,
                ratio_w = width / data.width,
                ratio_h = (height - options.top) / data.height,
                wave_path = data.samples;

            var canvas = document.createElement("canvas"),
                f = canvas.getContext("2d");

            canvas.width = width;
            canvas.height = height;

            var h = 0;
            for (var i = 0, len = width; i < len; i++) {
                h = Math.round((wave_path[Math.round(i / ratio_w)]) * ratio_h);

                f.fillStyle = color;
                f.fillRect(i, 0, 1, height - h);
                //f.fillRect(i, height / 2 + h, 1, height);
            }
            var wave_wrap = $('<div class="'+options.wrapClass+'"></div>');
            wave_wrap.append(canvas);
            return wave_wrap;
        }
    };
    return wave;
});