from flask import Flask, json, request, redirect, url_for, session, jsonify
from flask.templating import render_template
from config import Config
from flask_pymongo import PyMongo
from werkzeug.security import check_password_hash, generate_password_hash
import os
from glob import glob
from bson import json_util
from bson.json_util import loads, dumps, ObjectId
from pprint import pprint

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
        if not db.users.count_documents({'username' : self.username }):
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
        self.marks = None
        self.content = None
        self.topic = None
        self.course = None
        self.description = None
        self.qImages = None
        self.msImages = None

@app.route("/")
def home():
    if 'username' in session:
        user = db.users.find_one({'username' : session['username'] })
        return render_template('index.html')
    else:
        return redirect(url_for('login'))

@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method=='POST' and 'username' in request.form and 'password' in request.form:
        user = db.users.find_one({'username' : request.form['username']})
        if user and check_password_hash(user['password_hash'], password):
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

@app.route("/newquestion", methods=['POST'])
def newQuestion():
    print("Creating new question...")
    q = Question()
    db.session.add(q)
    db.session.commit()
    q.description = f"New Question {q.id}"
    q.marks = 1
    db.session.add(q)
    db.session.commit()
    return render_template('questions.html', questions=[q])

@app.route('/viewer')
def viewer():
    path = os.path.join("static","images")
    id = request.args['id']
    qImagePaths = glob(os.path.join(path, id,"q","*.png"))
    msImagePaths = glob(os.path.join(path, id, "ms","*.png"))
    q = Question.query.filter_by(id=id).first()
    q_template = render_template('view-question.html',qPaths=qImagePaths)
    ms_template = render_template('view-ms.html', msPaths=msImagePaths)
    data_template = render_template('view-data.html', q=q)
    return jsonify(question=q_template, markscheme=ms_template, data=data_template)

@app.route('/questions', methods=['POST'])
def create():
    question = loads(request.data)
    _id = db.questions.insert_one(question).inserted_id
    newQuestionDict = db.questions.find_one({'_id' : _id })
    newQuestionDict['_id'] = str(newQuestionDict['_id'])
    return jsonify(newQuestionDict)

@app.route('/questions/<string:id>')
def read(id):
    doc = db.questions.find_one(ObjectId(id))
    doc['_id'] = id
    return jsonify(doc)

@app.route('/questions/<string:id>', methods=['PUT'])
def update(id):
    data = request.form.to_dict()
    id = ObjectId(data['_id'])
    data.pop('_id')
    db.questions.update_one({'_id' : id}, data)

@app.route('/questions/<string:id>', methods=['DELETE'])
def delete(id):
    db.questions.delete_one({'_id' : ObjectId(id)})

@app.route('/questions')
def query():
    cursor = db.questions.find()
    questions = list(cursor)
    for question in questions:
        question['_id'] = str(question['_id'])
    print(questions)
    return jsonify(questions)