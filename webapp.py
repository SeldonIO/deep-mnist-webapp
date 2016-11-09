from flask import Flask, request, render_template, jsonify
import requests
import json
import scipy.misc
import numpy as np
import time
import argparse

def encode_image(im):
    data = {'x%03d'%i:pixel for i,pixel in enumerate(im)}
    return {'data':data}

def get_token():
    try:
        r = requests.post('{url}/token?consumer_key={key}&consumer_secret={secret}'.format(
            url=_globals['url'],
            key=_globals['key'],
            secret=_globals['secret']))
    except:
        print 'Failed to retrieve token'
        return ''
    return r.json().get('access_token')

def request_prediction(image,token):
    return requests.post('{url}/predict?oauth_token={token}'.format(url=_globals['url'],token=token), json = encode_image(image))

def save(im):
    scipy.misc.toimage(1.-np.array(im).reshape((28,28)), cmin=0.0, cmax=1.0).save('user_images/im_%d.jpg'%(time.time()*10))

app = Flask(__name__)

_globals = {}


@app.route('/')
def index():
    return render_template('webapp.html')

@app.route('/predict/',methods=['POST'])
def predict():
    save(request.json)
    r = request_prediction(request.json,_globals['token'])
    if r.json().get('error_id') == 8: # Token expired
        _globals['token'] = get_token()
        r = request_prediction(request.json,_globals['token'])

    predictions = r.json()
    list_preds = [(int(x['predictedClass']),x['prediction']) for x in predictions['predictions']]
    list_preds.sort()
    return jsonify([x[1] for x in list_preds])

if __name__ == '__main__':

    parser = argparse.ArgumentParser(prog="Starting deep mnist webapp")
    parser.add_argument('--host',type=str,help='Prediction client host',required=True)
    parser.add_argument('-p','--port',type=int,help='Prediction client port',default=80)
    parser.add_argument('-k','--key',type=str,help='Authentication key',required=True)
    parser.add_argument('-s','--secret',type=str,help='Authentication secret',required=True)

    args = parser.parse_args()

    _globals['url'] = 'http://{}:{}'.format(args.host,str(args.port))
    _globals['key'] = args.key
    _globals['secret'] = args.secret

    print 'Retrieving token'
    _globals['token'] = get_token()

    print 'Starting webapp'
    app.run('0.0.0.0',port=80)
