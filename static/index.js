window.onscroll = function() {
  var botFrame = document.getElementsByClassName('frame').item(0);
  var frameOffset = botFrame.offsetTop;
  var landingPage = document.getElementsByClassName('landingPage').item(0);

  if (window.pageYOffset >= frameOffset) {
    landingPage.remove();
    samplePrint();
  }
}
