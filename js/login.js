// ===== Login Page JavaScript =====

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginPage();
});

function initializeLoginPage() {
    createParticles();
    setupLoginForm();
    checkExistingSession();
}

function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const accessCodeInput = document.getElementById('accessCode');
    const loginButton = document.getElementById('loginButton');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    if (!loginForm) return;

    loginForm.addEventListener('submit', handleLogin);
    
    // Add enter key support
    accessCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin(e);
        }
    });
    
    // Add input validation
    accessCodeInput.addEventListener('input', function() {
        hideMessages();
        if (this.value.length > 0) {
            loginButton.disabled = false;
            loginButton.style.opacity = '1';
        } else {
            loginButton.disabled = true;
            loginButton.style.opacity = '0.6';
        }
    });
}

function handleLogin(event) {
    event.preventDefault();
    
    const accessCode = document.getElementById('accessCode').value.trim();
    const loginButton = document.getElementById('loginButton');
    
    if (!accessCode) {
        showError('يرجى إدخال رمز الدخول');
        return;
    }
    
    // Show loading state
    loginButton.disabled = true;
    loginButton.innerHTML = '<div class="loading-spinner"></div> جاري التحقق...';
    hideMessages();
    
    // Simulate network delay for better UX
    setTimeout(() => {
        const validation = FCWolvesUtils.validateAccessCode(accessCode);
        
        if (validation) {
            // Save user session
            FCWolvesUtils.saveToLocalStorage('currentUser', validation.user);
            FCWolvesUtils.saveToLocalStorage('currentUserType', validation.type);
            
            showSuccess('تم تسجيل الدخول بنجاح!');
            
            // Redirect after success message
            setTimeout(() => {
                if (validation.type === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'player.html';
                }
            }, 1500);
        } else {
            showError('رمز الدخول غير صحيح. يرجى المحاولة مرة أخرى.');
            
            // Reset button state
            loginButton.disabled = false;
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> دخول';
            
            // Clear input and focus
            document.getElementById('accessCode').value = '';
            document.getElementById('accessCode').focus();
        }
    }, 1000);
}

function checkExistingSession() {
    const currentUser = FCWolvesUtils.getFromLocalStorage('currentUser');
    const currentUserType = FCWolvesUtils.getFromLocalStorage('currentUserType');
    
    if (currentUser && currentUserType) {
        // User is already logged in, redirect
        if (currentUserType === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'player.html';
        }
    }
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function hideMessages() {
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    if (errorMessage) errorMessage.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add click effect to logo
    const logo = document.querySelector('.team-logo img');
    if (logo) {
        logo.addEventListener('click', function() {
            this.style.transform = 'scale(1.2) rotate(360deg)';
            setTimeout(() => {
                this.style.transform = '';
            }, 600);
        });
    }
    
    // Add typing effect to team name
    const teamName = document.querySelector('.team-name');
    if (teamName) {
        const text = teamName.textContent;
        teamName.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                teamName.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        setTimeout(typeWriter, 500);
    }
});

