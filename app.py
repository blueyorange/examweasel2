import base64
from flask import Flask, Response, make_response, request, redirect, url_for, session, jsonify
from flask.templating import render_template
from config import Config
from flask_pymongo import PyMongo
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename, send_from_directory
import os
from bson import json_util
from bson.json_util import loads, dumps, ObjectId
import base64
from string import Template

app = Flask(__name__)
app.config.from_object(Config)
mongo = PyMongo(app)
db = mongo.db

# REMOVE WHEN FINISHED


def db_setup():
    u = User(username='russ', password='chugs')
    q = Question()
    q.marks = 1
    q.topic = 'topic'
    q.content = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    q.description = 'A question about potatoes.'
    db.users.insert_one(u.__dict__)
    db.questions.insert_one(q.__dict__)


class User:
    def __init__(self, username, password):
        self.username = username
        self.password = password

    def commit(self):
        if not db.users.count_documents({'username': self.username}):
            # zero documents with that username found, so add new user
            db.users.insert_one(self.__dict__)

    def __repr__(self):
        return '<User {}>'.format(self.username)

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)


class Question:
    def __init__(self):
        self.marks = 0
        self.content = ""
        self.topic = ""
        self.course = ""
        self.description = ""
        self.qImages = []
        self.msImages = []


@app.route("/")
def home():
    if 'username' in session:
        user = db.users.find_one({'username': session['username']})
        return render_template('index.html')
    else:
        return redirect(url_for('login'))


@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == 'POST' and 'username' in request.form and 'password' in request.form:
        user = db.users.find_one({'username': request.form['username']})
        if user and check_password_hash(user['password_hash'], request.form['password']):
            session['username'] = request.form['username']
            print("Logged in successfully")
            return redirect(url_for('home'))
        else:
            return ('Incorrect username or password', 401)
    else:
        # GET request returns html for page
        return render_template('login.html')


@app.route("/logout")
def logout():
    if 'username' in session:
        session.pop('username')
    return redirect(url_for("login"))


@app.route('/questions')
def query():
    cursor = db.questions.find()
    questions = list(cursor)
    print(dumps(questions))
    for question in questions:
        question['id'] = str(question['_id'])
        question.pop('_id')
    return jsonify(questions)


@app.route('/questions', methods=['POST'])
def create():
    question = loads(request.data)
    id = str(db.questions.insert_one(question).inserted_id)
    doc = db.questions.find_one(ObjectId(id))
    doc['id'] = id
    doc.pop('_id')
    return make_response(jsonify(doc), 201)


@app.route('/questions/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def read(id):
    print(id)
    if not ObjectId(id).is_valid:
        return Response({}, 404)
    if request.method == 'DELETE':
        db.questions.delete_one({"_id": ObjectId(id)})
        return Response({}, 200)
    if request.method == 'GET':
        doc = db.questions.find_one(ObjectId(id))
        if not doc:
            return make_response("Document not found", 404)
        doc['id'] = id
        doc.pop('_id')
        return jsonify(doc)
    elif request.method == 'PUT':
        data = request.form.to_dict()
        # update form data
        db.questions.update_one({'_id': ObjectId(id)}, {'$set': data})
        # update file data
        for key in ['question-images', 'markscheme-images']:
            for file in request.files.getlist(key):
                fileExtension = os.path.splitext(file.filename)[-1]
                if fileExtension in app.config['ALLOWED_IMAGE_EXTENSIONS']:
                    image_string = base64.b64encode(file.read()).decode()
                    dataURL = Template("data:image/$imgFormat;base64,$img").substitute(
                        imgFormat=fileExtension[1:], img=image_string)
                    db.questions.update_one({'_id': ObjectId(id)}, {
                                            '$push': {key: dataURL}})
        doc = db.questions.find_one(ObjectId(id))
        doc['id'] = id
        doc.pop('_id')
        return jsonify(doc)


@app.route('/questions/<string:id>', methods=['DELETE'])
def delete(id):
    db.questions.delete_one({'_id': ObjectId(id)})


@app.route('/images/<string:id>/<string:imageType>/<int:index>')
def getImage(id, imageType, index):
    doc = db.questions.find_one(ObjectId(id))
    filename = doc['images'][imageType][index]
    return send_from_directory(app.config['IMAGE_FOLDER'], filename)
