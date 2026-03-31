// PMCC - Main JavaScript
import { updateAllCurrencies, formatCurrency, getCurrencySymbol } from './currency.js';
import { logout, authFetch } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initial currency update
    updateAllCurrencies();

    // Fetch Dashboard Stats from API
    async function fetchDashboardStats() {
        try {
            const response = await authFetch('/api/dashboard/stats');
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

    // Fetch Members from API
    async function fetchMembers() {
        const membersTable = document.getElementById('membersTable')?.querySelector('tbody');
        if (!membersTable) return;

        try {
            const response = await authFetch('/api/members');
            const data = await response.json();
            
            membersTable.innerHTML = '';
            data.forEach(member => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${member.full_name}</td>
                    <td>${member.email || 'N/A'}</td>
                    <td>${member.phone || 'N/A'}</td>
                    <td>${new Date(member.join_date).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-light border-0 edit-member-btn" data-id="${member.id}"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-light border-0 text-danger delete-member-btn" data-id="${member.id}"><i class="bi bi-trash"></i></button>
                    </td>
                `;
                membersTable.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    }

    // Fetch Users from API
    async function fetchUsers() {
        const usersTable = document.getElementById('usersTable')?.querySelector('tbody');
        if (!usersTable) return;

        try {
            const response = await authFetch('/api/users');
            const data = await response.json();
            
            usersTable.innerHTML = '';
            data.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="https://picsum.photos/seed/${user.username}/40/40" class="rounded-circle me-3" width="32" height="32">
                            <div>
                                <div class="fw-bold">${user.username}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge bg-primary bg-opacity-10 text-primary">${user.role}</span></td>
                    <td>Full</td>
                    <td>General</td>
                    <td><span class="badge bg-success bg-opacity-10 text-success">Active</span></td>
                    <td class="text-muted">${new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-light border-0 edit-user-btn" data-id="${user.id}"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-light border-0 text-danger lock-user-btn" data-id="${user.id}"><i class="bi bi-shield-lock"></i></button>
                    </td>
                `;
                usersTable.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    // Fetch Website Settings
    async function fetchWebsiteSettings() {
        try {
            const response = await authFetch('/api/website/settings');
            const data = await response.json();
            
            // Update UI
            const heroTitleInput = document.querySelector('#editWebsiteForm [name="heroTitle"]') || document.querySelector('#editWebsiteForm input[type="text"]');
            const heroSubtitleInput = document.querySelector('#editWebsiteForm [name="heroSubtitle"]') || document.querySelector('#editWebsiteForm textarea');
            
            if (heroTitleInput) heroTitleInput.value = data.hero_title;
            if (heroSubtitleInput) heroSubtitleInput.value = data.hero_subtitle || '';
            
            // Update display labels
            const heroTitleLabel = document.querySelector('.list-group-item h6:contains("Hero Banner Text")')?.nextElementSibling;
            // Note: :contains is not standard CSS, I'll use a safer way in the code
            
            // Update form switches
            const formPartnership = document.getElementById('formPartnership');
            const formTestimony = document.getElementById('formTestimony');
            const formBaptism = document.getElementById('formBaptism');
            
            if (data.forms_enabled) {
                if (formPartnership) formPartnership.checked = !!data.forms_enabled.partnership;
                if (formTestimony) formTestimony.checked = !!data.forms_enabled.testimony;
                if (formBaptism) formBaptism.checked = !!data.forms_enabled.baptism;
            }
            
            // Update SEO/Analytics
            const metaTitleInput = document.getElementById('metaTitle');
            if (metaTitleInput) metaTitleInput.value = data.meta_title || '';
            
            const gaIdInput = document.getElementById('gaId');
            if (gaIdInput) gaIdInput.value = data.google_analytics_id || '';
            
            const emailInput = document.getElementById('notificationEmail');
            if (emailInput) emailInput.value = data.notification_email || '';
            
            // Update buttons
            const primaryBtnInput = document.querySelector('#editWebsiteForm [name="primaryButtonText"]');
            const secondaryBtnInput = document.querySelector('#editWebsiteForm [name="secondaryButtonText"]');
            
            if (primaryBtnInput) primaryBtnInput.value = data.primary_button_text || 'Join Us Online';
            if (secondaryBtnInput) secondaryBtnInput.value = data.secondary_button_text || 'Request Prayer';

        } catch (error) {
            console.error('Error fetching website settings:', error);
        }
    }

    // Fetch Website Submissions
    async function fetchWebsiteSubmissions() {
        const submissionsTable = document.querySelector('table.table-hover tbody');
        if (!submissionsTable || !window.location.pathname.includes('website.html')) return;

        try {
            const response = await authFetch('/api/website/submissions');
            const data = await response.json();
            
            submissionsTable.innerHTML = '';
            data.forEach(sub => {
                const row = document.createElement('tr');
                const badgeClass = sub.type === 'Partnership' ? 'bg-primary' : (sub.type === 'Testimony' ? 'bg-info' : 'bg-warning');
                const link = sub.type === 'Partnership' ? '/partnership.html' : (sub.type === 'Testimony' ? '/testimonies.html' : '/baptism.html');
                
                row.innerHTML = `
                    <td><span class="badge ${badgeClass} bg-opacity-10 text-${badgeClass.replace('bg-', '')}">${sub.type}</span></td>
                    <td class="fw-bold">${sub.name}</td>
                    <td class="text-muted small">${new Date(sub.date).toLocaleDateString()}</td>
                    <td><span class="badge ${sub.status === 'New' || sub.status === 'Pending' ? 'bg-warning text-dark' : 'bg-success'}">${sub.status}</span></td>
                    <td><a href="${link}" class="btn btn-sm btn-light">Manage</a></td>
                `;
                submissionsTable.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching website submissions:', error);
        }
    }

    // Fetch Finance Summary
    async function fetchFinanceSummary() {
        try {
            const response = await authFetch('/api/finance/summary');
            const data = await response.json();
            
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => {
                const p = card.querySelector('p');
                if (!p) return;
                const h3 = card.querySelector('h3');
                if (!h3) return;
                
                if (p.textContent.includes('Total Income')) {
                    h3.textContent = formatCurrency(data.totalIncome);
                } else if (p.textContent.includes('Total Expenses')) {
                    h3.textContent = formatCurrency(data.totalExpenses);
                } else if (p.textContent.includes('Net Balance')) {
                    h3.textContent = formatCurrency(data.netBalance);
                }
            });
        } catch (error) {
            console.error('Error fetching finance summary:', error);
        }
    }

    // Fetch Partnerships
    async function fetchPartnerships() {
        const table = document.querySelector('table.table-hover tbody');
        if (!table || !window.location.pathname.includes('partnership.html')) return;

        try {
            const response = await authFetch('/api/partnerships');
            const data = await response.json();
            
            table.innerHTML = '';
            data.forEach(p => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${p.full_name}</td>
                    <td>${p.category}</td>
                    <td>${formatCurrency(p.amount)}</td>
                    <td>${p.frequency}</td>
                    <td><span class="badge ${p.status === 'Active' ? 'bg-success' : 'bg-warning'} bg-opacity-10 text-${p.status === 'Active' ? 'success' : 'warning'}">${p.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-light border-0"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-light border-0 text-danger"><i class="bi bi-trash"></i></button>
                    </td>
                `;
                table.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching partnerships:', error);
        }
    }

    // Fetch Testimonies
    async function fetchTestimonies() {
        const table = document.querySelector('table.table-hover tbody');
        if (!table || !window.location.pathname.includes('testimonies.html')) return;

        try {
            const response = await authFetch('/api/testimonies');
            const data = await response.json();
            
            table.innerHTML = '';
            data.forEach(t => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${t.full_name}</td>
                    <td>${t.title}</td>
                    <td>${new Date(t.date).toLocaleDateString()}</td>
                    <td><span class="badge ${t.status === 'Approved' ? 'bg-success' : (t.status === 'Pending' ? 'bg-warning' : 'bg-danger')} bg-opacity-10 text-${t.status === 'Approved' ? 'success' : (t.status === 'Pending' ? 'warning' : 'danger')}">${t.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-light border-0"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-sm btn-light border-0 text-success"><i class="bi bi-check-lg"></i></button>
                        <button class="btn btn-sm btn-light border-0 text-danger"><i class="bi bi-x-lg"></i></button>
                    </td>
                `;
                table.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching testimonies:', error);
        }
    }

    // Fetch Baptism Requests
    async function fetchBaptismRequests() {
        const table = document.querySelector('table.table-hover tbody');
        if (!table || !window.location.pathname.includes('baptism.html')) return;

        try {
            const response = await authFetch('/api/baptism-requests');
            const data = await response.json();
            
            table.innerHTML = '';
            data.forEach(r => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${r.full_name}</td>
                    <td>${new Date(r.preferred_date).toLocaleDateString()}</td>
                    <td>${r.location}</td>
                    <td><span class="badge ${r.status === 'Completed' ? 'bg-success' : (r.status === 'Pending' ? 'bg-warning' : 'bg-info')} bg-opacity-10 text-${r.status === 'Completed' ? 'success' : (r.status === 'Pending' ? 'warning' : 'info')}">${r.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-light border-0"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-light border-0 text-success"><i class="bi bi-check-lg"></i></button>
                    </td>
                `;
                table.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching baptism requests:', error);
        }
    }

    // Fetch Transactions
    async function fetchTransactions(type = 'all', search = '') {
        const transactionsTable = document.querySelector('table.table-hover tbody');
        if (!transactionsTable || !window.location.pathname.includes('finance.html')) return;

        try {
            let url = '/api/finance';
            const params = new URLSearchParams();
            if (type !== 'all') params.append('type', type);
            if (search) params.append('search', search);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const response = await authFetch(url);
            const data = await response.json();
            
            transactionsTable.innerHTML = '';
            data.forEach(tx => {
                const row = document.createElement('tr');
                const isIncome = ['Tithe', 'Offering', 'Partnership', 'Other Income'].includes(tx.type);
                const typeClass = isIncome ? 'text-success' : 'text-danger';
                const typeIcon = isIncome ? 'bi-arrow-down-left' : 'bi-arrow-up-right';
                
                row.innerHTML = `
                    <td>${new Date(tx.date).toLocaleDateString()}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="bg-light rounded p-2 me-3">
                                <i class="bi ${typeIcon} ${typeClass}"></i>
                            </div>
                            <div>
                                <div class="fw-bold">${tx.description}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge bg-light text-dark border">${tx.type}</span></td>
                    <td class="fw-bold ${typeClass}">${isIncome ? '+' : '-'}${formatCurrency(tx.amount)}</td>
                    <td><span class="text-muted small">${tx.category || 'N/A'}</span></td>
                    <td><span class="badge ${tx.status === 'Completed' ? 'bg-success' : 'bg-warning'} bg-opacity-10 text-${tx.status === 'Completed' ? 'success' : 'warning'}">${tx.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-light border-0" onclick="editTransaction(${tx.id})"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-light border-0 text-danger" onclick="deleteTransaction(${tx.id})"><i class="bi bi-trash"></i></button>
                    </td>
                `;
                transactionsTable.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    }

    // Transaction Search
    const transactionSearch = document.getElementById('transactionSearch');
    if (transactionSearch) {
        let timeout;
        transactionSearch.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const activeTab = document.querySelector('#financeTabs .nav-link.active');
                const type = activeTab ? activeTab.getAttribute('data-type') : 'all';
                fetchTransactions(type, e.target.value);
            }, 300);
        });
    }

    // Fetch Media
    async function fetchMedia() {
        const table = document.querySelector('table.table-hover tbody');
        if (!table || !window.location.pathname.includes('media.html')) return;

        try {
            const response = await authFetch('/api/media');
            const data = await response.json();
            
            table.innerHTML = '';
            data.forEach(m => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="bg-light rounded p-2 me-3">
                                <i class="bi ${m.type === 'Video' ? 'bi-play-btn' : 'bi-image'}"></i>
                            </div>
                            <div>
                                <div class="fw-bold">${m.title}</div>
                                <div class="text-muted x-small">${m.category}</div>
                            </div>
                        </div>
                    </td>
                    <td>${m.type}</td>
                    <td>${new Date(m.upload_date).toLocaleDateString()}</td>
                    <td><span class="badge bg-success bg-opacity-10 text-success">Published</span></td>
                    <td>
                        <button class="btn btn-sm btn-light border-0"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-light border-0 text-danger"><i class="bi bi-trash"></i></button>
                    </td>
                `;
                table.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching media:', error);
        }
    }

    // Finance Tab Filtering
    const financeTabs = document.getElementById('financeTabs');
    if (financeTabs) {
        financeTabs.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.closest('.nav-link');
            if (!target) return;

            // Update active state
            financeTabs.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            target.classList.add('active');

            const type = target.getAttribute('data-type');
            fetchTransactions(type);
        });
    }

    // Add Transaction Form
    const addTransactionForm = document.getElementById('addTransactionForm');
    if (addTransactionForm) {
        addTransactionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addTransactionForm);
            const data = {
                description: formData.get('description'),
                type: formData.get('type'),
                amount: parseFloat(formData.get('amount')),
                category: formData.get('category'),
                date: formData.get('date'),
                notes: formData.get('notes'),
                status: 'Completed'
            };

            try {
                const response = await authFetch('/api/finance', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addTransactionModal'));
                    modal.hide();
                    addTransactionForm.reset();
                    fetchFinanceSummary();
                    fetchTransactions();
                } else {
                    const error = await response.json();
                    alert('Error: ' + (error.error || 'Failed to save transaction'));
                }
            } catch (error) {
                console.error('Error saving transaction:', error);
            }
        });
    }

    // Global functions for edit/delete
    window.deleteTransaction = async (id) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        try {
            const response = await authFetch(`/api/finance/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchFinanceSummary();
                fetchTransactions();
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    window.editTransaction = (id) => {
        // For now, just a placeholder or simple implementation
        alert('Edit functionality coming soon!');
    };
    // Page Routing
    const path = window.location.pathname;
    if (path === '/' || path.includes('index.html')) {
        fetchDashboardStats();
    } else if (path.includes('members.html')) {
        fetchMembers();
    } else if (path.includes('users.html')) {
        fetchUsers();
    } else if (path.includes('website.html')) {
        fetchWebsiteSettings();
        fetchWebsiteSubmissions();
    } else if (path.includes('finance.html')) {
        fetchFinanceSummary();
        fetchTransactions();
    } else if (path.includes('partnership.html')) {
        fetchPartnerships();
    } else if (path.includes('testimonies.html')) {
        fetchTestimonies();
    } else if (path.includes('baptism.html')) {
        fetchBaptismRequests();
    } else if (path.includes('media.html')) {
        fetchMedia();
    }

    // Set User Name
    const userName = localStorage.getItem('pmcc_user');
    if (userName) {
        const userElements = document.querySelectorAll('.user-info h6, .navbar .d-md-inline');
        userElements.forEach(el => {
            el.textContent = userName;
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

    // Update Website Settings
    const editWebsiteForm = document.getElementById('editWebsiteForm');
    if (editWebsiteForm) {
        editWebsiteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(editWebsiteForm);
            const data = {
                hero_title: formData.get('heroTitle'),
                hero_subtitle: formData.get('heroSubtitle'),
                primary_button_text: formData.get('primaryButtonText'),
                secondary_button_text: formData.get('secondaryButtonText')
            };

            try {
                const response = await authFetch('/api/website/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showNotification('Website content updated successfully!', 'success');
                    const modalElement = document.getElementById('editWebsiteModal');
                    if (modalElement) {
                        const modal = bootstrap.Modal.getInstance(modalElement);
                        if (modal) modal.hide();
                    }
                    fetchWebsiteSettings();
                } else {
                    showNotification('Failed to update website content.', 'danger');
                }
            } catch (error) {
                console.error('Error updating website settings:', error);
                showNotification('An error occurred.', 'danger');
            }
        });
    }

    // Save SEO & Form Settings
    const saveSeoBtn = document.getElementById('saveSeoSettings');
    if (saveSeoBtn) {
        saveSeoBtn.addEventListener('click', async () => {
            const data = {
                meta_title: document.getElementById('metaTitle')?.value,
                google_analytics_id: document.getElementById('gaId')?.value,
                notification_email: document.getElementById('notificationEmail')?.value,
                forms_enabled: {
                    partnership: document.getElementById('formPartnership')?.checked,
                    testimony: document.getElementById('formTestimony')?.checked,
                    baptism: document.getElementById('formBaptism')?.checked
                }
            };

            try {
                const response = await authFetch('/api/website/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showNotification('Settings saved successfully!', 'success');
                    fetchWebsiteSettings();
                } else {
                    showNotification('Failed to save settings.', 'danger');
                }
            } catch (error) {
                console.error('Error saving settings:', error);
                showNotification('An error occurred.', 'danger');
            }
        });
    }

    // Form Submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            if (form.id === 'loginForm' || form.id === 'editWebsiteForm') return;
            
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
