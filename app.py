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


@app.route('/fetch_entity_details', methods=['GET'])
def fetch_entities():
    entity_name = request.args.get('entity_name')
    url = "https://api.dialogflow.com/v1/entities"
    headers = {'Content-Type': 'application/json',
               'authorization': os.getenv('dev_token')}
    response = requests.get(url, headers=headers)
    entities = response.json()
    entity_id = ''
    values = ''
    for entity in entities:
        if entity['name'].lower() == entity_name.lower():
            entity_id = entity['id']
            break

    entity_response = requests.get("https://api.dialogflow.com/v1/entities/{0}".format(entity_id),
                                   headers=headers)
    entity_details = entity_response.json()
    count = 0
    for entry in entity_details['entries']:
        if count <= 20 :
            values = values + entry['value'] + ' | '
            count += 1
    reply = {

          "fulfillment_text": values,
       }
    return jsonify(reply)


@app.route('/filter_details', methods=['GET'])
def fetch_filter_details():
    entities = fetch_entities()
    filters = ''
    for entity in entities:
        if entity['name'] == 'Filters':
            entity_id = entity['id']
            break

    headers = {'Content-Type': 'application/json',
               'authorization': os.getenv('dev_token')}
    entity_response = requests.get("https://api.dialogflow.com/v1/entities/{0}".format(entity_id),
                                   headers=headers)
    entity_details = entity_response.json()
    for entry in entity_details['entries']:
        filters = filters + entry['value'] + ' | '
    response_text = {"message":  filters}
    return jsonify(response_text)


