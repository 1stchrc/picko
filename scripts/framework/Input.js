Msg.INPUT_KEYDOWN = 16;
Msg.INPUT_KEYUP = 17;

Msg.INPUT_TOUCH = 20;

Msg.INPUT_MOUSE_DOWN = 32;
Msg.INPUT_MOUSE_UP = 33;
Msg.INPUT_MOUSE_MOVE = 34;

var Input = function(){

    var buttons = new Map();
    var touches = [];
    var buttonStates = new Map();
    var mouse0 = false;
    var mouse1 = false;
    var mouse2 = false;
    var mouse3 = false;
    var mouse4 = false;

    function renderProc(msg, param){
        switch(msg){
            case Msg.INPUT_KEYDOWN :
                buttonStates.set(param, true);
                break;
            case Msg.INPUT_KEYUP :
                buttonStates.set(param, false);
                break;
            case Msg.INPUT_TOUCH :
                touches = param;
                break;
            case Msg.INPUT_MOUSE_DOWN :
            case Msg.INPUT_MOUSE_UP :
                //Will be implemented soon
                break;
        }
    }

    Updating.setHook(renderProc);

    window.addEventListener("keydown", function(e){
        keyCode = buttons.get(e.code);
        if(keyCode != undefined)
            Updating.postMessage(Msg.INPUT_KEYDOWN, keyCode);
    });

    window.addEventListener("keyup", function(e){
        keyCode = buttons.get(e.code);
        if(keyCode != undefined)
            Updating.postMessage(Msg.INPUT_KEYUP, keyCode);
    });
    
    Input = {
        registerButton : function(key, keyCode){
            buttons.set(keyCode, key);
            buttonStates.set(key,false);
        },
        unregisterButton : function(key){
            var iter = buttons.entries();
            var result = null;
            while(true){
                result = iter.next();
                if(result.value[1] == key){
                    buttons.delete(result.value[0]);
                    break;
                }
                if(result.done)
                    break;
            }
            buttonStates.delete(key);
        },
        getButton : function(key){return buttonStates.get(key)},
        getMouseButton : null,
        getMousePos : null,
        getTouches : null,
        getWindowResize : null,
        getScreenOrientationChange : null,
    };
}

Input.MOUSE_LBUTTON = 0;
Input.MOUSE_RBUTTON = 1;
Input.MOUSE_WHEEL = 2;
Input.MOUSE_4TH = 3;
Input.MOUSE_5TH = 4;

Input();