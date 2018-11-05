**Project Title: MovieBuddy**
Our vision is to develop a chatbot which will respond to user queries regarding movies/tv-shows. It will be an interactive assistant for movie/TV enthusiasts who are frequently stuck with "_WHAT ELSE?_" and "_WHAT NEXT?"_ when it comes to entertainment and want valuable suggestions. 
It will be personalized and based on feedback from an expert system trained with knowledge acquired from online entertainment databases. 
The recommendations will be based on:
Genre
Language
Year range
Reviews and ratings
Actor/actresses/director(cast)
Users recent history

**Prerequisites**
Python 3.6 and above
Flask
Ngrok

**External Software Used**
Dialogflow as the A.I Agent
TMDB Api to fetch responses for movies and tv-shows

**Running the application**
Its a flask application 
Run the command: 
`flask run`
This will start the application on local host port 5000
http://localhost:5000/ 
Currently we need to have ngrok running on the local to make the webhook accessible to dialogflow
Command to host ngrok :
 `ngrok http localhost:5000`
 
 **Access The Chat-Bot**
 The chatBot can be directly accessed by clicking on the following url ec2-13-57-7-81.us-west-1.compute.amazonaws.com 
 
