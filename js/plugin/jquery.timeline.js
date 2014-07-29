 /* Copyright (c) 2013 fengxiao
*  CreateDate: 2013-02-05 11:03
*  Version: 1.0
*  Requires: $ 1.9，jquery.parser.js
*/
define(['jquery', 'plugin/jquery.parser'], function ($) {
    var timeID = 0;
    //todo 无需闭包
    (function ($) {
        /// <summary>
        /// 删除数组中的元素
        /// </summary>
        /// <param name="dx">索引</param>
    	//todo 不要去修改原生构造函数的prototype
        Array.prototype.remove = function (dx) {
            if (isNaN(dx) || dx > this.length) { return false; }
            for (var i = 0, n = 0; i < this.length; i++) {
                if (this[i] != this[dx]) {
                    this[n++] = this[i];
                }
            }
            this.length -= 1;
        };
        /// <summary>
        /// 插入到数组
        /// </summary>
        /// <param name="dx">索引</param>
        /// <param name="obj">数据</param>
        Array.prototype.insertAt = function (dx, obj) {
            this.splice(dx, 0, obj);
        };
        /// <summary>
        /// 计算滚动条信息
        /// </summary>
        //todo 非构造函数，首字母小写
        function ScollPostion() {
            var t, h;

            h = document.documentElement.scrollHeight;
            t = $(document).scrollTop(); //todo 缓存  $(document)

            return { top: t, height: h };
        }
        /// <summary>
        /// 滚动到元素位置
        /// </summary>
        /// <param name="$el">jq元素</param>
        /// <param name="offset">偏移量</param>
        function scrollTo($el, offset1, loaded) {
            var scroll = ScollPostion();

            if ($el.size) {
                var offset = $el.offset();
                if (offset) {
                    var top = offset.top;
                    var off = 0;
                    if (top < scroll.top) {
                        top = top + offset1;
                        if (loaded === true) top -= 8;
                        off = 20;
                    } else {
                        top = top + offset1;
                        if (loaded === true) top += 8;
                        off = -20;
                    }
                    var moveHeight = Math.abs(top - scroll.top);
                    var timei = moveHeight / 250 * 45 + moveHeight % 30;
                    if (timei < 800) timei = 800;
                    else if (timei > 2000) timei = 2000;
                    $("html, body").stop().animate({ scrollTop: top }, timei);//todo 缓存  $("html, body")
                }
            }
        }
        /// <summary>
        /// 排序-倒序
        /// <param name="node">数组</param>
        /// </summary>
        function doSort(array) {
            if (array) {
                array.sort(function (a, b) { return a < b ? 1 : -1; });//todo 表达式简化
            }
        }
        /// <summary>
        /// 相似二分法
        /// </summary>
        /// <param name="node">数据</param>
        /// <param name="array">数组</param>
        /// <param name="field">检索字段</param>
        /// <param name="equal">等于的情况下</param>
        function inOSArray(node, array, field, equal) {
            var length = array.length - 1,
            low = 0,
            high = length,
            mid = 0,
            nowNode;

            node = node[field];
            while (low <= high) {
                mid = parseInt((low + high) / 2);
                nowNode = array[mid][field];
                if (nowNode >= node) {
                    if (nowNode == node && equal !== true) {
                        return mid;
                    }
                    else if (mid == 0) {
                        return -1;
                    }
                    nowNode = array[mid - 1][field];
                    if (nowNode <= node) {
                        return mid - 1;
                    }
                    high = mid - 1;
                    if (high < 0) high = 0;
                } else if (nowNode < node) {
                    if (mid == length) {
                        return mid;
                    }
                    nowNode = array[mid + 1][field];
                    if (nowNode == node && equal !== true) {
                        return ++mid;
                    }
                    else if (nowNode > node) {
                        return mid;
                    }
                    low = mid + 1;
                    if (low > length) low = length;
                } else {
                    return mid;
                }
            }

            return length;
        }
        /// <summary>
        /// 对象二分法
        /// </summary>
        /// <param name="node">数据</param>
        /// <param name="array">数组</param>
        /// <param name="field">检索字段</param>
        function inOArray(node, array, field) {
            var low = 0,
            high = array.length - 1,
            mid = 0,
            nowNode;

            field = field || "z";
            if (low == high) {
                return array[mid][field] == node[field] ? 0 : -1;
            }
            while (low <= high) {
                mid = parseInt((low + high) / 2);
                nowNode = array[mid];
                if (nowNode[field] > node[field]) {
                    high = mid - 1;
                } else if (nowNode[field] < node[field]) {
                    low = mid + 1;
                } else {
                    return mid;
                }
            }

            return -1;
        }
        /// <summary>
        /// 二分法
        /// </summary>
        /// <param name="node">数据</param>
        /// <param name="array">数组</param>
        function inArray(node, array) {
            if (typeof (array) == "object") {
                var low = 0,
                    high = array.length - 1,
                    mid = 0,
                    nowNode;

                if (low == high) {
                    return array[mid] == node ? 0 : -1;
                }
                while (low <= high) {
                    mid = parseInt((low + high) / 2);
                    nowNode = array[mid];
                    if (nowNode > node) {
                        low = mid + 1;
                    } else if (nowNode < node) {
                        high = mid - 1;
                    } else {
                        return mid;
                    }
                }
            }

            return -1;
        }
        /// <summary>
        /// 获得页面上的时间轴年份信息
        /// </summary>
        /// <param name="data">数据</param>
        function doInitLineBar(jq) {
            var data = $.data(jq, "timeline");
            var options = data["options"];
            var timeLineBar = data.lineobjs.timeLineBar.find("[data-rel='timeLineBarList']");
            var linebar = [];

            options.markers.length = 0;
            options.years.length = 0;
            options.combineYears.length = 0;
            options.yearInfo = {};
            $(timeLineBar).find("li > a.timelineYear").each(function () {
                var _this = $(this);
                var year = _this.attr("data-time");

                if (year) {
                    options.yearInfo[year] = {
                        loaded: [], //加载过的月份
                        months: [], //所有月份
                        isLoadMonth: false, //是否加载过年份信息
                        closed:  (year == options.birthYear + ""), //年份是否加载完
                        overed: (year == options.birthYear + ""), //年份中的月份是否加载完
                        dom: null,
                        combine: [], //合并的月份信息
                        currentMonth: 0,
                        value: _this.attr("data-time")
                    };
                    options.years.push(year);
                    _this.off("click").on("click", null, [jq], doInitMonthsInfo);//todo 转化为自身事件
                }
            });
        }
        /// <summary>
        /// 年份点击事件
        /// </summary>
        /// <param name="obj">数据</param>
        function doInitMonthsInfo(obj) {
            var jq = obj.data[0];
            var options = $.data(jq, "timeline")["options"];
            var _this = $(obj.currentTarget);
            var currentYear = _this.attr("data-time");
            var yearInfo = options.yearInfo[currentYear];

            if (yearInfo) {
                if (!yearInfo.isLoadMonth) {
                    options.onYearSelect.call(jq, _this, currentYear);
                } else {
                    doCallYearInfo(jq, currentYear);
                }
            }
            return false;
        }
        /// <summary>
        /// 重新计算高度表
        /// </summary>
        /// <param name="jq">时间轴dom</param>
        /// <param name="marker">当前panel</param>
        function resetHeight(jq, marker) {
            var options = jq.timeline("options");
            var index = inOSArray(marker, options.markers, "top");

            if (index < 0) index = 0;
            if (options.markers[index].year != marker.year || options.markers[index].month != marker.month) {
                if (options.markers[index].year < marker.year) {
                    //alert(1);
                }
                else if (options.markers[index].year > marker.year) {
                    index++;
                } else if (options.markers[index].month > marker.month) {
                    index++;
                } else {
                    index++;
                }
            }
            if (index != -1) {
                for (var i = index + 1, n = options.markers.length; i < n; i++) {
                    var marker = options.markers[i];

                    marker.top = marker.marker.offset().top;
                }
            }
        }
        /// <summary>
        /// 设置年份对应的月份信息
        /// </summary>
        /// <param name="jq">时间轴dom</param>
        /// <param name="yearinfo">时间信息，{year,months}</param>
        function doSetMonths(jq, yearinfo) {
            var data = $.data(jq, "timeline");
            var options = data["options"];
            var yearInfo = options.yearInfo[yearinfo.year];

            if (yearInfo) {
                doSort(yearinfo.months);
                while (yearInfo["months"].length) {
                    var month = yearInfo["months"][0];

                    if (inArray(month, yearinfo.months) == -1) {
                        yearinfo.months.push(month);
                    }
                    yearInfo["months"].remove(0);
                }
                doSort(yearinfo.months);
                yearInfo["pages"] = [];
                yearInfo["months"] = yearinfo.months;
                yearInfo["dom"] = yearinfo.dom;
                yearInfo.isLoadMonth = true;
                yearinfo.dom.find("[data-time]").off("monthclick").on("monthclick", function () {
                    var currentMonth = $(this).attr("data-time");
                    doCallYearInfo(jq, yearinfo.year, currentMonth);
                    return false;
                }).off("click").on("click", function () {
                    options.isClick = true;
                    $(this).trigger("monthclick");
                });
                if (yearinfo.doClick !== false) {
                    doCallYearInfo(jq, yearinfo.year);
                }
            }
        }
        /// <summary>
        /// 设置年份对应的月份信息
        /// </summary>
        /// <param name="jq">时间轴dom</param>
        /// <param name="year">时间信息-年信息</param>
        /// <param name="currentMonth">时间信息-当前月份信息</param>
        function doCallYearInfo(jq, year, currentMonth) {
            var data = $.data(jq, "timeline");
            var options = data["options"];
            var timelineBar = $(data["lineobjs"]["timeLineBar"]);
            var timelineCon = $(data["lineobjs"]["container"]);
            var yearInfo = options.yearInfo[year];

            if (!currentMonth && yearInfo.months.length > 0) {
                currentMonth = yearInfo.months[0];
            }
            if (currentMonth) {
                //月份是否已经被加载过判定
                var monthIndex = inArray(currentMonth, options.yearInfo[year].loaded);
                if (monthIndex == -1 && !options.locked) {
                    if (options.currentYear && options.currentYear != year) {
                        lastYearInfo = options.yearInfo[options.currentYear];

                        var yearsInfo = {
                            newYear: {
                                yearInfo: options.yearInfo[year],
                                index: inArray(year, options.years),
                                value: year
                            },
                            oldYear: {
                                yearInfo: options.yearInfo[options.currentYear],
                                index: inArray(options.currentYear, options.years),
                                value: options.currentYear
                            }
                        };
                        if (yearsInfo.oldYear.index < yearsInfo.newYear.index) {
                            if (options.canScroll) {
                                doCombineYears(jq, yearsInfo);
                            }
                        }
                        //年份更改事件触发
                        options.onYearChange.call(jq, yearsInfo);
                    }
                    if (yearInfo.months.length <= 1 && options.years[0] == year) {
                        yearInfo.dom.hide();
                    }
                    yearInfo.pages["" + currentMonth] = 1;
                    options.onMonthSelect.call(jq, parseInt(year), parseInt(currentMonth));
                }
                else if (options.canScroll) {
                    scrollTo(timelineCon.find("#marker" + year + "" + currentMonth), -30);
                }
            }
        }
        /// <summary>
        /// 合并年份信息
        /// </summary>
        /// <param name="jq">时间轴dom</param>
        /// <param name="yearsInfo">年份信息</param>
        function doCombineYears(jq, yearsInfo) {
            var data = $.data(jq, "timeline");
            var options = data["options"];
            var timelineCon = $(data["lineobjs"]["container"]);
            var combineYears = [];

            //合并年份信息
            for (var i = yearsInfo.oldYear.index; i < yearsInfo.newYear.index; i++) {
                var yearInfo = options.yearInfo[options.years[i]];
                if (yearInfo) {
                    if (!yearInfo.closed) {
                        combineYears.push(yearInfo.value);
                    }
                    //合并月份信息
                    if (inArray(0, yearInfo.months) == -1) {
                        yearInfo.months.push(0);
                        yearInfo.loaded.push(0);
                        yearInfo.overed = true;
                        if (yearInfo.closed) {
                            var idx = inArray(0, yearInfo.loaded);
                            if (idx > 0) {
                                yearInfo.currentMonth = yearInfo.loaded[idx - 1];
                            }
                            doCloseMonth(jq, {
                                year: yearInfo.value,
                                month: yearInfo.currentMonth >= 0 ? yearInfo.currentMonth : yearInfo.months[0],
                                isAppend: false
                            });
                        }
                        yearInfo.closed = true;
                    }
                }
            }
            timelineCon.append(getCombineYearInfo(jq, options, combineYears));
        }
        /// <summary>
        /// 获得页面jq元素
        /// </summary>
        /// <param name="jq">时间轴控件</param>
        function getLineObjs(jq) {
            var t = $(jq);

            return {
                timeLineBar: t.find("[data-rel='timeLineBar']"),
                container: t.find("[data-rel='timeLineContainer']")
            };
        }
        /// <summary>
        /// 取得第一个年份信息
        /// </summary>
        /// <param name="jq">时间轴控件</param>
        function doInit(jq) {
            var data = $.data(jq, "timeline");
            var options = data["options"];
            var timelineBar = $(data["lineobjs"]["timeLineBar"]);
            var timelineContainer = $(data["lineobjs"]["container"]);

            options.offset = timelineContainer.offset().top;
            if (options.onInit.call(jq, options)) {
                if (options.currentYear) {
                    timelineBar.find("[data-time='" + options.currentYear + "']").click();
                }
            }
        }
        /// <summary>
        /// 设置html数据，重新计算top值
        /// </summary>
        /// <param name="jq">时间轴控件</param>
        /// <param name="opts">参数</param>
        function doSetData(jq, opts) {
            var data = $.data(jq, "timeline");
            if (!data) return;
            var options = data["options"];
            var timelineCon = $(data["lineobjs"]["container"]);
            var scroll = ScollPostion();
            var height = opts.dom.height();
            var canLoad = false;

            if (opts.year < options.currentYear) {
                canLoad = true;
            }
            else if (opts.year == options.currentYear && opts.month <= options.currentMonth) {
                canLoad = true;
            }
            var offset = opts.dom.offset();
            var index = inOSArray(offset, options.markers, "top");
            if (index < 0) index = 0;

            if (options.markers[index].year != opts.year || options.markers[index].month != opts.month) {
                if (options.markers[index].year < opts.year) {
                    //alert(1);
                }
                else if (options.markers[index].year > opts.year) {
                    index++;
                } else if (options.markers[index].month > opts.month) {
                    index++;
                } else {
                    index++;
                }
            }
            if (!options.markers[index].isLoad) {
                options.markers[index].dom = opts.dom;
            } else {
                //options.markers[index].isAppend = true;
            }
            options.markers[index].isAppend = opts.isAppend;
            options.markers[index].isLoad = false;
            options.markers[index].htm = opts.htm;
            if (canLoad) {
                doResetPosition(options.markers[index], index, options);
            }
            options.locked = false;
            options.canScroll = true;
            //doScroll(jq, options);
            doShowMore(jq, opts, scroll);
        }
        /// <summary>
        /// 设置html数据，重新计算top值
        /// </summary>
        /// <param name="marker">标志</param>
        /// <param name="index">标志索引</param>
        /// <param name="options">时间轴参数</param>
        function doResetPosition(marker, index, options) {
            var canLoad = false;

            if (!marker.isLoad && marker.dom) {
                if (marker.year < options.currentYear) {
                    canLoad = true;
                }
                else if (marker.year == options.currentYear && marker.month <= options.currentMonth) {
                    canLoad = true;
                }
                if (canLoad || true) {
                    marker.isLoad = true;
                    if (marker.isAppend === true) {
                        marker.dom.append(marker.htm);
                    } else {
                        marker.dom[0].innerHTML = (marker.htm ? marker.htm : "&nbsp;");
                    }
                    marker.htm = "";
                    if (index >= 0) {
                        var height = 0;
                        for (var i = index, n = options.markers.length; i < n; i++) {
                            height = parseInt(options.markers[i].marker.offset().top);
                            options.markers[i].top = height;
                        }
                    }
                    options.onAppendData.call(marker, index);
                }
            }
            return canLoad;
        }
        /// <summary>
        /// 关闭年份中的月份信息
        /// </summary>
        /// <param name="jq">时间轴控件</param>
        /// <param name="opts">参数{year:'年份',month:'月份'，isAppend:bool}</param>
        function doCloseMonth(jq, opts) {
            var data = $.data(jq, "timeline");
            var options = data["options"];
            var timelineCon = $(data["lineobjs"]["container"]);
            var scroll = ScollPostion();
            var yearInfo = options.yearInfo[opts.year];
            var div = $(options.setLoading(opts.year, opts.month));
            var combine = null;
            var combineMonthPrev = [];
            var combineMonthNext = [];
            var combineYearPrev = [];
            var combineYearNext = [];
            var isLoaded = -1;
            var marker;

            opts.month = parseInt(opts.month);
            opts.year = parseInt(opts.year);
            if (yearInfo) {
                isLoaded = inArray(opts.month, yearInfo.loaded);
                if (isLoaded == -1) {
                    yearInfo.loaded.push(opts.month);
                    doSort(yearInfo.loaded);
                    yearInfo.currentMonth = opts.month;
                }
                yearInfo.closed = true;
                var monthIndex = inArray(opts.month, yearInfo.loaded);
                //计算可合并的月份
                if (monthIndex >= 0) {
                    var prevMonth = yearInfo.loaded[monthIndex - 1];
                    var nextMonth = monthIndex < yearInfo.loaded.length - 1 ? yearInfo.loaded[monthIndex + 1] : -1;
                    for (var i = opts.month * 1 + 1; i < prevMonth; i++) {
                        if (inArray(i, yearInfo.months) > -1) {
                            combineMonthPrev.push(i);
                        }
                    }
                    if (nextMonth >= 0) {
                        for (var i = nextMonth * 1 + 1; i < opts.month * 1; i++) {
                            if (inArray(i, yearInfo.months) > -1) {
                                combineMonthNext.push(i);
                            }
                        }
                    }
                }
                //查找当前月份是否在合并月份中
                for (var i = 0; i < yearInfo.combine.length; i++) {
                    var combindInfo = yearInfo.combine[i];
                    if (opts.month >= combindInfo.start && opts.month <= combindInfo.end) {
                        combine = combindInfo.dom;
                        yearInfo.combine.remove(i);
                        opts.isConbineYear = true;
                        break;
                    }
                }
                if (!combine) {
                    //查找合并年份信息
                    for (var i = 0; i < options.combineYears.length; i++) {
                        var combindInfo = options.combineYears[i];
                        if (opts.year >= combindInfo.start && opts.year <= combindInfo.end) {
                            combine = combindInfo.dom;
                            opts.isConbineMonth = true;
                            var yearIndex = inArray(opts.year, options.years);
                            var prevIndex = inArray(combindInfo.start, options.years);
                            var nextIndex = inArray(combindInfo.end, options.years);

                            for (var j = yearIndex + 1; j <= prevIndex; j++) {
                                combineYearNext.push(parseInt(options.years[j]));
                            }
                            for (var j = nextIndex; j < yearIndex; j++) {
                                combineYearPrev.push(parseInt(options.years[j]));
                            }
                            options.combineYears.remove(i);
                            break;
                        }
                    }
                }
                if (combine) {
                    opts.isReloadTop = true;
                    //合并当前年份以前的年份
                    combine.before(getCombineYearInfo(jq, options, combineYearPrev));
                    //合并当前月份以前的月份
                    combine.before(getCombineMonthInfo(jq, options, combineMonthPrev, yearInfo));
                    //当前月份数据容器
                    if (isLoaded == -1 && opts.isAppend) {
                        marker = $(options.setMarker(opts.year, opts.month));
                        combine.before(marker).before(div);
                        //marker = div;
                    }
                    //合并当前年份以前的年份
                    combine.before(getCombineMonthInfo(jq, options, combineMonthNext, yearInfo));
                    //合并当前年份以后的年份
                    combine.before(getCombineYearInfo(jq, options, combineYearNext));
                    combine.remove();
                } else {
                    opts.isReloadTop = false;
                    //合并当前年份以前的年份
                    timelineCon.append(getCombineYearInfo(jq, options, combineYearPrev));
                    //合并当前月份以前的月份
                    timelineCon.append(getCombineMonthInfo(jq, options, combineMonthPrev, yearInfo));
                    //当前月份数据容器
                    if (isLoaded == -1 && opts.isAppend) {
                        marker = $(options.setMarker(opts.year, opts.month));
                        timelineCon.append(marker).append(div);
                        //marker = div;
                    }
                    //合并当前年份以后的年份
                    timelineCon.append(getCombineMonthInfo(jq, options, combineMonthNext, yearInfo));
                    //合并当前年份以后的年份
                    timelineCon.append(getCombineYearInfo(jq, options, combineYearNext));
                }
                //添加marker信息
                if (marker && marker.size()) {
                    doAddMarkerInfo(options.markers, {
                        marker: div,
                        year: opts.year,
                        month: opts.month,
                        isReloadTop: opts.isReloadTop
                    }, false);
                }
                //月份全部加载完，改变标志
                if (yearInfo.loaded.length == yearInfo.months.length) {
                    yearInfo.overed = true;
                }
            }
            if (opts.isAppend && options.canScroll) {
                scrollTo(timelineCon.find("#marker" + opts.year + "" + opts.month), -30, true);
            }
            options.locked = options.isSingle;
            options.canScroll = true;

            return div;
        }
        /// <summary>
        /// 添加marker的信息，用于滚动时高度判断
        /// </summary>
        /// <param name="markers">数组</param>
        /// <param name="opts">参数</param>
        function doAddMarkerInfo(markers, opts, jq) {
            var info = {
                year: opts.year,
                month: opts.month,
                top: parseInt(opts.marker.offset().top),
                height: opts.marker.height(),
                marker: opts.marker,
                dom: null,
                isLoad: false,
                htm: ""
            };

            if (opts.closeMonth === true && jq && jq.size()) {
                doCloseMonth(jq[0], {
                    month: opts.month,
                    year: opts.year,
                    isAppend: false
                });
            }
            if (!markers.length) {
                markers.push(info);
            } else {
                var index = inOSArray(info, markers, "top");
                var topDiff = 0, top = 0, offset = 0, changeIndex = index;
                if (index < 0) index = 0;
                for (var i = index, n = markers.length; i < n; i++) {
                    if (changeIndex == i) {
                        top = parseInt(markers[i].marker.offset().top);
                        topDiff = parseInt(top - markers[i].top);
                        if (!topDiff || topDiff < 0) {
                            changeIndex++;
                        } else {
                            markers[i].top = top;
                        }
                    } else {
                        markers[i].top += topDiff;
                    }
                }
                if (markers[index].year < opts.year) {
                    markers.insertAt(index, info);
                }
                else if (markers[index].year > opts.year) {
                    markers.insertAt(index + 1, info);
                } else if (markers[index].month > opts.month) {
                    markers.insertAt(index + 1, info);
                } else {
                    markers.insertAt(index, info);
                }
            }

        }
        /// <summary>
        /// 关闭年份中的月份信息
        /// </summary>
        /// <param name="options">时间轴参数</param>
        /// <param name="combineMonth">合并数组</param>
        /// <param name="yearInfo">年份信息</param>
        function getCombineMonthInfo(jq, options, combineMonth, yearInfo) {
            var combine = null;

            if (combineMonth.length > 0) {
                if (combineMonth.length == 1) {
                    combine = $(options.setCombineMarker(true, yearInfo.value, combineMonth[0]));
                    yearInfo.combine.push({
                        start: combineMonth[0],
                        end: combineMonth[0],
                        dom: combine
                    });
                } else {
                    combine = $(options.setCombineMarker(true, yearInfo.value, combineMonth[0], combineMonth[combineMonth.length - 1]));
                    yearInfo.combine.push({
                        start: combineMonth[0],
                        end: combineMonth[combineMonth.length - 1],
                        dom: combine
                    });
                }
                yearInfo.currentMonth = combineMonth[0];
                combine.off().on("click", function () {
                    doCallYearInfo(jq, yearInfo.value, combineMonth[combineMonth.length - 1]);
                    return false;
                });
            }

            return combine;
        }
        /// <summary>
        /// 关闭年份中的月份信息
        /// </summary>
        /// <param name="options">时间轴参数</param>
        /// <param name="combineYear">合并数组</param>
        function getCombineYearInfo(jq, options, combineYear) {
            var combine = null;
            var data = $.data(jq, "timeline");
            var timeLineBar = $(data["lineobjs"]["timeLineBar"]);

            if (combineYear.length > 0) {
                if (combineYear.length == 1) {
                    combine = $(options.setCombineMarker(false, 0, combineYear[0]));
                    options.combineYears.push({
                        start: parseInt(combineYear[0]),
                        end: parseInt(combineYear[0]),
                        dom: combine
                    });
                } else {
                    combine = $(options.setCombineMarker(false, 0, combineYear[0], combineYear[combineYear.length - 1]));
                    options.combineYears.push({
                        end: parseInt(combineYear[0]),
                        start: parseInt(combineYear[combineYear.length - 1]),
                        dom: combine
                    });
                }
                combine.off().on("click", function () {
                    timeLineBar.find("[data-time='" + combineYear[0] + "']").click();
                    return false;
                });
            }

            return combine;
        }
        /// <summary>
        /// 滚动条滚动事件
        /// </summary>
        /// <param name="jq"></param>
        /// <param name="isScroll"></param>
        function doScroll(jq, isScroll) {
            var data = $.data(jq, "timeline");
            var options = data["options"];
            var date1 = new Date();

            if (options.locked) {
                if (isScroll != true) {
                    return;
                }
            }
            var scroll = ScollPostion();
            var indexm = -1;
            var timelineBar = $(data["lineobjs"]["timeLineBar"]);
            var indexm = inOSArray(scroll, options.markers, "top");
            var markerm = options.markers[indexm] || { top: -10000 };
            var markerp = options.markers[indexm - 1] || { top: -10000 };
            var markern = options.markers[indexm + 1] || { top: -10000 };
            var marker = $.extend({}, markerp);

            //找到当前容器与前后容器中最接近当前高度的容器
            if (marker.top != -1000) {
                if (markerm.top <= scroll.top) {
                    if (markern.top + options.offsetTop >= 0 && markern.top + options.offsetTop <= scroll.top) {
                        marker = markern;
                    } else {
                        marker = markerm;
                    }
                }
            } else {
                marker = markerm;
                if (marker.top != -1000) {
                    if (markern.top <= scroll.top) {
                        marker = markern;
                    }
                }
            }
            //如果有，定位到容器所对应的的年月份信息
            if (marker.top != -10000) {
                var yearInfo = options.yearInfo[marker.year];
                if (!yearInfo) return;

                if (options.currentYear != marker.year) {
                    options.currentYear = marker.year;
                    timelineBar.find("." + options.currentCls).removeClass(options.currentCls);
                    timelineBar.find("[data-time='" + marker.year + "']").parent().addClass(options.currentCls);
                }
                if (yearInfo.dom) {
                    yearInfo.dom.find("[data-time]").parent().removeClass(options.currentCls);
                    yearInfo.dom.find("[data-time='" + marker.month + "']").parent().addClass(options.currentCls);
                }
                options.currentMonth = marker.month;
                doResetPosition(marker, indexm, options);
            }
            //判定是否需要加载下一个feed信息
            doShowMore(jq, $.extend({}, options.markers[options.markers.length - 2]), scroll);
        }
        /// <summary>
        /// 滚动条滚动到底获取下个月信息
        /// </summary>
        /// <param name="jq"></param>
        /// <param name="opts"></param>
        /// <param name="scroll"></param>
        function doShowMore(jq, opts, scroll) {
            scroll = scroll || ScollPostion();
            clearTimeout(timeID);
            timeID = setTimeout(function () {
                var data = $.data(jq, "timeline");
                var options = data["options"];
                var timelineBar = $(data["lineobjs"]["timeLineBar"]);
                var yearInfo;

                yearInfo = options.yearInfo[opts.year];
                if (yearInfo) {
                    if (scroll.height - scroll.top - options.scrollBottom < options.viewHeight) {
                        var mIndex = inArray(opts.month, yearInfo.months);
                        if (mIndex >= 0 && mIndex < yearInfo.months.length - 1) {
                            opts.month = yearInfo.months[mIndex + 1];
                        } else {
                            var yIndex = inArray(opts.year, options.years);
                            if (yIndex >= 0 && yIndex < options.years.length - 1) {
                                opts.year = options.years[yIndex + 1];
                                var yearInfo = options.yearInfo[opts.year];
                                if (yearInfo) {
                                    opts.month = yearInfo.currentMonth;
                                    if (!opts.month) {
                                        opts.month = yearInfo.months[0];
                                    }
                                } else {
                                    opts = null;
                                }
                            } else {
                                opts = null;
                            }
                        }
                        if (opts) {
                            options.canScroll = false;
                            if (!yearInfo.isLoadMonth) {
                                timelineBar.find("[data-time='" + opts.year + "']").trigger("click");
                            } else if (opts.month > 0) {
                                doCallYearInfo(jq, opts.year, opts.month);
                                options.canScroll = true;
                            }
                        }
                    }
                }
            }, 200);
        }
        /// <summary>
        /// 时间轴函数
        /// </summary>
        /// <param name="method">时间轴控件函数</param>
        /// <param name="options">参数</param>
        $.fn.timeline = function (method, options) {
            if (typeof method == "string") {
                return $.fn.timeline.methods[method](this, options);
            }
            //todo 封装init
            method = method || {};
            return this.each(function () {
                var data = $.data(this, "timeline");
                if (data) {
                    $.extend(data.options, method);
                } else {
                    data = $.data(this, "timeline", {
                        options: $.extend({}, $.fn.timeline.defaults, $.fn.timeline.parseOptions(this), method),
                        lineobjs: getLineObjs(this)
                    });
                }
                doInitLineBar(this);
                doInit(this);
            });
        };
        /// <summary>
        /// 时间轴函数方法
        /// </summary>
        $.fn.timeline.methods = {
            options: function (jq, key) {
                key = key || "options";
                return $.data(jq[0], "timeline")[key];
            },
            setMonths: function (jq, options) {
                doSetMonths(jq[0], options);
            },
            setData: function (jq, options) {
                doSetData(jq[0], options);
            },
            closeMonth: function (jq, options) {
                return doCloseMonth(jq[0], options);
            },
            destroy: function (jq, options) {
                clearTimeout(timeID);
                $.data(jq[0], "timeline", null);
            },
            scroll: function (jq, options) {
                doScroll(jq[0], options);
            },
            //todo参数命名
            resetHeight: function (jq, options) {
                resetHeight(jq, options);
            },
            resize: function (jq) {
                var options = jq.timeline("options");

                options.viewHeight = $(window).height();
                doScroll(jq[0]);
            },
          //todo参数命名
            addMarker: function (jq, opts) {
                var options = $(jq).timeline("options");
                doAddMarkerInfo(options.markers, opts, jq);
                options.locked = false;
                if (opts.closeMonth === true) {
                    options.onAppendData.call(opts, 0);
                }
            }
        };
        /// <summary>
        /// 时间轴函数参数获取函数
        /// </summary>
        $.fn.timeline.parseOptions = function (jq) {
            var t = $(jq);

            return $.extend({}, $.parser.parseOptions(jq, [{ showBar: "boolean", fixed: "boolean"}]));
        };
        /// <summary>
        /// 时间轴参数默认值
        /// </summary>
        $.fn.timeline.defaults = $.extend({}, {
            canScroll: false,
            locked: false,
            diffHeight: 0,
            scrollBottom: 200,
            showBar: true,
            fixed: true,
            viewHeight: 500,
            markers: [],
            years: [],
            combineYears: [],
            offsetTop: -340,
            model: null,
            isSingle: true,
            currentCls: 'current',
            birthYear: 2007,
            birthMonth: 12,
            yearInfo: {},
            setLoading: function () { },
            setMarker: function () { },
            setCombineMarker: function () { },
            onYearSelect: function () { },
            onMonthSelect: function () { },
            onYearChange: function () { },
            onAppendData: function () { },
            onInit: function () { return true; },
            currentYear: 0,
            currentMonth: 0
        });
    })($);
});