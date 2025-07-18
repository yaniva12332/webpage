// API Configuration
const API_BASE_URL = window.location.origin;
let authToken = localStorage.getItem('admin_token');
let currentUser = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (authToken) {
        verifyToken();
    } else {
        showLoginScreen();
    }
    
    // Setup login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup settings form
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsUpdate);
    }
});

// Verify authentication token
async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/appointments`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            showAdminPanel();
            initializeAdminData();
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        showLoginScreen();
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.user.role === 'admin') {
            authToken = result.token;
            currentUser = result.user;
            localStorage.setItem('admin_token', authToken);
            
            showAdminPanel();
            initializeAdminData();
        } else {
            showError('שם משתמש או סיסמה שגויים, או שאין הרשאות מנהל');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('שגיאה בחיבור לשרת');
    }
}

// Logout
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('admin_token');
    showLoginScreen();
}

// Show login screen
function showLoginScreen() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
}

// Show admin panel
function showAdminPanel() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    
    if (currentUser) {
        document.getElementById('admin-username').textContent = currentUser.username;
    }
}

// Initialize admin data
async function initializeAdminData() {
    await Promise.all([
        loadAppointments(),
        loadSettings(),
        loadServices()
    ]);
}

// Tab management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data for specific tabs
    if (tabName === 'appointments') {
        loadAppointments();
    } else if (tabName === 'customers') {
        loadCustomers();
    }
}

// Load appointments
async function loadAppointments() {
    try {
        const statusFilter = document.getElementById('status-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        
        let url = `${API_BASE_URL}/api/admin/appointments`;
        const params = new URLSearchParams();
        
        if (statusFilter) params.append('status', statusFilter);
        if (dateFilter) params.append('date', dateFilter);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const appointments = await response.json();
            displayAppointments(appointments);
        } else {
            showError('שגיאה בטעינת התורים');
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        showError('שגיאה בחיבור לשרת');
    }
}

// Display appointments
function displayAppointments(appointments) {
    const tbody = document.querySelector('#appointments-table tbody');
    tbody.innerHTML = '';
    
    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">אין תורים להצגה</td></tr>';
        return;
    }
    
    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(appointment.appointment_date)}</td>
            <td>${appointment.appointment_time}</td>
            <td>${appointment.name}</td>
            <td>${appointment.service}</td>
            <td><a href="tel:${appointment.phone}">${appointment.phone}</a></td>
            <td><span class="status-badge status-${appointment.status}">${getStatusText(appointment.status)}</span></td>
            <td>
                ${appointment.status === 'pending' ? `
                    <button class="action-btn confirm-btn" onclick="updateAppointmentStatus(${appointment.id}, 'confirmed')">
                        אשר
                    </button>
                ` : ''}
                ${appointment.status !== 'cancelled' ? `
                    <button class="action-btn cancel-btn" onclick="updateAppointmentStatus(${appointment.id}, 'cancelled')">
                        בטל
                    </button>
                ` : ''}
                <button class="action-btn" onclick="showAppointmentDetails(${appointment.id})" style="background: #007bff;">
                    פרטים
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update appointment status
async function updateAppointmentStatus(appointmentId, newStatus) {
    if (!confirm(`האם אתה בטוח שברצונך ${newStatus === 'confirmed' ? 'לאשר' : 'לבטל'} את התור?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/appointments/${appointmentId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            showSuccess(`התור ${newStatus === 'confirmed' ? 'אושר' : 'בוטל'} בהצלחה`);
            loadAppointments();
        } else {
            showError('שגיאה בעדכון התור');
        }
    } catch (error) {
        console.error('Error updating appointment:', error);
        showError('שגיאה בחיבור לשרת');
    }
}

// Filter appointments
function filterAppointments() {
    loadAppointments();
}

