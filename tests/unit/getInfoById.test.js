const request = require('supertest');

const app = require('../../src/app');

describe('GET /fragments/:id/info', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/someId/info').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/someId/info')
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
      .get(`/v1/fragments/${responseFromPOST.body.fragment.id}/info`)
      .auth('user1@email.com', 'password1');

    expect(responseFromGET.body.status).toBe('ok');
    expect(responseFromGET.body.fragment).toEqual(responseFromPOST.body.fragment);
  });

  test('invalid id parameter passed', async () => {
    const res = await request(app)
      .get(`/v1/fragments/notARealId/info`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
  });
});
