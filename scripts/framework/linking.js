function pickoLinkFile(type, filePath){
    var node = document.createElement(type);
    node.src = filePath;        
    document.body.appendChild(node);
    return new Promise(resolve => 
        node.addEventListener("load", () => {
            node.remove();
            resolve();
        })
    );
}