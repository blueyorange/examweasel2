import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'this_is_secret'
    MONGO_URI = os.environ.get('DATABASE_URL') or  'mongodb://localhost:27017/database'
    SEND_FILE_MAX_AGE_DEFAULT = 300