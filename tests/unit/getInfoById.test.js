const request = require('supertest');

const app = require('../../src/app');
const hash = require('../../src/hash');
const { writeFragment, writeFragmentData, clear } = require('../../src/model/data/memory');

describe('GET /fragments/:id/info', () => {
  const testFragmentData = Buffer.from('hello');
  const testFragment = {
    ownerId: hash('user1@email.com'),
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
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/someId/info').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/someId/info')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('invalid id parameter passed', async () => {
    const res = await request(app)
      .get(`/v1/fragments/notARealId/info`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
  });

  test('data returned matches data sent to POST', async () => {
    await writeFragment(testFragment);
    await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);

    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}/info`)
      .auth('user1@email.com', 'password1');

    expect(response.body.status).toBe('ok');
    expect(response.body.fragment).toEqual(testFragment);
  });
});
