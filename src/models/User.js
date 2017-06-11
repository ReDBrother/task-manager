import Sequelize from 'sequelize';
import moment from 'moment';
import encrypt from '../lib/secure';

export default connect => connect.define('User', {
  email: {
    type: Sequelize.STRING,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  passwordDigest: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: true,
    },
  },
  firstName: {
    type: Sequelize.STRING,
    field: 'first_name',
    validate: {
      notEmpty: true,
    },
  },
  lastName: {
    type: Sequelize.STRING,
    field: 'last_name',
    validate: {
      notEmpty: true,
    },
  },
  password: {
    type: Sequelize.VIRTUAL,
    set: function set(value) {
      this.setDataValue('passwordDigest', encrypt(value));
      this.setDataValue('password', value);
      return value;
    },
    validate: {
      len: [1, +Infinity],
    },
  },
}, {
  getterMethods: {
    fullName: function fullName() {
      return `${this.firstName} ${this.lastName}`;
    },
    created: function created() {
      return moment(this.createdAt)
        .format('MMMM Do YYYY, h:mm:ss a');
    },
  },
  freezeTableName: true, // Model tableName will be the same as the model name
});
