$(document).ready(function() {

  // Method to capture user query as form data
  // and called when user queries through UI
  $('#queryForm').on('submit', function(e) {
    const inputText = $('#usrtext').val();
    if (inputText !== "") {
      inputConversation("user", inputText);
      $('#usrtext').val('');
    }
    e.preventDefault();
    if (!inputText) {
      return
    }
    inputConversation("bot", "<div id=\"loading\"></div>");
    submit_message(inputText);
  });

  //Scroll landing-page on click
  $('#clickScroll').click(function() {
    var landingPage = document.getElementsByClassName('landingPage').item(0);
    var botFrame = document.getElementsByClassName('frame').item(0);
    $('html, body').animate({
      scrollTop: botFrame.offsetTop
    }, 500);
    setTimeout(function() {
      landingPage.remove();
    }, 500);
    startConversation();
  });
});

// Method to send user query in a form based object to server
// and receive bot's response and insert in the UI
function submit_message(text) {
  console.log(text)
  $.post("/send_message", {
    message: text
  }, handle_response);

  //Handles bot response
  function handle_response(data) {
    document.getElementById("loading").innerHTML = data.message;
    document.getElementById("loading").id = "";
  }
}

//-- Method to print introductory conversation
function startConversation() {
  inputConversation("bot", "Hello, how are you today?");
  inputConversation("user", "Hi, I am good.", 1000);
  inputConversation("bot", "What would you like to talk about today?", 2500);
  inputConversation("user", "Tell me some good stuff to watch.", 4000);
  inputConversation("bot", "What would you like to watch?", 5500);
  suggestion('<button type="button" class="btn btn-outline-primary btn-md center-block" Style="width: 100px;margin: 10px">Movie</button>' +
    '<button type="button" class="btn btn-outline-primary btn-md center-block" Style="width: 100px; margin: 10px">TV Show</button>', 7000);
}

//-- Remove landing page
window.onscroll = function() {
  var botFrame = document.getElementsByClassName('frame').item(0);
  var frameOffset = botFrame.offsetTop;
  var landingPage = document.getElementsByClassName('landingPage').item(0);
  if (window.pageYOffset >= frameOffset && landingPage != null) {
    landingPage.remove();
    startConversation();
  }
}

// function to show the time in conversation
function showTimeStamp(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  minutes = formatTime(minutes);
  var startTime = hours + ':' + minutes + ' ' + period;
  return startTime;
}

//function to format the minutes
function formatTime(min) {
  if (min < 10) {
    min = "0" + min;
  }
  return min;
}
var bot = {};
bot.displayIcon = "/static/image/bot.png";
var user = {};
user.displayIcon = "/static/image/user.jpg";

//-- Method to insert conversation into html
function inputConversation(userbot, message) {
  var introField = "";
  var date = showTimeStamp(new Date());
  if (userbot == "bot") {
    introField = '<li style="width:100%">' +
      '<div class="displayIconBot"><img class="img-circle" style="width:100%;" src="' + bot.displayIcon + '" /></div>' +
      '<div class="box macro">' +
      '<div class="text text-l">' +
      '<p>' + message + '</p>' +
      '<p><small>' + date + '</small></p>' +
      '</div>' +
      '</div>' +
      '</li>';
  } else {
    introField = '<li style="width:100%;">' +
      '<div class="displayIconUser"><img class="img-circle" style="width:100%;" src="' + user.displayIcon + '" /></div>' +
      '<div class="box-right macro">' +
      '<div class="text text-r">' +
      '<p>' + message + '</p>' +
      '<p><small>' + date + '</small></p>' +
      '</div>' +
      '</div>' +
      '</li>';
  }
  $("ul").append(introField).scrollTop($("ul").prop('scrollHeight'));
}

function suggestion(message) {
  var introField = "";
  introField = '<li style="width:100%">' +
    '<div class="center">' +
    '<p>' + message + '</p>' +
    '</div>' +
    '</li>';
  $("ul").append(introField).scrollTop($("ul").prop('scrollHeight'));
}
