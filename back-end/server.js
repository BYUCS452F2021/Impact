const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "impact",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

//Project API
//Add a project
app.post("/api/projects", async (req, res) => {
  var sql = "INSERT INTO Project (UserID, ProjectName) VALUES (?, ?);";
  con.query(sql, [req.userId, req.title], function (err, result) {
    if (err)  {
      res.sendStatus(500);
      throw err;
    }
    console.log("1 record inserted");
    res.sendStatus(200);
    res.send(result);
  });
});

//Get all project
app.get("/api/projects", async (req, res) => {
  var sql = "SELECT * FROM Project;";
  con.query(sql, function (err, result) {
    if (err)  {
      sendStatus(500);
      throw err;
    }
    res.sendStatus(200);
    res.send(result)
    console.log("All records selected");
  });
});

//Delete the project
app.delete("/api/projects/:projectId", async (req, res) => {
  var sql = "DELETE * FROM Project WHERE ProjectID = ?;";
  con.query(sql, [req.params.projectId], function (err, result) {
    if (err) {
      res.sendStatus(500);
      throw err;
    }
    console.log("Record deleted");
    res.sendStatus(200);
    res.send(result);
  });
});

//Task API
//add a task
app.post('/api/projects/:projectID/timers', async (req, res) => {
  var sql = "INSERT INTO Task (ProjectID, TaskName) VALUES (?, ?);";
    try {
    con.query(sql, [req.params.projectID, req.body.title],
      function(error, results){});
    } catch (err) {
      console.error(`Error while creating task`, err.message);
      next(err);
    }
});

//get all tasks for a project
app.get("/api/projects/:projectID/timers", async (req, res) => {
  var sql = "SELECT * FROM Task WHERE ProjectID = ?;";
    con.query(sql, [req.params.projectID], function (error, results) {
      if (error) {
        console.error("Error while getting tasks for project", err.message);
        res.sendStatus(500);
        throw(error);
      }
    });
});

//Stop timer
app.put("/api/projects/:projectID/timers/:timerID/stop", async (req, res) => {
  var sqlSelect = "SELECT * FROM Task WHERE TaskID = ?";
  con.query(sqlSelect, [req.params.timerID], function (err, result) {
    if (err) {
      res.sendStatus(500);
      throw err;
    }
    console.log("Timer stopped");
    let task = result;
    task.TotalTime =
      task.TotalTime + (Date.now() / 1000 / 60 - timer.lastEdited / 1000 / 60);
    res.sendStatus(200);
  });
});

//update a task's TotalTime
// app.put('/api/tasks/:id', async (req, res) => {
//   var sql = 'UPDATE Task SET TotalTime = ? WHERE TaskID = ?';
//   try {
//     con.query(sql[
//       req.body.TotalTime, req.body.TaskID
//     ], function(error, results){});
//   } catch (err) {
//     console.error('Error while updating TotalTime', err.message);
//   }
// });

//start a task's timer
app.put("/api/projects/:projectID/timers/:timerID/start", async (req, res) => {
  var sql = "UPDATE Timer SET LastEdited = ? WHERE TaskID = ?;";
  con.query(sql, [Date.now(), req.body.timerName], function (err, result) {
    if (err) throw err;
    console.log("Error starting a timer");
  });  
});

//delete a task
app.delete("/api/projects/:projectID/timers/:timerID", async (req, res) => {
  var sql = "DELETE FROM Task WHERE TaskID = ?;";
  try {
    con.query(sql[req.body.timerName], function (error, results) {});
  } catch (err) {
    console.error("Error while deleting task", err.message);
  }
});

//Time API - implement post MVP 

//User API
//Register a User

