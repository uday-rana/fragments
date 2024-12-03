const request = require('supertest');

const app = require('../../src/app');

describe('404 handler', () => {
  test('should respond with HTTP 404 when a nonexistent endpoint is requested', () =>
    request(app).get('/notarealendpoint').expect(404));
});
