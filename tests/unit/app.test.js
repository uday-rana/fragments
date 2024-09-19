const request = require('supertest');

const app = require('../../src/app');

describe('404 handler', () => {
  test('nonexistent routes return HTTP 404 response', () =>
    request(app).get('/notarealendpoint').expect(404));
});
