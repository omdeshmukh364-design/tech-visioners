// Authentication Functions

// Handle User Login
async function handleLogin(event) {
    event.preventDefault();
    
    const loginData = {
        username: document.getElementById('loginPhone').value,
        password: document.getElementById('loginPassword').value
    };
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to dashboard
            window.location.href = '/dashboard.html';
        } else {
            const error = await response.json();
            alert(error.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Network error. Please check your connection.');
    }
}

// Handle User Registration
async function handleRegister(event) {
    event.preventDefault();
    
    const registerData = {
        name: document.getElementById('regName').value,
        phone: document.getElementById('regPhone').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        aadhaar: document.getElementById('regAadhaar').value,
        state: document.getElementById('regState').value,
        city: document.getElementById('regCity').value,
        pincode: document.getElementById('regPincode').value
    };
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Send OTP verification
            await sendOTPVerification(registerData.phone);
            
            alert('Registration successful! Please verify your phone number.');
            
            // Show OTP verification modal
            showOTPModal(registerData.phone);
        } else {
            const error = await response.json();
            alert(error.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Network error. Please check your connection.');
    }
}

// Handle Official Login
async function handleOfficialLogin(event) {
    event.preventDefault();
    
    const officialData = {
        officialId: document.getElementById('officialId').value,
        department: document.getElementById('department').value,
        password: document.getElementById('officialPassword').value
    };
    
    try {
        const response = await fetch('/api/auth/official-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(officialData)
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Store token and official data
            localStorage.setItem('officialToken', data.token);
            localStorage.setItem('official', JSON.stringify(data.official));
            
            // Redirect to admin dashboard
            window.location.href = '/admin-dashboard.html';
        } else {
            const error = await response.json();
            alert(error.message || 'Login failed. Invalid credentials.');
        }
    } catch (error) {
        console.error('Official login error:', error);
        alert('Network error. Please check your connection.');
    }
}

// OTP Verification
async function sendOTPVerification(phone) {
    try {
        const response = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone })
        });
        
        return response.ok;
    } catch (error) {
        console.error('OTP send error:', error);
        return false;
    }
}

function showOTPModal(phone) {
    // Create OTP verification modal
    const otpModal = document.createElement('div');
    otpModal.className = 'modal';
    otpModal.id = 'otpModal';
    otpModal.style.display = 'block';
    
    otpModal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal('otpModal')">&times;</span>
            <h2>Verify Phone Number</h2>
            <p>Enter the 6-digit OTP sent to ${phone}</p>
            <form onsubmit="verifyOTP(event, '${phone}')">
                <div class="form-group">
                    <input type="text" id="otpCode" placeholder="Enter OTP" maxlength="6" pattern="[0-9]{6}" required>
                </div>
                <button type="submit" class="btn-primary">Verify OTP</button>
                <button type="button" class="btn-secondary" onclick="resendOTP('${phone}')">Resend OTP</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(otpModal);
}

async function verifyOTP(event, phone) {
    event.preventDefault();
    
    const otpData = {
        phone: phone,
        otp: document.getElementById('otpCode').value
    };
    
    try {
        const response = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(otpData)
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            alert('Phone verified successfully!');
            
            // Close modal and redirect
            closeModal('otpModal');
            window.location.href = '/dashboard.html';
        } else {
            alert('Invalid OTP. Please try again.');
        }
    } catch (error) {
        console.error('OTP verification error:', error);
        alert('Verification failed. Please try again.');
    }
}

async function resendOTP(phone) {
    const sent = await sendOTPVerification(phone);
    if (sent) {
        alert('OTP resent successfully!');
    } else {
        alert('Failed to resend OTP. Please try again.');
    }
}

// Social Login
function handleGoogleLogin() {
    // Implement Google OAuth
    window.location.href = '/api/auth/google';
}

function handleFacebookLogin() {
    // Implement Facebook OAuth
    window.location.href = '/api/auth/facebook';
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('officialToken');
    localStorage.removeItem('official');
    
    window.location.href = '/';
}

// Session Management
function checkSession() {
    const token = localStorage.getItem('token');
    
    if (token) {
        // Verify token validity
        fetch('/api/auth/verify-token', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }).then(response => {
            if (!response.ok) {
                // Token expired or invalid
                logout();
            }
        }).catch(error => {
            console.error('Session check error:', error);
        });
    }
}

// Check session every 5 minutes
setInterval(checkSession, 300000);

// Password Reset
function showPasswordResetModal() {
    const resetModal = document.createElement('div');
    resetModal.className = 'modal';
    resetModal.id = 'resetModal';
    resetModal.style.display = 'block';
    
    resetModal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal('resetModal')">&times;</span>
            <h2>Reset Password</h2>
            <form onsubmit="handlePasswordReset(event)">
                <div class="form-group">
                    <input type="text" id="resetPhone" placeholder="Enter registered phone number" required>
                </div>
                <button type="submit" class="btn-primary">Send Reset Link</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(resetModal);
}

async function handlePasswordReset(event) {
    event.preventDefault();
    
    const phone = document.getElementById('resetPhone').value;
    
    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone })
        });
        
        if (response.ok) {
            alert('Password reset link sent to your registered phone/email.');
            closeModal('resetModal');
        } else {
            alert('Phone number not found. Please check and try again.');
        }
    } catch (error) {
        console.error('Password reset error:', error);
        alert('Failed to send reset link. Please try again.');
    }
}