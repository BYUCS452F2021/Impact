const express = require("express");
const mysql = require("mysql");
const app = express();

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
app.post("/api/projects", async (req, res) => {
  var sql = "INSERT INTO Project (UserID, ProjectName) VALUES (?, ?);";
  con.query(sql, [req.userId, req.title], function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
});

app.get("/api/projects", async (req, res) => {
  var sql = "SELECT * FROM Project;";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("All records selected");
  });
});

//Task API
//add a task
app.post('/api/tasks', async (req, res) => {
  var sql = "INSERT INTO Task (ProjectID, TaskName, TotalTime) VALUES (?, ?, ?);";
    try {
    con.query(sql)[req.body.ProjectID, req.body.TaskName, req.body.TotalTime],
      function(error, results){};
    } catch (err) {
      console.error(`Error while creating task`, err.message);
      next(err);
    }
});

//get all tasks for a project
app.get('api/project/:id/tasks', async (req, res) => {
  var sql = "SELECT * FROM Task WHERE ProjectID = ?;";
  try {
    con.query(sql)[req.body.ProjectID], function(error, results){};
  } catch (err) {
    console.error('Error while getting tasks for project', err.message);
    next(err);
  }
});

//delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  var sql = 'DELETE FROM Task WHERE TaskID = ?;';
  try {
    con.query(sql)[
      req.body.TaskID    
    ], function(error, results){}; 
  } catch (err) {
      console.error('Error while deleting task', err.message);
  }
});

//Time API

//User API
app.post('/api/users/register', async (req, res) => {
  var sql = "INSERT INTO User (FirstName, LastName, UserName, Password) VALUES (?, ?, ?, ?);";
  con.query(sql, [
    req.body.firstName,
    req.body.lastName,
    req.body.username,
    req.body.password
  ], function (err, result) {
    if (err) throw err;
    console.log("1 user inserted");
  });
});



// login a user
app.post('/api/companies/login', async (req, res) => {
  // Make sure that the form coming from the browser includes a username and a
  // password, otherwise return an error.
  if (!req.body.username || !req.body.password)
    return res.sendStatus(400);

  try {
    //  lookup user record
    const company = await Company.findOne({
      username: req.body.username
    });
    // Return an error if user does not exist.
    if (!company)
      return res.status(403).send({
        message: "username or password is wrong"
      });

    // Return the SAME error if the password is wrong. This ensure we don't
    // leak any information about which users exist.
    if (!await company.comparePassword(req.body.password))
      return res.status(403).send({
        message: "username or password is wrong"
      });

    // set user session info
    req.session.companyID = company._id;
    return res.send({
      company: company
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
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
