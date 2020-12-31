var Misc = {
    ObjPool : function(constructor){
        this.space = [];
        this.ptr = 0;
        this.constructor = constructor;
    }
};

Misc.ObjPool.prototype.get = function(){
    if(this.ptr == this.space.length){
        var obj = new this.constructor();
        this.space[this.ptr++] = obj;
        return obj;
    }
    return this.space[this.ptr++];
}