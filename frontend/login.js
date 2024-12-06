document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    const query = `
      mutation {
        login(email: "${email}", password: "${password}") {
          token
          user {
            role
          }
        }
      }
    `;
  
    try {
      const response = await fetch('http://localhost:4000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
  
      const result = await response.json();
      console.log(result);  // Log the result to check the response
  
      if (result.errors || !result.data.login.token) {
        document.getElementById('error-message').textContent = 'Invalid email or password';
      } else {
        // Store the token and user role in localStorage
        localStorage.setItem('token', result.data.login.token);
        localStorage.setItem('role', result.data.login.user.role);
  
        // Log the user role to debug
        console.log('User role:', result.data.login.user.role);
  
        // Redirect based on user role
        if (result.data.login.user.role === 'admin') {
          console.log('Redirecting to admin dashboard');
          window.location.href = 'admin.html';  // Admin page
        } else {
          console.log('Redirecting to user dashboard');
          window.location.href = 'user.html';  // Regular user page
        }
      }
    } catch (error) {
      document.getElementById('error-message').textContent = 'An error occurred during login.';
      console.error(error);  // Log error to debug
    }
  });
  