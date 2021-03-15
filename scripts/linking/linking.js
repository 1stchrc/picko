function pickoLinking(){
    var linkResolve = null;
    pickoLinking = {
        linkFile : function(filePath){
            var node = document.createElement("script");
            node.src = filePath;        
            document.body.appendChild(node);
            return new Promise(resolve => 
                node.addEventListener("load", () => {
                    node.remove();
                    resolve();
                })
            );
        },
        link : function(filePath){
            var node = document.createElement("script");
            node.src = filePath;
            var promise = new Promise(resolve => {linkResolve = () => {
                node.remove;
                linkResolve = null;
                resolve();
            };});
            document.body.appendChild(node);
            return promise;
        },
        getLinkResolve : function(){
            return linkResolve;
        }
    };
};
pickoLinking();