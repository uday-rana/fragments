const request = require('supertest');

const app = require('../../src/app');
const hash = require('../../src/hash');
const {
  writeFragment,
  writeFragmentData,
  clear,
  listFragments,
} = require('../../src/model/data/memory');

describe('DELETE /fragments', () => {
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
    request(app).delete('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .delete('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('should return 404 for invalid id', async () => {
    const response = await request(app)
      .delete(`/v1/fragments/notARealFragment`)
      .auth('user1@email.com', 'password1');

    expect(response.body.status).toBe('error');
    expect(response.statusCode).toBe(404);
  });

  test('fragment is successfully deleted', async () => {
    await writeFragment(testFragment);
    await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);

    const response = await request(app)
      .delete(`/v1/fragments/${testFragment.id}`)
      .auth('user1@email.com', 'password1');

    const result = await listFragments(testFragment.ownerId);

    expect(response.statusCode).toBe(200);
    expect(result).not.toContain(testFragment.id);
  });
});
