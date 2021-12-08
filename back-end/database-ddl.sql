CREATE TABLE User (
	UserID int NOT NULL AUTO_INCREMENT,
	FirstName varchar(255) NOT NULL,
	LastName varchar(255) NOT NULL,
	UserName varchar(255) NOT NULL,
	Password varchar(255) NOT NULL,
	PRIMARY KEY (UserID)
);

CREATE TABLE Project (
	ProjectID int NOT NULL AUTO_INCREMENT,
	UserID int NOT NULL,
	ProjectName varchar(255) NOT NULL,
	PRIMARY KEY (ProjectID),
	FOREIGN KEY (UserID) REFERENCES User(UserID)
);

CREATE TABLE Task(
	TaskID int NOT NULL AUTO_INCREMENT,
	ProjectID int NOT NULL,
	TaskName varchar(255) NOT NULL,
	TotalTime int DEFAULT 0,
	Active BOOLEAN DEFAULT false,
	LastEdited DATETIME,
	PRIMARY KEY(TaskID),
	FOREIGN KEY(ProjectID) REFERENCES Project(ProjectID)
);

CREATE TABLE Time(
  TimeID INT NOT NULL AUTO_INCREMENT,
  TaskID INT NOT NULL,
  StartTimestamp DATETIME NOT NULL,
  EndTimestamp DATETIME,
  PRIMARY KEY (TimeID),
  FOREIGN KEY (TaskID) REFERENCES Task(TaskID)
);
