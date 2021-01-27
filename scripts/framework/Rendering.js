var Rendering = function(){
    var renderingCanvas = document.createElement("canvas");
    renderingCanvas.width = 128;
    renderingCanvas.height = 72;
    var screenCtx = renderingCanvas.getContext("2d");
    screenCtx.setTransform(1,0,0,-1,0,renderingCanvas.height);
    var desX = 0;
    var desY = 0;
    var desWidth = Global.onscreenCanvas.width;
    var desHeight = Global.onscreenCanvas.height;
    var imgSmooth = false;
    function lateRender(){
        Global.onscreenCanvasContext.drawImage(renderingCanvas,desX,desY,desWidth,desHeight);
    }
    Updating.startLateRenderRoutine(Symbol("__render"),32,lateRender);
    Rendering = {
        setScreenScale : function(width, height){
            renderingCanvas.width = width; 
            renderingCanvas.height = height;
            screenCtx.setTransform(1,0,0,-1,0,height);
            screenCtx.imageSmoothingEnabled = imgSmooth;
        },
        getScreenWidth : function(){return renderingCanvas.width},
        getScreenHeight : function(){return renderingCanvas.height},
        getScreenContext : function(){return screenCtx},
        setBlitOptions : function(dx,dy,dWidth,dHeight){
            desX = dx;
            desY = dy;
            desWidth = dWidth;
            desHeight = dHeight;
        },
        setImageSmoothing : function(flag){
            imgSmooth = flag;
            screenCtx.imageSmoothingEnabled = imgSmooth;
        }
    };
};
Rendering();