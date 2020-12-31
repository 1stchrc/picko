this.linkFile = function linkFile(filePath) {
    var node = document.createElement("script");
    node.src = filePath;
    document.body.appendChild(node);
    return new Promise((resolve, reject) => {
        node.addEventListener("load", () => {
            node.remove();
            resolve();
        });
        node.addEventListener("error", () => {
            node.remove();
            reject();
        });
    });
};
