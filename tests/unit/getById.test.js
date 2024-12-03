const request = require('supertest');

const app = require('../../src/app');
const hash = require('../../src/hash');
const { convertBuffer } = require('../../src/model/conversions');
const { writeFragment, writeFragmentData, clear } = require('../../src/model/data/memory');

// Mock convertBuffer but retain other module exports
jest.mock('../../src/model/conversions', () => ({
  ...jest.requireActual('../../src/model/conversions'),
  convertBuffer: jest.fn(),
}));

describe('GET /fragments/:id', () => {
  const testFragmentData = Buffer.from('hello');
  const testFragment = {
    ownerId: hash('user1@email.com'),
    id: 'a',
    type: 'text/plain',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    size: 5,
  };

  beforeEach(() => {
    // Clear the in-memory databases
    clear();
    // Reset the mocks to empty functions
    jest.resetAllMocks();
  });

  // If the request is missing the Authorization header, it should be forbidden
  test('should deny unauthenticated requests', () =>
    request(app).get('/v1/fragments/someId').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('should deny incorrect credentials', () =>
    request(app)
      .get('/v1/fragments/someId')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('should respond with HTTP 404 when an invalid fragment id is passed', async () => {
    const res = await request(app)
      .get(`/v1/fragments/notARealId`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
  });

  test('should respond with HTTP 200 and return data matching the data in the db on success', async () => {
    convertBuffer.mockImplementation((buf) => {
      return Promise.resolve(buf.toString());
    });

    await writeFragment(testFragment);
    await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);

    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(response.statusCode).toBe(200);
    expect(response.text).toEqual(testFragmentData.toString());
  });

  test('should respond with HTTP 415 when unsupported conversion target extension is passed', async () => {
    convertBuffer.mockImplementation(() => {
      let err = new Error(`Invalid target extension`);
      err.status = 415;
      return Promise.reject(err);
    });

    await writeFragment(testFragment);
    await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);

    await request(app)
      .get(`/v1/fragments/${testFragment.id}.handlebars`)
      .auth('user1@email.com', 'password1')
      .expect(415);
  });
});
