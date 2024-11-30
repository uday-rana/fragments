const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('data returned contains data sent to POST', async () => {
    const rawData = Buffer.from('hello');

    const responseFromPOST = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .type('text/plain')
      .send(rawData);

    const responseFromGET = await request(app)
      .get('/v1/fragments')
      .auth('user1@email.com', 'password1');

    expect(responseFromGET.body.status).toBe('ok');
    expect(responseFromGET.body.fragments).toEqual(
      expect.arrayContaining([responseFromPOST.body.fragment.id])
    );
  });

  test('expanded data returned matches data sent to POST', async () => {
    const rawData = Buffer.from('hello');

    const responseFromPOST = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .type('text/plain')
      .send(rawData);

    const responseFromGET = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');

    expect(responseFromGET.body.status).toBe('ok');
    expect(responseFromGET.body.fragments).toEqual(
      expect.arrayContaining([responseFromPOST.body.fragment])
    );
  });

  test('"expand" query parameter passed unsupported value returns unexpanded data', async () => {
    const rawData = Buffer.from('hello');

    const responseFromPOST = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .type('text/plain')
      .send(rawData);

    const responseFromGET = await request(app)
      .get('/v1/fragments?expand=maybe')
      .auth('user1@email.com', 'password1');

    expect(responseFromGET.body.status).toBe('ok');
    expect(responseFromGET.body.fragments).toEqual(
      expect.arrayContaining([responseFromPOST.body.fragment.id])
    );
  });
});