app.post("/api/user/register", async (req, res) => {
  var sql =
    "INSERT INTO User (FirstName, LastName, UserName, Password) VALUES (?, ?, ?, ?);";
  console.log(req.body);
  con.query(
    sql,
    [
      req.body.firstName,
      req.body.lastName,
      req.body.username,
      req.body.password,
    ],
    function (err, result) {
      if (err) throw err;
      console.log(result);
      console.log("1 user inserted");
    }
  );
});

// login a user
app.get("/api/user/login", async (req, res) => {
  // Make sure that the form coming from the browser includes a username and a
  // password, otherwise return an error.
  if (!req.body.username || !req.body.password) return res.sendStatus(400);

  var sql = "SELECT * FROM User WHERE UserName = ? AND Password = ?;";
  console.log(req.body);
  con.query(
    sql,
    [req.body.username, req.body.password],
    function (err, result) {
      if (err) throw err;
      console.log(result);
      console.log("valid user found");
    }
  );
});

// // PROJECT API
// app.post('/api/projects', async (req, res) => {
//   const project = new Project({
//     title: req.body.title,
//   });
//   try {
//     await project.save();
//     res.sendStatus(200);
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(500);
//   }
// });

// app.get('/api/projects', async (req, res) => {
//   try {
//     let projects = await Project.find();
//     res.send(projects);
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(500);
//   }
// });

// app.delete('/api/projects/:projectID', async (req, res) => {
//   try {
//     let project = await Project.findOne({_id: req.params.projectID});
//     if (!project) {
//       res.send(404);
//       return;
//     }
//     let timers = await Timer.find({project:project});
//     for (timer of timers) {
//       await timer.delete();
//     }
//     await project.delete();
//     res.sendStatus(200);
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(500);
//   }
// });

// // TIMER API
// app.get('/api/timers', async (req, res) => {
//   try {
//     let timers = await Timer.find();
//     res.send(timers);
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(500);
//   }
// });

// app.post('/api/projects/:projectID/timers', async (req, res) => {
//   let project = await Project.findOne({ _id: req.params.projectID });
//   if (!project) {
//     res.send(404);
//     return;
//   }
//   const timer = new Timer({
//     project: project,
//     title: req.body.title,
//     active: false,
//     time: 0,
//     lastEdited: Date.now()
//   });
//   try {
//     await timer.save();
//     res.sendStatus(200);
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(500);
//   }
// });

// app.get('/api/projects/:projectID/timers', async (req, res) => {
//   try {
//     let project = await Project.findOne({ _id: req.params.projectID });
//     if (!project) {
//       res.send(404);
//       return;
//     }
//     let timers = await Timer.find({project:project});
//     res.send(timers);
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(500);
//   }
// });

// app.put('/api/projects/:projectID/timers/:timerID/start', async (req, res) => {
//   try {
//     let timer = await Timer.findOne({_id:req.params.timerID, project: req.params.projectID});
//     if (!timer) {
//       res.send(404);
//       return;
//     }
//     timer.active = true;
//     timer.lastEdited = Date.now();
//     await timer.save();
//     res.sendStatus(200);
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(500);
//   }
// });

// app.put('/api/projects/:projectID/timers/:timerID/stop', async (req, res) => {
//   try {
//     let timer = await Timer.findOne({_id:req.params.timerID, project: req.params.projectID});
//     if (!timer) {
//       res.send(404);
//       return;
//     }
//     timer.time = timer.time + ((Date.now() / 1000 / 60) - (timer.lastEdited / 1000 / 60));
//     timer.active = false;
//     timer.lastEdited = Date.now();
//     await timer.save();
//     res.sendStatus(200);
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(500);
//   }
// });

// app.delete('/api/projects/:projectID/timers/:timerID', async (req, res) => {
//   try {
//     let timer = await Timer.findOne({_id:req.params.timerID, project: req.params.projectID});
//     if (!timer) {
//       res.send(404);
//       return;
//     }
//     await timer.delete();
//     res.sendStatus(200);
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(500);
//   }
// });

app.listen(3000, () => console.log("Server listening on port 3000!"));
