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

  test('data returned from GET contains data sent to POST', async () => {
    const rawData = Buffer.from('hello');
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .type('text/plain')
      .send(rawData);
    const getRes = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(getRes.body.fragments).toEqual(expect.arrayContaining([postRes.body.fragment.id]));
  });

  test('expanded data returned from GET matches data sent to POST', async () => {
    const rawData = Buffer.from('hello');
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .type('text/plain')
      .send(rawData);
    const getRes = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');
    expect(getRes.body.fragments).toEqual(expect.arrayContaining([postRes.body.fragment]));
  });

  test('"expand" query parameter passed any value other than 1 returns unexpanded data', async () => {
    const rawData = Buffer.from('hello');
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .type('text/plain')
      .send(rawData);
    const getRes = await request(app)
      .get('/v1/fragments?expand=maybe')
      .auth('user1@email.com', 'password1');
    expect(getRes.body.fragments).toEqual(expect.arrayContaining([postRes.body.fragment.id]));
  });
});
