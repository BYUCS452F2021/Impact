const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const argon2 = require("argon2");
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

// This is a hook that will be called before a user record is saved,
// allowing us to be sure to salt and hash the password first.
userSchema.pre('save', async function (next) {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified('Password'))
    return next();

  try {
    // generate a hash. argon2 does the salting and hashing for us
    const hash = await argon2.hash(this.Password);
    // override the plaintext password with the hashed one
    this.Password = hash;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// This is a method that we can call on User objects to compare the hash of the
// password the browser sends with the has of the user's true password stored in
// the database.
userSchema.methods.comparePassword = async function (password) {
  try {
    // note that we supply the hash stored in the database (first argument) and
    // the plaintext password. argon2 will do the hashing and salting and
    // comparison for us.
    const isMatch = await argon2.verify(this.Password, password);
    return isMatch;
  } catch (error) {
    return false;
  }
};

// This is a method that will be called automatically any time we convert a user
// object to JSON. It deletes the password hash from the object. This ensures
// that we never send password hashes over our API, to avoid giving away
// anything to an attacker.
userSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.Password;
  return obj;
}

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
// app.delete("/api/projects/:projectId", async (req, res) => {
//   console.log("delete /api/projects/:projectID hit");

//   try {
//     let project = await Project.findOne({ _id: req.params.projectId });
//   }

//   var sql = "DELETE FROM Task WHERE ProjectID = ?;";
//   con.query(sql, [req.params.projectId], function (err, result) {
//     if (err) {
//       res.sendStatus(500);
//       throw err;
//     }
//     var sql = "DELETE FROM Project WHERE ProjectID = ?;";
//     con.query(sql, [req.params.projectId], function (err, result) {
//       if (err) {
//         res.sendStatus(500);
//         throw err;
//       }
//       res.send(result);
//     });
//   });
// });

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

  const user = new User({
    FirstName: req.body.firstName,
    LastName: req.body.lastName,
    UserName: req.body.username,
    Password: req.body.password
  });
  let res1 = await user.save();
  console.log(res1.toJSON());
  res.send({
    user: res1
  });
});

// login a user
app.post('/api/user/login', async (req, res) => {
  // Make sure that the form coming from the browser includes a username and a
  // password, otherwise return an error.
  if (!req.body.username || !req.body.password)
    return res.sendStatus(400);

  try {
    //  lookup user record
    const user = await User.findOne({
      UserName: req.body.username
    });
    // Return an error if user does not exist.
    if (!user)
      return res.status(403).send({
        message: "username or password is wrong"
      });

    // Return the SAME error if the password is wrong. This ensure we don't
    // leak any information about which users exist.
    if (!await user.comparePassword(req.body.password))
      return res.status(403).send({
        message: "username or password is wrong"
      });
    return res.send({
      user: user
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

app.listen(3000, () => console.log("Server listening on port 3000!"));
