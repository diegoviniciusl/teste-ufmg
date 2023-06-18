import requestHelper from '../helpers/requestHelper';
import createApp from '../../src/create-app';

const getPath = () => '/api/user';

let get: any;
let server: any;

(async () => {
  const helper = requestHelper(await createApp());
  get = helper.get;
  server = helper.server;
})();

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
