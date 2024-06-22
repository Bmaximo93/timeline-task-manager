import os
from datetime import date, datetime, timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from flask import Flask, render_template, request, redirect, jsonify, url_for, current_app
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

            #print(f"Task {task.id} start time is {task.start_time}")
            #print(f"Now = {now}")
            try:
                #print(f"Updating task: {task}")
                
                if task.end_time <= now:
                    task.status = "complete"
                elif task.start_time <= now <= task.end_time:
                    task.status = "current"
                elif now < task.start_time:
                    task.status = "upcoming"
                else:
                    task.status = "error"

                
                #print(f"Updated task {task.id} status to {task.status}")

            except Exception as e:
                print(f"Error updating task {task.id}: {e}")

        db.session.commit()
        print("Updated tasks and committed changes")
        

scheduler = BackgroundScheduler()
scheduler.add_job(func=update_tasks, trigger="interval", seconds=1)
scheduler.start()

@app.route('/get_tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    task_list = [{
        'id': task.id,
        'name': task.name,
        'color': task.color,
        'start_time': task.start_time.isoformat(),
        'end_time': task.end_time.isoformat(),
        'status': task.status,
    } for task in tasks]
    #print("Fetched tasks:", task_list) 
    return {'tasks': task_list}

# create new task
@app.route('/new_task', methods=['POST'])
def new_task():
    
    task_name = request.form.get('name')
    start_time_str = request.form.get('start_time')
    end_time_str = request.form.get('end_time')
    task_color = request.form.get('color')

    if not task_name:
        return jsonify({'error': 'Task name is required.'}), 400

    if not start_time_str or not end_time_str:
        return jsonify({'error': 'Task times are required.'}), 400

    try:
        start_time = datetime.strptime(start_time_str, '%H:%M').time()
        end_time = datetime.strptime(end_time_str, '%H:%M').time()

        today = date.today()
        start_datetime = datetime.combine(today, start_time)
        end_datetime = datetime.combine(today, end_time)

        if start_datetime >= end_datetime:
            return jsonify({'error': 'Start time must be before end time.'}), 400

        existing_tasks = Task.query.all()

        for existing_task in existing_tasks:
            if (start_datetime >= existing_task.start_time and start_datetime < existing_task.end_time) \
                    or (end_datetime > existing_task.start_time and end_datetime <= existing_task.end_time):
                return jsonify({'error': f'Task overlapping with existing task: "{existing_task.name}"'}), 400

        new_task = Task(
            name=task_name,
            color=task_color,
            start_time=start_datetime,
            end_time=end_datetime,
            status="upcoming"
        )
        db.session.add(new_task)
        db.session.commit()

        print(f"New task created: {new_task}")
        tasks = Task.query.all()
        

        return redirect(url_for('home'))
    except ValueError:
        return jsonify({'error': 'Invalid time format. Use HH:MM format.'}), 400
    except Exception as e:
        print(f"Error creating task: {e}")
        return jsonify({'error': 'An error occurred while creating the task.'}), 500
    
@app.route('/')
def home():
    return render_template('home.html')


@app.route('/delete_task', methods=['POST'])
def delete_task():
    task_id = request.form['taskId']
    task = Task.query.get(task_id)
    if not task:
        print(f"Task {task} not found")
        return jsonify({'success': False})
    
    db.session.delete(task)
    db.session.commit()
    return jsonify({'success': True})


@app.route('/edit_task', methods=['POST'])
def edit_task():
    task_id = request.form.get('task_id')
    task_name = request.form.get('name')
    start_time_str = request.form.get('start_time')
    end_time_str = request.form.get('end_time')
    task_color = request.form.get('color')

    if not task_name:
        return jsonify({'error': 'Task name is required.'}), 400

    if not start_time_str or not end_time_str:
        return jsonify({'error': 'Task times are required.'}), 400

    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': 'Task not found.'}), 404

        start_time = datetime.strptime(start_time_str, '%H:%M').time()
        end_time = datetime.strptime(end_time_str, '%H:%M').time()

        today = date.today()
        start_datetime = datetime.combine(today, start_time)
        end_datetime = datetime.combine(today, end_time)

        if start_datetime >= end_datetime:
            return jsonify({'error': 'Start time must be before end time.'}), 400

        existing_tasks = Task.query.filter(Task.id != task_id).all()

        for existing_task in existing_tasks:
            if (start_datetime >= existing_task.start_time and start_datetime < existing_task.end_time) \
                    or (end_datetime > existing_task.start_time and end_datetime <= existing_task.end_time):
                return jsonify({'error': f'Task overlapping with existing task: "{existing_task.name}"'}), 400

        task.name = task_name
        task.color = task_color
        task.start_time = start_datetime
        task.end_time = end_datetime
        db.session.commit()

        return jsonify({'success': 'Task updated successfully.'})
    except ValueError:
        return jsonify({'error': 'Invalid time format. Use HH:MM format.'}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error editing task: {e}")
        return jsonify({'error': 'An error occurred while editing the task.'}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        with db.engine.connect() as connection:
            table_exists = connection.dialect.has_table(connection, 'task')
            print(f"Database connected: {db.engine.url}")
            print(f"Task table exists: {table_exists}")
    app.run(debug=True)

