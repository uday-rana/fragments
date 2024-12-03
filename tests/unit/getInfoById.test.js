const request = require('supertest');

const app = require('../../src/app');
const hash = require('../../src/hash');
const { writeFragment, writeFragmentData, clear } = require('../../src/model/data/memory');

describe('GET /fragments/:id/info', () => {
  const testUserEmail = 'user1@email.com';
  const testUserPasswd = 'password1';
  const testFragmentData = Buffer.from('hello');
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
  test('should deny unauthenticated requests', () =>
    request(app).get('/v1/fragments/someId/info').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('should deny incorrect credentials', () =>
    request(app)
      .get('/v1/fragments/someId/info')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('should respond with HTTP 404 when an invalid fragment id is passed', async () => {
    const res = await request(app)
      .get(`/v1/fragments/notARealId/info`)
      .auth(testUserEmail, testUserPasswd);

    expect(res.statusCode).toBe(404);
  });

  test('should respond with HTTP 200, return status: "ok" in response, and return data matching the data in the db on success', async () => {
    await writeFragment(testFragment);
    await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);

    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}/info`)
      .auth(testUserEmail, testUserPasswd);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.fragment).toEqual(testFragment);
  });
});
