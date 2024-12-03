const request = require('supertest');

const app = require('../../src/app');
const hash = require('../../src/hash');
const {
  writeFragment,
  writeFragmentData,
  clear,
  listFragments,
} = require('../../src/model/data/memory');

describe('DELETE /fragments/:id', () => {
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
    request(app).delete('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('should deny incorrect credentials', () =>
    request(app)
      .delete('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('should respond with HTTP 404 when an invalid fragment id is passed', async () => {
    const response = await request(app)
      .delete(`/v1/fragments/notARealFragment`)
      .auth(testUserEmail, testUserPasswd);

    expect(response.body.status).toBe('error');
    expect(response.statusCode).toBe(404);
  });

  test("should respond with HTTP 200 and remove fragment from user's fragments list on success", async () => {
    await writeFragment(testFragment);
    await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);

    const response = await request(app)
      .delete(`/v1/fragments/${testFragment.id}`)
      .auth(testUserEmail, testUserPasswd);

    const result = await listFragments(testFragment.ownerId);

    expect(response.statusCode).toBe(200);
    expect(result).not.toContain(testFragment.id);
  });
});
