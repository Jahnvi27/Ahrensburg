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
    }, 1000);
  });

});

var filtersList = ['Genre', 'Language', 'Cast', 'Year', 'Ratings'];
var filterValues = '';

//Icon Click submits message
function submitForm() {
  $('#queryForm').submit();
}

// Method to send user query in a form based object to server
// and receive bot's response and insert in the UI
function submit_message(text) {
  if (filtersList.includes(text)) {
    filterValues = '';
    getFilters(text);
    setTimeout(function () {
      console.log(filterValues);
      suggestion(filterValues);
    }, 1000);
  }
  // else {
    inputConversation("bot", "<div id=\"loading\"></div>");
    $.post("/send_message", {
      message: text
    }, handle_response);

    //Handles bot response
    function handle_response(data) {

      intentId = data.intentId.split("/")[4]

      if (data.message.includes("|")) {
        displayMovies(data.message);
        //inputConversation("bot", "Wanna dig deeper? Awesome! Go ahead and hit one of these filter by options...")
        filters = getFilters('Filters');
        setTimeout(function() {
          filters = filters.replace("Language", "");
          filters = filters.replace("Genre", "");
          if (intentId === 'a9a3281b-5018-421b-b9d3-d3ef3adaafda' || intentId === '213a53db-ff41-4cd2-a516-b94c09a4a7a3') {
            inputConversation("bot", "Wanna dig deeper? Awesome! Go ahead and hit one of these filter by options...");
            suggestion(filters);
          } else if (intentId === 'ea844afe-94b6-4f74-aeb0-9d8e1af10813' || intentId === '4fce1a0a-0062-4ed3-a4a3-4cbd9f2114cc') {
            inputConversation("bot", "Wanna dig deeper? Awesome! Go ahead and hit one of these filter by options...");
            filters = filters.replace("Cast", "");
            suggestion(filters);
          }
          else if ( intentId === "91a3d9d4-eab9-4929-86da-6ab5bf9036bd"|| intentId === "a73b7784-eb58-45ff-80de-d78d252af250" || intentId === "7f75f273-7ec4-4f4f-8319-e7d0f3dae7d8" || intentId === "8893f055-4933-486a-8c8f-2c107aa100de"){
            suggestion("Get Movie suggestions| Get TV-show suggestions");
          }
        }, 1000);
        return;
      }

      document.getElementById("loading").innerHTML = data.message;
      document.getElementById("loading").id = "";

       console.log(intentId);
      if (intentId === "467b18a3-3c3d-4833-885a-5d27f9a735b1") {
        console.log("print this");
        suggestion("Get Movie suggestions| Get TV-show suggestions");
      } else if (intentId === "5bb8d797-a892-4dc1-b461-a8576a0eb91b") {
        filters = getFilters('Filters');
        setTimeout(function() {
          suggestion(filters);
        }, 1000);
      } else if (intentId === "eaf81156-2629-4cd2-8506-d45b39eae48b") {
        filters = getFilters('Filters');
        setTimeout(function() {
          filters = filters.replace("Cast", "");
          suggestion(filters);
        }, 1000);
      }
      $("ul").scrollTop($("ul").prop('scrollHeight'));
    }
  // }
}

function formSubmit() {
  document.getElementById("queryForm").submit();
}

//-- Call dialogflow to get filter values
function getFilters(entityName) {
  $.get("/fetch_entity_details", {
    entity_name: entityName
  }, handle_response);

  filters = "";

  function handle_response(data) {
    filters = data.fulfillment_text;
    console.log(filters);
    filterValues = filters;
    return filters;
  }
}

//--Method to call fetch_video_url method in server
function displayMovieDetails(show_id,context) {
  console.log(context)
  $.get("/fetch_video_url", {
    show_id: show_id,
      context: context
  }, handle_response);

  function handle_response(data) {
    setTimeout(function() {
      if (document.getElementById("trailerDiv") != null) {
        document.getElementById("trailerDiv").remove();
      }

      var description = document.getElementsByClassName(show_id)[0].value
      var title = document.getElementsByClassName(show_id)[1].innerHTML
      var rating = document.getElementsByClassName(show_id)[2].innerHTML
      trailerDiv = '<div id="trailerDiv">' +
        '<iframe width="100%" height="280" src=' + data.message + ' frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>' +
        '<a class="preview-description center" href="#" onclick="showTrailer()"><b>Watch trailer</b></a>' +
        '<p class="preview-description"><b>' + title + '</b></p>' +
        '<p class="preview-description"><I>' + rating + '</I></p>' +
        '<p class="preview-description"><I>' + description + '</I></p>' +
        '</div>';
      $("ul").append(trailerDiv).scrollTop($("ul").prop('scrollHeight'));
      $("iframe").hide();
    }, 1000);
  }
}

function showTrailer() {
  $("iframe").show();
  $("ul").scrollTop($("ul").prop('scrollHeight'));
}
//-- Method to display Movies
function displayMovies(movieDetails) {
  movieListDiv = '<table class="center" style="padding-top: 10px; padding-bottom: 10px; min-height: fit-content;"> <tr">';
  movieDetailList = movieDetails.split("|");
  context = movieDetailList.pop()
  for (var movie in movieDetailList) {
    if (movieDetailList[movie].trim() != "") {
      movieAttr = movieDetailList[movie].split("##");
      if (movieAttr[3].trim() == "") {
        movieAttr[3] = "/static/image/default-poster.png";
      }
      movieListDiv = movieListDiv +
        '<td class="preview-td" id="' + movieAttr[1] + '" onclick="displayMovieDetails(this.id,context)">' +
        '<div class="preview-box">' +
        '<img class="preview-img" src=\'' + movieAttr[3] + '\'/>' +
        '</div>' +
        '<input class="' + movieAttr[1] + '" type="text" value=\'' + movieAttr[2] + '\' hidden>' +
        '<div class="preview-title">' +
        '<p class="' + movieAttr[1] + '">' + movieAttr[0] + '</p>' +
        '<p class="' + movieAttr[1] + '"><I>Rating: ' + movieAttr[4] + '/10</I></p>' +
        '</div>'
      '</td>';
      if (movieDetailList[parseInt(movie) + 1] === null) {
        movieListDiv = movieListDiv + '</tr>';
      }
      if (movie % 2 != 0) {
        movieListDiv = movieListDiv + '</tr><tr>';
      }
    }
  }
  movieListDiv = movieListDiv + '</table>';
  document.getElementById("loading").innerHTML = 'Here are some cool ones on top of mind that you might like... <i class="em em-wink"></i>';
  document.getElementById("loading").id = '';
  $("ul").append(movieListDiv).scrollTop($("ul").prop('scrollHeight'));
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
  var buttonFields = '<div class="center suggestion" style="min-height: fit-content">';
  for (var index in suggestionTexts) {
    text = suggestionTexts[index].trim();
    if (text != "") {
      buttonFields = buttonFields +
        '<button class="btn btn-primary btn-lg suggestion-btn"' +
        'onclick="submit_message(this.innerHTML)">' + text + '</button>';
    }
  }
  buttonFields = buttonFields + '</div>';

  $("ul").append(buttonFields).scrollTop($("ul").prop('scrollHeight'));
}
