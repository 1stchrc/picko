var Updating = {

    deltaTime : null,


    renderFrame : null,
    startRenderRoutine : null,
    stopRenderRoutine : null,
    pushRenderEvent : null,

    functionGetter : function(){
        var renderRoutines = [];
        var renderEvents = [];

        function renderRoutine(name, priority, func){
            this.name = name;
            this.priority = priority;
            this.func = func;
        };

        Updating.renderFrame = function(dt){
            for(var i = 0; i < renderEvents.length; i++){
                renderEvents[i]();
            }
            renderEvents.length = 0;
            Updating.deltaTime = dt / 1000;
            for(var i = 0; i < renderRoutines.length; i++){
                renderRoutines[i].func();
            }
        };

        Updating.startRenderRoutine = function(name, priority, func){
            renderRoutines.push(new renderRoutine(name,priority,func));
            renderRoutines.sort(function(l, r){return l.priority - r.priority;});
        };
        Updating.stopRenderRoutine = function(name){
            renderRoutines.splice(renderRoutines.findIndex(function(el){return el.name == name;}), 1);
        };

        Updating.pushRenderEvent = function(event){
            renderEvents.push(event);
        };


    }
};
Updating.functionGetter();