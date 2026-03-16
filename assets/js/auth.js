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
            
            // Simulate network delay
            setTimeout(() => {
                // Hardcoded credentials as requested
                if (username === 'samie' && password === 'timeisgood') {
                    // Success
                    localStorage.setItem('pmcc_auth', 'true');
                    localStorage.setItem('pmcc_user', 'samie');
                    
                    // Redirect to dashboard
                    window.location.href = '/index.html';
                } else {
                    // Failure
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    
                    // Show error (using a simple alert for now, or we could add a UI element)
                    alert('Invalid username or password. Please try again.');
                    passwordInput.value = '';
                    passwordInput.focus();
                }
            }, 1000);
        });
    }

    // Check auth on other pages
    const isLoginPage = window.location.pathname.includes('login.html');
    if (!isLoginPage) {
        const isAuthenticated = localStorage.getItem('pmcc_auth') === 'true';
        if (!isAuthenticated) {
            window.location.href = '/login.html';
        }
    }
});

// Logout function
export function logout() {
    localStorage.removeItem('pmcc_auth');
    localStorage.removeItem('pmcc_user');
    window.location.href = '/login.html';
}
