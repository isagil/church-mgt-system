// PMCC - Authentication Logic

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            // Show loading state
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Authenticating...';
            
            // Call backend API
            fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Success
                    localStorage.setItem('pmcc_auth', 'true');
                    localStorage.setItem('pmcc_token', data.token);
                    localStorage.setItem('pmcc_user', data.user.username);
                    localStorage.setItem('pmcc_role', data.user.role);
                    
                    // Redirect to dashboard
                    window.location.href = '/index.html';
                } else {
                    // Failure
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    
                    alert(data.error || 'Invalid username or password. Please try again.');
                    passwordInput.value = '';
                    passwordInput.focus();
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                alert('An error occurred during login. Please try again later.');
            });
        });
    }

    // Auth check removed to allow direct access
});

// Logout function
export function logout() {
    localStorage.removeItem('pmcc_auth');
    localStorage.removeItem('pmcc_token');
    localStorage.removeItem('pmcc_user');
    localStorage.removeItem('pmcc_role');
    window.location.href = '/index.html'; // Redirect to home instead of login
}

// Authenticated fetch helper
export async function authFetch(url, options = {}) {
    const token = localStorage.getItem('pmcc_token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    // Removed auto-logout on 401 to keep app working
    return response;
}
