// PMCC - Main JavaScript
// import Chart from 'chart.js/auto'; // Removed to use CDN

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

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
                    borderColor: '#7B0299',
                    backgroundColor: 'rgba(123, 2, 153, 0.3)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Expenses',
                    data: [2400, 1398, 9800, 3908, 4800, 3800, 4300],
                    borderColor: '#470482',
                    backgroundColor: 'rgba(71, 4, 130, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#470482' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(71, 4, 130, 0.05)' },
                        ticks: { color: '#470482' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#470482' }
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
                    backgroundColor: '#7B0299',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#470482' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(71, 4, 130, 0.05)' },
                        ticks: { color: '#470482' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#470482' }
                    }
                }
            }
        });
    }
});
