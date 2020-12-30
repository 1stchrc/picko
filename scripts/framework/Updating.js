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
Msg.fixed_start = 1;
Msg.fixed_stop = 2;


//Since js is single-threaded so no need to consider thread safty stuff.
var Updating = {

    renderFrame : null,
    startRenderRoutine : null,
    stopRenderRoutine : null,
    postRenderMessage : null,

    startFixedRoutine : null,
    stopFixedRoutine : null,
    postFixedUpdateMessage : null,
    fixedUpdatePaused : true,

    setRenderHook : null,
    setFixedHook : null,
    dettachRenderHook : null,
    dettachFixedHook : null,

    startFixedUpdate : null,
    frameDropThreshold : 5,
    stopFixedUpdate : function(){

        function ObjPool(constructor){
            this.space = [];
            this.ptr = 0;
            this.constructor = constructor;
        }

        ObjPool.prototype.get = function(){
            if(this.ptr == this.space.length){
                var obj = new this.constructor();
                this.space[this.ptr++] = obj;
                return obj;
            }
            return space[ptr++];
        }

        function Routine(name, func){
            this.name = name;
            this.func = func;
        }

        var renderRoutines = [];
        var renderMsgQueue = new ObjPool(Msg);
        var renderRefreshFlag = false;
        var loopIndex = 0;

        var fixedRoutines = [];
        var fixedUpdateMsgQueue = new ObjPool(Msg);
        var fixedUpdateRefreshFlag = false;

        var fixedDeltaTime = 20;

        var renderHooks = [];
        var fixedHooks = [];

        var fixedUpdate = function(){
            Time.fixedTimestamp = loopIndex * fixedDeltaTime;
            for(var i = 0; i < fixedUpdateMsgQueue.ptr; i++){
                var msg = fixedUpdateMsgQueue.space[i].msg;
                var param = fixedUpdateMsgQueue.space[i].param;
                fixedHooks.forEach(function(hook){hook(msg, param);});                          
            }
            fixedUpdateMsgQueue.ptr = 0;
            if(fixedUpdateRefreshFlag){
                fixedUpdateEvents.space.length = 0;
                fixedUpdateMsgQueue.space.length = 0;
                fixedUpdateRefreshFlag = false;
            }
            fixedRoutines.forEach(function(route){route.func();});
        }
        Updating.renderFrame = function(timestamp){
            for(var i = 0; i < renderMsgQueue.ptr; i++){
                var msg = renderMsgQueue.space[i].msg;
                var param = renderMsgQueue.space[i].param;
                renderHooks.forEach(function(hook){hook(msg, param);});            
            }
            renderMsgQueue.ptr = 0;
            if(renderRefreshFlag){
                renderEvents.space.length = 0;
                renderMsgQueue.space.length = 0;
                renderRefreshFlag = false;
            }
            Time.deltaTime = timestamp - Time.renderTimestamp;
            Time.renderTimestamp = timestamp;
            var expectedLoopIndex = Math.round(timestamp / fixedDeltaTime);
            if(Updating.fixedUpdatePaused || expectedLoopIndex > loopIndex + Updating.frameDropThreshold){
                loopIndex = expectedLoopIndex;
                
            }
            else
                while(loopIndex < expectedLoopIndex){
                    fixedUpdate();
                    loopIndex++;
                }            
            renderRoutines.forEach(function(route){route.func();});
            
        };
        
        Updating.setRenderHook = function(hook){renderHooks.push(hook)};
        Updating.dettachRenderHook = function(hook){
            renderHooks[renderHooks.indexOf(hook)] = renderHooks[renderHooks.length - 1];
            renderHooks.length--;
        };

        Updating.setFixedHook = function(hook){fixedHooks.push(hook)};
        Updating.dettachFixedHook = function(hook){
            fixedHooks[fixedHooks.indexOf(hook)] = fixedHooks[fixedHooks.length - 1];
            fixedHooks.length--;
        };

        Updating.startRenderRoutine = function(name, priority, func){
            var idx = renderRoutines.findIndex(function(el){return el.priority > priority});
            if(idx != -1)
                renderRoutines.splice(idx, 0, new Routine(name, func));
            else{
                renderRoutines.push(new Routine(name, func));
            }
            
        };
        Updating.stopRenderRoutine = function(name){
            renderRoutines.splice(renderRoutines.findIndex(function(el){return el.name == name;}), 1);
        };

        Updating.postRenderMessage = function(msgid, param){
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

        Updating.postFixedUpdateMessage = function(msgid, param){
            var msg = fixedUpdateMsgQueue.get();
            msg.msg = msgid;
            msg.param = param;
        };

        Time.getFixedDeltaTime = function(){return fixedDeltaTime};
        
    }
};
Updating.stopFixedUpdate();