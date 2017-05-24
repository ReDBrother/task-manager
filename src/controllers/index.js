import welcome from './welcome';
import users from './users';
import sessions from './sessions';
import account from './account';

const controllers = [welcome, users, sessions, account];

export default (router, container) => controllers.forEach(f => f(router, container));
