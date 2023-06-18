import requestHelper from '../helpers/requestHelper';
import createApp from '../../src/create-app';

const {
  get,
  server,
} = requestHelper(createApp());

const getPath = () => '/api/user';

afterAll(async () => {
  await server.close();
});

describe('[IT][GET] users', () => {
  it('GET', async () => {
    await get({
      path: getPath(),
    });

    expect(true).toBeTruthy();
  });
});
