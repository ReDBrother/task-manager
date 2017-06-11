import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import app from '../src';

describe('requests', () => {
  let server;

  let firstName;
  let lastName;
  let email;
  let password;

  beforeAll(() => {
    jasmine.addMatchers(matchers);

    email = faker.internet.email();
    firstName = faker.name.firstName();
    lastName = faker.name.lastName();
    password = faker.internet.password();
  });

  beforeEach(() => {
    server = app().listen();
  });

  it('GET 200', async () => {
    const res1 = await request.agent(server)
      .get('/');
    const res2 = await request.agent(server)
      .get('/users');
    const res3 = await request.agent(server)
      .get('/users/new');
    const res4 = await request.agent(server)
      .get('/session/new');
    const res5 = await request.agent(server)
      .get('/tasks');
    const res6 = await request.agent(server)
      .get('/statuses');
    expect(res1).toHaveHTTPStatus(200);
    expect(res2).toHaveHTTPStatus(200);
    expect(res3).toHaveHTTPStatus(200);
    expect(res4).toHaveHTTPStatus(200);
    expect(res5).toHaveHTTPStatus(200);
    expect(res6).toHaveHTTPStatus(200);
  });

  it('GET 302', async () => {
    const res1 = await request.agent(server)
      .get('/my/account');
    const res2 = await request.agent(server)
      .get('/my/password');
    const res3 = await request.agent(server)
      .get('/tasks/new');
    const res4 = await request.agent(server)
      .get('/statuses/new');
    expect(res1).toHaveHTTPStatus(302);
    expect(res2).toHaveHTTPStatus(302);
    expect(res3).toHaveHTTPStatus(302);
    expect(res4).toHaveHTTPStatus(302);
  });

  it('Sign In', async () => {
    const form = { email, password };
    const res = await request.agent(server)
      .post('/session')
      .send({ form });
    expect(res).toHaveHTTPStatus(302);
  });

  it('Sign in (wrong password)', async () => {
    const wrongPassword = faker.internet.password();
    const form = { email, password: wrongPassword };
    const res = await request.agent(server)
      .post('/session')
      .send({ form });
    expect(res).toHaveHTTPStatus(302);
  });

  it('Sign up', async () => {
    const form = { email, firstName, lastName, password };
    const res = await request.agent(server)
      .post('/users')
      .send({ form });
    expect(res).toHaveHTTPStatus(302);
  });

  it('Sign Out', async () => {
    const res = await request.agent(server)
      .delete('/session');
    expect(res).toHaveHTTPStatus(302);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
