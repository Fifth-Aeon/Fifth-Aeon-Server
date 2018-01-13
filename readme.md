# About
This is a server for a collectable card game written in typescript. You can find a corresponding client at <https://github.com/WilliamRitson/CCG-Client>. The game's core logic is shared between the client and the server. To facilitate this sharing it uses a [git submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules) which is hosted at <https://github.com/WilliamRitson/CCG-Model>.

# Install
Run `git clone --recursive https://github.com/WilliamRitson/CCG-Server.git
` to clone the project and its submodule (do this wherever you want the project stored on your computer).

Install [node](https://nodejs.org/en/) using an installer. This should also install npm.

Run `npm install -g gulp` to get gulp which is used to compile the projects TypeScript into JavaScript.

Finally run `npm install` within the project directory (the place you cloned it) to install the project's dependencies.

# Run
You can use `gulp watch` to automatically compile typescript.

You can use `npm start` to start the server (once typescript has been compiled).

In order to run a game, you to start at least a server and two clients. Run the `join` command from each client.