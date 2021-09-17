
function Timer({ name }) {
  return (
    <div className="timer">
      <div className="timer-start">
        Start
      </div>
      <div className="timer-name">
        {name}
      </div>
      <div className="timer-time-elapsed">
        1:00
      </div>
      <div className="timer-delete">
        Delete
      </div>
      
    </div>
  );
}

export default Timer;