// public variables
var $tasks; // jQuery reference to the ul of tasks
// var tasks = []; // stores information in Task objects, implement smart indexing later
var nTasks = 0;
var durationText = ["5 seconds",
                      "2 minutes", "15 minutes", "Enter my time"];
var durationTimes = [5, 120, 900, 0]; // durations in  seconds

// task constructor, constructs a task and adds it to the page
var Task = function (taskIndex) {
  var index = taskIndex;
  this.isCompleted = false;
  this.duration = 0;
  var timerInterval;
  var timeLeft;
  var barIncrement;
  templates = []; // 0 - name input bar template, 1 - icons template,
                  // 2 - duration options template, 3 - alarm switch template
                  // 4 - delete button, 5 - save button
  rows = []; // 0 - bar template, 1 - row 1, 2 - row 2, 3 - row 4 (missing row 3 = description)
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

  var $duration = $("<select>");
  for(var i = 0; i < durationText.length; i++) { // jshint ignore:line
    $duration.append($("<option>", {value: i, text: durationText[i]}));
  }
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
  rows.push($("<div>", {"class": "row"}).append(templates[2], templates[3],
                         $("<button>", {"class": "btn waves-effect waves-light del_btn", text: "Delete"}),
                         $("<button>", {"class": "btn waves-effect waves-light", type: "submit", name: "action", text: "Save"}))); // row 2

  // ROW 4
  var $del_btn = $("<button>", {"class": "btn waves-effect waves-light del_btn", text: "Delete"});
  templates.push($("<div>", {"class": "col s3 offset-s6"}).append(
                      $del_btn));
  var $save_btn = $("<button>", {"class": "btn waves-effect waves-light save_btn", type: "submit", name: "action", text: "Save"});
  templates.push($("<div>", {"class": "col s3"}).append(
                      $save_btn));
  rows.push($("<div>", {"class": "row"}).append(templates[4], templates[5])); // row 4


  //rows.push($("<div>", {"class": "row"}).append($time_table));

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
    span[1].onclick = (function(input) { // jshint ignore:line
      return function() {
      $(input).val(padDigits(
        wrapTime(parseInt($(input).val()) - 1)));
      };
    })(input);
    span[0].onclick = (function(input) { // jshint ignore:line
      return function () {
      $(input).val(padDigits(
        wrapTime(parseInt($(input).val()) + 1)));
      };
    })(input);
    }
  };

  var expand = function () {
    $(rows[3]).slideDown("slow");
    $(rows[2]).slideDown("slow");
    $task.addClass("expanded");
    $($expand_btn).addClass("disabled");
  };

  var contract = function () {
    $(rows[3]).slideUp("slow");
    $(rows[2]).slideUp("slow");
    $task.removeClass("expanded");
    $($expand_btn).removeClass("disabled");
  };

  var save = function () {
    this.taskName = $($name).val();
    this.duration = durationTimes[$($duration).val()];
  };

  var padDigits = function (number) {
    return ("00" + number).slice(-2);
  };

  function wrapTime (time) {
    if (time < 0)
      time += 60;
    return time % 60;
  }

  // change a time in seconds to a string (00:00:00)
  var timeToStr = function (timeLeft) {
    seconds = timeLeft % 60;
    minutes = Math.floor(timeLeft / 60) % 60; // JS can't be forced to do integer division
    hours = Math.floor(minutes / 60) % 24; // limit for timer is one day
    timeStr = padDigits(hours) + ":" + padDigits(minutes) + ":" + padDigits(seconds);
    return timeStr;
  };

  var playTimer = function () {
    if(timeLeft < 0)
      return;
    if(timeLeft == null) // jshint ignore:line
      timeLeft = this.duration; // time left in seconds
    if(barIncrement == null) // jshint ignore:line
      barIncrement = 100 / timeLeft;
    timerInterval = setInterval(function () {
      var timeStr = timeToStr(timeLeft);
      barToGo = 100 - barIncrement * timeLeft;
      $($bar).css("width", barToGo + "%");
      clockText.text(timeStr);
      timeLeft--;
      if(timeLeft <= -1){
        clearInterval(timerInterval);
        // if the task is incomplete, tell them!
        if(!$($compl_checkbox).checked)
          $task.css("background-color", "#ffcdd2"); // overdue warning
      }
    }, 1000); // call back every second
  };

  var pauseTimer = function () {
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
  $($save_btn).click(function () {
    contract();
    save(); // save all the elements of the task
  });

  // expand the task view, maybe make this a minus in the future?
  $($expand_btn).click(function () {
    $(rows[3]).slideToggle(); // easier to do this than to use the expand/contract methods
    $(rows[2]).slideToggle();
  });

  // play the timer
  $($play_btn).click(function () {
    save();
    if($(this).find("i").text() == "play_circle_filled"){
      $(this).find("i").text("pause_circle_filled");
      playTimer();
    }
    else {
      $(this).find("i").text("play_circle_filled");
      pauseTimer();
    }
  });

  $($duration).change(
    function() {
      // enter my time is always the last
      if($($duration).val() == durationText.length - 1)
      {
        console.log("Enter your own thing");
      }
      if(timeLeft < 0)
        timeLeft = durationTimes[$($duration).val()];
    }
  );
}; // end of tasks class

// adds an expanded task when clicked
$("#add-more > a").click(function () {
  // create a new task, then append it
  var newTask = new Task(nTasks);
  nTasks++; // guarantees a good index, although this might not be so pretty after a while
  //tasks.push(newTask);
  newTask.addTask();
});

$(document).ready(function() {
  // find the tasks on the page (later, we'll load tasks from local storage if they're there)
  $tasks = $('#tasks');

  // init the option select from the Materialize framework
  $('select').material_select();
});
