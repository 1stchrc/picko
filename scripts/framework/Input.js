Msg.input_keydown = 16;
Msg.input_keyup = 17;

Msg.input_touch = 20;

Msg.input_mouse_button_down = 32;
Msg.input_mouse_button_up = 33;
Msg.input_mouse_move = 34;
Msg.input_mouse_scroll = 35;

var Input = {
    registerButton : null,
    unregisterButton : null,
    getButton : null,
    getTouches : null,
    getWindowResize : null,
    getScreenOrientationChange : null,
    functionGetter : function(){
        var buttons = new Map();
        var touches = [];
        var buttonStates = new Map();
        var lbutton = false;
        var rbutton = false;
        var swheel = false;
        function renderProc(msg, param){
            switch(msg){
                case Msg.input_keydown :
                    buttonStates.set(param, true);
                    break;
                case Msg.input_keyup :
                    buttonStates.set(param, false);
                    break;
                case Msg.input_touch :
                    touches = param;
                    break;
                case Msg.input_mouse_button_down :
                    switch(param.button){
                        case -1 :
                            lbutton = true;
                            break;
                        case 1 :
                            rbutton = true;
                            break;
                        case 0 :
                            swheel = true;
                            break;
                    }
                    break;
                case Msg.input_mouse_button_up :
                    switch(param.button){
                        case -1 :
                            lbutton = false;
                            break;
                        case 1 :
                            rbutton = false;
                            break;
                        case 0 :
                            swheel = false;
                            break;
                    }
                    break;
                case Msg.input_mouse_scroll :
                    //Not implemented
                    break;
            }
        }
        Updating.setHook(renderProc);

        window.addEventListener("keydown", function(e){
            keyCode = buttons.get(e.code);
            if(keyCode != undefined)
                Updating.postMessage(Msg.input_keydown, keyCode);
        });

        window.addEventListener("keyup", function(e){
            keyCode = buttons.get(e.code);
            if(keyCode != undefined)
                Updating.postMessage(Msg.input_keyup, keyCode);
        });

        Input.registerButton = function(key, keyCode){
            buttons.set(keyCode, key);
            buttonStates.set(key,false);
        }
        Input.unregisterButton = function(key){
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
        };
        Input.getButton = function(key){return buttonStates.get(key)};
    }
};
Input.functionGetter();