$( document ).ready(function() {
  console.log( "ready!" );
  $('#usrtext').bind("keypress",
    function(e) {
      console.log("running");
      if(e != null && e.which == 13){
        typeQuery();
      }
    });
});

//-- Type and ask a Query
function typeQuery() {
  var text = $('#usrtext').val();
  if (text !== "") {
    //Write method to transfer query to message window
    //Remove--
    console.log("User types query!!");
    //--
      inputConversation("user",text);
    $('#usrtext').val('');
  }
};

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
// this function should be called while creating the conversation
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
    if(min<10){
        min = "0" + min;
    }
    return min;
}

var bot = {};
  bot.displayIcon = "/static/image/bot.png";


var user = {};
  user.displayIcon = "/static/image/user.jpg";


//-- Method to add introductory conversation.
function inputConversation(userbot, message, time){
    if (time === undefined){
        time = 0;
    }
    var introField = "";
    var date = showTimeStamp(new Date());

    if (userbot == "bot"){
        introField = '<li style="width:100%">' +
                       '<div class="displayIconBot"><img class="img-circle" style="width:100%;" src="'+ bot.displayIcon +'" /></div>'+
                        '<div class="box macro">' +
                            '<div class="text text-l">' +
                                '<p>'+ message +'</p>' +
                                '<p><small>'+date+'</small></p>' +
                            '</div>' +
                        '</div>' +
                    '</li>';
    }else{
        introField = '<li style="width:100%;">' +
                      '<div class="displayIconUser"><img class="img-circle" style="width:100%;" src="'+user.displayIcon+'" /></div>'+
                        '<div class="box-right macro">' +
                            '<div class="text text-r">' +
                                '<p>'+ message +'</p>' +
                                '<p><small>'+date+'</small></p>' +
                            '</div>' +
                      '</div>'+
                  '</li>';
    }
    setTimeout(
        function(){
            $("ul").append(introField).scrollTop($("ul").prop('scrollHeight'));
        }, time);

}

//-- Method to print introductory conversation
function startConversation() {
    inputConversation("bot", "Hello, how are you today?", 0);
    inputConversation("user", "Hi, I am good.", 1500);
    inputConversation("bot", "What would you like to talk about today?", 3500);
    inputConversation("user", "Tell me some good stuff to watch.", 7000);
    inputConversation("bot", "What would you like to watch?", 9500);
}
