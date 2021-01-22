var Misc = {
    StructArray : function(constructor){
        this.space = [];
        this.ptr = 0;
        this.constructor = constructor;
    },
    ObjList : function(){
        this.space = [];
        this.ptr = 0;
    }
};

Misc.StructArray.prototype = { 
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
    },
    clear : function(){
        for(var i = 0; i < this.ptr; i++){
            this.space[i] = null;
        }
    }
}

Misc.ObjList.prototype = {
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
    }
}