Msg.INPUT_KEYDOWN = 16;
Msg.INPUT_KEYUP = 17;

Msg.INPUT_TOUCH_START = 20;
Msg.INPUT_TOUCH_END = 21;
Msg.INPUT_TOUCH_MOVE = 22;
Msg.INPUT_TOUCH_CANCEL = 23;

Msg.INPUT_MOUSE_DOWN = 32;
Msg.INPUT_MOUSE_UP = 33;
Msg.INPUT_MOUSE_MOVE = 34;

var Input = function(){

    function ButtonState(){
        this.pressed = false;
        this.down = 0;
        this.up = 0;
    }

    var buttons = new Map();
    var buttonStates = new Map();

    function TouchState(){
        this.x = 0;
        this.y = 0;
        this.extra = null;
    }

    function TouchMsg(){
        this.id = 0;
        this.x = 0;
        this.y = 0;
    }

    var startedTouches = new Misc.ObjList();
    var endedTouches = new Misc.ObjList();
    var canceledTouches = new Misc.ObjList();
    var stayingTouches = [];
    var touchPool = new Misc.ObjPool(TouchState);
    var touchMsgQueue = new Misc.StructArray(TouchMsg);
    
    var mouseButtonStates = new Array(5);
    for(var i = 0; i < 5; i++){
        mouseButtonStates[i] = new ButtonState();
    }
    function MousePos(x,y){
        this.x = x;
        this.y = y;
    }

    var mousePos = new MousePos(0,0);

    var mousemoveQueue = new Misc.StructArray(MousePos);

    function renderProc(msg, param){
        switch(msg){
            case Msg.INPUT_TOUCH_MOVE :
                touchMoveProc(param);
                break;
            case Msg.INPUT_MOUSE_MOVE :
                mousePos.x = param.x;
                mousePos.y = param.y;
                break;
            case Msg.INPUT_KEYDOWN :
                keyDownProc(param);
                break;
            case Msg.INPUT_KEYUP :
                keyUpProc(param);
                break;
            case Msg.INPUT_TOUCH_START :
                touchStartProc(param);
                break;
            case Msg.INPUT_TOUCH_END :
                touchEndProc(param);
                break;
            case Msg.INPUT_TOUCH_CANCEL :
                touchCancelProc(param);
                break;
            case Msg.INPUT_MOUSE_DOWN :
                mouseButtonStates[param].pressed = true;
                mouseButtonStates[param].down++;
                break;
            case Msg.INPUT_MOUSE_UP:
                mouseButtonStates[param].pressed = false;
                mouseButtonStates[param].up++;
                break;
        }
    }

    function keyDownProc(param){
        var state = buttonStates.get(param);
        if(state.pressed == true)
            return;
        state.pressed = true;
        state.down++;
    }

    function keyUpProc(param){
        var state = buttonStates.get(param);
        state.pressed = false;
        state.up++;
    }

    function touchStartProc(param){
        var touch = touchPool.pop();
        touch.x = param.x;
        touch.y = param.y;
        startedTouches.push(touch);
        stayingTouches[param.id] = touch;
    }

    function touchEndProc(param){
        var touch = stayingTouches[param.id];
        touch.x = param.x;
        touch.y = param.y;
        endedTouches.push(touch);
        stayingTouches[param.id] = undefined;
    }

    function touchCancelProc(param){
        var touch = stayingTouches[param.id];
        touch.x = param.x;
        touch.y = param.y;
        canceledTouches.push(touch);
        stayingTouches[param.id] = undefined;
    }

    function touchMoveProc(param){
        var touch = stayingTouches[param.id];
        touch.x = param.x;
        touch.y = param.y;
    }

    function lateRender(){
        mousemoveQueue.ptr = 0;
        touchMsgQueue.ptr = 0;
        startedTouches.clear();
        for(var i = 0; i < endedTouches.ptr; i++){
            touchPool.push(endedTouches[i]);
            endedTouches[i] = null;
        }
        for(var i = 0; i < canceledTouches.ptr; i++){
            touchPool.push(canceledTouches[i]);
            canceledTouches[i] = null;
        }
        buttonStates.forEach(state => {state.down = 0; state.up = 0});
        mouseButtonStates[0].down = 0;
        mouseButtonStates[1].down = 0;
        mouseButtonStates[2].down = 0;
        mouseButtonStates[3].down = 0;
        mouseButtonStates[4].down = 0;
        mouseButtonStates[0].up = 0;
        mouseButtonStates[1].up = 0;
        mouseButtonStates[2].up = 0;
        mouseButtonStates[3].up = 0;
        mouseButtonStates[4].up = 0;
    }

    Updating.setHook(renderProc);
    Updating.startLateRenderRoutine(Symbol("__input"),32,lateRender);

    window.addEventListener("keydown", function(e){
        var keyCode = buttons.get(e.code);
        if(keyCode != undefined)
            Updating.postMessage(Msg.INPUT_KEYDOWN, keyCode);
    });

    window.addEventListener("keyup", function(e){
        var keyCode = buttons.get(e.code);
        if(keyCode != undefined)
            Updating.postMessage(Msg.INPUT_KEYUP, keyCode);
    });
    
    window.addEventListener("mousemove",function(e){
        var bbox = Global.onscreenCanvas.getBoundingClientRect();
        var pos = mousemoveQueue.alloc();
        pos.x = (e.clientX - bbox.left) / bbox.width;
        pos.y = 1 - (e.clientY - bbox.top) / bbox.height;
        Updating.postMessage(Msg.INPUT_MOUSE_MOVE, pos);
    });

    window.addEventListener("mousedown",function(e){
        Updating.postMessage(Msg.INPUT_MOUSE_DOWN, e.button);
    });

    window.addEventListener("mouseup",function(e){
        Updating.postMessage(Msg.INPUT_MOUSE_UP, e.button);
    });

    window.addEventListener("touchstart",function(e){
        var bbox = Global.onscreenCanvas.getBoundingClientRect();
        var ct = e.changedTouches;
        for(var i = 0; i < ct.length; i++){
            var touch = touchMsgQueue.alloc();
            touch.id = ct[i].identifier;
            touch.x = (ct[i].clientX - bbox.left) / bbox.width;
            touch.y = 1 - (ct[i].clientY - bbox.top) / bbox.height;
            Updating.postMessage(Msg.INPUT_TOUCH_START, touch);
        }
    });

    window.addEventListener("touchend",function(e){
        var bbox = Global.onscreenCanvas.getBoundingClientRect();
        var ct = e.changedTouches;
        for(var i = 0; i < ct.length; i++){
            var touch = touchMsgQueue.alloc();
            touch.id = ct[i].identifier;
            touch.x = (ct[i].clientX - bbox.left) / bbox.width;
            touch.y = 1 - (ct[i].clientY - bbox.top) / bbox.height;
            Updating.postMessage(Msg.INPUT_TOUCH_END, touch);
        }
    });

    window.addEventListener("touchcancel",function(e){
        var bbox = Global.onscreenCanvas.getBoundingClientRect();
        var ct = e.changedTouches;
        for(var i = 0; i < ct.length; i++){
            var touch = touchMsgQueue.alloc();
            touch.id = ct[i].identifier;
            touch.x = (ct[i].clientX - bbox.left) / bbox.width;
            touch.y = 1 - (ct[i].clientY - bbox.top) / bbox.height;
            Updating.postMessage(Msg.INPUT_TOUCH_CANCEL, touch);
        }
    });

    window.addEventListener("touchmove",function(e){
        var bbox = Global.onscreenCanvas.getBoundingClientRect();
        var ct = e.changedTouches;
        for(var i = 0; i < ct.length; i++){
            var touch = touchMsgQueue.alloc();
            touch.id = ct[i].identifier;
            touch.x = (ct[i].clientX - bbox.left) / bbox.width;
            touch.y = 1 - (ct[i].clientY - bbox.top) / bbox.height;
            Updating.postMessage(Msg.INPUT_TOUCH_MOVE, touch);
        }
    });

    Input = {
        registerButton : function(key, keyCode){
            buttons.set(keyCode, key);
            var state = new ButtonState();
            buttonStates.set(key,state);
            return state;
        },
        unregisterButton : function(key){
            var iter = buttons.entries();
            var result = null;
            do {
                result = iter.next();
                if(result.value[1] == key){
                    buttons.delete(result.value[0]);
                    break;
                }
            } while (!result.done);
            buttonStates.delete(key);
        },
        getButton : function(key){return buttonStates.get(key)},
        getMouseButton : function(button){return mouseButtonStates[button]},
        getMousePos : function(){return mousePos},
        proceedTouchStart : function(func){startedTouches.forEach(func)},
        proceedTouchEnd : function(func){endedTouches.forEach(func)},
        proceedTouchCancel : function(func){cancelTouches.forEach(func)},
        proceedTouchStay : function(func){stayingTouches.forEach(func)},
        getWindowResize : null,
        getScreenOrientationChange : null,
    };
}

Input();