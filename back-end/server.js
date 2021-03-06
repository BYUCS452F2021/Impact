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
  LastEdited: Date,
});
const Task = mongoose.model("Task", taskSchema);
const projectSchema = new mongoose.Schema({
  ProjectName: String,
  Tasks: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Task",
    },
  ],
});
const Project = mongoose.model("Project", projectSchema);
const userSchema = new mongoose.Schema({
  Projects: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Project",
    },
  ],
  FirstName: String,
  LastName: String,
  UserName: String,
  Password: String,
});

// This is a hook that will be called before a user record is saved,
// allowing us to be sure to salt and hash the password first.
userSchema.pre("save", async function (next) {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified("Password")) return next();

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
};

const User = mongoose.model("User", userSchema);

//Project API
//Add a project
app.post("/api/projects", async (req, res) => {
  console.log("post /api/projects hit");

  let user = null;
  let project = null;

  try {
    user = await User.findOne({ _id: req.body.userId });

    console.log("adding " + req.body.projectName + " as a new project");

    project = new Project({
      ProjectName: req.body.projectName,
      Tasks: [],
    });

    await project.save();

    if (!user) {
      res.send(404);
      return;
    }

    user.Projects.push(project);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }

  try {
    await user.save();
    res.status(200).send(project.toJSON());
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

//Get all project
app.get("/api/projects/:userId", async (req, res) => {
  console.log("get /api/projects/:userId hit");

  try {
    let user = await User.findOne({ _id: req.params.userId });
    const projects = user.Projects;
    const projectArray = [];
    for (const project of projects) {
      const userProject = await Project.findOne({ _id: project });
      projectArray.push(userProject);
    }
    res.send(projectArray);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
  console.log("All records selected");
});

//Delete the project
app.delete("/api/projects/:projectId/:userId", async (req, res) => {
  console.log("delete /api/projects/:projectID hit");

  try {
    const project = await Project.findOne({ _id: req.params.projectId });
    console.log("Project to delete: " + project);

    const user = await User.findOne({ _id: req.params.userId });

    if (!project || !user) {
      res.send(404);
      return;
    }

    let tasks = project.Tasks;
    for (const task of tasks) {
      const taskToDelete = Task.findOne({ _id: task });
      await Task.deleteOne(taskToDelete);
    }

    await Project.deleteOne(project);
    const index = user.Projects.indexOf(project._id);
    if (index != -1) {
      user.Projects.splice(index, 1);
    }

    await user.save();
    res.status(200).send(user.toJSON());
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

//Task API
//add a task
app.post("/api/projects/:projectID/timers", async (req, res) => {
  console.log("post /api/projects/:projectID/timers hit");
  console.log(req.params.projectID);
  console.log(req.body.title);

  //***************************************** */
  let task = new Task();
  let project = new Project();

  try {
    project = await Project.findOne({ _id: req.params.projectID });

    task = new Task({
      TaskName: req.body.title,
      TotalTime: 0,
      Active: false,
      LastEdited: null,
    });

    if (!project) {
      res.send(404);
      return;
    }

    task.save();
    project.Tasks.push(task);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
    return;
  }

  try {
    await project.save();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

//get all tasks for a project
app.get("/api/projects/:projectID/timers", async (req, res) => {
  console.log("get /api/projects/:projectID/timers hit");
  try {
    let project = await Project.findOne({ _id: req.params.projectID });
    const tasks = project.Tasks;
    const taskArray = [];
    for (const task of tasks) {
      const taskObject = await Task.findOne({ _id: task });
      taskArray.push(taskObject);
    }
    res.send(taskArray);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
  console.log("All records selected");
});

// start timer
app.put("/api/projects/:projectID/timers/:timerID/start", async (req, res) => {
  try {
    let timer = await Task.findOne({
      _id: req.params.timerID,
      project: req.params.projectID,
    });
    if (!timer) {
      res.send(404);
      return;
    }
    timer.Active = true;
    timer.LastEdited = Date.now();
    await timer.save();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

//Stop timer
app.put("/api/projects/:projectID/timers/:timerID/stop", async (req, res) => {
  try {
    let timer = await Task.findOne({
      _id: req.params.timerID,
      project: req.params.projectID,
    });
    if (!timer) {
      res.send(404);
      return;
    }
    timer.TotalTime =
      timer.TotalTime + (Date.now() / 1000 / 60 - timer.LastEdited / 1000 / 60);
    timer.Active = false;
    timer.LastEdited = Date.now();
    await timer.save();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

//delete a task
app.delete("/api/projects/:projectID/timers/:timerID", async (req, res) => {
  console.log("delete /api/projects/:projectID/timers/:timerID hit");

  try {
    const taskToDelete = await Task.findOne({ _id: req.params.timerID });
    const project = await Project.findOne({ _id: req.params.projectID });
    console.log(project);

    if (!project || !taskToDelete) {
      res.send(404);
      return;
    }

    const index = project.Tasks.indexOf(taskToDelete._id);
    if (index != -1) {
      project.Tasks.splice(index, 1);
    }

    await project.save();

    await Task.deleteOne(taskToDelete);
    res.status(200).send(taskToDelete.toJSON());
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
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
    Password: req.body.password,
  });
  let res1 = await user.save();
  console.log(res1.toJSON());
  res.send({
    user: res1,
  });
});

// login a user
app.post("/api/user/login", async (req, res) => {
  // Make sure that the form coming from the browser includes a username and a
  // password, otherwise return an error.
  if (!req.body.username || !req.body.password) return res.sendStatus(400);

  try {
    //  lookup user record
    const user = await User.findOne({
      UserName: req.body.username,
    });
    // Return an error if user does not exist.
    if (!user)
      return res.status(403).send({
        message: "username or password is wrong",
      });

    // Return the SAME error if the password is wrong. This ensure we don't
    // leak any information about which users exist.
    if (!(await user.comparePassword(req.body.password)))
      return res.status(403).send({
        message: "username or password is wrong",
      });
    return res.send({
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

app.listen(3000, () => console.log("Server listening on port 3000!"));
