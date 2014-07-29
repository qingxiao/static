/* Copyright (c) 2006 Brandon Aaron (brandon.aaron@gmail.com || http://brandonaaron.net)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 *
 * $LastChangedDate: 2007-12-20 09:02:08 -0600 (Thu, 20 Dec 2007) $
 * $Rev: 4265 $
 *
 * Version: 3.0
 * 
 * Requires: $ 1.2.2+
 */
define(['jquery'], function ($) {
    var browser = {};
    try {
        (function () {
            var idSeed = 0,
            ua = navigator.userAgent.toLowerCase(),
            check = function (r) {
                return r.test(ua);
            },
            DOC = document,
            isStrict = DOC.compatMode == "CSS1Compat",
            isOpera = check(/opera/),
            isChrome = check(/\bchrome\b/),
            isWebKit = check(/webkit/),
            isSafari = !isChrome && check(/safari/),
            isSafari2 = isSafari && check(/applewebkit\/4/), // unique to Safari 2  
            isSafari3 = isSafari && check(/version\/3/),
            isSafari4 = isSafari && check(/version\/4/),
            isIE = !isOpera && check(/msie/),
            isIE7 = isIE && check(/msie 7/),
            isIE8 = isIE && check(/msie 8/),
            isIE6 = isIE && !isIE7 && !isIE8,
            isGecko = !isWebKit && check(/gecko/),
            isGecko2 = isGecko && check(/rv:1\.8/),
            isGecko3 = isGecko && check(/rv:1\.9/),
            isBorderBox = isIE && !isStrict,
            isWindows = check(/windows|win32/),
            isMac = check(/macintosh|mac os x/),
            isAir = check(/adobeair/),
            isLinux = check(/linux/),
            isIpad = check(/ipad/),
            isSecure = /^https/i.test(window.location.protocol);
            browser = {
                isOpera: isOpera,
                isIE: isIE,
                isIE6: isIE6,
                isFirefox: isGecko,
                isSafari: isSafari,
                isChrome: isChrome,
                isIpad: isIpad
            };
        })();
    } catch (e) { }

    (function ($) {
        $.event.special.mousewheel = {
            setup: function () {
                var handler = $.event.special.mousewheel.handler;

                // Fix pageX, pageY, clientX and clientY for mozilla
                if (browser.isFirefox)
                    $(this).bind('mousemove.mousewheel', function (event) {
                        $.data(this, 'mwcursorposdata', {
                            pageX: event.pageX,
                            pageY: event.pageY,
                            clientX: event.clientX,
                            clientY: event.clientY
                        });
                    });
                if (this.addEventListener)
                    this.addEventListener((browser.isFirefox ? 'DOMMouseScroll' : 'mousewheel'), handler, false);
                else
                    this.onmousewheel = handler;
            },

            teardown: function () {
                var handler = $.event.special.mousewheel.handler;

                $(this).unbind('mousemove.mousewheel');

                if (this.removeEventListener)
                    this.removeEventListener((browser.isFirefox ? 'DOMMouseScroll' : 'mousewheel'), handler, false);
                else
                    this.onmousewheel = function () { };

                $.removeData(this, 'mwcursorposdata');
            },

            handler: function (event) {
                var args = Array.prototype.slice.call(arguments, 1);
                var e = $.extend({}, event || window.event);

                event = $.event.fix(event || window.event);
                // Get correct pageX, pageY, clientX and clientY for mozilla
                $.extend(event, $.data(this, 'mwcursorposdata') || {});
                var delta = 0, returnValue = true;

                if (e.wheelDelta) delta = e.wheelDelta / 120;
                if (e.detail) delta = -e.detail / 3;
                if (browser.isOpera) delta = -event.wheelDelta;

                event.data = event.data || {};
                event.type = "mousewheel";

                // Add delta to the front of the arguments
                args.unshift(delta);
                // Add event to the front of the arguments
                args.unshift(e);
                //args.unshift(event);

                var handlers = ((jQuery._data(this, "events") || {})[event.type] || []);
                var handlerQueue = $.event.handlers.apply(this, [event, handlers]);
                var i, j, cur, ret, selMatch, matched, matches, handleObj, sel, related;

                for (i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++) {
                    matched = handlerQueue[i];
                    event.currentTarget = matched.elem;

                    for (j = 0; j < matched.handlers.length && !event.isImmediatePropagationStopped(); j++) {
                        handleObj = matched.handlers[j];

                        // Triggered event must either 1) be non-exclusive and have no namespace, or
                        // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
                        if ((!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test(handleObj.namespace)) {

                            event.data = handleObj.data;
                            event.handleObj = handleObj;

                            ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler)
							.apply(matched.elem, args);
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }
                }
            }
        };

        $.fn.extend({
            mousewheel: function (fn) {
                return fn ? this.on("mousewheel", fn) : this.trigger("mousewheel");
            },
            unmousewheel: function (fn) {
                return this.off("mousewheel", fn);
            }
        });
    })($);
});