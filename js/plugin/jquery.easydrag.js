/**
* EasyDrag 1.5 - Drag & Drop jQuery Plug-in
*
* Thanks for the community that is helping the improvement
* of this little piece of code.
*
* For usage instructions please visit http://fromvega.com/scripts
*/
define(['jquery'], function ($) {

    /**
    * EasyDrag 1.5 - Drag & Drop jQuery Plug-in
    *
    * Thanks for the community that is helping the improvement
    * of this little piece of code.
    *
    * For usage instructions please visit http://fromvega.com/scripts
    */

    (function ($) {

        // to track if the mouse button is pressed
        var isMouseDown = false;

        // to track the current element being dragged
        var currentElement = null;

        // callback holders
        var dropCallbacks = {};
        var dragCallbacks = {};
        var beforeDragCallbacks = {};

        // bubbling status
        var bubblings = {};

        // global position records
        var lastMouseX;
        var lastMouseY;
        var lastElemTop;
        var lastElemLeft;

        // track element dragStatus
        var dragStatus = {};

        // if user is holding any handle or not
        var holdingHandler = false;

        // if is binding document.mouseup and document.mousemove event or not
        var isBindEvent = false;

        // returns the mouse (cursor) current position
        $.getMousePosition = function (e) {
            var posx = 0;
            var posy = 0;

            if (!e) var e = window.event;

            if (e.pageX || e.pageY) {
                posx = e.pageX;
                posy = e.pageY;
            }
            else if (e.clientX || e.clientY) {
                posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            return { 'x': posx, 'y': posy };
        };

        // updates the position of the current element being dragged
        $.updatePosition = function (e) {
            var pos = $.getMousePosition(e);

            var spanX = (pos.x - lastMouseX);
            var spanY = (pos.y - lastMouseY);

            var marginLeft = parseFloat($(currentElement).css("marginLeft"));
            var canLeftMove = $(currentElement).attr("canLeftMove");
            var canTopMove = $(currentElement).attr("canTopMove");

            if (canLeftMove !== "false") {
                $(currentElement).css("left", (lastElemLeft - marginLeft + spanX));
            }
            if (canTopMove !== false) {
                $(currentElement).css("top", (lastElemTop + spanY));
            }
        };

        // fengxiao start
        $.fn.unBindEvent = function () {
            $(document).off("mousemove", mousemove);
            $(document).off("mouseup", mouseup);
            isBindEvent = false;
        };

        $.fn.bindEvent = function () {
            if (!isBindEvent) {
                // when the mouse is moved while the mouse button is pressed
                $(document).mousemove(mousemove);

                // when the mouse button is released
                $(document).mouseup(mouseup);
                isBindEvent = true;
            }
        };

        function mousemove(e) {
            if (isMouseDown && dragStatus[currentElement.id] != 'false') {
                // update the position and call the registered function
                $.updatePosition(e);
                if (dragCallbacks[currentElement.id] != undefined) {
                    dragCallbacks[currentElement.id](e, currentElement);
                }

                return false;
            }
        }
        function mouseup(e) {
            $("body").removeClass("none-select");
            if (isMouseDown && dragStatus[currentElement.id] != 'false') {
                isMouseDown = false;
                if (dropCallbacks[currentElement.id] != undefined) {
                    dropCallbacks[currentElement.id](e, currentElement);
                }

                return false;
            }
        }
        // fengxiao end

        $.fn.beforeDrag = function (callback) {
            return this.each(function () {
                beforeDragCallbacks[this.id] = callback;
            });
        };

        // register the function to be called while an element is being dragged
        $.fn.ondrag = function (callback) {
            return this.each(function () {
                dragCallbacks[this.id] = callback;
            });
        };

        // register the function to be called when an element is dropped
        $.fn.ondrop = function (callback) {
            
            return this.each(function () {
                dropCallbacks[this.id] = callback;
            });
        };

        // disable the dragging feature for the element
        $.fn.dragOff = function () {
            return this.each(function () {
                dragStatus[this.id] = 'off';
            });
        };

        // enable the dragging feature for the element
        $.fn.dragOn = function () {
            return this.each(function () {
                dragStatus[this.id] = 'on';
            });
        };

        // set a child element as a handler
        $.fn.setHandler = function (handlerId) {
            return this.each(function () {
                var draggable = this;

                // enable event bubbling so the user can reach the handle
                bubblings[this.id] = true;

                // reset cursor style
                $(draggable).css("cursor", "");

                // set current drag status
                dragStatus[draggable.id] = "handler";
                var $handler;
                if(typeof handlerId == 'string'){
                    $handler = $("#" + handlerId);
                }else if(handlerId.jquery){
                    $handler  = handlerId;
                }
                // change handle cursor type
                $handler.css("cursor", "move");

                // bind event handler
                $handler.mousedown(function (e) {
                    holdingHandler = true;
                    $(draggable).trigger('mousedown', e);
                });

                // bind event handler
                $handler.mouseup(function (e) {
                    holdingHandler = false;
                });
            });
        }

        //release fun fengxiao start
        $.fn.easydrag_release = function (id) {
            dragStatus[id] = undefined;
            dropCallbacks[id] = undefined;
            dragCallbacks[id] = undefined;
            beforeDragCallbacks[id] = undefined;
        };
        //fengxiao end

        // set an element as draggable - allowBubbling enables/disables event bubbling
        $.fn.easydrag = function (allowBubbling, bindEvent) {
            //fengxiao start
            if (bindEvent !== false) {
                $.fn.bindEvent();
            }
            //fengxiao end
            return this.each(function () {

                // if no id is defined assign a unique one
                if (undefined == this.id || !this.id.length) this.id = "easydrag" + (new Date().getTime());

                // save event bubbling status
                bubblings[this.id] = allowBubbling ? true : false;

                // set dragStatus
                dragStatus[this.id] = "on";

                // change the mouse pointer
                $(this).css("cursor", "move");

                // when an element receives a mouse press
                $(this).mousedown(function (e,trigger_e) {
                    if(trigger_e){
                        e = $.extend({},trigger_e, e);
                    }
                    if (!allowBubbling) {
                        if (e.target != this) {
                            return;
                        }
                    }
                    $("body").addClass("none-select");
                    /**/
                    var cancelDrag = false;
                    if (beforeDragCallbacks && beforeDragCallbacks[this.id]) {
                        if (beforeDragCallbacks[this.id](e, currentElement||this)) {
                            cancelDrag = true;
                        }
                    }
                    if (cancelDrag) {
                        return true;
                    }
                    // just when "on" or "handler"
                    if ((dragStatus[this.id] == "off") || (dragStatus[this.id] == "handler" && !holdingHandler))
                        return bubblings[this.id];


                    // set it as absolute positioned
                    $(this).css("position", "absolute");

                    // set z-index
                    $(this).css("z-index", parseInt(new Date().getTime() / 1000));

                    // update track variables
                    isMouseDown = true;
                    currentElement = this;

                    // retrieve positioning properties
                    var pos = $.getMousePosition(e);
                    lastMouseX = pos.x;
                    lastMouseY = pos.y;

                    lastElemTop = this.offsetTop;
                    lastElemLeft = this.offsetLeft;

                    $.updatePosition(e);

                    return bubblings[this.id];
                });
            });
        };

    })($);

});

