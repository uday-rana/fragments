const request = require('supertest');

const app = require('../../src/app');

describe('DELETE /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).delete('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .delete('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('fragment is successfully deleted', async () => {
    const rawData = Buffer.from('hello');

    const responseFromPOST = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .type('text/plain')
      .send(rawData);

    const createdFragmentId = responseFromPOST.body.fragment.id;

    const responseFromGET = await request(app)
      .get(`/v1/fragments/${createdFragmentId}/info`)
      .auth('user1@email.com', 'password1');

    const responseFromDELETE = await request(app)
      .delete(`/v1/fragments/${createdFragmentId}`)
      .auth('user1@email.com', 'password1');

    const responseFromGET2 = await request(app)
      .get(`/v1/fragments/${responseFromPOST.body.fragment.id}/info`)
      .auth('user1@email.com', 'password1');

    expect(responseFromGET.body.fragment).toEqual(responseFromPOST.body.fragment);

    expect(responseFromDELETE.statusCode).toBe(200);

    expect(responseFromGET2.statusCode).toBe(404);
  });

  test('should return 404 for invalid id', async () => {
    const responseFromDELETE = await request(app)
      .delete(`/v1/fragments/notARealFragment`)
      .auth('user1@email.com', 'password1');

    expect(responseFromDELETE.statusCode).toBe(404);
  });
});
