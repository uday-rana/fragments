# fragments

Fragments back-end API

## Running

To run the server, use the command `npm run start`.

```js
// package.json

"scripts": {
  // ...
  "start": "node src/server.js",
  // ...
}
```

### Dev mode

To run the server in dev mode and restart it when changes are made to the code, use the command `npm run dev`.

```js
// package.json

"scripts": {
  // ...
  "dev": "cross-env LOG_LEVEL=debug nodemon ./src/server.js --watch src",
  // ...
}
```

To attach a debugger (e.g. VSCode), configure it using  the `npm run debug` script.

```js
// package.json

"scripts": {
  // ...
  "debug": "cross-env LOG_LEVEL=debug nodemon --inspect=0.0.0.0:9229 ./src/server.js --watch src"
  // ...
}
```

```js
// .vscode/launch.json

{
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    // Start the app and attach the debugger
    {
      "name": "Debug via npm run debug",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run-script", "debug"],
      "skipFiles": ["<node_internals>/**"],
      "type": "node"
    }
  ]
}
```

## Linting

To lint the code using [ESLint](https://eslint.org/), use the command `npm run lint`.

```js
// package.json

"scripts": {
  // ...
  "lint": "eslint \"./src/**/*.js\"",
  // ...
}
```
