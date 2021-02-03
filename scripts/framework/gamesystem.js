var pickoSystem = function(){
    var archetypeSpaces = [];
    var componentTypes = [];
    var componentPools = []; // The pools of unused components.
    function ArchetypeSpace(archetype){
        this.archetype = archetype;
        this.entities = new pickoMisc.ObjList();
        this.components = new Array(archetype.length);
        for(var i = 0; i < archetype.length; i++){
            this.components[i] = new pickoMisc.ObjList();
        }
        this.typeMap = new Map();
        var tm = this.typeMap;
        this.archetype.forEach(function(id, idx){
            tm.set(componentTypes[id], idx);
        });
    }
    ArchetypeSpace.prototype = {
        createEntity : function(){
            var entity = entityPool.pop();
            entity.index = this.entities.ptr;
            entity.dead = false;
            this.entities.push(entity);
            entity.archetype = this;
            for(var i = 0; i < this.components.length; i++){
                this.components[i].push(componentPools[this.archetype[i]].pop());
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
        getComponent : function(constructor){
            return this.archetype.components[this.archetype.typeMap.get(constructor)].space[this.index];
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
                        componentPools[sp.archetype[idx]].push(comArray.space[i]);
                        comArray.remove(i);
                    });
                } else {
                    i++;
                }
            }
        });
    }

    pickoUpdating.startLateRenderRoutine(Symbol("__system"), -32, lateRender);

    pickoSystem = {
        createArchetype : function(types){ // The parameter is an array of the components' constructors, and the return value is the archetype id.
            var components = [];
            for(var i = 0; i < types.length; i++){
                var index = componentTypes.indexOf(types[i]);
                if(index == -1){
                    components[i] = componentTypes.length;
                    componentTypes.push(types[i]);
                    componentPools.push(new pickoMisc.ObjPool(types[i]));
                } else {
                    components[i] = index;
                }
            }
            archetypeSpaces.push(new ArchetypeSpace(components));
            return archetypeSpaces[archetypeSpaces.length - 1];
        },
        createEntity : function(archetype){
            return archetypeSpaces[archetype].createEntity();
        },
        registerComponent : function(constructor){
            var index = componentTypes.indexOf(constructor);
            if(index == -1){
                componentTypes.push(constructor);
                componentPools.push(new pickoMisc.ObjPool(constructor));
                return componentTypes.length - 1;
            }
            return -1;
        },
        createSystemByComponents : function(func, includes, excludes = []){
            var system = new System();
            system.func = func;
            archetypeSpaces.forEach(function(sp){
                for(var i = 0; i < excludes.length; i++){
                    if(sp.archetype.indexOf(componentTypes.indexOf(excludes[i])) != -1)
                        return;
                }
                for(var i = 0; i < includes.length; i++){
                    if(sp.archetype.indexOf(componentTypes.indexOf(includes[i])) == -1)
                        return;
                }
                system.archetypes.push(sp);
            });
            if(system.archetypes.length > 0)
                return system;
            else 
                return null;
        },
        createSystemByComponentIds : function(func, includes, excludes = []){
            var system = new System();
            system.func = func;
            archetypeSpaces.forEach(function(sp){
                for(var i = 0; i < excludes.length; i++){
                    if(sp.archetype.indexOf(excludes[i]) != -1)
                        return;
                }
                for(var i = 0; i < includes.length; i++){
                    if(sp.archetype.indexOf(includes[i]) == -1)
                        return;
                }
                system.archetypes.push(sp);
            });
            if(system.archetypes.length > 0)
                return system;
            else 
                return null;
        },
        createSystemByArchetypes : function(func, archetypes){
            if(archetypes.length == 0)
                return null;
            var system = new System();
            system.func = func;
            archetypes.forEach(function(){
                system.archetypes.push(sp);
            });
            return system;
        }
    };
}
pickoSystem();