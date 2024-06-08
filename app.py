import os
from datetime import date, datetime, timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from flask import Flask, render_template, request, redirect, url_for, current_app
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

# task db model
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    color = db.Column(db.String(30))
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    status = db.Column(db.String(20))


def update_tasks():
    with app.app_context():
        now = datetime.now()
        tasks = Task.query.all()
        for task in tasks:

            print(f"Task {task.id} start time is {task.start_time}")
            print(f"Now = {now}")
            try:
                print(f"Updating task: {task}")
                
                if task.end_time <= now:
                    task.status = "completed"
                elif task.start_time <= now <= task.end_time:
                    task.status = "current"
                elif now < task.start_time:
                    task.status = "upcoming"
                else:
                    task.status = "error"

                # Update status instead of deleting the task
                print(f"Updated task {task.id} status to {task.status}")

            except Exception as e:
                print(f"Error updating task {task.id}: {e}")

        db.session.commit()
        print("Updated tasks and committed changes")
        

scheduler = BackgroundScheduler()
scheduler.add_job(func=update_tasks, trigger="interval", minutes=1)
scheduler.start()

@app.route('/get_tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    task_list = [{
        'name': task.name,
        'color': task.color,
        'start_time': task.start_time.isoformat(),
        'end_time': task.end_time.isoformat(),
        'status': task.status,
    } for task in tasks]
    print("Fetched tasks:", task_list)  # Debugging statement
    return {'tasks': task_list}

# create new task
@app.route('/new_task', methods=['POST'])
def new_task():

    start_time_str = request.form['start_time']
    end_time_str = request.form['end_time']

    start_time = datetime.strptime(start_time_str, '%H:%M').time()
    end_time = datetime.strptime(end_time_str, '%H:%M').time()

    today = date.today()

    start_datetime = datetime.combine(today, start_time)
    end_datetime = datetime.combine(today, end_time)

    try:
        task = Task(
        name = request.form['name'],
        color = request.form['color'],
        start_time = start_datetime,
        end_time = end_datetime,
        status = "upcoming"
        ) # type: ignore
        db.session.add(task)
        db.session.commit()
        print(f"New task created: {task}")
        tasks = Task.query.all()
        print("All Tasks after adding new task:", tasks)

        return redirect(url_for('home'))
    except Exception as e:
        print(f"Error creating task: {e}")
        return redirect(url_for('home'))

@app.route('/')
def home():
    return render_template('home.html')


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        with db.engine.connect() as connection:
            table_exists = connection.dialect.has_table(connection, 'task')
            print(f"Database connected: {db.engine.url}")
            print(f"Task table exists: {table_exists}")
    app.run(debug=True)