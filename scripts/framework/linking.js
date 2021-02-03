function pickoLinkFile(filePath){
    var node = document.createElement("script");
    node.src = filePath;        
    document.body.appendChild(node);
    return new Promise(resolve => 
        node.addEventListener("load", () => {
            node.remove();
            resolve();
        })
    );
}