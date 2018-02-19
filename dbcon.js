var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs290_jadinc',
  password        : 'Fade2blk',
  database        : 'cs290_jadinc'
});

module.exports.pool = pool;