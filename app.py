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
    movie = data['queryResult']['parameters']

    scenario = results['action']
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
        # A map is needed to store the ids of language and genre
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
            if item['name'] == movie['Genre']:
                genre_id = item['id']
                break

        language_detail = requests.get('https://api.themoviedb.org/3/configuration/languages?api_key={0}'.format(api_key))
        language_detail = json.loads(language_detail.content)

        # Fetch language id
        for item in language_detail:
            if item['english_name'] == movie['language']:
                language_id = item['iso_639_1']
                break

        data = {'language': 'en-US',
                'with_original_language': language_id,
                'with_genres': genre_id}
        detail = requests.get('https://api.themoviedb.org/3/discover/movie?api_key={0}'.format(api_key), params=data)
        detail = detail.json()

        titles = ''
        for item in detail['results']:
            title = item['original_title']
            titles = titles + title + ', '
            reply = {

                "fulfillment_text": titles,
            }

        return jsonify(reply)
