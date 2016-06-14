// public variables
var $tasks; // jQuery reference to the ul of tasks
// var tasks = []; // stores information in Task objects, implement smart indexing later
var nTasks = 0;
var alarm;
var timeWeight = [3600, 60, 1];
// task constructor, constructs a task and adds it to the page
var Task = function (taskIndex) {
  var index = taskIndex;
  this.isCompleted = false;
  this.duration = -1; // time left in seconds
  var durations = [0, 0, 0];
  var timerInterval;
  var timeLeft;
  var barIncrement;
  var templates = []; // 0 - name input bar template, 1 - icons template,
                  // 2 - duration options template, 3 - alarm switch template
                  // 4 - delete button, 5 - save button
  var rows = []; // 0 - bar template, 1 - row 1, 2 - row 2
  var $task;

  // create templates for everything we'll need
  var $bar = $("<div>", {"class": "determinate", id: "bar_" + index, style: "width: 0%"});
  rows.push($("<div>", {"class": "progress"}).append($bar)); // bar row

  // ROW 1
  var $name = $("<input>", {id: "task_name_" + index, type: "text"});
  templates.push($("<div>", {"class": "input-field col s6"}).append( // name template
                        $name,
                        $("<label>", {for: "task_name_" + index, text: "Task"})));
  var $compl_checkbox = $("<input>", {type: "checkbox", id: "checkbox_" + index});
  var $compl_label = $("<label>", {for: "checkbox_" + index, text: "Incomplete", "class": "checkbox-label"});
  var $expand_btn = $("<a>", {"class": "btn-floating btn-tiny waves-effect waves-light icon grey expand-btn"}).append(
                      $("<i>", {"class": "material-icons", text: "add"}));
  var $play_btn = $("<a>", {"class": "btn-floating btn-tiny waves-effect waves-light red icon"}).append(
                      $("<i>", {"class": "material-icons", text: "play_circle_filled"}));
  var clockText = $("<span>", {text: "00:00:00", "class": "red-text"});
  templates.push($("<div>", {"class": "col s6"}).append( // icons template
                        $compl_checkbox, $compl_label,
                        $expand_btn,
                        $play_btn,
                        $("<a>", {"class": "btn-floating btn-tiny waves-effect waves-light red icon"}).append(
                          $("<i>", {"class": "material-icons icon tiny", text: "schedule"})),
                            clockText));
  rows.push($("<div>", {"class": "row"}).append(templates[0], templates[1])); // row 1

  // ROW 2
  var $time_table = $("<table>", {class: "time-table", id: "customTime_" + index, width: "200px"});
  var $time_row = $("<tr>");
  for(var i = 0; i < 3; i++) { // jshint ignore:line
    $time_row.append($("<td>", {class: "spinner"}).append(
                          $("<span>", {class: "caret", text: "\u25B2"}),
                          $("<input>", {type: "number", value: "00", readonly:""}),
                          $("<span>", {class: "caret", text: "\u25BC"})));
    if(i != 2){
      $time_row.append($("<td>").append($("<div>", {class: "colon", text: "\u003A"})));
    }
  }
  $time_table.append($time_row);

  templates.push($("<div>", {"class": "input-field col s6"}).append( // duration options template
                          $time_table, $("<label>", {text: "Duration"})));
  var $alarm_switch = $("<input>", {type: "checkbox"});
  templates.push($("<div>", {"class": "input-field col s6"}).append( // alarm options template
                      $("<div>", {"class": "switch"}).append(
                        $("<label>", {"class": "alarm"}).append(
                          $("<span>", {text: "Alarm Off"}),
                          $alarm_switch,
                          $("<span>", {"class": "lever"}),
                          $("<span>", {text: "Alarm On"})
                        ))));
  var $del_btn = $("<a>", {"class": "btn-floating waves-effect waves-light del_btn btn"}).append(
                      $("<i>", {"class": "material-icons", text: "delete"}));
  var $save_btn = $("<a>", {"class": "waves-effect waves-light btn", text: "Save"}).append(
                      $("<i>", {"class": "material-icons right", text: "input"}));
  rows.push($("<div>", {"class": "row"}).append(templates[2], templates[3],
                         $del_btn, $save_btn)); // row 2

  // attaches expanded task to page, assumes that tasks list has been initialized
  this.addTask = function () {
    $task = $("<li>", {id: "task_li_" + index, "class": "collection-item expanded"}).append(
                    rows[0], rows[1], rows[2]);
    $($task).hide().appendTo($tasks).slideDown("slow");
    $('select').material_select();
    console.log("task " + index + " added");

    // spinner listener code
    var spins = $(".spinner");
    for (var i = 0, len = spins.length; i < len; i++) {
      var spin = spins[i],
        span = $(spin).children("span"),
        input = $(spin).children("input");
      span[1].onclick = (function(input, i) { // jshint ignore:line
        return function() {
        time = wrapTime(parseInt($(input).val()) - 1);
        durations[i] = time;
        console.log("duration " + i + " assigned " + durations[i]);
        $(input).val(padDigits(
          time));
        };
      })(input, i);
      span[0].onclick = (function(input, i) { // jshint ignore:line
        return function () {
        time = wrapTime(parseInt($(input).val()) + 1);
        durations[i] = time;
        console.log("duration " + i + " assigned " + durations[i]);
        $(input).val(padDigits(
          time));
        };
      })(input, i);
    } //  end spinner listener code
  };

  this.playTimer = function() {
    if(timeLeft == null){ // jshint ignore:line
      for (var i = 0, len = durations.length; i < len; i++) {
        this.duration += durations[i] * timeWeight[i];
      }
      timeLeft = this.duration;
    }
    if(barIncrement == null) // jshint ignore:line
      barIncrement = 100 / timeLeft;
    if(timeLeft < 0)
      return;
    timerInterval = setInterval(function () {
      var timeStr = timeToStr(timeLeft);
      barToGo = 100 - barIncrement * timeLeft;
      $($bar).css("width", barToGo + "%");
      console.log(timeLeft);
      clockText.text(timeStr);
      timeLeft--;
      if(timeLeft <= -1){
        clearInterval(timerInterval);
        alarm.play();
        // if the task is incomplete, tell them!
        if(!$($compl_checkbox).checked)
          $task.css("background-color", "#ffcdd2"); // overdue warning
      }
    }, 1000); // call back every second
  };

  this.pauseTimer = function () {
    clearInterval(timerInterval);
  };

  // deletes the task
  $($del_btn).click(function () {
    //tasks = tasks.splice(index, 1); // remove the task from the tasks list
    console.log("task " + index + " deleted");
    $($task).slideUp("slow", function(){ $(this).remove(); });
  });

  // changes the state of the checkbox
  $($compl_checkbox).change(
    function(){
        if (this.checked) { // CAREFUL, THIS IS NO LONGER THE TASK ANYMORE
            $($bar).css("width", "100%");
            $($compl_label).text("Complete");
            $($task).css("background-color", "#c8e6c9");
        }
        else {
            $($bar).css({"width": "0%"});
            $($compl_label).text("Incomplete");
            $($task).css("background-color", "#fff");
        }
    });

  // saves everything and calculates stuff for the time
  $($save_btn).click($.proxy(function () {
    this.taskName = $($name).val();
    this.duration = durationTimes[$($duration).val()];
 },this));

  // expand the task view, maybe make this a minus in the future?
  $($expand_btn).click(function () {
    $(rows[2]).slideToggle();
    $task.toggleClass("expanded");
  });

  // play the timer
  $($play_btn).click($.proxy(function () {
    if($($play_btn).find("i").text() == "play_circle_filled"){
      $($play_btn).find("i").text("pause_circle_filled");
      this.playTimer();
    }
    else {
      $($play_btn).find("i").text("play_circle_filled");
      this.pauseTimer();
    }
  }, this));
}; // end of tasks class

