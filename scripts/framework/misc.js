var pickoMisc = {
    StructArray : function(constructor){
        this.space = [];
        this.ptr = 0;
        this.constructor = constructor;
    },
    ObjList : function(){
        this.space = [];
        this.ptr = 0;
    },
    ObjPool : function(constructor){
        this.space = [];
        this.ptr = 0;
        this.constructor = constructor;
    },
    HashMap : function(maxHash, hash, equal, duplicate){
        this.buckets = new Array(maxHash + 1);
        this.hash = hash;
        this.equal = equal;
        this.duplicate = duplicate;
        for(var i = 0; i < this.buckets.length; i++){
            this.buckets[i] = [];
        }
    },
    Pair : function(first, second){
        this.first = first;
        this.second = second;
    }
};

pickoMisc.StructArray.prototype = { 
    alloc : function(){
        if(this.ptr == this.space.length){
            var obj = new this.constructor();
            this.space[this.ptr++] = obj;
            return obj;
        }
        return this.space[this.ptr++];
    },
    reset : function(){
        this.space = [];
        this.ptr = 0;
    }
}

pickoMisc.ObjList.prototype = {
    push : function(obj){
        this.space[this.ptr++] = obj;
    },
    remove : function(index){
        this.space[index] = this.space[--this.ptr];
        this.space[this.ptr] = null;
    },
    reset : function(){
        this.space = [];
        this.ptr = 0;
    },
    forEach : function(opt){
        for(var i = 0; i < this.ptr; i++){
            opt(this.space[i]);
        }
    },
    clear : function(){
        for(var i = 0; i < this.ptr; i++){
            this.space[i] = null;
        }
        this.ptr = 0;
    }
}

pickoMisc.ObjPool.prototype = {
    push : function(obj){
        this.space[this.ptr++] = obj;
    },
    pop : function(){
        if(this.ptr == 0){
            var _obj = new this.constructor();
            return _obj;
        }
        var obj = this.space[--this.ptr];
        this.space[this.ptr] = null;
        return obj;
    },
    reset : function(){
        this.space = [];
        this.ptr = 0;
    }
}

pickoMisc.HashMap.prototype = {
    set : function(key, value){
        this.buckets[this.hash(key)].push(new pickoMisc.Pair(this.duplicate(key), value));
    },
    get : function(key){
        var that = this;
        var set = this.buckets[this.hash(key)];
        for(var i = 0; i < set.length; i++){
            if(that.equal(set[i].first, key))
                return set[i].second;
        }
        return undefined;
    }
}