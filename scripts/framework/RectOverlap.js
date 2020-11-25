var RectOverlap = {
    RectObj: function (left,bottom,right,top,obj = null){
        this.left = left;
        this.bottom = bottom;
        this.right = right;
        this.top = top;
        this.obj = obj;
    },
    GridLayer: function (sizeX,sizeY,scaleX,scaleY){
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.gridList = [];
        this.gridList.length = this.sizeX*this.sizeY;
        for(var i = 0; i < this.gridList.length; i++){
            this.gridList[i] = [];
        }
        this.pushRect = function(rect,xi,xa,yi,ya){
            for(var y = yi; y < ya; y++){
                for(var x = xi; x < xa; x++){
                    this.gridList[x + y * this.sizeX].push(rect);
                }
            }
        }
        this.deleteRect = function(rect,xi,xa,yi,ya){
            for(var y = yi; y < ya; y++){
                for(var x = xi; x < xa; x++){
                    var set = this.gridList[x + y * this.sizeX];
                    set.splice(set.indexOf(rect),1);
                }
            }
        }
        this.addRect = function(rect){
            this.pushRect(rect,Math.floor(rect.left/this.scaleX),Math.ceil(rect.right/this.scaleX),Math.floor(rect.bottom/this.scaleY),Math.ceil(rect.top/this.scaleY));
        }
        this.removeRect = function(rect){
            this.deleteRect(rect,Math.floor(rect.left/this.scaleX),Math.ceil(rect.right/this.scaleX),Math.floor(rect.bottom/this.scaleY),Math.ceil(rect.top/this.scaleY));
        }
        this.overlapRect = function(l,b,r,t){
            var array = [];
            var xmin = Math.floor(l/this.scaleX);
            var xmax = Math.ceil(r/this.scaleX);
            var ymax = Math.ceil(t/this.scaleY);
            for(var y = Math.floor(b/this.scaleY); y < ymax; y++){
                for(var x = xmin; x < xmax; x++){
                    this.gridList[x + y * this.sizeX].forEach(rect=>{
                        if(array.indexOf(rect) != -1)
                            return;
                        if(rect.left > r)
                            return;
                        if(l > rect.right)
                            return;
                        if(rect.bottom > t)
                            return;
                        if(b > rect.top)
                            return;
                        array.push(rect);
                    });
                }
            }
            return array;
        }
        this.updateRect = function(rect,l,r,b,t){
            var oldxmin = Math.floor(rect.left/this.scaleX);
            var oldxmax = Math.ceil(rect.right/this.scaleX);
            var oldymin = Math.floor(rect.bottom/this.scaleY);
            var oldymax = Math.ceil(rect.top/this.scaleY);
            var xmin = Math.floor(l/this.scaleX);
            var xmax = Math.ceil(r/this.scaleX);
            var ymin = Math.floor(b/this.scaleY);
            var ymax = Math.ceil(t/this.scaleY);
            if(xmin >= oldxmax || xmax <= oldxmin || ymin >= oldymax || ymax <= oldymin){
                this.deleteRect(rect,oldxmin,oldxmax,oldymin,oldymax);
                this.pushRect(rect,xmin,xmax,ymin,ymax);
            } else {
                var xminalt = xmin-oldxmin;
                var xmaxalt = xmax-oldxmax;
                var yminalt = ymin-oldymin;
                var ymaxalt = ymax-oldymax;
                var step2xmin = oldxmin;
                var step2xmax = oldxmax;
                if(xminalt < 0){
                    this.pushRect(rect,xmin,oldxmin,ymin,ymax);
                } else if (xminalt > 0){
                    this.deleteRect(rect,oldxmin,xmin,oldymin,oldymax);
                    step2xmin = xmin;
                }
                if(xmaxalt > 0){
                    this.pushRect(rect,oldxmax,xmax,ymin,ymax);
                } else if (xmaxalt < 0){
                    this.deleteRect(rect,xmax,oldxmax,oldymin,oldymax);
                    step2xmax = xmax;
                }
                if(yminalt < 0){
                    this.pushRect(rect,step2xmin,step2xmax,ymin,oldymin);
                } else if(yminalt > 0){
                    this.deleteRect(rect,step2xmin,step2xmax,oldymin,ymin);
                }
                if(ymaxalt > 0){
                    this.pushRect(rect,step2xmin,step2xmax,oldymax,ymax);
                } else if(ymaxalt < 0){
                    this.deleteRect(rect,step2xmin,step2xmax,ymax,oldymax);
                }
            }
            rect.left=l;
            rect.right=r;
            rect.bottom=b;
            rect.top=t;
        }
    }
}