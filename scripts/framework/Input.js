Msg.INPUT_KEYDOWN = 16;
Msg.INPUT_KEYUP = 17;

Msg.INPUT_TOUCH = 20;

Msg.INPUT_MOUSE_DOWN = 32;
Msg.INPUT_MOUSE_UP = 32;
Msg.INPUT_MOUSE_MOVE = 34;

var Input = function(){

    var buttons = new Map();
    var buttonStates = new Map();

    var touches = [];
    
    var mouseButtons = 0;
    function MousePos(x,y){
        this.x = x;
        this.y = y;
    }

    var mousePos = new MousePos(0,0);

    var mousemoveQueue = new Misc.StructArray(MousePos);

    function renderProc(msg, param){
        switch(msg){
            case Msg.INPUT_TOUCH :
                touches = param;
                break;
            case Msg.INPUT_MOUSE_MOVE :
                mousePos.x = param.x;
                mousePos.y = 1 - param.y;
                break;
            case Msg.INPUT_KEYDOWN :
                buttonStates.set(param, true);
                break;
            case Msg.INPUT_KEYUP :
                buttonStates.set(param, false);
                break;
            case Msg.INPUT_MOUSE_DOWN :
            case Msg.INPUT_MOUSE_UP:
                mouseButtons = param;
                break;
        }
    }

    function renderFrame(){
        mousemoveQueue.ptr = 0;
    }

    Updating.setHook(renderProc);
    Updating.startRenderRoutine("__input",-1,renderFrame);

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
        pos.y = (e.clientY - bbox.top) / bbox.height;
        Updating.postMessage(Msg.INPUT_MOUSE_MOVE, pos);
    });

    window.addEventListener("mousedown",function(e){
        Updating.postMessage(Msg.INPUT_MOUSE_DOWN, e.buttons);
    });

    window.addEventListener("mouseup",function(e){
        Updating.postMessage(Msg.INPUT_MOUSE_UP, e.buttons);
    });

    Input = {
        registerButton : function(key, keyCode){
            buttons.set(keyCode, key);
            buttonStates.set(key,false);
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
        getMouseButton : function(button){return mouseButtons & (1 << button) != 0},
        getMousePos : function(){return mousePos},
        getTouches : null,
        getWindowResize : null,
        getScreenOrientationChange : null,
    };
}

Input();