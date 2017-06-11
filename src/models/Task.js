import Sequelize from 'sequelize';
import moment from 'moment';

export default connect => connect.define('Task', {
  name: {
    type: Sequelize.STRING,
    unique: true,
    validate: {
      notEmpty: true,
    },
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
  },
  statusId: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
    validate: {
      notEmpty: true,
    },
    allowNull: false,
  },
  creatorId: {
    type: Sequelize.INTEGER,
    validate: {
      notEmpty: true,
    },
    allowNull: false,
  },
  assignedToId: {
    type: Sequelize.INTEGER,
  },
}, {
  getterMethods: {
    created: function created() {
      return moment(this.createdAt)
        .format('MMMM Do YYYY, h:mm:ss a');
    },
  },
  freezeTableName: true,
});
