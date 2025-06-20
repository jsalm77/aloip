// ===== Admin Page JavaScript =====

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPage();
});

function initializeAdminPage() {
    checkAdminAuth();
    loadPlayers();
    setupEventListeners();
    loadMatchInfo();
    initializeDefaultData();
}

function checkAdminAuth() {
    const currentUser = FCWolvesUtils.getFromLocalStorage('currentUser');
    const currentUserType = FCWolvesUtils.getFromLocalStorage('currentUserType');
    
    if (!currentUser || currentUserType !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
}

function setupEventListeners() {
    // Add player form
    const addPlayerForm = document.getElementById('addPlayerForm');
    if (addPlayerForm) {
        addPlayerForm.addEventListener('submit', handleAddPlayer);
    }
    
    // Notification form
    const notificationForm = document.getElementById('notificationForm');
    if (notificationForm) {
        notificationForm.addEventListener('submit', handleSendNotification);
    }
    
    // Match form
    const matchForm = document.getElementById('matchForm');
    if (matchForm) {
        matchForm.addEventListener('submit', handleSaveMatch);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', FCWolvesUtils.logout);
    }
}

async function initializeDefaultData() {
    const players = FCWolvesUtils.getFromLocalStorage('players') || [];
    
    if (players.length === 0) {
        const defaultPlayer = {
            id: 'jihad001',
            name: 'جهاد الغرياني',
            code: '0011JM',
            position: 'رأس حربة',
            number: 9,
            description: 'رأس حربة فتاك ومهاجم خطير',
            image: 'https://via.placeholder.com/150',
            joinDate: '2024-01-01',
            matches: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0
        };

        players.push(defaultPlayer);
        
        // Save to both Firebase and localStorage
        await FCWolvesUtils.saveData('players', players);
        FCWolvesUtils.saveToLocalStorage('players', players);
        
        loadPlayers();
    }
}

async function handleAddPlayer(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const playerData = {
        id: FCWolvesUtils.generateId(),
        name: formData.get('playerName'),
        code: formData.get('playerCode'),
        position: formData.get('playerPosition'),
        number: parseInt(formData.get('playerNumber')),
        description: formData.get('playerDescription') || '',
        image: 'https://via.placeholder.com/150',
        joinDate: new Date().toISOString().split('T')[0],
        matches: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0
    };
    
    // Validation
    if (!playerData.name || !playerData.code || !playerData.position || !playerData.number) {
        FCWolvesUtils.showMessage('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // Check for duplicate code or number
    const players = FCWolvesUtils.getFromLocalStorage('players') || [];
    const duplicateCode = players.find(p => p.code === playerData.code);
    const duplicateNumber = players.find(p => p.number === playerData.number);
    
    if (duplicateCode) {
        FCWolvesUtils.showMessage('رمز اللاعب موجود مسبقاً', 'error');
        return;
    }
    
    if (duplicateNumber) {
        FCWolvesUtils.showMessage('رقم القميص موجود مسبقاً', 'error');
        return;
    }
    
    FCWolvesUtils.showLoading(true);
    
    try {
        players.push(playerData);
        await FCWolvesUtils.saveData('players', players);
        
        FCWolvesUtils.showMessage('تم إضافة اللاعب بنجاح!', 'success');
        event.target.reset();
        loadPlayers();
        
        // Send notification
        FCWolvesUtils.createNotification(
            'لاعب جديد',
            `تم إضافة اللاعب ${playerData.name} إلى الفريق`,
            'info'
        );
        
    } catch (error) {
        console.error('Error adding player:', error);
        FCWolvesUtils.showMessage('حدث خطأ أثناء إضافة اللاعب', 'error');
    } finally {
        FCWolvesUtils.showLoading(false);
    }
}

async function loadPlayers() {
    const playersContainer = document.getElementById('playersContainer');
    if (!playersContainer) return;
    
    const players = FCWolvesUtils.getFromLocalStorage('players') || [];
    
    if (players.length === 0) {
        playersContainer.innerHTML = '<p style="text-align: center; color: rgba(248, 250, 252, 0.7);">لا يوجد لاعبين مسجلين</p>';
        return;
    }
    
    playersContainer.innerHTML = players.map(player => `
        <div class="player-card">
            <div class="player-info">
                <h3>${player.name}</h3>
                <div class="player-details">
                    <div class="player-detail">
                        <i class="fas fa-id-card"></i>
                        <span>الرمز: ${player.code}</span>
                    </div>
                    <div class="player-detail">
                        <i class="fas fa-running"></i>
                        <span>المركز: ${player.position}</span>
                    </div>
                    <div class="player-detail">
                        <i class="fas fa-hashtag"></i>
                        <span>الرقم: ${player.number}</span>
                    </div>
                    <div class="player-detail">
                        <i class="fas fa-calendar"></i>
                        <span>انضم: ${player.joinDate}</span>
                    </div>
                </div>
                <div class="player-actions">
                    <button class="btn btn-danger btn-small" onclick="deletePlayer('${player.id}')">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function deletePlayer(playerId) {
    if (!confirm('هل أنت متأكد من حذف هذا اللاعب؟')) {
        return;
    }
    
    FCWolvesUtils.showLoading(true);
    
    try {
        const players = FCWolvesUtils.getFromLocalStorage('players') || [];
        const updatedPlayers = players.filter(p => p.id !== playerId);
        
        await FCWolvesUtils.saveData('players', updatedPlayers);
        FCWolvesUtils.showMessage('تم حذف اللاعب بنجاح!', 'success');
        loadPlayers();
        
    } catch (error) {
        console.error('Error deleting player:', error);
        FCWolvesUtils.showMessage('حدث خطأ أثناء حذف اللاعب', 'error');
    } finally {
        FCWolvesUtils.showLoading(false);
    }
}

async function handleSendNotification(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const notificationData = {
        title: formData.get('notificationTitle'),
        message: formData.get('notificationMessage'),
        type: formData.get('notificationType') || 'info'
    };
    
    if (!notificationData.title || !notificationData.message) {
        FCWolvesUtils.showMessage('يرجى ملء جميع حقول الإشعار', 'error');
        return;
    }
    
    FCWolvesUtils.showLoading(true);
    
    try {
        FCWolvesUtils.createNotification(
            notificationData.title,
            notificationData.message,
            notificationData.type
        );
        
        FCWolvesUtils.showMessage('تم إرسال الإشعار بنجاح!', 'success');
        event.target.reset();
        
    } catch (error) {
        console.error('Error sending notification:', error);
        FCWolvesUtils.showMessage('حدث خطأ أثناء إرسال الإشعار', 'error');
    } finally {
        FCWolvesUtils.showLoading(false);
    }
}

async function handleSaveMatch(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const matchData = {
        opponent: formData.get('opponent'),
        date: formData.get('matchDate'),
        time: formData.get('matchTime'),
        location: formData.get('location'),
        type: formData.get('matchType') || 'ودية'
    };
    
    if (!matchData.opponent || !matchData.date || !matchData.time || !matchData.location) {
        FCWolvesUtils.showMessage('يرجى ملء جميع حقول المباراة', 'error');
        return;
    }
    
    FCWolvesUtils.showLoading(true);
    
    try {
        await FCWolvesUtils.saveData('nextMatch', matchData);
        FCWolvesUtils.showMessage('تم حفظ معلومات المباراة بنجاح!', 'success');
        loadMatchInfo();
        
        // Send notification about the match
        FCWolvesUtils.createNotification(
            'مباراة جديدة',
            `مباراة ${matchData.type} ضد ${matchData.opponent} في ${matchData.date}`,
            'match'
        );
        
    } catch (error) {
        console.error('Error saving match:', error);
        FCWolvesUtils.showMessage('حدث خطأ أثناء حفظ معلومات المباراة', 'error');
    } finally {
        FCWolvesUtils.showLoading(false);
    }
}

async function loadMatchInfo() {
    const matchDetails = document.getElementById('matchDetails');
    if (!matchDetails) return;
    
    const matchData = await FCWolvesUtils.loadData('nextMatch');
    
    if (matchData) {
        matchDetails.innerHTML = `
            <div class="match-detail">
                <h4>الخصم</h4>
                <p>${matchData.opponent}</p>
            </div>
            <div class="match-detail">
                <h4>التاريخ</h4>
                <p>${matchData.date}</p>
            </div>
            <div class="match-detail">
                <h4>الوقت</h4>
                <p>${matchData.time}</p>
            </div>
            <div class="match-detail">
                <h4>المكان</h4>
                <p>${matchData.location}</p>
            </div>
            <div class="match-detail">
                <h4>نوع المباراة</h4>
                <p>${matchData.type}</p>
            </div>
        `;
    } else {
        matchDetails.innerHTML = '<p style="text-align: center; color: rgba(248, 250, 252, 0.7);">لا توجد مباراة محددة</p>';
    }
}

// Make functions globally available
window.deletePlayer = deletePlayer;

