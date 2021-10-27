from flask import Flask, request, redirect, url_for, session
from flask.templating import render_template
from config import Config
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash
import os
from glob import glob

app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)

# REMOVE WHEN FINISHED
def db_setup():
    db.create_all()
    u = User(username='russ')
    u.password = 'chugs'
    q = Question()
    q.marks = 1
    q.topic = 'topic'
    q.content = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    q.description = 'A question about potatoes.'
    db.session.add_all([u,q])
    db.session.commit()
    
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    password_hash = db.Column(db.String(128))

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

class Question(db.Model):
    __tablename__ = 'question'
    id = db.Column(db.Integer, primary_key = True)
    marks = db.Column(db.Integer)
    content = db.Column(db.String)
    topic = db.Column(db.String)
    course = db.Column(db.String)
    description = db.Column(db.String)
    qImages = db.Column(db.PickleType)
    msImages = db.Column(db.PickleType)

@app.route("/")
def home():
    if 'username' in session:
        user = User.query.filter_by(username=session['username'])
        return render_template('index.html', user=user, questions=Question.query.all())
    else:
        return redirect(url_for('login'))

@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method=='POST' and 'username' in request.form and 'password' in request.form:
        user = User.query.filter_by(username=request.form['username']).first()
        if user and user.verify_password(request.form['password']):
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

@app.route("/queryquestions")
def queryQuestionHTML():
    return render_template('questions.html', questions=Question.query.all())

@app.route('/viewer')
def viewer():
    path = os.path.join("static","images")
    id = request.args['id']
    qImagePaths = glob(os.path.join(path, id,"q","*.png"))
    msImagePaths = glob(os.path.join(path, id, "ms","*.png"))
    q=Question.query.filter_by(id=id).first()
    return render_template('viewer.html', qPaths=qImagePaths, msPaths=msImagePaths, q=q)