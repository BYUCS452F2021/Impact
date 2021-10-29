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

//Time API

//User API

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
