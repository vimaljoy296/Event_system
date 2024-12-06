// user.js

// Utility function to display messages
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.className = `alert alert-${type}`;
    document.body.appendChild(messageDiv);
    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }
  
  // Fetch available events
  async function fetchAvailableEvents() {
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
  
      // Display available events
      const eventsList = document.getElementById('events-list');
      eventsList.innerHTML = ''; // Clear previous events
      events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
          <h3>${event.name}</h3>
          <p>${event.description}</p>
          <p>Date: ${event.date}</p>
          <p>Capacity: ${event.capacity}</p>
          <button class="btn" onclick="registerForEvent(${event.id})">Register</button>
        `;
        eventsList.appendChild(eventCard);
      });
    } catch (error) {
      showMessage('Error fetching events.', 'danger');
    }
  }
  
  // Fetch registered events for the user
  async function fetchRegisteredEvents() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); // Assuming the user ID is stored in localStorage
  
    const query = `
      query {
        fetchUserEvents(userId: "${userId}") {
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
      const events = result.data.fetchUserEvents;
  
      // Display registered events
      const registeredEventsList = document.getElementById('registered-events-list');
      registeredEventsList.innerHTML = ''; // Clear previous events
      events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
          <h3>${event.name}</h3>
          <p>${event.description}</p>
          <p>Date: ${event.date}</p>
          <p>Capacity: ${event.capacity}</p>
        `;
        registeredEventsList.appendChild(eventCard);
      });
    } catch (error) {
      showMessage('Error fetching registered events.', 'danger');
    }
  }
  
  // Register for an event
  async function registerForEvent(eventId) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); // Assuming the user ID is stored in localStorage
  
    const query = `
      mutation {
        registerForEvent(eventId: ${eventId}, userId: "${userId}") {
          id
          name
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
      
      if (result.errors) {
        showMessage('Error registering for event.', 'danger');
      } else {
        showMessage('Successfully registered for event!');
        fetchRegisteredEvents(); // Refresh registered events
      }
    } catch (error) {
      showMessage('Error registering for event.', 'danger');
    }
  }
  
  // Fetch available and registered events on page load
  fetchAvailableEvents();
  fetchRegisteredEvents();
  