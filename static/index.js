$(document).ready(function() {

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
    submit_message(inputText);
  });

  //Scroll landing-page on click
  $('#clickScroll').click(function() {
    var landingPage = document.getElementsByClassName('landingPage').item(0);
    var botFrame = document.getElementsByClassName('frame').item(0);
    $('html, body').animate({
      scrollTop: botFrame.offsetTop
    }, 500);
  });
});

//Icon Click submits message
function submitForm() {
  console.log("ok");
  $('#queryForm').submit();
}

// Method to send user query in a form based object to server
// and receive bot's response and insert in the UI
function submit_message(text) {
  inputConversation("bot", "<div id=\"loading\"></div>");
  console.log(text)
  $.post("/send_message", {
    message: text
  }, handle_response);

  //Handles bot response
  function handle_response(data) {
    console.log(data.message);
    console.log(data.intentId);

    intentId = data.intentId.split("/")[4]

    movieListDiv = '<ol>';
    if (data.message.includes("|")) {
      movieList = data.message.split("|");
      for (var movie in movieList) {
        if (movieList[movie].trim() != "") {
          movieListDiv = movieListDiv +
            '<li style="width:100%">' +
            movieList[movie] +
            '</li>'
        }
      }
      movieListDiv = movieListDiv + '</ol>';
      document.getElementById("loading").innerHTML = movieListDiv;
      document.getElementById("loading").id = "";
      inputConversation("bot", "Wanna dig deeper? Awesome! Go ahead and hit one of these filter by options...")
      filters = getFilters();
      setTimeout(function() {
        filters = filters.replace("language", "");
        filters = filters.replace("genre", "");
        if (intentId == 'a9a3281b-5018-421b-b9d3-d3ef3adaafda' || intentId == '213a53db-ff41-4cd2-a516-b94c09a4a7a3') {
          suggestion(filters);
        } else if (intentId == 'ea844afe-94b6-4f74-aeb0-9d8e1af10813' || '4fce1a0a-0062-4ed3-a4a3-4cbd9f2114cc') {
          filters = filters.replace("cast", "");
          suggestion(filters);
        }
      }, 1000);
      return;
    }

    document.getElementById("loading").innerHTML = data.message;
    document.getElementById("loading").id = "";

    if (intentId == "467b18a3-3c3d-4833-885a-5d27f9a735b1") {
      suggestion("Get Movie suggestions| Get TV-show suggestions");
    } else if (intentId == "5bb8d797-a892-4dc1-b461-a8576a0eb91b") {
      filters = getFilters();
      setTimeout(function() {
        suggestion(filters);
      }, 500);
    }
    else if (intentId == "eaf81156-2629-4cd2-8506-d45b39eae48b") {
     filters = getFilters();
      setTimeout(function() {
        filters = filters.replace("cast", "");
        suggestion(filters);
      }, 500);
    }
    $("ul").scrollTop($("ul").prop('scrollHeight'));
  }
}

function formSubmit() {
  document.getElementById("queryForm").submit();
}

//-- Call dialogflow to get filter values
function getFilters() {
  $.get("/filter_details", {}, handle_response);

  filters = "";

  function handle_response(data) {
    console.log(data.message);
    filters = data.message;
    return filters;
  }
}

//-- Method to print introductory conversation
function startConversation() {
  inputConversation("bot", 'Hello, how are you doing today? <i class="em em-smiley_cat"></i>' +
    '<br><br>I\'m here to help you find your favorite movie/tv-shows.' +
    'You can either choose to answer few of our questions or click <i class="em em-three_button_mouse"></i> options from suggestion ' +
    'bubbles to find your watch list.');
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
  console.log(message);
  suggestionTexts = message.split("|");
  var buttonFields = '<div class="center suggestion">';
  for (var index in suggestionTexts) {
    text = suggestionTexts[index].trim();
    if (text != "") {
      buttonFields = buttonFields +
        '<button class="btn btn-primary btn-lg suggestion-btn"' +
        'onclick="submit_message(this.innerHTML.toLowerCase())">' + text + '</button>';
    }
  }
  buttonFields = buttonFields + '</div>';

  $("ul").append(buttonFields).scrollTop($("ul").prop('scrollHeight'));
}
