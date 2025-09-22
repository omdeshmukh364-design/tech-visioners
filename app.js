// Global variables
let currentStep = 1;
let selectedCategory = '';
let userLocation = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthStatus();
    
    // Load public statistics
    loadStatistics();
    
    // Initialize language
    initializeLanguage();
});

// Modal Functions
function showLoginModal() {
    document.getElementById('authModal').style.display = 'block';
}

function showReportModal() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to report an issue');
        showLoginModal();
        return;
    }
    document.getElementById('quickReportModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Tab switching
function switchTab(tab) {
    // Remove active class from all tabs and forms
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    // Add active class to selected tab and form
    if (tab === 'login') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else if (tab === 'register') {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    } else if (tab === 'official') {
        document.querySelectorAll('.tab-btn')[2].classList.add('active');
        document.getElementById('officialForm').classList.add('active');
    }
}

// Category Selection
function selectCategory(category) {
    selectedCategory = category;
    
    // Update UI
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.category-card').classList.add('selected');
    
    // Auto proceed to next step after selection
    setTimeout(() => nextStep(), 500);
}

// Step Navigation
function nextStep() {
    if (currentStep < 3) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.add('active');
        
        // Update navigation buttons
        document.getElementById('prevBtn').style.display = 'inline-block';
        if (currentStep === 3) {
            document.getElementById('nextBtn').style.display = 'none';
            document.getElementById('submitBtn').style.display = 'inline-block';
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.add('active');
        
        // Update navigation buttons
        if (currentStep === 1) {
            document.getElementById('prevBtn').style.display = 'none';
        }
        document.getElementById('nextBtn').style.display = 'inline-block';
        document.getElementById('submitBtn').style.display = 'none';
    }
}

// Location Functions
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Update UI to show location obtained
                alert('Location obtained successfully!');
                
                // Show location on map (integrate with map API)
                displayLocationOnMap(userLocation);
            },
            error => {
                alert('Unable to get location. Please enter manually.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

function displayLocationOnMap(location) {
    // This would integrate with Google Maps or OpenStreetMap
    const mapContainer = document.getElementById('mapContainer');
    mapContainer.innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <p>Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</p>
            <p style="color: green;">✓ Location marked on map</p>
        </div>
    `;
}

// File Upload Preview
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('issueMedia');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const files = e.target.files;
            const preview = document.getElementById('mediaPreview');
            preview.innerHTML = '';
            
            for (let file of files) {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        preview.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    }
});

// Submit Quick Report
async function submitQuickReport(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('category', selectedCategory);
    formData.append('title', document.getElementById('issueTitle').value);
    formData.append('description', document.getElementById('issueDescription').value);
    formData.append('urgency', document.getElementById('urgencyLevel').value);
    
    // Add location data
    if (userLocation) {
        formData.append('latitude', userLocation.lat);
        formData.append('longitude', userLocation.lng);
    } else {
        formData.append('address', document.getElementById('manualAddress').value);
        formData.append('area', document.getElementById('area').value);
        formData.append('city', document.getElementById('cityLocation').value);
        formData.append('pincode', document.getElementById('pincodeLocation').value);
    }
    
    // Add media files
    const mediaFiles = document.getElementById('issueMedia').files;
    for (let file of mediaFiles) {
        formData.append('media', file);
    }
    
    try {
        const response = await fetch('/api/issues/report', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            alert(`Issue reported successfully! Your ticket ID is: ${data.ticketId}`);
            closeModal('quickReportModal');
            
            // Reset form
            document.getElementById('quickReportForm').reset();
            currentStep = 1;
            
            // Redirect to dashboard
            window.location.href = '/dashboard.html';
        } else {
            alert('Error submitting report. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error. Please check your connection.');
    }
}

// Load Statistics
async function loadStatistics() {
    try {
        const response = await fetch('/api/statistics');
        const stats = await response.json();
        
        // Update statistics display
        document.querySelector('.stats-grid').innerHTML = `
            <div class="stat-card">
                <h3>${stats.totalIssues.toLocaleString()}</h3>
                <p>Issues Reported</p>
            </div>
            <div class="stat-card">
                <h3>${stats.resolvedIssues.toLocaleString()}</h3>
                <p>Issues Resolved</p>
            </div>
            <div class="stat-card">
                <h3>${stats.resolutionRate}%</h3>
                <p>Resolution Rate</p>
            </div>
            <div class="stat-card">
                <h3>${stats.avgResolutionTime}</h3>
                <p>Avg Resolution Time</p>
            </div>
        `;
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Language Support
function initializeLanguage() {
    const languageSelect = document.getElementById('language');
    languageSelect.addEventListener('change', function(e) {
        changeLanguage(e.target.value);
    });
}

function changeLanguage(lang) {
    // This would integrate with i18n library for proper translations
    const translations = {
        'hi': {
            'title': 'नागरिक मुद्दे की रिपोर्ट करें, बेहतर समुदाय बनाएं',
            'reportBtn': 'मुद्दे की रिपोर्ट करें',
            'viewBtn': 'सार्वजनिक मुद्दे देखें'
        },
        'ta': {
            'title': 'குடிமை பிரச்சினைகளைப் புகாரளிக்கவும், சிறந்த சமூகங்களை உருவாக்கவும்',
            'reportBtn': 'பிரச்சினையைப் புகாரளிக்கவும்',
            'viewBtn': 'பொது பிரச்சினைகளைக் காண்க'
        }
    };
    
    if (translations[lang]) {
        // Apply translations to UI elements
        console.log('Language changed to:', lang);
    }
}

// Check Authentication Status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        // Update UI for logged-in user
        updateNavForLoggedInUser();
    }
}

function updateNavForLoggedInUser() {
    const navMenu = document.querySelector('.nav-menu');
    const loginBtn = navMenu.querySelector('.btn-primary');
    
    if (loginBtn) {
        loginBtn.textContent = 'Dashboard';
        loginBtn.onclick = () => window.location.href = '/dashboard.html';
    }
}

// Public Dashboard
function showPublicDashboard() {
    window.location.href = '/public-dashboard.html';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}