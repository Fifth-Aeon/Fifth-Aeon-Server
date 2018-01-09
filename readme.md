# About
This is a server for a collectable card game written in typescript. You can find a corresponding client at <https://github.com/WilliamRitson/CCG-Client>. The game's core logic is shared between the client and the server. To facilitate this sharing it uses a [git submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules) which is hosted at <https://github.com/WilliamRitson/CCG-Model>.

# Install
Requires [node](https://nodejs.org/en/), [npm](https://www.npmjs.com/) and [typescript](https://www.typescriptlang.org/) to be installed and avalible in your path.

Once you have npm run `npm install` to get the dependencies.

# Run
You can use `gulp watch` to automatically compile typescript.

You can use `npm start` to start the server (once typescript has been compiled).

In order to run a game, you to start at least a server and two clients. Run the `join` command from each client.