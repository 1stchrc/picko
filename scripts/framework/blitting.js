var pickoBlitting = function(){
    var renderingCanvas = document.createElement("canvas");
    renderingCanvas.width = 128;
    renderingCanvas.height = 72;
    var screenCtx = renderingCanvas.getContext("2d");
    screenCtx.setTransform(1,0,0,-1,0,renderingCanvas.height);
    var desX = 0;
    var desY = 0;
    var desWidth = pickoGlobal.onscreenCanvas.width;
    var desHeight = pickoGlobal.onscreenCanvas.height;
    var imgSmooth = false;
    function lateRender(){
        pickoGlobal.onscreenCanvasContext.drawImage(renderingCanvas,desX,desY,desWidth,desHeight);
    }
    pickoUpdating.startLateRenderRoutine(Symbol("__blit"),32,lateRender);
    pickoBlitting = {
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
pickoBlitting();