// adds an expanded task when clicked
$("#add-more > a").click(function () {
  // create a new task, then append it
  var newTask = new Task(nTasks);
  nTasks++; // guarantees a good index, although this might not be so pretty after a while
  //tasks.push(newTask);
  newTask.addTask();
});

// helper functions
// pads a digit so it looks like a digital clock
function padDigits(number) {
  return ("00" + number).slice(-2);
}
// wraps times around from 59 -> 0 and 0 <- 59
function wrapTime (time) {
  if (time < 0)
    time += 60;
  return time % 60;
}
// change a time in seconds to a string (00:00:00)
function timeToStr(timeLeft) {
  seconds = timeLeft % 60;
  minutes = Math.floor(timeLeft / 60) % 60; // JS can't be forced to do integer division
  hours = Math.floor(minutes / 60) % 24; // limit for timer is one day
  timeStr = padDigits(hours) + ":" + padDigits(minutes) + ":" + padDigits(seconds);
  return timeStr;
}

$(document).ready(function() {
  // find the tasks on the page (later, we'll load tasks from local storage if they're there)
  $tasks = $('#tasks');
  // load sound
  alarm = new Audio("http://www.freesound.org/data/previews/198/198841_285997-lq.mp3");
});

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    'outerBounds': {
      'width': 800,
      'height': 600
    }
  });
});
