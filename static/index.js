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
    samplePrint();
  }
}
