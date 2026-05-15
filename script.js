document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    initEventListeners();
});

function initCharts() {
    const trafficCtx = document.getElementById('trafficChart').getContext('2d');
    const typeCtx = document.getElementById('typeChart').getContext('2d');

    new Chart(trafficCtx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
                label: '数据流量',
                data: [1200, 800, 2400, 3200, 2800, 1800],
                borderColor: '#4F46E5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 8,
                pointBackgroundColor: '#4F46E5',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(71, 85, 105, 0.3)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94A3B8',
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(71, 85, 105, 0.3)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94A3B8',
                        font: {
                            size: 12
                        },
                        callback: (value) => value >= 1000 ? `${value / 1000}k` : value
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });

    new Chart(typeCtx, {
        type: 'doughnut',
        data: {
            labels: ['时空数据', '地理数据', '时序数据', '其他'],
            datasets: [{
                data: [35, 28, 25, 12],
                backgroundColor: [
                    '#4F46E5',
                    '#8B5CF6',
                    '#3B82F6',
                    '#64748B'
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#CBD5E1',
                        font: {
                            size: 13
                        },
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        }
    });
}

function initEventListeners() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(menu => menu.classList.remove('active'));
            item.classList.add('active');
        });
    });

    const tabs = document.querySelectorAll('.chart-tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.add('btn-active');
            setTimeout(() => btn.classList.remove('btn-active'), 200);
        });
    });

    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}
