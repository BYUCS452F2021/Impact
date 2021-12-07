const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// connect to the database
mongoose.connect("mongodb://localhost:27017/impact", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const taskSchema = new mongoose.Schema({
  TaskName: String,
  TotalTime: Number,
  Active: Boolean,
  LastEdited: Date
});
const Task = mongoose.model("Task", taskSchema);
const projectSchema = new mongoose.Schema({
  ProjectName: String,
  Tasks: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Task'
  }]
});
const Project = mongoose.model("Project", projectSchema);
const userSchema = new mongoose.Schema({
  Projects: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Project'
  }],
  FirstName: String,
  LastName: String,
  UserName: String,
  Password: String
});
const User = mongoose.model("User", userSchema);


//Project API
//Add a project
app.post("/api/projects", async (req, res) => {
  console.log("post /api/projects hit");

  const project = new Project({
    userId: req.body.userId,
    title: req.body.title,
  });

  try {
    await project.save();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

//Get all project
app.get("/api/projects/:userId", async (req, res) => {
  console.log("get /api/projects/:userId hit");

  try {
    let projects = await Project.find({ userId: req.params.userId });
    res.send(projects);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
  console.log("All records selected");
});

//Delete the project
app.delete("/api/projects/:projectId", async (req, res) => {
  console.log("delete /api/projects/:projectID hit");

  try {
    let project = await Project.findOne({ _id: req.params.projectId });
  }

  var sql = "DELETE FROM Task WHERE ProjectID = ?;";
  con.query(sql, [req.params.projectId], function (err, result) {
    if (err) {
      res.sendStatus(500);
      throw err;
    }
    var sql = "DELETE FROM Project WHERE ProjectID = ?;";
    con.query(sql, [req.params.projectId], function (err, result) {
      if (err) {
        res.sendStatus(500);
        throw err;
      }
      res.send(result);
    });
  });
});

//Task API
//add a task
app.post("/api/projects/:projectID/timers", async (req, res) => {
  console.log("post /api/projects/:projectID/timers hit");
  console.log(req.params.projectID);
  console.log(req.body.title);
  var sql =
    "INSERT INTO Task (ProjectID, TaskName, TotalTime) VALUES (?, ?, ?);";
  con.query(
    sql,
    [req.params.projectID, req.body.title, 0],
    function (err, results) {
      if (err) {
        res.sendStatus(500);
        throw err;
      }
      // res.sendStatus(200);
      res.send(results);
    }
  );
});

//get all tasks for a project
app.get("/api/projects/:projectID/timers", async (req, res) => {
  console.log("get /api/projects/:projectID/timers hit");
  console.log(req.params.projectID);

  var sql = "SELECT * FROM Task WHERE ProjectID = ?;";
  con.query(sql, [req.params.projectID], function (error, results) {
    if (error) {
      console.error("Error while getting tasks for project", err.message);
      res.sendStatus(500);
      throw error;
    }
    // res.sendStatus(200);
    results = JSON.parse(JSON.stringify(results));
    console.log(results);
    res.send(results);
  });
});

// start timer
app.put("/api/projects/:projectID/timers/:timerID/start", async (req, res) => {
  console.log("put /api/projects/:projectID/timers/:timerID/start hit");

  var sqlSelect = "SELECT * FROM Task WHERE TaskID = ?";
  con.query(sqlSelect, [req.params.timerID], function (err, result) {
    if (err) {
      res.sendStatus(500);
      throw err;
    }
    console.log("Timer started");
    let task = result;
    console.log(Date(task.LastEdited));
    task.LastEdited = Date.now(); // /1000 because this is milliseconds mysql needs seconds
    var sqlUpdateTime = "UPDATE Task SET Active = true WHERE TaskID = ?";
    console.log(task.TaskID);
    con.query(sqlUpdateTime, [req.params.timerID], function (err, result) {
      if (err) {
        res.sendStatus(500);
        throw err;
      }
      console.log(result);
      console.log("Time updated");
      console.log("about to update lastedited");
      var sqlUpdateLastEdited =
        "UPDATE Task SET LastEdited = NOW() WHERE TaskId = ?";
      con.query(
        sqlUpdateLastEdited,
        [req.params.timerID],
        function (err, result) {
          if (err) {
            res.sendStatus(500);
            throw err;
          }
          console.log(result);

          console.log("LastEdited updated");
          res.sendStatus(200);
        }
      );
    });
  });
});
//Stop timer
app.put("/api/projects/:projectID/timers/:timerID/stop", async (req, res) => {
  console.log("put /api/projects/:projectID/timers/:timerID/stop hit");

  var sqlSelect = "SELECT * FROM Task WHERE TaskID = ?";
  con.query(sqlSelect, [req.params.timerID], function (err, result) {
    if (err) {
      res.sendStatus(500);
      throw err;
    }
    console.log("Timer stopped");
    result = JSON.parse(JSON.stringify(result));
    console.log(result);
    let task = result[0];
    console.log(task);
    console.log(new Date(task.LastEdited).getTime());
    var sqlUpdateTime = "UPDATE Task SET Active = false WHERE TaskID = ?";
    console.log(task.TaskID);
    con.query(sqlUpdateTime, [req.params.timerID], function (err, result) {
      if (err) {
        res.sendStatus(500);
        throw err;
      }
      task.TotalTime =
        task.TotalTime +
        Math.floor((Date.now() - new Date(task.LastEdited).getTime()) / 1000);
      task.LastEdited = Date.now();
      var sqlUpdateTime = "UPDATE Task SET TotalTime = ? WHERE TaskID = ?";
      con.query(
        sqlUpdateTime,
        [task.TotalTime, task.TaskID],
        function (err, result) {
          if (err) {
            res.sendStatus(500);
            throw err;
          }
          console.log("Time updated");
          res.sendStatus(200);
        }
      );
    });
  });
});

//update a task's TotalTime
// app.put("/api/tasks/:id", async (req, res) => {
//   console.log("put /api/tasks/:id hit");

//   var sql = "UPDATE Task SET TotalTime = ? WHERE TaskID = ?";

//     con.query(sql)[(req.body.TotalTime, req.body.TaskID)],
//       function (err, results) {
//         if (err) {
//           res.sendStatus(500);
//           console.log("Error while updating TotalTime");
//           throw err;
//         }
//         // res.sendStatus(200);
//         res.send(results);
//       };
// });

//delete a task
app.delete("/api/projects/:projectID/timers/:timerID", async (req, res) => {
  console.log("delete /api/projects/:projectID/timers/:timerID hit");

  var sql = "DELETE FROM Task WHERE TaskID = ?;";
  con.query(sql, [req.params.timerID], function (err, result) {
    if (err) {
      res.sendStatus(500);
      throw err;
    }
    res.send(result);
  });
});

//Time API - implement post MVP

//User API
//Register a User

app.post("/api/user/register", async (req, res) => {
  console.log("post /api/user/register hit");

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
      if (err) {
        res.sendStatus(500);
        console.log("Error while registering user");
        throw err;
      }
      // res.sendStatus(200);
      console.log(result);
      result = JSON.parse(JSON.stringify(result));
      console.log(result);
      console.log({ user: result });
      res.send({ user: result });
    }
  );
});

// login a user
app.post("/api/user/login", async (req, res) => {
  // Make sure that the form coming from the browser includes a username and a
  // password, otherwise return an error.
  if (!req.body.username || !req.body.password) return res.sendStatus(400);

  var sql = "SELECT * FROM User WHERE UserName = ? AND Password = ?;";
  console.log(req.body);
  con.query(
    sql,
    [req.body.username, req.body.password],
    function (err, result) {
      if (err) {
        res.sendStatus(500);
        console.log("Error while logging in a user");
        throw err;
      } else {
        console.log("success finding user for login, trying to send result");
        // res.sendStatus(200);
        result = JSON.parse(JSON.stringify(result));
        console.log({ user: result[0] });
        res.send({ user: result[0] });
        console.log("valid user found");
      }
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
