import welcome from './welcome';
import users from './users';
import sessions from './sessions';
import account from './account';
import tasks from './tasks';

const controllers = [welcome, users, sessions, account, tasks];

export default (router, container) => controllers.forEach(f => f(router, container));
