const request = require('supertest');

const app = require('../../src/app');
const hash = require('../../src/hash');
const { writeFragment, writeFragmentData, clear } = require('../../src/model/data/memory');

describe('PUT /fragments/:id', () => {
  const testUserEmail = 'user1@email.com';
  const testUserPasswd = 'password1';
  const testFragmentData = Buffer.from('hello');
  const newFragmentData = Buffer.from('goodbye');
  const newFragmentDataSize = Buffer.byteLength(newFragmentData);
  const testFragment = {
    ownerId: hash(testUserEmail),
    id: 'a',
    type: 'text/plain',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    size: 5,
  };

  // Clear the in-memory databases before each test
  beforeEach(() => {
    clear();
  });

  // If the request is missing the Authorization header, it should be forbidden
  test('should deny unauthenticated requests', async () =>
    await request(app).put(`/v1/fragments/${testFragment.id}`).expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('should deny incorrect credentials', async () =>
    await request(app)
      .put(`/v1/fragments/${testFragment.id}`)
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('should respond with HTTP 404 when an invalid fragment id is passed', async () => {
    await request(app)
      .put(`/v1/fragments/notARealId`)
      .auth(testUserEmail, testUserPasswd)
      .type(testFragment.type)
      .expect(404);
  });

  describe('erroneous content-type header in request', () => {
    test("should respond with HTTP 400 when the request's content-type does not match the existing fragment's type", async () => {
      await writeFragment(testFragment);
      await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);

      await request(app)
        .put(`/v1/fragments/${testFragment.id}`)
        .auth(testUserEmail, testUserPasswd)
        .type('text/markdown')
        .send('# hello')
        .expect(400);
    });
    test("should respond with HTTP 415 when the request's content-type is unsupported", async () => {
      await writeFragment(testFragment);
      await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);

      await request(app)
        .put(`/v1/fragments/${testFragment.id}`)
        .auth(testUserEmail, testUserPasswd)
        .type('unsupported')
        .send('# hello')
        .expect(415);
    });

    test('should respond with HTTP 415 when the content-type header is not set on the request', async () => {
      await request(app)
        .put(`/v1/fragments/${testFragment.id}`)
        .auth(testUserEmail, testUserPasswd)
        .send(newFragmentData)
        .expect(415);
    });
  });

  test('should respond with HTTP 200, status: "ok", and updated fragment metadata on success', async () => {
    await writeFragment(testFragment);
    await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);

    const response = await request(app)
      .put(`/v1/fragments/${testFragment.id}`)
      .auth(testUserEmail, testUserPasswd)
      .type(testFragment.type)
      .send(newFragmentData);

    expect(response.statusCode).toBe(200);

    expect(response.body.status).toBe('ok');

    expect(response.body.fragment.id).toBe(testFragment.id);
    expect(response.body.fragment.ownerId).toBe(testFragment.ownerId);
    expect(Date.parse(response.body.fragment.created)).toEqual(Date.parse(testFragment.created));
    expect(Date.parse(response.body.fragment.updated)).toBeGreaterThan(
      Date.parse(testFragment.updated)
    );
    expect(response.body.fragment.type).toBe(testFragment.type);
    expect(response.body.fragment.size).toEqual(newFragmentDataSize);
  });
});
