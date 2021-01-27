var Time = {
    deltaTime : 0,
    fixedDeltaTime : 20,
    renderTimestamp : 0,
    fixedTimestamp : 0
};

function Msg(){
    this.msg = 0;
    this.param = undefined;
}

Msg.NULL = 0;

//Since js is single-threaded so no need to consider thread safty stuff.
var Updating = function(){

    function Routine(name, func){
        this.name = name;
        this.func = func;
    }

    var renderRoutines = [];
    var renderMsgQueue = new Misc.StructArray(Msg);
    var lateRenderRoutines = [];
    var renderRefreshFlag = false;

    var fixedRoutines = [];

    var renderHooks = [];

    function fixedUpdate(){

        fixedRoutines.forEach(function(route){route.func();});
    }

    Updating = {
        
        renderFrame : function(timestamp){
    
            Time.deltaTime = timestamp - Time.renderTimestamp;
            Time.renderTimestamp = timestamp;

            for(var i = 0; i < renderMsgQueue.ptr; i++){
                var msg = renderMsgQueue.space[i].msg;
                var param = renderMsgQueue.space[i].param;
                renderHooks.forEach(function(hook){hook(msg, param);});
                msg = Msg.NULL;
                param = undefined;
            }

            renderMsgQueue.ptr = 0;
            if(renderRefreshFlag){
                renderMsgQueue.space.length = 0;
                renderRefreshFlag = false;
            }

            renderRoutines.forEach(function(route){route.func();});

            var maxTime = Time.fixedTimestamp + Updating.frameDropThreshold * Time.fixedDeltaTime;
            if(Updating.fixedUpdatePaused)
                Time.fixedTimestamp = maxTime;
            else
                while(Time.fixedTimestamp < timestamp){
                    if(Time.fixedTimestamp > maxTime){
                        Time.fixedTimestamp = maxTime;
                        break;
                    }
                    Time.fixedTimestamp += Time.fixedDeltaTime;
                    fixedUpdate();
                }

            lateRenderRoutines.forEach(function(route){route.func();});            
        },

        startRenderRoutine : function(name, priority, func){
            var idx = renderRoutines.findIndex(function(el){return el.priority > priority});
            if(idx != -1)
                renderRoutines.splice(idx, 0, new Routine(name, func));
            else
                renderRoutines.push(new Routine(name, func));
        },
        startLateRenderRoutine : function(name, priority, func){
            var idx = renderRoutines.findIndex(function(el){return el.priority > priority});
            if(idx != -1)
                lateRenderRoutines.splice(idx, 0, new Routine(name, func));
            else
                lateRenderRoutines.push(new Routine(name, func));
        },
        stopRenderRoutine : function(name){
            renderRoutines.splice(renderRoutines.findIndex(function(el){return el.name == name;}), 1);
        },
        stopLateRenderRoutine : function(name){
            lateRenderRoutines.splice(lateRenderRoutines.findIndex(function(el){return el.name == name;}), 1);
        },
        postMessage : function(msgid, param){
            var msg = renderMsgQueue.alloc();
            msg.msg = msgid;
            msg.param = param;
        },
    
        startFixedRoutine : function(name, priority, func){
            var idx = fixedRoutines.findIndex(function(el){return el.priority > priority});
            if(idx != -1)
                fixedRoutines.splice(idx, 0, new Routine(name, func));
            else 
                fixedRoutines.push(new Routine(name, func));
        },

        stopFixedRoutine : function(name){
            fixedRoutines.splice(fixedRoutines.findIndex(function(el){return el.name == name;}), 1);
        },
    
        setHook : function(hook){
            renderHooks.push(hook);
        },

        dettachHook : function(hook){
            renderHooks[renderHooks.indexOf(hook)] = renderHooks[renderHooks.length - 1];
            renderHooks.length--;
        },
        
        fixedUpdatePaused : true,

        frameDropThreshold : 5,
    };
}
Updating();