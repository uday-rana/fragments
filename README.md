# fragments

Fragments back-end API

## Running

To run the server, use the command `npm run start`.

```jsonc
// package.json

"scripts": {
  // ...
  "start": "node src/server.js",
  // ...
}
```

### Dev mode

To run the server in dev mode and automatically restart it when changes are made to the source code, use the command `npm run dev`.

```jsonc
// package.json

"scripts": {
  // ...
  "dev": "cross-env LOG_LEVEL=debug nodemon ./src/server.js --watch src",
  // ...
}
```

### Using a debugger

To attach a debugger (e.g. [VSCode](https://code.visualstudio.com/docs/editor/debugging)), configure it using  the `npm run debug` script. (Refer to debugger documentation)

```jsonc
// package.json

"scripts": {
  // ...
  "debug": "cross-env LOG_LEVEL=debug nodemon --inspect=0.0.0.0:9229 ./src/server.js --watch src"
  // ...
}
```

```jsonc
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

```jsonc
// package.json

"scripts": {
  // ...
  "lint": "eslint \"./src/**/*.js\"",
  // ...
}
```