// Load settings
async function loadSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings`);
        
        if (response.ok) {
            const settings = await response.json();
            populateSettingsForm(settings);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Populate settings form
function populateSettingsForm(settings) {
    Object.keys(settings).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.value = settings[key];
        }
    });
}

// Handle settings update
async function handleSettingsUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const updates = [];
    
    for (const [key, value] of formData.entries()) {
        updates.push({ key, value });
    }
    
    try {
        showLoading('שומר שינויים...');
        
        for (const update of updates) {
            await fetch(`${API_BASE_URL}/api/settings`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(update)
            });
        }
        
        hideLoading();
        showSuccess('ההגדרות נשמרו בהצלחה');
    } catch (error) {
        hideLoading();
        console.error('Error updating settings:', error);
        showError('שגיאה בשמירת ההגדרות');
    }
}

// Load services
async function loadServices() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/services`);
        
        if (response.ok) {
            const services = await response.json();
            displayServicesInAdmin(services);
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// Display services in admin
function displayServicesInAdmin(services) {
    const servicesList = document.getElementById('services-list');
    servicesList.innerHTML = '';
    
    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-admin-card';
        serviceCard.innerHTML = `
            <div class="service-admin-header">
                <h4>${service.name}</h4>
                <div class="service-admin-actions">
                    <button class="action-btn" onclick="editService(${service.id})" style="background: #007bff;">
                        <i class="fas fa-edit"></i> ערוך
                    </button>
                    <button class="action-btn cancel-btn" onclick="deleteService(${service.id})">
                        <i class="fas fa-trash"></i> מחק
                    </button>
                </div>
            </div>
            <p>${service.description || 'אין תיאור'}</p>
            <div class="service-admin-details">
                <span><i class="fas fa-clock"></i> ${service.duration} דקות</span>
                <span><i class="fas fa-shekel-sign"></i> ${service.price}</span>
            </div>
        `;
        servicesList.appendChild(serviceCard);
    });
}

// Load customers
async function loadCustomers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/appointments`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const appointments = await response.json();
            const customers = processCustomersData(appointments);
            displayCustomers(customers);
        }
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// Process customers data
function processCustomersData(appointments) {
    const customersMap = new Map();
    
    appointments.forEach(appointment => {
        const key = appointment.email;
        if (customersMap.has(key)) {
            const customer = customersMap.get(key);
            customer.appointmentCount++;
            if (new Date(appointment.appointment_date) > new Date(customer.lastAppointment)) {
                customer.lastAppointment = appointment.appointment_date;
            }
        } else {
            customersMap.set(key, {
                name: appointment.name,
                email: appointment.email,
                phone: appointment.phone,
                appointmentCount: 1,
                lastAppointment: appointment.appointment_date
            });
        }
    });
    
    return Array.from(customersMap.values());
}

// Display customers
function displayCustomers(customers) {
    const tbody = document.querySelector('#customers-table tbody');
    tbody.innerHTML = '';
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">אין לקוחות להצגה</td></tr>';
        return;
    }
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td><a href="mailto:${customer.email}">${customer.email}</a></td>
            <td><a href="tel:${customer.phone}">${customer.phone}</a></td>
            <td>${customer.appointmentCount}</td>
            <td>${formatDate(customer.lastAppointment)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
}

function getStatusText(status) {
    const statusTexts = {
        'pending': 'ממתין לאישור',
        'confirmed': 'מאושר',
        'cancelled': 'מבוטל'
    };
    return statusTexts[status] || status;
}

// Show messages
function showSuccess(message) {
    showMessage(message, 'success');
}

function showError(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    const container = document.getElementById('message-container');
    
    // Remove existing messages
    container.innerHTML = '';
    
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type === 'success' ? 'success-message' : 'error-message'}`;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 1000;
        max-width: 400px;
        font-weight: 500;
    `;
    messageEl.textContent = message;
    
    container.appendChild(messageEl);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}

function showLoading(message) {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        color: white;
        font-size: 1.2rem;
    `;
    overlay.innerHTML = `
        <div style="text-align: center;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 10px;"></i>
            <div>${message}</div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Additional styles for admin panel
const adminCSS = `
.login-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.login-container {
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 400px;
}

.login-header {
    text-align: center;
    margin-bottom: 30px;
}

.login-header h1 {
    color: var(--primary-color);
    margin-bottom: 10px;
}

.login-form .form-group {
    margin-bottom: 20px;
}

.login-help {
    margin-top: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 10px;
    font-size: 0.9rem;
    color: #666;
}

.tab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.filters {
    display: flex;
    gap: 15px;
    align-items: center;
}

.filters select,
.filters input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.service-admin-card {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 15px;
    padding: 20px;
    margin-bottom: 15px;
}

.service-admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.service-admin-actions {
    display: flex;
    gap: 10px;
}

.service-admin-details {
    display: flex;
    gap: 20px;
    margin-top: 10px;
    color: #666;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1500;
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 15px;
    width: 100%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 5px;
}

.settings-section {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e9ecef;
}

.settings-section h3 {
    color: var(--primary-color);
    margin-bottom: 20px;
}
`;

// Inject admin CSS
const adminStyle = document.createElement('style');
adminStyle.textContent = adminCSS;
document.head.appendChild(adminStyle);