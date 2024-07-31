# TIMELINE TASK MANAGER

#### Description:

  This application was developed as my final project for Harvard’s CS50x course. It is a simple time management app designed to help users visualize time, plan and manage their daily tasks. Moving forward, I plan to expand on this project by adding new features and enhancements to further improve functionality and user experience.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Project Features](#project-features)
4. [Technologies Used](#technologies-used)
5. [Application Architecture](#application-architecture)
6. [File Structure](#file-structure)
7. [Planned Features](#planned-features)
8. [Contributing](#contributing)
9. [License](#license)
10. [Contact](#contact)
11. [Acknowledgments](#acknowledgments)

## Introduction:
    

Timeline Task Manager aims to streamline task organization through a visual representation of your day. This application was developed with the intention of assisting individuals with ADHD, autism, and other executive function disorders by providing a simple, clutter-free interface for time management, promoting productivity and efficient time allocation, inspired by similar applications such as [Owaves](https://owaves.com) and [Sectograph](https://www.sectograph.com). 

Executive function disorders, including ADHD, often present challenges in planning and organizing tasks. Individuals with ADHD, in particular, struggle with organizing information, managing memory, sequencing thoughts and behaviors, and perceiving time accurately. Traditional planners can sometimes exacerbate these difficulties, as the blocks of information they present can often feel overwhelming and abstract. The concept of a timeline task manager seeks to provide a flexible solution to these problems. Users are able to create and manage tasks, assign them time slots, and track their progress throughout the day.

At its core, However, the Timeline Task Manager focuses mainly on visual feedback. Rather than being thought of as a planner, this tool aims to combine the general idea of a task list with the benefits of visualizing your tasks in a timeline format. By displaying tasks and their relative positions on a horizontal timeline, users can better understand the sequencing and progress of their activities, As the bars displayed also act as individual progress bars that fill as time passes. The visual representation of tasks should help users, especially those with ADHD, to better grasp the actual time required for each task, as longer tasks take more space within the timeline, hopefully reducing any confusion and enhancing time management.

While the app is designed with ADHD users in mind, it should also be useful for anyone looking to improve their time management skills. The Timeline Task Manager seeks to provide a clear and intuitive visual structure that helps users to stay on track and manage their day more effectively.

## Installation:

1. **Clone the repository:**
    ```bash
    git clone https://github.com/Bmaximo93/timeline-task-manager.git
    ```

2. **Navigate to the project directory:**
    ```bash
    cd timeline-task-manager
    ```

3. **Create a virtual environment:**
    ```bash
    python3 -m venv venv
    ```

4. **Activate the virtual environment:**
    - On Windows:
      ```bash
      venv\Scripts\activate
      ```
    - On macOS and Linux:
      ```bash
      source venv/bin/activate
      ```

5. **Install the required packages:**
    ```bash
    pip install -r requirements.txt
    ```

6. **Run the application:**
    ```bash
    flask run
    ```

7. **Access the application:**\
    Open a web browser and go to `http://127.0.0.1:5000/`

#### Note on Application Use:
 This application is currently intended for local use and may not be ready for production or deployment in its current state.

## Project Features:

- **Timeline and Task Bars:** 
  - The timeline represents 24 hours, and daily tasks are displayed as color-coded bars within it.  
  - Tasks are positioned and sized relative to their scheduled times, meaning tasks taking place further along the day will be placed closer to the end of the timeline, and the longer the duration of the task, the bigger the portion of the timeline the bar will take up.
    
- **Current Time Indication:** 
  - The timeline has a moving indicator that represents the current moment, as time passes this indicator will move across the timeline, representing how much time has passed since the day's start, or in other words, where you currently are in the timeline. 
    
- **Task Progress Indication:** 
  - The task bars themselves also act as progress bars, when a task is created it's bar will be placed along the timeline with a lighter color than the one selected by the user, as the indicator passes through the bar it gets filled up in order to represent how much time has passed since the task's start, and how much time remains until it's end

- **Clock:**
  - Above the timeline, users can also see the current time in the traditional manner with a digital clock that displays time in a 24 hour format, the clock area also works as a visualizer for the current task. displaying it's name and progress.
    
- **Radial Progress Indicator:** 
  - Placed around the clock is a radial progress bar, when there is no current active task, the bar will be gray, as a new task begins, the radial bar's color changes to the current task's color, and will also be filled until completion, this allows for a clearer visualization of the task's time, especially considering that smaller tasks can be too small on the timeline for meaningful progress tracking using the timeline only

- **Task Cards:** 
  - Task cards allow the user to review and manage their tasks individually. Task cards are displayed below the timeline, as a list of cards representing saved tasks, initially, when there are no tasks saved, this section will only display the menu card with the option to add tasks, but as new tasks are added this space will be filled with a list of cards that show information about the tasks, such as their names, their color, current status, start time and end time, as well as individual buttons for editing the task or deleting it.

- **Adding Tasks:** 
  - Users are able to create new tasks, after clicking the add task button a modal menu will appear, prompting the user to insert the new task's name, color, start and end times, after the new task is saved, it will be added to the database and displayed in the timeline.

- **Deleting Tasks:** 
  - By default, tasks are not deleted on completion, instead, they are marked as completed and displayed as such on their task cards, this is done in order for completed tasks to still be visible on the timeline, allowing the user to see past tasks as well as upcoming tasks, users can, however, delete tasks manually, by clicking on the delete task button on the selected task's card, this will prompt the user for confirmation, then delete the task from the database.

- **Editing Tasks:** 
  - After a task is created and a task card is generated, the user can still edit every aspect of the task by clicking the edit task button on the slected task's card, after confirming the new parameters, the task will be updated accordingly.

## Technologies Used:

- **Backend:**

  - **Flask:** Python web framework used for building the main application backend.
  - **Flask-SQLAlchemy:** Flask extension for SQL database integration, facilitating database operations.
  - **Flask-Session:**  Flask extension to manage user sessions.
  - **APScheduler:** Python library for scheduling tasks within the application.
  - **SQLite:** Embedded relational database management system for local development. 

- **Frontend:**

  - **jQuery/Ajax:** JavaScript libraries for frontend interaction and asynchronous request handling.
  - **Bootstrap:** Frontend framework for responsive and mobile-first design.
  - **SweetAlert:** JavaScript library for creating custom and attractive alert messages.

## Application Architecture: 

### **Backend:** 

#### **Main Application:**

- **Flask Initialization and Configuration:** 
  - Intializes the flask application 
  - Configures the SQLite database (timeline.db) for storing tasks
  - Configures Flask-Session to store session data in the filesystem for persistence across browser sessions.

- **Database Model:** 
  - Defines the Task model using SQLAlchemy, which represents individual tasks with attributes such as id, name, color, start_time, end_time, and status.

- **Task Updater and Scheduler Setup:** 
  - Uses BackgroundScheduler from APScheduler to schedule periodic updates of task statuses.
  - sets tasks as either complete, upcoming or current.

- **Routes and API Endpoints:** 

  - Implements various Flask routes to handle CRUD operations for tasks: 

   - **task fetching:** Retrieves tasks from the database, formats them into a list of dictionaries and returns them as a JSON response to the client for dynamic display and interaction,

   - **task creation:** Handles POST requests with form data to create new tasks, validates input parameters on server-side, upon successful validation, creates a new `Task` object with the provided details and inserts it into the SQLite database, If any validation fails (e.g., invalid time format or overlaping tasks), appropriate error responses are returned.

   - **task deletion:** Manages POST requests to delete specific tasks identified by unique IDs, deleting them from the database and committing the transaction, handles error if task does not exist.

   - **task editing:** Handles Post requests to modify existing tasks, retrieves task details based on the provided task ID, validates and updates task attributes, similar to task creation, it will ensure that new task details do not overlap with existing tasks or violate any constraints. Upon successful validation and update, commits changes to the database, rolls back transaction and returns appropriate error response if any error occurs during the process.

- **Database Initialization and Server Start:** 
  - Creates database if none are found, Creates tables
  - Starts the Flask application.

### **Database**:

 #### **Task Table:**

  - `id`: Integer, primary key of the task.
  - `name`: String (up to 100 characters), representing the name or title of the task.
  - `color`: String (up to 30 characters), storing a color code for the task.
  - `start_time`: DateTime, indicating when the task starts.
  - `end_time`: DateTime, specifying when the task ends.
  - `status`: String (up to 20 characters), tracking the status of the task (e.g., upcoming, current, complete).


### **Frontend:**

#### **User Interface:**

- **HTML Structure and Template Integration:**

  - **Layout Definition:** Divides the page into logical sections by using content blocks, such as the main content area and footer, also incorporates necessary links to external stylesheets (Bootstrap and custom CSS) and scripts (Bootstrap's JavaScript components and custom JavaScript).

  - **Main HTML:** Serves as the main template for the application's interface, also includes containers for displaying dynamic content, such as current task information, progress visualization, timeline display, and task cards.


- **CSS Styling:**

  - **Bootstrap:** Utilizes Bootstrap's predefined classes and components for responsive layout and styling as a base, ensuring consistency and compatibility across different devices and screen sizes.

  - **Custom CSS:** Provides essential specifications for the display of elements beyond Bootstrap's defaults. 
  
#### **JavaScript Functionality:**

- **Initialization and Timeline Display:**
  - Initializes and updates the clock display to show the current time.
  - Uses AJAX to fetch task data from the server in real time.
  - On successful retrieval of task data, stores tasks in local `tasks` array.
  - Checks for changes by comparing current data with previous fetch.
  - Updates interface to reflect updated task information when changes are detected.
  - Updates the progress radial based on current task's status.

- **Updating Progress Radial:**
  - Dynamically adjusts Radial bar's progress based on the completion status of the current task.

- **Time Formatting:**
  - Formats a given `Date` object into `hh:mm` format for use as strings on task cards also ensuring single-digit hours and minutes are padded with leading zeros.

- **Task Card Generation and Rendering:**
  - Generates HTML for task cards based on provided `task` objects, including task name, duration, status and insertion of task IDs for action buttons (edit/delete).
  - Sets styles and data attributes dynamicallly based on task properties.
  - Populates task cards container with cards for each task in `tasks` array
  

- **Rendering Timeline Tasks:**
  - Draws task bars on the timeline.
  - Calculates task placement and width relative to the timeline's dimensions.
  - Updates current task progress based on elapsed time since start.
  - Recalculates bar placement and width if window is resized in order to preserve visual consistency.

- **Task Creaton:**
  - Handles form submission for adding new tasks, sends data via AJAX
  - Displays feedback using SweetAlert.
- **Task Editing:**
  - Handles form submission for editing tasks, updates task data on the server.
  - pre-fills modal form for each task card with correct task data for when edit task button is clicked.
  - Displays feedback using SweetAlert.
- **Task Deletion:**
  - handles task deletion with confirmation dialog.

## **File Structure:**

#### Static:

- **styles.css**: Contains the CSS styles for the application, defining the look and feel of the front-end interface.

- **scriptmain.js**: Holds JavaScript code for handling dynamic behavior on the client side, such as updating the timeline and interacting with the server via AJAX requests.

#### Templates:

- **layout.html**: The base template that includes common elements like the header and footer. Other HTML files, such as home.html or any future pages should extend this template to maintain consistency across the app.

- **home.html**: Extends layout.html, this is the main page template that includes the timeline interface where users can see their tasks and interact with them.

#### Application:
- **app.py**: The main application file. It initializes the Flask app, defines routes for the web application, handles HTTP requests, and interacts with the database.

#### Database:
- **timeline.db**: The SQLite database file that stores all data for the application's tasks, accessed by `app.py` to read from and write to the database.

## Planned Features:

- **User Authentication:**
  - Implementing user registration and login functionality to support multiple users.

- **Schedule Future Tasks:**
  - Enable users to schedule tasks for any future date, not just the current day.

- **Recurring Tasks:**
  - Enable the creation of tasks that repeat on a daily, weekly, or monthly basis.

- **Integration with Calendars and other tools:**
  - Allow integration with popular calendar apps (e.g., Google Calendar, Outlook) and Project Management tools (e.g., Trello, Asana).

- **Drag and drop features:**
  - Allow the user to edit task duration by dragging on the corners of task bars or deleting tasks by dragging the task bars outside the timeline.

- **Sunrise and Sunset times:**
  - display sunrise and sunset times as icons on the timeline.

- **Scheduled sleep times:**
  - allow the user to schedule sleep times to be displayed on the timeline.
  - allow for integration with sleep tracking apps.

- **Customization options:**
  - Option for automatic task deletion on completion.
  - Option for task bars to be erased by the time indicator as it passes, rather than being filled up as a progress bar.
  - Dark mode option for better usability in low-light environments.


## Contributing:

If you’d like to contribute to this project, please fork the repository and use a feature branch. Pull requests are warmly welcome.

	1.	Fork the Project
	2.	Create your Feature Branch (git checkout -b feature/FeatureName)
	3.	Commit your Changes (git commit -m 'Add some FeatureName')
	4.	Push to the Branch (git push origin feature/FeatureName)
	5.	Open a Pull Request

## License

This project is licensed under the terms of the [MIT license](LICENSE.txt).

## Contact

Bruno Máximo - [Bmaximo93@gmail.com](mailto:Bmaximo93@gmail.com)

Project Link: [https://github.com/Bmaximo93/timeline-task-manager](https://github.com/Bmaximo93/timeline-task-manager)

## Acknowledgments

### **Inspiration:** 

- [Owaves](https://owaves.com)
- [Sectograph](https://www.sectograph.com)

### Libraries and Tools:
 
- [Flask](https://flask.palletsprojects.com/)
- [SQLAlchemy](https://www.sqlalchemy.org/)
- [Bootstrap](https://getbootstrap.com/)
- [jQuery](https://jquery.com/)
- [Google Material Design Icons](https://fonts.google.com/icons)
- [Sweet Alert](https://sweetalert2.github.io)



