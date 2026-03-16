// PMCC - Main JavaScript
import { updateAllCurrencies, formatCurrency, getCurrencySymbol } from './currency.js';
import { logout } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    // Auth Check
    const isAuthenticated = localStorage.getItem('pmcc_auth') === 'true';
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (!isAuthenticated && !isLoginPage) {
        window.location.href = '/login.html';
        return;
    }

    // Initial currency update
    updateAllCurrencies();

    // Fetch Dashboard Stats from API
    async function fetchDashboardStats() {
        try {
            const response = await fetch('/api/dashboard/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();
            
            // Update UI with real data
            const memberStat = document.querySelector('.bi-people')?.closest('.stat-card')?.querySelector('h3');
            if (memberStat) memberStat.textContent = data.totalMembers.toLocaleString();
            
            const partnerStat = document.querySelector('.bi-cash-stack')?.closest('.stat-card')?.querySelector('h3');
            if (partnerStat) {
                partnerStat.setAttribute('data-amount', data.totalIncome);
                partnerStat.textContent = formatCurrency(data.totalIncome);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    }

    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        fetchDashboardStats();
    }

    // Set User Name
    const userName = localStorage.getItem('pmcc_user');
    if (userName) {
        const userElements = document.querySelectorAll('.user-info h6, .navbar .d-md-inline');
        userElements.forEach(el => {
            if (userName === 'samie') {
                el.textContent = 'Samie';
            } else {
                el.textContent = userName;
            }
        });
    }

    // Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Theme Colors
    const colors = {
        primary: '#5B0F8A',
        sidebar: '#4A0C73',
        accent: '#8E24AA',
        light: '#E9D8F3',
        textDark: '#2E0B47',
        textLight: '#FFFFFF',
        hover: '#A64AC9'
    };

    // Dashboard Charts
    const incomeCtx = document.getElementById('incomeChart');
    if (incomeCtx) {
        new Chart(incomeCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Income',
                    data: [4000, 3000, 2000, 2780, 1890, 2390, 3490],
                    borderColor: colors.accent,
                    backgroundColor: 'rgba(142, 36, 170, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: colors.accent
                }, {
                    label: 'Expenses',
                    data: [2400, 1398, 9800, 3908, 4800, 3800, 4300],
                    borderColor: 'rgba(91, 15, 138, 0.5)',
                    backgroundColor: 'rgba(91, 15, 138, 0.05)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: colors.textDark, font: { family: 'Inter', size: 12 } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { 
                            color: colors.textDark,
                            callback: function(value) {
                                return getCurrencySymbol() + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: colors.textDark }
                    }
                }
            }
        });
    }

    const activityCtx = document.getElementById('activityChart');
    if (activityCtx) {
        new Chart(activityCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Active Members',
                    data: [400, 300, 200, 278, 189, 239, 349],
                    backgroundColor: colors.accent,
                    hoverBackgroundColor: colors.hover,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: colors.textDark, font: { family: 'Inter', size: 12 } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { color: colors.textDark }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: colors.textDark }
                    }
                }
            }
        });
    }

    // Toast System
    window.showToast = function(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(container);
        }

        const toastId = 'toast-' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="bi ${type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-warning'} me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', toastHtml);
        
        const toastElement = document.getElementById(toastId);
        const bsToast = new bootstrap.Toast(toastElement, { delay: 3000 });
        bsToast.show();

        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    };

    // Form Submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('[type="submit"]');
            const originalText = submitBtn ? submitBtn.innerHTML : '';
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
            }

            // Simulate API call
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
                window.showToast('Action completed successfully!');
                form.reset();
                
                // Close modals if any
                const modalElement = form.closest('.modal');
                if (modalElement) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) modal.hide();
                }
            }, 1000);
        });
    });

    // Action Buttons (Approve, Decline, View, Delete, etc.)
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        // Approve Action
        if (target.classList.contains('btn-success') && target.textContent.includes('Approve')) {
            const row = target.closest('tr');
            window.showToast('Request approved successfully!');
            if (row) {
                const statusBadge = row.querySelector('.badge');
                if (statusBadge) {
                    statusBadge.className = 'badge bg-primary bg-opacity-10 text-primary';
                    statusBadge.textContent = 'Approved';
                }
                target.parentElement.innerHTML = `
                    <button class="btn btn-sm btn-light border-0"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-light border-0"><i class="bi bi-trash"></i></button>
                `;
            }
        }

        // Decline Action
        if (target.classList.contains('btn-danger') && target.textContent.includes('Decline')) {
            window.showToast('Request declined', 'warning');
            const row = target.closest('tr');
            if (row) row.remove();
        }

        // View Action
        if (target.querySelector('.bi-eye') || target.textContent.includes('View')) {
            window.showToast('Opening record details...', 'info');
        }

        // Download Action
        if (target.querySelector('.bi-download') || target.textContent.includes('Download') || target.textContent.includes('Export')) {
            window.showToast('Preparing download...', 'info');
            setTimeout(() => window.showToast('Download started!'), 1500);
        }

        // Delete Action
        if (target.querySelector('.bi-trash')) {
            if (confirm('Are you sure you want to delete this record?')) {
                const row = target.closest('tr') || target.closest('.card');
                window.showToast('Record deleted successfully!', 'warning');
                if (row) row.remove();
            }
        }

        // Filter Action
        if (target.querySelector('.bi-filter')) {
            window.showToast('Filter options coming soon!', 'info');
        }
    });

    // Search Functionality
    const searchInput = document.querySelector('.navbar .form-control');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    window.showToast(`Searching for: "${query}"...`);
                    searchInput.value = '';
                }
            }
        });
    }

    // Notifications
    const notificationBtn = document.querySelector('.bi-bell')?.closest('.btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            window.showToast('You have 3 new notifications', 'info');
        });
    }

    // User Management Logic
    const addUserForm = document.getElementById('addUserForm');
    const editUserForm = document.getElementById('editUserForm');
    const usersTable = document.getElementById('usersTable')?.querySelector('tbody');
    const roleFilter = document.querySelector('select.form-select-sm');
    
    if (addUserForm && usersTable) {
        addUserForm.addEventListener('submit', function(e) {
            // General handler handles simulation, we just update UI
            const formData = new FormData(addUserForm);
            const fullName = formData.get('fullName');
            const email = formData.get('email');
            const role = formData.get('role');
            const accessLevel = formData.get('accessLevel');
            const department = formData.get('department');
            
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <img src="https://picsum.photos/seed/${fullName}/40/40" class="rounded-circle me-3" width="32" height="32">
                        <div>
                            <div class="fw-bold">${fullName}</div>
                            <div class="small text-muted">${email}</div>
                        </div>
                    </div>
                </td>
                <td><span class="badge bg-primary bg-opacity-10 text-primary">${role}</span></td>
                <td>${accessLevel}</td>
                <td>${department}</td>
                <td><span class="badge bg-success bg-opacity-10 text-success">Active</span></td>
                <td class="text-muted">Just now</td>
                <td>
                    <button class="btn btn-sm btn-light border-0 edit-user-btn"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-light border-0 text-danger lock-user-btn"><i class="bi bi-shield-lock"></i></button>
                </td>
            `;
            usersTable.prepend(newRow);
        });
    }

    if (editUserForm) {
        editUserForm.addEventListener('submit', function(e) {
            const formData = new FormData(editUserForm);
            const name = formData.get('fullName');
            const role = formData.get('role');
            const level = formData.get('accessLevel');
            const status = formData.get('status');
            
            // In a real app we'd use the userId hidden field
            // For simulation, we'll just update the first row or show a message
            window.showToast('User details updated successfully');
        });
    }

    if (roleFilter && usersTable) {
        roleFilter.addEventListener('change', function() {
            const filterValue = this.value.toLowerCase();
            const rows = usersTable.querySelectorAll('tr');
            
            rows.forEach(row => {
                const role = row.cells[1].textContent.toLowerCase();
                if (filterValue === 'all roles' || role.includes(filterValue)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Handle User Actions (Edit, Lock)
    document.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-user-btn');
        const lockBtn = e.target.closest('.lock-user-btn');
        
        if (editBtn) {
            const row = editBtn.closest('tr');
            const name = row.querySelector('.fw-bold').textContent;
            const email = row.querySelector('.text-muted').textContent;
            const role = row.cells[1].textContent.trim();
            const level = row.cells[2].textContent.trim();
            
            const editModalElement = document.getElementById('editUserModal');
            if (editModalElement) {
                const editModal = new bootstrap.Modal(editModalElement);
                const form = document.getElementById('editUserForm');
                form.querySelector('[name="fullName"]').value = name;
                form.querySelector('[name="email"]').value = email;
                form.querySelector('[name="role"]').value = role;
                form.querySelector('[name="accessLevel"]').value = level;
                editModal.show();
            }
        }
        
        if (lockBtn) {
            const row = lockBtn.closest('tr');
            const statusBadge = row.cells[4].querySelector('.badge');
            const isLocked = statusBadge.textContent === 'Locked';
            
            if (isLocked) {
                statusBadge.className = 'badge bg-success bg-opacity-10 text-success';
                statusBadge.textContent = 'Active';
                lockBtn.innerHTML = '<i class="bi bi-shield-lock"></i>';
                window.showToast('User account unlocked');
            } else {
                statusBadge.className = 'badge bg-danger bg-opacity-10 text-danger';
                statusBadge.textContent = 'Locked';
                lockBtn.innerHTML = '<i class="bi bi-shield-check"></i>';
                window.showToast('User account locked', 'warning');
            }
        }
    });

    // Logout
    const allDropdownItems = document.querySelectorAll('.dropdown-item');
    allDropdownItems.forEach(item => {
        if (item.textContent.includes('Logout')) {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                window.showToast('Logging out...', 'info');
                setTimeout(() => {
                    logout();
                }, 1500);
            });
        }
    });

    // Settings Section Switching
    const settingsLinks = document.querySelectorAll('.list-group-item[data-section]');
    const settingsSections = document.querySelectorAll('.settings-section');
    
    if (settingsLinks.length > 0) {
        settingsLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('data-section');
                
                // Update active link
                settingsLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Show/Hide sections
                settingsSections.forEach(section => {
                    if (section.id === `section-${sectionId}`) {
                        section.classList.remove('d-none');
                    } else {
                        section.classList.add('d-none');
                    }
                });
                
                window.showToast(`Switched to ${link.textContent.trim()}`, 'info');
            });
        });
    }

    // Dynamic Stat Updates (Simulation)
    const stats = document.querySelectorAll('.stat-card h3');
    if (stats.length > 0) {
        setInterval(() => {
            const randomStat = stats[Math.floor(Math.random() * stats.length)];
            const currentVal = parseInt(randomStat.textContent.replace(/[^0-9]/g, ''));
            if (!isNaN(currentVal)) {
                const change = Math.floor(Math.random() * 10) - 4; // -4 to +5
                const newVal = Math.max(0, currentVal + change);
                
                // Update with animation if it's a simple number
                if (randomStat.hasAttribute('data-amount')) {
                    randomStat.setAttribute('data-amount', newVal);
                    randomStat.textContent = formatCurrency(newVal);
                } else if (randomStat.textContent.includes('%')) {
                    randomStat.textContent = newVal + '%';
                } else {
                    randomStat.textContent = newVal.toLocaleString();
                }
            }
        }, 10000);
    }

    // CSV Import Handling
    const importBaptismBtn = document.getElementById('importBaptismCsv');
    const baptismInput = document.getElementById('baptismCsvInput');
    if (importBaptismBtn && baptismInput) {
        importBaptismBtn.addEventListener('click', () => baptismInput.click());
        baptismInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                window.showToast(`Importing ${file.name}...`, 'info');
                setTimeout(() => {
                    window.showToast(`Successfully imported ${file.name}`, 'success');
                    e.target.value = ''; // Reset
                }, 1500);
            }
        });
    }

    const importPartnershipBtn = document.getElementById('importPartnershipCsv');
    const partnershipInput = document.getElementById('partnershipCsvInput');
    if (importPartnershipBtn && partnershipInput) {
        importPartnershipBtn.addEventListener('click', () => partnershipInput.click());
        partnershipInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                window.showToast(`Importing ${file.name}...`, 'info');
                setTimeout(() => {
                    window.showToast(`Successfully imported ${file.name}`, 'success');
                    e.target.value = ''; // Reset
                }, 1500);
            }
        });
    }
});
