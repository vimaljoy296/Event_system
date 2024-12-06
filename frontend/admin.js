// Utility function to display messages
function showMessage(message, type = 'success') {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.className = `alert alert-${type}`;
  messageDiv.style.display = 'block';
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}

// Validate Role before continuing
function validateRole() {
  const role = localStorage.getItem('role');
  if (role !== 'admin') {
    // If role is not admin, redirect to user dashboard
    window.location.href = 'user.html';  // or a more appropriate page
  }
}

// Fetch all events and update the table
async function fetchEvents() {
  const token = localStorage.getItem('token');
  const query = `
    query {
      fetchEvents {
        id
        name
        description
        date
        capacity
      }
    }
  `;

  try {
    const response = await fetch('http://localhost:4000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query })
    });

    const result = await response.json();
    const events = result.data.fetchEvents;

    // Update events table
    const tableBody = document.getElementById('events-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Clear existing rows
    events.forEach(event => {
      const row = tableBody.insertRow();
      row.innerHTML = `
        <td>${event.id}</td>
        <td>${event.name}</td>
        <td>${event.description}</td>
        <td>${event.date}</td>
        <td>${event.capacity}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="showUpdateForm(${event.id}, '${event.name}', ${event.capacity})">Update</button>
          <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.id})">Delete</button>
        </td>
      `;
    });

    // Populate select options for update and delete forms
    const updateSelect = document.getElementById('event-id-update');
    const deleteSelect = document.getElementById('event-id-delete');
    updateSelect.innerHTML = '';
    deleteSelect.innerHTML = '';
    events.forEach(event => {
      const optionUpdate = document.createElement('option');
      optionUpdate.value = event.id;
      optionUpdate.textContent = event.name;
      updateSelect.appendChild(optionUpdate);

      const optionDelete = document.createElement('option');
      optionDelete.value = event.id;
      optionDelete.textContent = event.name;
      deleteSelect.appendChild(optionDelete);
    });
  } catch (error) {
    showMessage('Failed to fetch events.', 'danger');
  }
}

// On page load, check role and fetch events
window.onload = function() {
  validateRole(); // Check role before proceeding
  fetchEvents();  // Fetch events after role validation
};
