// PMCC - Login Logic (Mock)

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            // Show loading state
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Authenticating...';
            
            // Attempt real login
            fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Invalid credentials');
                }
                return response.json();
            })
            .then(data => {
                // SUCCESS
                localStorage.setItem('pmcc_auth', 'true');
                localStorage.setItem('pmcc_token', data.token);
                localStorage.setItem('pmcc_user', data.user.username);
                localStorage.setItem('pmcc_role', data.user.role);
                localStorage.setItem('pmcc_permissions', JSON.stringify(data.user.permissions));
                
                // Success feedback
                submitBtn.classList.remove('btn-primary');
                submitBtn.classList.add('btn-success');
                submitBtn.innerHTML = '<i class="bi bi-check-lg me-2"></i>Welcome!';
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 800);
            })
            .catch(error => {
                console.error('Login failed:', error);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                
                // Show Bootstrap Toast instead of alert
                const toastElement = document.getElementById('loginToast');
                const toastMessage = document.getElementById('toastMessage');
                if (toastElement && toastMessage) {
                    toastMessage.textContent = error.message || 'Invalid username or password';
                    const toast = new bootstrap.Toast(toastElement);
                    toast.show();
                } else {
                    alert('Login failed: ' + (error.message || 'Invalid username or password'));
                }
            });
        });
    }
});
