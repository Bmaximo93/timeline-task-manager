import os
from datetime import datetime, timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from flask import Flask, render_template, request, redirect, url_for
from apscheduler.schedulers.background import BackgroundScheduler
import atexit

app = Flask(__name__)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'timeline.db')
app.config["SESSION_PERMANENT"] = True
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

db = SQLAlchemy(app)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)

# implement later
# def update_tasks():
#     now = datetime.now()
#     tasks = Task.query.all()
#     for task in tasks:
#         if task.start_time < now:
#             task.start_time = now
#         if task.end_time <= now:
#             db.session.delete(task)
#     db.session.commit()

# implement later
#scheduler = BackgroundScheduler()
#schedular.add_job(func=update_tasks, trigger="interval", minutes=1)
#scheduler.start()

@app.route('/new_task', methods=['POST'])
def new_task():

    task = Task(
    name = request.form['name'],
    start_time = datetime.strptime(request.form['start_time'], '%H:%M'),
    end_time = datetime.strptime(request.form['end_time'], '%H:%M'),
    ) # type: ignore
    db.session.add(task)
    db.session.commit()
    return redirect(url_for('home'))



@app.route('/')
def home():
    return render_template('layout.html')


if __name__ == '__main__':
    app.run(debug=True)