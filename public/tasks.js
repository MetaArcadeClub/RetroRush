document.addEventListener('DOMContentLoaded', () => {
  const taskContainer = document.querySelector('.taskContainer');
  const tasks = [
    { id: '1', type: 'follow', title: '500', details: 'Follow @metaarcadeclub', link: 'https://twitter.com/metaarcadeclub', buttonText: 'Follow' },
    { id: '2', type: 'retweet', title: '200', details: 'Retweet this post', link: 'https://twitter.com/metaarcadeclub/status/1773389811157553373', buttonText: 'Retweet' },
    { id: '3', type: 'like', title: '200', details: 'Like this post', link: 'https://twitter.com/metaarcadeclub/status/1772348104307523963', buttonText: 'Like' },
    { id: '4', type: 'tag', title: '250', details: 'Tag @metaarcadeclub', link: 'https://link-to-task4.com', buttonText: 'Tag' },
    { id: '5', type: 'join', title: '500', details: 'Join Discord', link: 'https://discord.gg/meta-arcade-club', buttonText: 'Join' },
  ];

  tasks.forEach(task => {
    const taskBox = document.createElement('div');
    taskBox.className = 'taskBox';
    taskBox.innerHTML = `
      <h2>${task.title} <img src="ticket.png" alt="Ticket Icon" class="ticket-icon"></h2>
      <div class="taskContent">
        <p>${task.details}</p>
        <button class="taskButton" data-task-id="${task.id}" data-task-type="${task.type}" data-points="${task.title}" data-action="${task.link}">${task.buttonText}</button>
      </div>
    `;
    taskContainer.appendChild(taskBox);
  });

  attachEventListeners();
});

function attachEventListeners() {
  document.querySelectorAll('.taskButton').forEach(button => {
    button.addEventListener('click', (event) => {
      const button = event.target;
      const actionUrl = button.getAttribute('data-action');
      const taskId = button.getAttribute('data-task-id');
      const taskType = button.getAttribute('data-task-type');
      const points = parseInt(button.getAttribute('data-points'), 10);

      if (actionUrl) {
        window.open(actionUrl, '_blank'); // Open in a new tab

        setTimeout(() => {
          if (confirm('Have you completed the task? If yes, points will be added to your account.')) {
            notifyTaskCompletion(taskId, taskType, points); // Notify the server of the task attempt
          }
        }, 5000); // Ask after 5 seconds to give users some time
      }
    });
  });
}

function notifyTaskCompletion(taskId, taskType, points) {
  // Retrieve the user ID from localStorage
  const userId = localStorage.getItem('userId');

  if (!userId) {
    alert('You are not logged in or your session has expired.');
    return;
  }

  console.log(`Notifying server of task completion: taskId=${taskId}, taskType=${taskType}, points=${points}, userId=${userId}`);

  fetch('/update-tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, taskId, taskType, points })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Points updated successfully!');
    } else {
      alert('Failed to update points. Please try again.');
    }
  })
  .catch(error => {
    console.error('Error updating points:', error);
    alert('There was a problem communicating with the server.');
  });
}


// Assume this part is called upon successful login somewhere in your application
function handleAuthSuccess(user) {
  localStorage.setItem('userId', user.sub); // Make sure 'user.sub' correctly references the user ID returned by your auth system
}