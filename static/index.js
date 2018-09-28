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