from datetime import datetime
from flask import Flask, request, redirect, url_for, session
from flask.templating import render_template
from config import Config
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)
username="Russell"
password="chugs"

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

@app.route("/")
def home():
    if 'username' in session:
        user = User.query.filter_by(username=session['username'])
        return render_template('index.html', user=user)
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