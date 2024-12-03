const request = require('supertest');

const app = require('../../src/app');
const hash = require('../../src/hash');
const { writeFragment, writeFragmentData, clear } = require('../../src/model/data/memory');

describe('GET /fragments', () => {
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
  test('should deny unauthenticated requests', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('should deny incorrect credentials', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('should return an array named fragments on success', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test("should return an array of user's fragment ids from the db", async () => {
    await writeFragment(testFragment);
    await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);

    const response = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');

    expect(response.body.status).toBe('ok');
    expect(response.body.fragments).toEqual(expect.arrayContaining([testFragment.id]));
  });

  test('should return expanded data matching the data in the db when the "expand" query parameter is passed', async () => {
    await writeFragment(testFragment);
    await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);

    const response = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');

    expect(response.body.status).toBe('ok');
    expect(response.body.fragments).toEqual(expect.arrayContaining([testFragment]));
  });

  test('should return unexpanded data when the "expand" query parameter is passed an unsupported value', async () => {
    await writeFragment(testFragment);
    await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);

    const response = await request(app)
      .get('/v1/fragments?expand=maybe')
      .auth('user1@email.com', 'password1');

    expect(response.body.status).toBe('ok');
    expect(response.body.fragments).toEqual(expect.arrayContaining([testFragment.id]));
  });
});
