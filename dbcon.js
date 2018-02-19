var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : '<HOSTNAME>',
  user            : '<USERNAME>',
  password        : '<PASSWORD>',
  database        : '<DB>'
});

module.exports.pool = pool;
