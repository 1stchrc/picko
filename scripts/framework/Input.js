Msg.INPUT_KEYDOWN = 16;
Msg.INPUT_KEYUP = 17;

Msg.INPUT_TOUCH = 20;

Msg.INPUT_MOUSE_DOWN = 32;
Msg.INPUT_MOUSE_UP = 33;
Msg.INPUT_MOUSE_MOVE = 34;

var Input = function(){

    var buttons = new Map();
    var buttonStates = new Map();

    function ButtonState(){
        this.pressed = false;
        this.down = 0;
        this.up = 0;
    }

    var touches = [];
    
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
            case Msg.INPUT_TOUCH :
                touches = param;
                break;
            case Msg.INPUT_MOUSE_MOVE :
                mousePos.x = param.x;
                mousePos.y = 1 - param.y;
                break;
            case Msg.INPUT_KEYDOWN :
                keyDownProc(param);
                break;
            case Msg.INPUT_KEYUP :
                keyUpProc(param);
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

    function lateRender(){
        mousemoveQueue.ptr = 0;
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
        pos.y = (e.clientY - bbox.top) / bbox.height;
        Updating.postMessage(Msg.INPUT_MOUSE_MOVE, pos);
    });

    window.addEventListener("mousedown",function(e){
        Updating.postMessage(Msg.INPUT_MOUSE_DOWN, e.button);
    });

    window.addEventListener("mouseup",function(e){
        Updating.postMessage(Msg.INPUT_MOUSE_UP, e.button);
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
        getTouches : null,
        getWindowResize : null,
        getScreenOrientationChange : null,
    };
}

Input();