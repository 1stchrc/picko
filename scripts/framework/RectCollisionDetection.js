function RectCollider(left,bottom,right,top,obj = null){
    this.left = left;
    this.bottom = bottom;
    this.right = right;
    this.top = top;
    this.obj = obj;
}
function GridLayer(sizeX,sizeY,scaleX,scaleY){
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.gridList = [];
    this.gridList.length = this.sizeX*this.sizeY;
    for(var i = 0; i < this.gridList.length; i++){
        this.gridList[i] = [];
    }
    this.addRect = function(rect){
        var xmin = Math.floor(rect.left/this.scaleX);
        var xmax = Math.ceil(rect.right/this.scaleX)
        var ymax = Math.ceil(rect.top/this.scaleY)
        for(var y = Math.floor(rect.bottom/this.scaleY); y < ymax; y++){
            for(var x = xmin; x < xmax; x++){
                this.gridList[x + y * this.sizeX].push(rect);
            }
        }
    }
    this.removeRect = function(rect){
        var xmin = Math.floor(rect.left/this.scaleX);
        var xmax = Math.ceil(rect.right/this.scaleX)
        var ymax = Math.ceil(rect.top/this.scaleY)
        for(var y = Math.floor(rect.bottom/this.scaleY); y < ymax; y++){
            for(var x = xmin; x < xmax; x++){
                this.gridList[x + y * this.sizeX](x,y).splice(set.indexOf(rect),1);
            }
        }
    }
    this.overlapRect = function(l,b,r,t){
        var array = [];
        var xmin = Math.floor(l/this.scaleX);
        var xmax = Math.ceil(r/this.scaleX)
        var ymax = Math.ceil(b/this.scaleY)
        for(var y = Math.floor(t/this.scaleY); y < ymax; y++){
            for(var x = xmin; x < xmax; x++){
                this.gridList[x + y * this.sizeX].forEach(r=>{
                    if(array.indexOf(r) != -1)
                        return;
                    if(r.left > r)
                        return;
                    if(l > r.right)
                        return;
                    if(r.bottom > t)
                        return;
                    if(b > r.top)
                        return;
                    array.push(r);
                });
            }
        }
        return array;
    }
}