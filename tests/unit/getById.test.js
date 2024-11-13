const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/someId').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/someId')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('data returned matches data sent to POST', async () => {
    const rawData = Buffer.from('hello');
    const responseFromPOST = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .type('text/plain')
      .send(rawData);
    const responseFromGET = await request(app)
      .get(`/v1/fragments/${responseFromPOST.body.fragment.id}`)
      .auth('user1@email.com', 'password1');
    expect(responseFromGET.body).toEqual(rawData);
  });

  test('invalid id parameter passed', async () => {
    const res = await request(app)
      .get(`/v1/fragments/notARealId`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });

  describe('type conversion', () => {
    test('markdown is successfully converted to html', async () => {
      const rawData = Buffer.from('# hello');

      const responseFromPOST = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .type('text/markdown')
        .send(rawData);

      const responseFromGET = await request(app)
        .get(`/v1/fragments/${responseFromPOST.body.fragment.id}.html`)
        .auth('user1@email.com', 'password1');

      expect(responseFromGET.headers['content-type']).toMatch(/^text\/html(?:;.*)?$/);
      expect(responseFromGET.headers['content-length']).toMatch('15');
      expect(responseFromGET.text).toEqual('<h1>hello</h1>\n');
    });

    test('responds with 415 for unsupported conversions', async () => {
      const rawData = Buffer.from('hello');

      const responseFromPOST = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .type('text/plain')
        .send(rawData);

      await request(app)
        .get(`/v1/fragments/${responseFromPOST.body.fragment.id}.handlebars`)
        .auth('user1@email.com', 'password1')
        .expect(415);
    });
  });
});
