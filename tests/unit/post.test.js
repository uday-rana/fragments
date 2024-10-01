const request = require('supertest');
const app = require('../../src/app');
const hash = require('../../src/hash');

// Wait for a certain number of ms. Feel free to change this value
// if it isn't long enough for your test runs. Returns a Promise.
const wait = async (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));

describe('POST /v1/fragments', () => {
  // test conditions:
  // - auth: authenticated/invalid user info/no user info
  // - file: raw binary data (buffer)/non raw binary data (not buffer)/no file
  // - content-type header: supported/not supported/not set
  describe('happy path', () => {
    test('authenticated users posting raw binary data of supported content-type get successful response', async () => {
      const rawData = Buffer.from('hello');
      const ownerEmail = 'user1@email.com';
      const dateBeforeReq = new Date();
      await wait();
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .type('text/plain')
        .send(rawData);
      const expectedLocationURL = `https://${process.env?.API_URL}/v1/fragments/${res.body.fragment.id}`;
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('ok');
      expect(res.body.fragment.ownerId).toStrictEqual(hash(ownerEmail));
      expect(res.body.fragment.size).toStrictEqual(Buffer.byteLength(rawData));
      expect(Date.parse(res.body.fragment.created)).toBeGreaterThan(Date.parse(dateBeforeReq));
      expect(Date.parse(res.body.fragment.updated)).toBeGreaterThan(Date.parse(dateBeforeReq));
      expect(res.headers.location).toStrictEqual(expectedLocationURL);
    });
  });

  describe('erroneous data in request body', () => {
    test('non-buffer data sent in request body', async () => {
      const rawData = 'hello';
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .type('plain/text')
        .send(rawData);
      expect(res.statusCode).toBe(415);
    });

    test('no data sent in request body', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .type('plain/text');
      expect(res.statusCode).toBe(415);
    });
  });

  describe('erroneous content-type header in request', () => {
    test('unsupported content-type set in request header', async () => {
      const rawData = Buffer.from('hello');
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .type('hmmm')
        .send(rawData);
      expect(res.statusCode).toBe(415);
    });

    test('content-type not set in request header', async () => {
      const rawData = Buffer.from('hello');
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .send(rawData);
      expect(res.statusCode).toBe(415);
    });
  });

  describe('unauthorized requests', () => {
    // If the request is missing the Authorization header, it should be forbidden
    test('unauthenticated requests are denied', () =>
      request(app).post('/v1/fragments').expect(401));

    // If the wrong username/password pair are used (no such user), it should be forbidden
    test('incorrect credentials are denied', () =>
      request(app)
        .post('/v1/fragments')
        .auth('invalid@email.com', 'incorrect_password')
        .expect(401));
  });
});
