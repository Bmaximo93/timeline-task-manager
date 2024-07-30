
    var tasks = [];
    var previousTasks = [];
    $(document).ready(function() {

        
        function timeline() {
            var now = new Date();
            var hours = String(now.getHours()).padStart(2, '0');
            var minutes = String(now.getMinutes()).padStart(2, '0');
            $('#hours').text(hours);
            $('#minutes').text(minutes);
            //console.log(hours, minutes);

            var container = $('#timeline');
            var seconds = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
        }

        function fetchTasks() {
           $.ajax({
                type: 'GET',
                url: '/get_tasks',
                success: function(response) {
                    
                    
                    if (Array.isArray(response.tasks)){
                        tasks = response.tasks;
                        //console.log('is array');
                        //console.log('Tasks:', response.tasks);
                        check = JSON.stringify(tasks) === JSON.stringify(previousTasks);
                        if (!check) {
                            console.log('Tasks have changed');
                            drawTaskCards(tasks);
                        }
                        drawTimelineTasks(response.tasks);
                        updateProgressRadial(tasks);
                        previousTasks = tasks;
                    } else {
                    console.error('Tasks data is not in the expected format:', response.tasks)};
                },

                error: function(xhr, status, error) {
                    console.log('Error fetching tasks:', error);
                }
            })
        } 


        function updateProgressRadial(tasks) {
            const currentTasks = tasks.filter(task => task.status === 'current');

            if (currentTasks.length > 0) {
                const currentTask = currentTasks[0];
                var secondaryColor = tinycolor(currentTask.color).lighten(20).toString();

                $('#currentTaskInfo').text(currentTask.name);
                $('#currentTaskInfo').css('color', currentTask.color);
                $('#progress-radial').css({
                    "background": `radial-gradient(closest-side, whitesmoke 85%, transparent 80% 100%), 
                            conic-gradient(${currentTask.color} ${currentTask.progress}%, ${secondaryColor} ${currentTask.progress}%)`
                });
            } else {
                $('#currentTaskInfo').text('No current task');
                $('#currentTaskInfo').css('color', 'grey');
                $('#progress-radial').css({
                    "background": `radial-gradient(closest-side, whitesmoke 85%, transparent 80% 100%), 
                            conic-gradient(grey 0%, grey 0%)`
                });
            }
        }

        function formatTime(dateTime) {
            let hours = String(dateTime.getHours()).padStart(2, '0');
            let minutes = String(dateTime.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        
        function getTimeStrings(task) {
            var startTime = new Date(task.start_time);
            var endTime = new Date(task.end_time);

            var startTimeFormatted = formatTime(startTime);
            var endTimeFormatted = formatTime(endTime);

            return { startTimeFormatted, endTimeFormatted };
        }

        function createTaskCard(task) {

            var { startTimeFormatted, endTimeFormatted } = getTimeStrings(task);
            var timeString = `${startTimeFormatted} - ${endTimeFormatted}`;


            var card = $('<div>', {
                'id': 'task-card-' + task.id,
                'class': 'card',
            });

            var cardColor = $('<div>', {
                'class': 'card-color',
                'style': 'background-color: ' + task.color + ';',
            }).appendTo(card);

            var cardBody = $('<div>', {
                'class': 'card-body',
            }).appendTo(card);

            var cardLeftContent = $('<div>', {
                'class': 'cardLeftContent',
            }).appendTo(cardBody);

            $('<h6>', {
                'class': 'card-title',
                'text': task.name,
            }).appendTo(cardLeftContent);

            var duration = $('<div>', {
                'class': 'duration',
            }).appendTo(cardLeftContent);

            $('<span>', {
                'class': 'material-symbols-outlined',
                'text': 'schedule',
                'style': 'margin: 0; padding-right: 5px; font-size: 14px;',
            }).appendTo(duration);

            $('<p>', {
                'class': 'time',
                'text': timeString,
            }).appendTo(duration);

            var statusColor = '';
            if (task.status === 'upcoming') {
                statusColor = 'lightsalmon'; 
            } else if (task.status === 'current') {
                statusColor = 'olivedrab'; 
            } else if (task.status === 'complete') {
                statusColor = 'grey'; 
            }

            var info = $('<div>', {
                'class': 'info',
            }).appendTo(cardBody);

            $('<p>', {
                'class': 'status',
                'text': task.status,
                'style': 'color: ' + statusColor + ';',
            }).appendTo(info);

            $('<button>', {
                'class': 'btn btn-sm innerbtn',
                'data-toggle': 'modal',
                'data-target': '#editTaskModal',
                'data-task-id': task.id,
                'data-task-name': task.name,
                'data-task-color': task.color,
                'data-start-time': startTimeFormatted,
                'data-end-time': endTimeFormatted,
                'html': '<span class="material-symbols-outlined" style="border: none; padding: 0; margin: 1;">edit</span>',
            }).appendTo(info);

            $('<button>', {
                'class': 'btn btn-sm innerbtn delete-task-btn',
                'data-task-id': task.id,
                'data-task-name': task.name,
                'html': '<span class="material-symbols-outlined" style="border: none; padding: 0; margin: 1;">delete</span>',
            }).appendTo(info);

            return card;

        } // end of createTaskCard function
        
        function drawTaskCards(tasks) {
            
            var taskCards = $('#task-cards');
            taskCards.empty();
            tasks.forEach( function(task) {
                card = createTaskCard(task);
                card.appendTo(taskCards);
            });
        
        }
        
        function drawTimelineTasks(tasks) {

            var dayLen = 86400000;
            var container = $('#timeline');
            var taskCards = $('#task-cards');
            var currentTaskInfo = $('#currentTaskInfo');
            container.empty();
            

            tasks.forEach( function(task) {

                   
                var now = new Date();
                var startTime = new Date(task.start_time);
                var endTime = new Date(task.end_time);
                var dayStart = new Date();
                dayStart.setHours(0, 0, 0, 0);
                dayEnd = new Date(dayStart);
                dayEnd.setHours(23, 59, 59, 999);

                var startMs = startTime - dayStart;
                var endMs = dayEnd - startTime;

                var totalDuration = endTime - startTime;
                let hoursDuration = Math.floor(totalDuration / (1000 * 60 * 60));
                let minutesDuration = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60));

                var { startTimeFormatted, endTimeFormatted } = getTimeStrings(task);
                var timeString = `${startTimeFormatted} - ${endTimeFormatted}`;

                var durationPercent = ((endTime - startTime) / dayLen) * 100;
                var elapsedPercent = Math.max(0, ((dayStart - startTime) / dayLen) * 100);
                var taskProgress = Math.min(100, ((now - startTime) / totalDuration) * 100);
                
    
                var startPercent = (startMs / dayLen) * 100;
                var endPercent = (endMs / dayLen) * 100;
                
                containerWidth = container.width();
                var barLeft = (startPercent / 100) * containerWidth;
                var barWidth = (durationPercent / 100) * containerWidth;

                var secondaryColor = tinycolor(task.color).lighten(20).toString();

                var bar = $('<div>', {
                    
                    'id': 'task-bar-' + task.id,
                    'class': 'progress taskprogress',
                    'role': 'progressbar',
                    'aria-valuenow': '+taskProgress+',
                    'aria-valuemin': '0',
                    'aria-valuemax': '100',
                    'style': 'position: absolute; left: ' + barLeft + 'px; width: ' + durationPercent + '%; background-color: '+secondaryColor+';',
                    'title': task.name,
                    

                });
                
                var barProgress = $('<div>', {

                        'class': 'progress-bar',
                        'style': 'position: absolute; width: ' + taskProgress + '%; background-color: ' + task.color + ';'
                    });
                

        
                container.append(bar);
                bar.append(barProgress);
                
                //console.log('now:', now);

                tbarProgress = Math.max(0, ((now - dayStart) / dayLen) * 100);
                var tbarLeft = (tbarProgress / 100) * containerWidth;
                $('#timebar').css('left', tbarLeft + 'px');

                //console.log('tbarProgress:', tbarProgress);
                //console.log('tbarLeft:', tbarLeft);
                //console.log('barLeft:', barLeft);

                if (task.status === 'current') {
                    $('#currentTaskInfo').text(task.name);
                    $('#currentTaskInfo').css('color', task.color);
                    $('#progress-radial').css({
                        "background": `radial-gradient(closest-side, whitesmoke 85%, transparent 80% 100%), 
                                conic-gradient(${task.color} ${taskProgress}%, ${secondaryColor} ${taskProgress}%)`
                    });
                } 

            
            
            });

        }; // end of drawTimelineTasks function

        timeline();
        fetchTasks();

        setInterval(timeline, 1000);
        setInterval(fetchTasks, 1000);
        
       

        $(window).on('resize', function() {
        console.log('Window resized');
        drawTimelineTasks(tasks);
        });

        $('#editTaskModal').on('show.bs.modal', function (event) {

        var button = $(event.relatedTarget); 
        var taskId = button.data('task-id');
        var taskName = button.data('task-name');
        var taskColor = button.data('task-color');
        var startTime = button.data('start-time');
        var endTime = button.data('end-time');

        var modal = $(this);
        modal.find('.modal-body #editTaskId').val(taskId);
        modal.find('.modal-body #editTaskName').val(taskName);
        modal.find('.modal-body #editTaskColor').val(taskColor);
        modal.find('.modal-body #editStartTime').val(startTime);
        modal.find('.modal-body #editEndTime').val(endTime);

        });

        $(document).on('click', '.delete-task-btn',function() {
           
            var taskId = $(this).data('task-id');
            var taskName = $(this).data('task-name');
            console.log('Delete task button clicked:', taskId);

            Swal.fire({
            html: 'Are you sure you want to delete <br><strong>' + taskName + '</strong>?',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel',
            confirmButtonColor: 'indianred',
            cancelButtonColor: '#d0d0d0',
            reverseButtons: true, 
            padding: '1rem',
            
            showClass: {
                popup: '', 
            },
            hideClass: {
                popup: '', 
            },
            customClass: {
                popup: 'custom-popup',
                cancelButton: 'custom-cancel-button',
                confirmButton: 'custom-confirm-button'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                
                $.ajax({
                    type: 'POST',
                    url: '/delete_task', 
                    data: { taskId: taskId },
                    success: function(response) {
                        if (response.success) {

                            console.log('delete task response successful');

                            tasks = tasks.filter(task => task.id !== taskId);

                            $('#task-card-' + taskId).remove();

                        } else {
                            alert('Error deleting task. Please try again.');
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Error:', status, error);
                        console.error('Response Text:', xhr.responseText);
                        alert('An error occurred while deleting the task. Please try again later.');
                    }
                });
            }
        });

        }); // end of delete task event

        $('#addTaskButton').click(function(event) {
        event.preventDefault();

        $.ajax({

            type: 'POST',
            url: '/new_task',
            data: $('#addTaskForm').serialize(),
            success: function(response) {
                if (response.error) {
                    Swal.fire({
                        icon: 'error',
                        text: response.error,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });

                } else {
                    $('#addTaskModal').modal('hide');
                    Swal.fire({
                        icon: 'success',
                        text: 'Your task has been added successfully!',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            },
            error: function(xhr, status, error) {
                var errorMessage = xhr.responseJSON ? xhr.responseJSON.error : 'An unknown error occurred.';
                console.error('Error:', status, error);
                console.error('Response Text:', xhr.responseText);
                Swal.fire({
                    icon: 'error',
                    text: errorMessage,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        });
    });

    $('#editTaskButton').click(function(event) {
        event.preventDefault();

        $.ajax({
            type: 'POST',
            url: '/edit_task',
            data: $('#editTaskForm').serialize(),
            success: function(response) {
                if (response.error) {
                    Swal.fire({
                        icon: 'error',
                        text: response.error,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                } else {
                    $('#editTaskModal').modal('hide');
                    Swal.fire({
                        icon: 'success',
                        text: 'Your task has been edited successfully!',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            },
            error: function(xhr, status, error) {
                var errorMessage = xhr.responseJSON ? xhr.responseJSON.error : 'An unknown error occurred.';
                console.error('Error:', status, error);
                console.error('Response Text:', xhr.responseText);
                Swal.fire({
                    icon: 'error',
                    text: errorMessage,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        });
    });
            
    }); // end of document ready