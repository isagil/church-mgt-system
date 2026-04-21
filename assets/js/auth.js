// PMCC - Authentication Logic

document.addEventListener('DOMContentLoaded', function() {
    // Check if we are on the login page (index.html or root)
    const isLoginPage = window.location.pathname === '/' || 
                       window.location.pathname.endsWith('index.html');
    
    const isAuthenticated = localStorage.getItem('pmcc_auth') === 'true';

    if (!isLoginPage && !isAuthenticated) {
        window.location.href = '/index.html';
    }
});

// Logout function
export function logout() {
    localStorage.removeItem('pmcc_auth');
    localStorage.removeItem('pmcc_token');
    localStorage.removeItem('pmcc_user');
    localStorage.removeItem('pmcc_role');
    window.location.href = '/index.html';
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

    return response;
}
