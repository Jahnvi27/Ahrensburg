<b>MovieBuddy</b> is a chatbot which will respond to user queries regarding movies/tv-shows. It will be an interactive assistant for movie/TV enthusiasts who are frequently stuck with <i>"WHAT ELSE?"</i> and <i>"WHAT NEXT?"</i> when it comes to entertainment and want valuable suggestions. It will be personalized and based on feedback from an expert system trained with knowledge acquired from online entertainment databases. The recommendations will be based on: 
<ul>
  <li>Genre</li>
  <li>Language</li>
  <li>Year range</li>
  <li>Reviews and ratings</li>
  <li>Dialogue</li>
  <li>Actor/actresses/director(cast)</li>
  <li>Users recent history</li>
</ul>

![alt text](https://user-images.githubusercontent.com/4372767/47619415-a8b4b000-da9b-11e8-961f-334c8c499bb5.png)

This app is developed using Python's <b>Flask</b> framework with a <b>bootstrapCSS</b> front-end and an AI agent build using <b>DialogFlow API</b>.
We are also using <b>TMDB API</b> to fetch movie/tv-show details in realtime.

## Running the application:
1. clone our repository using the below command:
```
git clone git@github.com:Jahnvi27/Ahrensburg.git
```
2. Set the environement variables for accessing tmdb and Dialogflow:
```
TMDB_API_KEY=<tmdb_api_key>

```

3. Run the following command under the root directory to host the app in your local:
```
flask run
```
The app can be then accessed on [Localhost](http://localhost:5000).
