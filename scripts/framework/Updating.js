var Time = {
    deltaTime : null,
    getFixedDeltaTime : null,
    renderTimestamp : 0,
    fixedTimestamp : 0
};

function Msg(){
    this.msg = 0;
    this.param = undefined;
}

Msg.null = 0;

//Since js is single-threaded so no need to consider thread safty stuff.
var Updating = {

    renderFrame : null,
    startRenderRoutine : null,
    startLateRenderRoutine : null,
    stopRenderRoutine : null,
    stopLateRenderRoutine : null,
    postMessage : null,

    startFixedRoutine : null,
    stopFixedRoutine : null,
    fixedUpdatePaused : true,

    setHook : null,
    dettachHook : null,

    startFixedUpdate : null,
    frameDropThreshold : 5,
    stopFixedUpdate : function(){
        function Routine(name, func){
            this.name = name;
            this.func = func;
        }

        var renderRoutines = [];
        var renderMsgQueue = new Misc.ObjPool(Msg);
        var lateRenderRoutines = [];
        var renderRefreshFlag = false;
        var loopIndex = 0;

        var fixedRoutines = [];

        var fixedDeltaTime = 20;

        var renderHooks = [];
        var fixedHooks = [];

        var fixedUpdate = function(){
            Time.fixedTimestamp = loopIndex * fixedDeltaTime;

            fixedRoutines.forEach(function(route){route.func();});
        }
        Updating.renderFrame = function(timestamp){

            Time.deltaTime = timestamp - Time.renderTimestamp;
            Time.renderTimestamp = timestamp;

            for(var i = 0; i < renderMsgQueue.ptr; i++){
                var msg = renderMsgQueue.space[i].msg;
                var param = renderMsgQueue.space[i].param;
                renderHooks.forEach(function(hook){hook(msg, param);});
            }
            renderMsgQueue.ptr = 0;
            if(renderRefreshFlag){
                renderMsgQueue.space.length = 0;
                renderRefreshFlag = false;
            }

            renderRoutines.forEach(function(route){route.func();});

            var expectedLoopIndex = Math.round(timestamp / fixedDeltaTime);
            var maxLoopIndex = loopIndex + Updating.frameDropThreshold;
            if(Updating.fixedUpdatePaused)
                loopIndex = expectedLoopIndex;
            else
                while(loopIndex < expectedLoopIndex){
                    if(loopIndex > maxLoopIndex){
                        loopIndex = expectedLoopIndex;
                        break;
                    }
                    fixedUpdate();
                    loopIndex++;
                }

            lateRenderRoutines.forEach(function(route){route.func();});            
        };
        
        Updating.setHook = function(hook){renderHooks.push(hook)};
        Updating.dettachHook = function(hook){
            renderHooks[renderHooks.indexOf(hook)] = renderHooks[renderHooks.length - 1];
            renderHooks.length--;
        };

        Updating.startRenderRoutine = function(name, priority, func){
            var idx = renderRoutines.findIndex(function(el){return el.priority > priority});
            if(idx != -1)
                renderRoutines.splice(idx, 0, new Routine(name, func));
            else
                renderRoutines.push(new Routine(name, func));
        };

        Updating.startLateRenderRoutine = function(name, priority, func){
            var idx = renderRoutines.findIndex(function(el){return el.priority > priority});
            if(idx != -1)
                lateRenderRoutines.splice(idx, 0, new Routine(name, func));
            else
                lateRenderRoutines.push(new Routine(name, func));
        };

        Updating.stopRenderRoutine = function(name){
            renderRoutines.splice(renderRoutines.findIndex(function(el){return el.name == name;}), 1);
        };

        Updating.stopLateRenderRoutine = function(name){
            lateRenderRoutines.splice(lateRenderRoutines.findIndex(function(el){return el.name == name;}), 1);
        };

        Updating.postMessage = function(msgid, param){
            var msg = renderMsgQueue.get();
            msg.msg = msgid;
            msg.param = param;
        };

        Updating.startFixedRoutine = function(name, priority, func){
            var idx = fixedRoutines.findIndex(function(el){return el.priority > priority});
            if(idx != -1)
                fixedRoutines.splice(idx, 0, new Routine(name, func));
            else 
                fixedRoutines.push(new Routine(name, func));
        };

        Updating.stopFixedRoutine = function(name){
            fixedRoutines.splice(fixedRoutines.findIndex(function(el){return el.name == name;}), 1);
        };

        Time.getFixedDeltaTime = function(){return fixedDeltaTime};
        
    }
};
Updating.stopFixedUpdate();