@app.route('/fetch_video_url', methods=['GET'])
def get_video_details():
    api_key = os.getenv('TMDB_API_KEY')
    show_id = request.args.get('show_id')
    context = request.args.get('context')
    video_info = requests.get("https://api.themoviedb.org/3/{2}/{1}/videos?api_key={0}".format(api_key, show_id, context))
    video_details = video_info.json()
    if len(video_details['results']) > 0:
        yt_key = video_details['results'][0]['key']
    else:
        yt_key = ""
    yt_url = "https://www.youtube.com/embed/" + yt_key
    response_text = {"message": yt_url}
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
    if 'TV-Shows' in scenario or scenario == 'TV-Suggestion.TV-Suggestion-custom.TV-Suggestion-custom-custom':
        names = ''
        parameters = results['parameters']
        genre = results['parameters']['Genre']
        genre_id = map_genre_ids.get(genre)
        language = results['parameters']['language']
        language_id = map_language_ids.get(language)
        # If ratings is provided by the user then follow this condition
        if 'Ratings' in parameters and len(results['parameters']['Ratings']) != 0:
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
            if len(show_list) > 0:
                for show in show_list:
                    name = show['name']
                    rating = show['vote_average']
                    poster_path = show['poster_path']
                    tv_id = show['id']
                    overview = show['overview']
                    if poster_path is not None:
                        final_path = "http://image.tmdb.org/t/p/w185/" + poster_path
                    else:
                        final_path = ""
                    display = name + '##' + str(tv_id) + "##" + overview + "##" + final_path + "##" + str(rating)
                    names = names + display + '|'
                reply = {

                    "fulfillment_text": names + 'tv',
                   }
                return jsonify(reply)
            else:
                reply = {

                    "fulfillment_text": "Sorry!!! there are no tv-shows for the mentioned rating. Can you try with another input?? ",
                }
                return jsonify(reply)

        elif 'Year' in parameters and len(results['parameters']['Year']) != 0:
            year = results['parameters']['Year']
            data = {'language': 'en-US',
                    'with_original_language': language_id,
                    'with_genres': genre_id,
                    'first_air_date_year': year
                    }
            response = requests.get("https://api.themoviedb.org/3/discover/tv?api_key={0}".format(api_key), params=data)
            details = response.json()
            show_list = details['results']
            if len(show_list) > 0:
                for show in show_list:
                    name = show['name']
                    tv_id = show['id']
                    overview = show['overview']
                    rating = show['vote_average']
                    poster_path = show['poster_path']
                    if poster_path is not None:
                        final_path = "http://image.tmdb.org/t/p/w185/" + poster_path
                    else:
                        final_path = ""
                    display = name + '##' + str(tv_id) + "##" + overview + "##" + final_path + "##" + str(rating)
                    names = names + display + '|'
                reply = {

                    "fulfillment_text": names + 'tv',
                   }
                return jsonify(reply)
            else:
                reply = {

                    "fulfillment_text": "Sorry!!! there are no tv-shows for the mentioned year. Can you try with another input?? ",
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
                tv_id = show['id']
                rating = show['vote_average']
                overview = show['overview']
                poster_path = show['poster_path']
                if poster_path is not None:
                    final_path = "http://image.tmdb.org/t/p/w185/" + poster_path
                else:
                    final_path = ""
                display = name + '##' + str(tv_id) + "##" + overview + "##" + final_path + "##" + str(rating)
                names = names + display + '|'
            reply = {

                "fulfillment_text": names + 'tv',
              }

            return jsonify(reply)

    # If the intent is for Movie
    elif 'Movie' in scenario:
        genre_detail = requests.get('https://api.themoviedb.org/3/genre/movie/list?api_key={0}'.format(api_key))
        genre_detail = json.loads(genre_detail.content)
        genre_id = ''
        # Fetch genre id
        if 'Genre' in movie:
            for item in genre_detail['genres']:
                if item['name'] == movie['Genre'] and movie['Genre'] is not None:
                    genre_id = item['id']
                    break

        language_detail = requests.get('https://api.themoviedb.org/3/configuration/languages?api_key={0}'.format(api_key))
        language_detail = json.loads(language_detail.content)
        language_id = ""
        # Fetch language id
        if 'language' in movie:
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
                    'primary_release_year': movie['Year']
                    }
        elif "Ratings" in movie and len(movie['Ratings']) != 0:
            data = {'language': 'en-US',
                    'with_original_language': language_id,
                    'with_genres': genre_id,
                    'vote_average.gte': movie['Ratings']
                    }
        else:
            data = {'language': 'en-US',
                    'with_original_language': language_id,
                    'with_genres': genre_id,
                    }

        detail = requests.get('https://api.themoviedb.org/3/discover/movie?api_key={0}'.format(api_key), params=data)
        detail = detail.json()

        titles = ''

        if len(detail['results']) > 0:
            for item in detail['results']:
                title = item['title']
                movie_id = item['id']
                movie_rating = item['vote_average']
                movie_overview = item['overview']
                movie_poster = item['poster_path']
                if movie_poster is not None:
                    movie_poster_url = "http://image.tmdb.org/t/p/w185/" + movie_poster
                else:
                    movie_poster_url = ""

                final_output = title + '##' + str(movie_id) + '##' + movie_overview + '##' + movie_poster_url + '##' + str(movie_rating)
                titles = titles + final_output + '|'

                reply = {

                    "fulfillment_text": titles + 'movie',

                    }
        else:
            reply = {

                "fulfillment_text": "Sorry!!! there are no movies according to your choice. Can you make some other selection?"

            }

        return jsonify(reply)

    elif scenario == 'TV-Suggestion.TV-Suggestion-custom':
        headers = {'Content-Type': 'application/json',
                   'authorization': os.getenv('dev_token')}
        values = ''
        entity_id = ''
        entities = fetch_entities()
        parameters = results['parameters']
        if 'genre' in parameters['Filters']:
            for entity in entities:
                if entity['name'] == 'Genre':
                    entity_id = entity['id']
                    break
        elif 'language' in parameters['Filters']:
            for entity in entities:
                if entity['name'] == 'language':
                    entity_id = entity['id']
                    break
        elif 'year' in parameters['Filters']:
            for entity in entities:
                if entity['name'] == 'Year':
                    entity_id = entity['id']
                    break
        elif 'rating' in parameters['Filters']:
            for entity in entities:
                if entity['name'] == 'Ratings':
                    entity_id = entity['id']
                    break

        entity_response = requests.get("https://api.dialogflow.com/v1/entities/{0}".format(entity_id),
                                       headers=headers)
        entity_details = entity_response.json()
        for entry in entity_details['entries']:
            values = values + entry['value'] + ' | '
        reply = {

            "fulfillment_text": values,
        }
        return jsonify(reply)

    elif 'DirectSuggest' in scenario:
        direct_detail = requests.get('http://api.tmdb.org/3/search/movie?api_key={0}&query={1}'.format(api_key, movie['Suggest']))
        direct_detail = json.loads(direct_detail.content)
        titles = ''

        if len(direct_detail['results']) > 0:
            for item in direct_detail['results']:
                title = item['title']
                movie_id = item['id']
                movie_rating = item['vote_average']
                movie_overview = item['overview']
                movie_poster = item['poster_path']
                if movie_poster is not None:
                    movie_poster_url = "http://image.tmdb.org/t/p/w185/" + movie_poster
                else:
                    movie_poster_url = ""

                final_output = title + '##' + str(
                    movie_id) + '##' + movie_overview + '##' + movie_poster_url + '##' + str(movie_rating)
                titles = titles + final_output + '|'

                reply = {

                    "fulfillment_text": titles + 'movie',

                }
        else:
            reply = {

                "fulfillment_text": "Sorry!!! there are no movies according to your choice. Can you make some other selection?"

            }

        return jsonify(reply)

#To get genre id of a specific genre
def get_genre_id(genre, genre_type):
    api_key = os.getenv('TMDB_API_KEY')

    #To check if the genre is for movie or tv-show
    if genre_type == "Movie":
        genre_detail = requests.get('https://api.themoviedb.org/3/genre/movie/list?api_key={0}'.format(api_key))
    elif genre_type == "TV-Shows":
        genre_detail = requests.get('https://api.themoviedb.org/3/genre/tv/list?api_key={0}'.format(api_key))

    genre_detail = json.loads(genre_detail.content)
    genre_id = ''

    # Fetch genre id
    for item in genre_detail['genres']:
        if item['name'] == genre:
            genre_id = item['id']
            break
    return genre_id

#To get language id of a specific language
def get_language_id(language):
    api_key = os.getenv('TMDB_API_KEY')
    language_detail = requests.get('https://api.themoviedb.org/3/configuration/languages?api_key={0}'.format(api_key))
    language_detail = json.loads(language_detail.content)
    language_id = ""

    # Fetch language id
    for item in language_detail:
        if item['english_name'] == language:
            language_id = item['iso_639_1']
        break
    return language_id
