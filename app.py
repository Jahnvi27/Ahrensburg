from flask import Flask, request, jsonify, render_template
import dialogflow
import os

import requests
import json

app = Flask(__name__)


@app.route('/')
def fetchui():
    return render_template('chat.html')

    if __name__ == '__main__':
        app.run()


# method to detect intent based on text
def detect_intent(project_id, session_id, texts, language_code):
    session_client = dialogflow.SessionsClient()
    session = session_client.session_path(project_id, session_id)
    text_input = dialogflow.types.TextInput(text=texts,
                                            language_code=language_code)

    query_input = dialogflow.types.QueryInput(text=text_input)
    response = session_client.detect_intent(
        session=session, query_input=query_input)
    return (response.query_result.fulfillment_text, response.query_result.intent.name)


# api route to which when the user enter his comment it should be submitted.
# This method will be called from the js file
# when the user enters his query
@app.route('/send_message', methods=['POST'])
def send_message():
    message = request.form['message']
    project_id = os.getenv('DIALOGFLOW_PROJECT_ID')
    fulfillment_text, intent_id = detect_intent(project_id, "unique", message, 'en')
    response_text = {"message":  fulfillment_text, "intentId": intent_id}
    return jsonify(response_text)


@app.route('/get_detail', methods=['POST'])
def get_detail():
    api_key = os.getenv('TMDB_API_KEY')
    data = request.get_json(silent=True)
    results = data['queryResult']
    scenario = results['action']
    movie = data['queryResult']['parameters']
    map_genre_ids = {'Action': 28, 'adventure': 12, 'Animation': 16, 'Comedy': 35, 'Crime': 80, 'Drama': 18, 'romantic': 10749, 'thriller': 53, 'Family': 10751}
    map_language_ids = {'English': 'en', 'German': 'de', 'French': 'fr', 'Spanish': 'es', 'Korean': 'ko', 'Chinese': 'zh'}
    # if the intent type is for TV-SHOWS then enter this condition
    if 'TV-Shows' in scenario:
        names = ''
        parameters = results['parameters']
        genre = results['parameters']['Genre']
        genre_id = map_genre_ids.get(genre)
        language = results['parameters']['language']
        language_id = map_language_ids.get(language)
        # If ratings is provided by the user then follow this condition
        if 'Ratings' in parameters:
            ratings = results['parameters']['Ratings']
            data = {'language': 'en-US',
                    'with_original_language' : language_id,
                    'with_genres': genre_id,
                    'vote_average.gte': ratings
                    }
            response = requests.get("https://api.themoviedb.org/3/discover/tv?api_key={0}".format(api_key), params=data)
            details = response.json()
            show_list = details['results']
            # display the show name along with the ratings of the show
            for show in show_list:
                name = show['name']
                rating = show['vote_average']
                display = name + ' --- ' + str(rating)
                names = names + display + ', '
            reply = {

                "fulfillment_text": names,
              }
            return jsonify(reply)

        else:
            data = {'language': 'en-US',
                    'with_original_language': language_id,
                    'with_genres': genre_id}
            response = requests.get("https://api.themoviedb.org/3/discover/tv?api_key={0}".format(api_key), params=data)

            details = response.json()
            show_list = details['results']
            for show in show_list:
                name = show['name']
                names = names + name + ', '
            reply = {

                "fulfillment_text": names,
              }

            return jsonify(reply)

    # If the intent is for Movie
    elif 'Movies' in scenario:
        genre_detail = requests.get('https://api.themoviedb.org/3/genre/movie/list?api_key={0}'.format(api_key))
        genre_detail = json.loads(genre_detail.content)
        genre_id = 0
        # Fetch genre id
        for item in genre_detail['genres']:
            if item['name'] == movie['genre']:
                genre_id = item['id']
                break

        language_detail = requests.get('https://api.themoviedb.org/3/configuration/languages?api_key={0}'.format(api_key))
        language_detail = json.loads(language_detail.content)
        language_id = ""
        # Fetch language id
        for item in language_detail:
            if item['english_name'] == movie['language']:
                language_id = item['iso_639_1']
                break
        cast_id = 0
        if 'Cast' in movie and len(movie['Cast']) != 0:
            cast_detail = requests.get('http://api.tmdb.org/3/search/person?api_key={0}&query={1}'.format(api_key, movie['Cast']))
            cast_detail = json.loads(cast_detail.content)
            cast_id = cast_detail['results'][0]['id']
            data = {'language': 'en-US',
                    'with_original_language': language_id,
                    'with_genres': genre_id,
                    'with_cast': cast_id
                    }
        elif "Year" in movie and len(movie['Year']) != 0:
            data = {'language': 'en-US',
                    'with_original_language': language_id,
                    'with_genres': genre_id,
                    'year': movie['Year']
                    }
        else:
            data = {'language': 'en-US',
                    'with_original_language': language_id,
                    'with_genres': genre_id}

        detail = requests.get('https://api.themoviedb.org/3/discover/movie?api_key={0}'.format(api_key), params=data)
        detail = detail.json()

        titles = ''

        if len(detail['results']) > 0:
            for item in detail['results']:
                title = item['title']
                titles = titles + title + '| '
                reply = {

                    "fulfillment_text": titles,

                }
        else:
            reply = {

                "fulfillment_text": "Sorry!!! there are no movies according to your choice. Can you make some other selection?"

            }

        return jsonify(reply)
