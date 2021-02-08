var pickoSystem = function(){

    var componentTypes = [];
    var componentPools = []; // The pools of unused components.

    var currentArchetype = [];

    function arrayHash(array){
        var hash = 0;
        for(var i = 0; i < array.length; i++){
            hash += array[i] % 37;
        }
        return hash % 37;
    }

    function arrayEqual(left, right){
        var i = 0;
        if(left.length > right.length){
            for(; i < right.length; i++){
                if(left[i] != right[i])
                    return false;
            }
            for(; i < left.length; i++){
                if(left[i] != 0)
                return false;
            }
            return true;
        }
        for(; i < left.length; i++){
            if(left[i] != right[i])
                return false;
        }
        for(; i < right.length; i++){
            if(right[i] != 0)
                return false;
        }
        return true;
    }

    function arrayDupe(array){
        var dupe = new Array(array.length);
        for(var i = 0; i < array.length; i++){
            dupe[i] = array[i];
        }
        return dupe;
    }

    var archetypes = new pickoMisc.HashMap(36, arrayHash, arrayEqual, arrayDupe);
    var archetypeSpaces = [];



    function ArchetypeSpace(archetype){
        this.archetype = archetype;
        this.entities = new pickoMisc.ObjList();
        this.components = [];
        this.componentTypes = [];
        this.typeMap = new Map();
    }
    ArchetypeSpace.prototype = {
        createEntity : function(){
            var entity = entityPool.pop();
            entity.index = this.entities.ptr;
            entity.dead = false;
            this.entities.push(entity);
            entity.archetype = this;
            for(var i = 0; i < this.components.length; i++){
                this.components[i].push(componentPools[this.componentTypes[i]].pop());
            }
            return entity;
        },
        getComponents : function(constructor){
            return this.components[this.typeMap.get(constructor)].space;
        },
        getEntityCount : function(){
            return this.entities.ptr;
        }
    };
    function Entity(){
        this.index = null;
        this.dead = true;
        this.archetype = null;
    }

    Entity.prototype = {
        getComponent : function(id){
            //console.log(this.archetype);
            return this.archetype.components[this.archetype.typeMap.get(id)].space[this.index];
        }
    }

    function System(){
        this.func = null;
        this.archetypes = [];
    }

    System.prototype = {
        invoke : function(){
            var func = this.func;
            this.archetypes.forEach(function(sp){
                func(sp);
            });
        }
    }

    var entityPool = new pickoMisc.ObjPool(Entity); // The pool of dead entities.

    function lateRender(){
        archetypeSpaces.forEach(function(sp){
            for(var i = 0; i < sp.entities.ptr;){
                if(sp.entities.space[i].dead){
                    entityPool.push(sp.entities.space[i]);
                    sp.entities.remove(i);
                    if(sp.ptr > 0){
                        sp.entities.space[i].index = i;
                    }
                    sp.components.forEach(function(comArray, idx){
                        componentPools[sp.componentTypes[idx]].push(comArray.space[i]);
                        comArray.remove(i);
                    });
                } else {
                    i++;
                }
            }
        });
    }

    function createArchetype(){
        var typecount = 0;
        var asp = new ArchetypeSpace(archetypeSpaces.length);
        for(var i = 0; i < currentArchetype.length; i++){
            var cnum = currentArchetype[i];
            for(var j = 0; j < 32; j++){
                if((cnum & (1 << j)) != 0){
                    var type = i * 32 + j;
                    asp.components.push(new pickoMisc.ObjList());
                    asp.componentTypes.push(type);
                    asp.typeMap.set(type, typecount);
                    typecount++;
                }
            }
        }

        archetypes.set(currentArchetype, asp);
        archetypeSpaces.push(asp);
        //console.log(currentArchetype);
        return asp;
    }

    pickoUpdating.startLateRenderRoutine(Symbol("__system"), -32, lateRender);

    pickoSystem = {
        addComponent : function(id){
            var digit = id % 32;
            var index = (id - digit) / 32;
            currentArchetype[index] = currentArchetype[index] | (1 << digit);
        },

        removeComponent : function(id){
            var digit = id % 32;
            var index = (id - digit) / 32;
            currentArchetype[index] & (~(1 << digit));
        },

        clearCurrent : function(){currentArchetype.forEach(function(val){val = 0;});},

        findArchetype : function(){
            var asp = archetypes.get(currentArchetype);
            if(asp == undefined){
                asp = createArchetype();
            }
            return asp;
        },

        registerComponent : function(constructor){
            var index = componentTypes.indexOf(constructor);
            if(index == -1){
                componentTypes.push(constructor);
                componentPools.push(new pickoMisc.ObjPool(constructor));
                if(currentArchetype.length * 32 < componentTypes.length){
                    currentArchetype.push(0);
                }
                return componentTypes.length - 1;
            }
            return -1;
        },

        createSystem : function(func, includes = [], excludes = []){
            var system = new System();
            system.func = func;
            archetypeSpaces.forEach(function(sp){
                for(var i = 0; i < excludes.length; i++){
                    if(sp.typeMap.get(excludes[i]) != undefined)
                        return;
                }
                for(var i = 0; i < includes.length; i++){
                    if(sp.typeMap.get(includes[i]) == undefined)
                        return;
                }
                system.archetypes.push(sp);
            });
            if(system.archetypes.length > 0)
                return system;
            else
                return null;
        },
    };
}
pickoSystem();