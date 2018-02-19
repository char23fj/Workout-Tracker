var express = require('express');

var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 4892);

app.use(express.static('static'));

//Reset the table
app.get('/reset-table', function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "date DATE,"+
    "reps INT,"+
    "weight INT,"+
    "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    });
  });
});

//Render home page
app.get('/',function(req,res,next){
  var context = {};
  mysql.pool.query("SELECT `id`, `name`, DATE_FORMAT(`date`, '%b %d, %Y') AS `date1`,"
  + " `reps`, `weight`, `lbs`, DATE_FORMAT(`date`,'%Y-%m-%d') AS `date` FROM workouts",
  function(err, rows, fields){
    if(err){
      next(err);
      return;
    }

    for (var x = 0; x < rows.length; x++)
    {
      if (rows[x].lbs === 1)
      {
        rows[x].units = "lbs";
      }
      else
      {
        rows[x].units = "kg";
      }
    }
    context.results = rows;
    res.render('home', context);

  });
});

//Insert a workout
app.get('/insert',function(req,res,next){
  mysql.pool.query("INSERT INTO workouts (`name`, `date`, `reps`, `weight`, `lbs`)"
  + "VALUES (?, ?, ?, ?, ?)", [req.query.name,req.query.date, req.query.reps, 
   req.query.weight, req.query.lbs], function(err, result){
    if(err){
      next(err);
      return;
    }

    var context = {};
    mysql.pool.query("SELECT `id`, `name`, DATE_FORMAT(`date`, '%b %d, %Y') AS `date1`,"
     + " `reps`, `weight`, `lbs`, DATE_FORMAT(`date`,'%Y-%m-%d') AS `date` FROM workouts"
     + " WHERE id=?", result.insertId, function(err, rows, fields){
      for (var x = 0; x < rows.length; x++)
      {
        if (rows[x].lbs === 1)
        {
          rows[x].units = "lbs";
        }
        else
        {
          rows[x].units = "kg";
        }
      }
      context.results = JSON.stringify(rows[0]);
      
      res.type('text/plain');
      res.send(context.results);
      console.log(context.results);
    });
  });
});

//Delete a workout
app.get('/delete',function(req,res,next){
  mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.query.id], 
  function(err, result){
    if(err){
      next(err);
      return;
    }
    if (result.affectedRows)
    {
      res.type('text/plain');
      res.send([req.query.id]);
    }
    else
    {
      res.send(null);
    }
  });
});

//Edit a workout
app.get('/update',function(req,res,next){
  //Select the row
  mysql.pool.query("SELECT * FROM todo WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];

      //Update the row
      mysql.pool.query("UPDATE workouts SET name=?, date=?, reps=?, weight=?, lbs=? "
      + " WHERE id=?", [req.query.name || curVals.name, req.query.date || 
      curVals.date, req.query.reps || curVals.reps, req.query.weight || 
      curVals.weight, req.query.lbs || curVals.lbs, req.query.id || curVals.id],
      function(err, result){
        if(err){
          console.log("err");
          next(err);
          return;
        }
        console.log(result);
        //Execute next if any rows are changed
        if (result.changedRows)
        {
          var context = {};
          console.log(result.changedRows);
          //Select the updated row and send it to the client
          mysql.pool.query("SELECT `id`, `name`, DATE_FORMAT(`date`, '%b %d, %Y') AS `date1`,"
          + " `reps`, `weight`, `lbs`, DATE_FORMAT(`date`,'%Y-%m-%d') AS `date` FROM workouts"
          + " WHERE id=?", [req.query.id], function(err, rows, fields){
            if(err){
              next(err);
              return;
            }
            for (var x = 0; x < rows.length; x++)
            {
              if (rows[x].lbs === 1)
              {
                rows[x].units = "lbs";
              }
              else
              {
                rows[x].units = "kg";
              }
            }
            context.results = JSON.stringify(rows[0]);

            res.type('text/plain');
            res.send(context.results);
          });
        }
      });
    }
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://flip2.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
});
