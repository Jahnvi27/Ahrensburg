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
    return response.query_result.fulfillment_text


# api route to which when the user enter his comment it should be submitted.
# This method will be called from the js file
# when the user enters his query
@app.route('/send_message', methods=['POST'])
def send_message():
    message = request.form['message']
    project_id = os.getenv('DIALOGFLOW_PROJECT_ID')
    fulfillment_text = detect_intent(project_id, "unique", message, 'en')
    response_text = {"message":  fulfillment_text}
    return jsonify(response_text)


@app.route('/get_detail', methods=['POST'])
def get_detail():
    api_key = os.getenv('TMDB_API_KEY')
    data = request.get_json(silent=True)
    results = data['result']
    scenario = results['action']
    if 'TV-Shows' in scenario:
       names = []
       parameters = results['parameters']
       genre = results['parameters']['Genre']
       language = results['parameters']['language']
       data = {'language': 'en-US',
               'with_genres': 28}
       response = requests.get("https://api.themoviedb.org/3/discover/tv?api_key={0}".format(api_key), params=data)
       details = response.json()
       show_list = details['results']
       for show in show_list:
           name = show['name']
           names.append(name)
           reply = {

             "fulfillment_text": names,
           }
           return jsonify(reply)

    else:
      movie = data['queryResult']['parameters']['movie']
      detail = requests.get('https://api.themoviedb.org/3/movie/{0}?api_key={1}'.format(movie, api_key)).content
      detail = json.loads(detail)
      response = """
        original_title : {0}
        release_date: {1}
        runtime: {2}
        overview: {3}
       """.format(detail['Title'], detail['Release Date'], detail['Runtime'], detail['Plot'])

      reply = {

        "fulfillment_text": response,
        }

      return jsonify(reply)
