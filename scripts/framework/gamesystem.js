var pickoSystem = function(){

    var componentTypes = [];
    var componentPools = []; // The pools of unused components.

    var currentArchetype = [];

    var systems = [];

    var entityPool = new pickoMisc.ObjPool(Entity);
    var deadEntities = new pickoMisc.ObjList();

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
        this.contains = null;
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
        this.version = 0;
        this.archetype = null;
    }

    Entity.prototype = {
        getComponent : function(id){
            return this.archetype.components[this.archetype.typeMap.get(id)].space[this.index];
        },
        free : function(){
            this.version++;
            entityPool.push(this);
            var sp = this.archetype;
            var i = this.index;
            sp.entities.remove(i);
            if(sp.entities.ptr > 0)
                sp.entities.space[this.index] = i;
            sp.components.forEach(function(comArray, idx){
                componentPools[sp.componentTypes[idx]].push(comArray.space[i]);
                comArray.remove(i);
            });
        }
    }

    function System(){
        this.func = null;
        this.archetypes = [];
        this.includes = [];
        this.excludes = [];
    }

    System.prototype = {
        invoke : function(){
            var func = this.func;
            this.archetypes.forEach(function(sp){
                func(sp);
            });
        }
    }

    function lateRender(){
        deadEntities.forEach(function(ent){
            ent.free();
        });
        deadEntities.clear();
    }

    function createArchetype(){
        var typecount = 0;
        var asp = new ArchetypeSpace(archetypeSpaces.length);
        for(var i = 0; i < currentArchetype.length; i++){
            var cnum = currentArchetype[i];
            for(var j = 0; j < 32; j++){
                if((cnum & (1 << j)) != 0){
                    var type = i * 32 + j;
                    if(componentTypes[type] != null){
                        asp.components.push(new pickoMisc.ObjList());
                        asp.componentTypes.push(type);
                        asp.typeMap.set(type, typecount);
                        typecount++;
                    }
                }
            }
        }
        asp.contains = arrayDupe(currentArchetype);
        archetypes.set(currentArchetype, asp);
        archetypeSpaces.push(asp);
        systems.forEach(function(sys){
            for(var i = 0; i < sys.includes.length; i++){
                if(((asp.contains[i] & sys.excludes[i]) != 0 ) || ((asp.contains[i] & sys.includes[i]) != sys.includes[i])){
                    return;
                }
            }
            sys.archetypes.push(asp);
        });
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

        clearCurrent : function(){
            for(var i = 0; i < currentArchetype.length; i++){
                currentArchetype[i] = 0;
            }
        },

        findArchetype : function(){
            var asp = archetypes.get(currentArchetype);
            if(asp == undefined){
                asp = createArchetype();
            }
            return asp;
        },
        registerComponent : function(constructor = null){
            if(constructor == null){
                componentTypes.push(null);
                componentPools.push(null);
            } else {
                if(componentTypes.indexOf(constructor) != -1)
                    return -1;
                componentTypes.push(constructor);
                componentPools.push(new pickoMisc.ObjPool(constructor));
            }
            
            if(currentArchetype.length * 32 < componentTypes.length){
                currentArchetype.push(0);
            }
            return componentTypes.length - 1;
        },
        destroy : function(entity){
            deadEntities.push(entity);
        },
        createSystem : function(func, includes = [], excludes = []){
            var system = new System();
            system.func = func;
            var inc = new Array(currentArchetype.length);
            var exc = new Array(currentArchetype.length);
            for(var i = 0; i < currentArchetype.length; i++){
                inc[i] = 0;
                exc[i] = 0;
            }
            includes.forEach(function(id){
                var digit = id % 32;
                var index = (id - digit) / 32;
                inc[index] = inc[index] | (1 << digit);
            });

            excludes.forEach(function(id){
                var digit = id % 32;
                var index = (id - digit) / 32;
                exc[index] = exc[index] | (1 << digit);
            });

            archetypeSpaces.forEach(function(sp){
                for(var i = 0; i < sp.contains.length; i++){
                    if(((sp.contains[i] & exc[i]) != 0 ) || ((sp.contains[i] & inc[i]) != inc[i])){
                        return;
                    }
                }
                system.archetypes.push(sp);
            });
            system.includes = inc;
            system.excludes = exc;
            systems.push(system);
            return system;
        },
    };
}
pickoSystem();