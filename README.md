# fragments

Fragments back-end API

## Requirements

- Linux
- [Node.js v20.x 'Iron' (LTS)](https://nodejs.org/en)
- [Docker](https://www.docker.com/)
- [AWS CLI](https://aws.amazon.com/cli/)

## Running

### Docker Compose

This will run the server as a Docker container using HTTP Basic Auth, along with services for in-memory storage.

1. `docker compose up --build -d`

2. `./scripts/local-aws-setup.sh`

The server will run on port `8080`.

> [!TIP]
> To run the server with Docker Compose using AWS Cognito, replace the `HTPASSWD_FILE` environment variable in `docker-compose.yml` with the AWS Cognito environment variables. See the Environment Variables section below for more information.

### Standalone Container

This will run the server as a Docker container and store data in the **server's** memory.

`docker build -t fragments-ui .`

`docker container run [--rm] [--init] [-it] [-d] -p [8080]:8080 --env-file [.env] fragments`

### Run On Host Machine

See Scripts > Running below.

## Scripts

You can run these scripts with `npm run [script]`:

### Running

- `start`: Starts the server.
- `dev`: Runs a development server which reloads on changes to the source code.
- `debug`: Used to attach the VSCode Debugger. Not intended for manual use.

### Testing

- `test`: Runs all unit tests. Pass globs for test files you want to run as arguments.
- `test:watch` Run unit tests and watch for changes to related files.
- `test:coverage` - Runs all unit tests and generates code coverage report, found in `coverage/lcov-report/index.html`.
- `test:integration` - Runs all integration tests. The server must be running on `http://localhost:8080` with HTTP Basic Auth.

### Linting

- `lint`: Runs [ESLint](https://eslint.org/) on `.js` files in `src/` and `tests/`.

### Formatting

- `prettier`: Runs [Prettier](https://prettier.io/) on all files in the project directory.

## Environment Variables

Environment variables can be set to define the server's behavior.

- `LOG_LEVEL`: Controls amount of information logged. Can be set to `debug`, `info`, or other values supported by [Pino](https://getpino.io/#/docs/api).

- `API_URL`: Sets the URL for the Location header on responses.

### Authorization Config

- `AWS_COGNITO_POOL_ID`, `AWS_COGNITO_CLIENT_ID`: If supplied, the server will use AWS Cognito for authentication. Takes precedence over `HTPASSWD_FILE`.

- `HTPASSWD_FILE`: If supplied (and AWS Cognito variables are missing), HTTP Basic Auth will be used.

### Data Storage Config

- `AWS_REGION`: If supplied, will use S3 and DynamoDB for storage. Else, the server will store data in it's memory.

#### AWS Credentials

These are required for authorization when connecting to AWS services (including LocalStack and DynamoDB local).

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

They are set to `test` in `docker-compose.yml`.

#### S3

- `AWS_S3_ENDPOINT_URL`: If supplied, will use the given value as the S3 endpoint URL. Used in `docker-compose.yml` to point to `LocalStack S3`.

- `AWS_S3_BUCKET_NAME`: If supplied, will use the given value as the S3 bucket name. Used in `docker-compose.yml`.

#### DynamoDB

- `AWS_DYNAMODB_ENDPOINT_URL`: If supplied, will use the given value as the DynamoDB endpoint URL. Used in `docker-compose.yml` for using `DynamoDb local`.

- `AWS_DYNAMODB_TABLE_NAME`: If supplied, will use the given value as the DynamoDB table name. Used in `docker-compose.yml`.

## Documentation

- **Language:** [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- **Containerization:** [Docker](https://docs.docker.com/reference/)
- **AWS**:
  - **SDK:** [AWS SDK for JavaScript, Version 3](https://docs.aws.amazon.com/sdk-for-javascript/)
  - **CLI:** [AWS CLI](https://aws.amazon.com/cli/)
- **Server:** [Express](https://expressjs.com/en/4x/api.html)
  - **Logging:** [Pino](https://getpino.io/#/docs/api), [pino-pretty](https://github.com/pinojs/pino-pretty)
  - **Security:** [Helmet](https://helmetjs.github.io/), [Express/CORS](https://github.com/expressjs/cors#readme)
  - **Graceful Shutdown:** [Stoppable](https://github.com/hunterloftis/stoppable#readme)
- **Runtime:** [Node.js](https://nodejs.org/docs/latest-v20.x/api/)
- **Runners:** [nodemon](https://github.com/remy/nodemon#readme)
- **Package Manager:** [npm](https://docs.npmjs.com/)
- **Version Control System:** [Git](https://git-scm.com/doc), [GitHub](https://docs.github.com/)
- **CI/CD:** [GitHub Actions](https://docs.github.com/en/actions)
- **Testing:**
  - **Unit Testing:** [Jest](https://jestjs.io/)
    - **HTTP Testing Library:** [Supertest](https://github.com/ladjs/supertest#readme)
  - **Integration Testing:** [Hurl](https://hurl.dev/)
- **Linting:** [ESLint](https://eslint.org/docs/v9.x/)
- **Formatting:** [Prettier](https://prettier.io/docs/en/)
