var linkFile = {linking : function(){
    var fileOnLinking = null;
    var currentCallback = null;
    var _finishLink = function(){
        fileOnLinking.remove();
        if(currentCallback != null)
            currentCallback();
    }
    return function(filePath,callback = null){
        var node = document.createElement("script");
        fileOnLinking = node;
        currentCallback = callback;
        node.src = filePath;
        node.addEventListener("load",_finishLink);
        document.body.appendChild(node);
    };
}};
linkFile = linkFile.linking();
