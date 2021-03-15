            pickoLinking.linkFile("./scripts/framework/misc.js")
.then(() => pickoLinking.linkFile("./scripts/framework/global.js"))
.then(() => pickoLinking.linkFile("./scripts/framework/updating.js"))
.then(() => pickoLinking.linkFile("./scripts/framework/blitting.js"))
.then(() => pickoLinking.linkFile("./scripts/framework/input.js"))
.then(() => pickoLinking.linkFile("./scripts/framework/gamesystem.js"))
.then(() => pickoLinking.getLinkResolve()());