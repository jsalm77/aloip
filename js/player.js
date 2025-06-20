// ===== Player Page JavaScript =====

let currentTab = 'team';

document.addEventListener('DOMContentLoaded', function() {
    initializePlayerPage();
});

function initializePlayerPage() {
    checkPlayerAuth();
    setupNavigation();
    loadPlayerData();
    showTab('team');
}

function checkPlayerAuth() {
    const currentUser = FCWolvesUtils.getFromLocalStorage('currentUser');
    const currentUserType = FCWolvesUtils.getFromLocalStorage('currentUserType');
    
    if (!currentUser || currentUserType !== 'player') {
        window.location.href = 'index.html';
        return;
    }
    
    // Update header with player name
    const playerHeader = document.querySelector('.player-header h1');
    if (playerHeader) {
        playerHeader.textContent = `مرحباً ${currentUser.name}`;
    }
}

function setupNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            showTab(tabName);
        });
    });
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', FCWolvesUtils.logout);
    }
    
    // Setup forms
    setupForms();
}

function setupForms() {
    // Post form
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', handleCreatePost);
    }
    
    // Chat form
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
        chatForm.addEventListener('submit', handleSendMessage);
    }
}

function showTab(tabName) {
    currentTab = tabName;
    
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Show/hide content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Load tab-specific data
    switch(tabName) {
        case 'team':
            loadTeamData();
            break;
        case 'posts':
            loadPosts();
            break;
        case 'chat':
            loadChatMessages();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

async function loadPlayerData() {
    // This will be called when the page loads
    loadTeamData();
}

async function loadTeamData() {
    await Promise.all([
        loadNextMatch(),
        loadTeamPlayers(),
        loadTeamStats()
    ]);
}

async function loadNextMatch() {
    const nextMatchContainer = document.querySelector('.next-match .match-details');
    if (!nextMatchContainer) return;
    
    const matchData = await FCWolvesUtils.loadData('nextMatch');
    
    if (matchData) {
        nextMatchContainer.innerHTML = `
            <div class="match-detail">
                <span>الخصم:</span>
                <strong>${matchData.opponent}</strong>
            </div>
            <div class="match-detail">
                <span>التاريخ:</span>
                <strong>${matchData.date}</strong>
            </div>
            <div class="match-detail">
                <span>الوقت:</span>
                <strong>${matchData.time}</strong>
            </div>
            <div class="match-detail">
                <span>المكان:</span>
                <strong>${matchData.location}</strong>
            </div>
            <div class="match-detail">
                <span>نوع المباراة:</span>
                <strong>${matchData.type}</strong>
            </div>
        `;
    } else {
        nextMatchContainer.innerHTML = '<p style="text-align: center; opacity: 0.7;">لا توجد مباراة محددة حالياً</p>';
    }
}

async function loadTeamPlayers() {
    const playersContainer = document.querySelector('.players-list');
    if (!playersContainer) return;
    
    const players = FCWolvesUtils.getFromLocalStorage('players') || [];
    
    if (players.length === 0) {
        playersContainer.innerHTML = '<p style="text-align: center; opacity: 0.7;">لا يوجد لاعبين مسجلين</p>';
        return;
    }
    
    playersContainer.innerHTML = players.map(player => `
        <div class="player-card">
            <div class="player-header-info">
                <div class="player-number">${player.number}</div>
                <div>
                    <div class="player-name">${player.name}</div>
                    <div class="player-position">${player.position}</div>
                </div>
            </div>
            <div class="player-details">
                <div class="player-detail">
                    <i class="fas fa-futbol"></i>
                    <span>المباريات: ${player.matches || 0}</span>
                </div>
                <div class="player-detail">
                    <i class="fas fa-bullseye"></i>
                    <span>الأهداف: ${player.goals || 0}</span>
                </div>
                <div class="player-detail">
                    <i class="fas fa-hands-helping"></i>
                    <span>التمريرات: ${player.assists || 0}</span>
                </div>
                <div class="player-detail">
                    <i class="fas fa-calendar"></i>
                    <span>انضم: ${player.joinDate}</span>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadTeamStats() {
    const statsContainer = document.querySelector('.stats-grid');
    if (!statsContainer) return;
    
    const players = FCWolvesUtils.getFromLocalStorage('players') || [];
    
    const totalPlayers = players.length;
    const totalMatches = players.reduce((sum, player) => sum + (player.matches || 0), 0);
    const totalGoals = players.reduce((sum, player) => sum + (player.goals || 0), 0);
    const totalAssists = players.reduce((sum, player) => sum + (player.assists || 0), 0);
    
    statsContainer.innerHTML = `
        <div class="stat-item">
            <span class="stat-number">${totalPlayers}</span>
            <span class="stat-label">اللاعبين</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${totalMatches}</span>
            <span class="stat-label">المباريات</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${totalGoals}</span>
            <span class="stat-label">الأهداف</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${totalAssists}</span>
            <span class="stat-label">التمريرات</span>
        </div>
    `;
}

async function handleCreatePost(event) {
    event.preventDefault();
    
    const currentUser = FCWolvesUtils.getFromLocalStorage('currentUser');
    const formData = new FormData(event.target);
    
    const postData = {
        id: FCWolvesUtils.generateId(),
        author: currentUser.name,
        content: formData.get('postContent'),
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: []
    };
    
    if (!postData.content.trim()) {
        FCWolvesUtils.showMessage('يرجى كتابة محتوى المنشور', 'error');
        return;
    }
    
    try {
        const posts = FCWolvesUtils.getFromLocalStorage('posts') || [];
        posts.unshift(postData);
        
        await FCWolvesUtils.saveData('posts', posts);
        FCWolvesUtils.showMessage('تم نشر المنشور بنجاح!', 'success');
        
        event.target.reset();
        loadPosts();
        
    } catch (error) {
        console.error('Error creating post:', error);
        FCWolvesUtils.showMessage('حدث خطأ أثناء نشر المنشور', 'error');
    }
}

async function loadPosts() {
    const postsContainer = document.querySelector('.posts-list');
    if (!postsContainer) return;
    
    const posts = FCWolvesUtils.getFromLocalStorage('posts') || [];
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p style="text-align: center; opacity: 0.7;">لا توجد منشورات حالياً</p>';
        return;
    }
    
    postsContainer.innerHTML = posts.map(post => `
        <div class="post-item">
            <div class="post-header">
                <div class="post-avatar">${post.author.charAt(0)}</div>
                <div class="post-info">
                    <h4>${post.author}</h4>
                    <div class="post-time">${FCWolvesUtils.formatDate(post.timestamp)}</div>
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <div class="post-action" onclick="likePost('${post.id}')">
                    <i class="fas fa-heart"></i>
                    <span>${post.likes || 0}</span>
                </div>
                <div class="post-action">
                    <i class="fas fa-comment"></i>
                    <span>${post.comments ? post.comments.length : 0}</span>
                </div>
            </div>
        </div>
    `).join('');
}

async function likePost(postId) {
    try {
        const posts = FCWolvesUtils.getFromLocalStorage('posts') || [];
        const post = posts.find(p => p.id === postId);
        
        if (post) {
            post.likes = (post.likes || 0) + 1;
            await FCWolvesUtils.saveData('posts', posts);
            loadPosts();
        }
        
    } catch (error) {
        console.error('Error liking post:', error);
    }
}

async function handleSendMessage(event) {
    event.preventDefault();
    
    const currentUser = FCWolvesUtils.getFromLocalStorage('currentUser');
    const formData = new FormData(event.target);
    
    const messageData = {
        id: FCWolvesUtils.generateId(),
        sender: currentUser.name,
        content: formData.get('messageContent'),
        timestamp: new Date().toISOString()
    };
    
    if (!messageData.content.trim()) {
        return;
    }
    
    try {
        const messages = FCWolvesUtils.getFromLocalStorage('chatMessages') || [];
        messages.push(messageData);
        
        await FCWolvesUtils.saveData('chatMessages', messages);
        
        event.target.reset();
        loadChatMessages();
        
        // Scroll to bottom
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

async function loadChatMessages() {
    const messagesContainer = document.querySelector('.chat-messages');
    if (!messagesContainer) return;
    
    const messages = FCWolvesUtils.getFromLocalStorage('chatMessages') || [];
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = '<p style="text-align: center; opacity: 0.7;">لا توجد رسائل حالياً</p>';
        return;
    }
    
    messagesContainer.innerHTML = messages.map(message => `
        <div class="chat-message">
            <div class="message-avatar">${message.sender.charAt(0)}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${message.sender}</span>
                    <span class="message-time">${FCWolvesUtils.formatDate(message.timestamp)}</span>
                </div>
                <div class="message-text">${message.content}</div>
            </div>
        </div>
    `).join('');
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function loadProfile() {
    const currentUser = FCWolvesUtils.getFromLocalStorage('currentUser');
    if (!currentUser) return;
    
    // Update profile information
    const profileName = document.querySelector('.profile-name');
    const profilePosition = document.querySelector('.profile-position');
    const profileAvatar = document.querySelector('.profile-avatar');
    
    if (profileName) profileName.textContent = currentUser.name;
    if (profilePosition) profilePosition.textContent = currentUser.position;
    if (profileAvatar) profileAvatar.textContent = currentUser.name.charAt(0);
    
    // Update profile details
    const profileDetails = document.querySelector('.profile-details');
    if (profileDetails) {
        profileDetails.innerHTML = `
            <div class="profile-detail">
                <h4>رمز الدخول</h4>
                <p>${currentUser.code}</p>
            </div>
            <div class="profile-detail">
                <h4>رقم القميص</h4>
                <p>${currentUser.number}</p>
            </div>
            <div class="profile-detail">
                <h4>تاريخ الانضمام</h4>
                <p>${currentUser.joinDate}</p>
            </div>
            <div class="profile-detail">
                <h4>الوصف</h4>
                <p>${currentUser.description || 'لا يوجد وصف'}</p>
            </div>
        `;
    }
    
    // Update stats
    const statsGrid = document.querySelector('.profile-stats .stats-grid');
    if (statsGrid) {
        statsGrid.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${currentUser.matches || 0}</span>
                <span class="stat-label">المباريات</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${currentUser.goals || 0}</span>
                <span class="stat-label">الأهداف</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${currentUser.assists || 0}</span>
                <span class="stat-label">التمريرات</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${currentUser.yellowCards || 0}</span>
                <span class="stat-label">البطاقات الصفراء</span>
            </div>
        `;
    }
}

// Make functions globally available
window.showTab = showTab;
window.likePost = likePost;

