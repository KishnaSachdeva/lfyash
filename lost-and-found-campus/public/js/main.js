/**
 * EduPortaile - Main Frontend JavaScript
 * Handles UI interactions, notifications, and flash messages
 *
 * SYLLABUS CONCEPT: Client-side JavaScript, DOM manipulation
 * - Flash message system
 * - Notification polling
 * - Mobile menu toggle
 * - Form validations
 */

// ==========================================
// FLASH MESSAGE SYSTEM
// ==========================================

/**
 * Show a flash message
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 */
function showFlashMessage(message, type = 'success') {
  const container = document.getElementById('flashMessages');
  if (!container) return;

  const flashDiv = document.createElement('div');
  flashDiv.className = `flash-message ${type}`;
  flashDiv.innerHTML = `
    <span class="flash-icon">${type === 'success' ? '✅' : '⚠️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(flashDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    flashDiv.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => flashDiv.remove(), 300);
  }, 5000);
}

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

/**
 * Fetch and update notification badge
 */
async function updateNotificationBadge() {
  const badge = document.getElementById('notificationBadge');
  if (!badge) return;

  try {
    const response = await fetch('/api/notifications/unread-count', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success && data.unreadCount > 0) {
      badge.textContent = data.unreadCount > 99 ? '99+' : data.unreadCount;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
}

/**
 * Load and display notifications in dropdown
 */
async function loadNotifications() {
  const notificationList = document.getElementById('notificationList');
  if (!notificationList) return;

  try {
    const response = await fetch('/api/notifications');
    const data = await response.json();

    if (data.success && data.notifications.length > 0) {
      notificationList.innerHTML = data.notifications
        .slice(0, 10)
        .map((notif) => `
          <div class="notification-item ${notif.isRead ? 'read' : 'unread'}">
            <div class="notification-icon">
              ${getNotificationIcon(notif.type)}
            </div>
            <div class="notification-content">
              <p class="notification-message">${notif.message}</p>
              <span class="notification-time">${new Date(notif.createdAt).toLocaleString()}</span>
            </div>
          </div>
        `)
        .join('');
    } else {
      notificationList.innerHTML = '<p class="no-notifications">No notifications</p>';
    }
  } catch (error) {
    console.error('Failed to load notifications:', error);
  }
}

/**
 * Get icon for notification type
 */
function getNotificationIcon(type) {
  const icons = {
    match: '🔍',
    claim: '💬',
    resolution: '✅',
    general: '📢',
  };
  return icons[type] || '📢';
}

/**
 * Mark all notifications as read
 */
async function markAllNotificationsRead() {
  try {
    const response = await fetch('/api/notifications/mark-read', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      updateNotificationBadge();
      loadNotifications();
      showFlashMessage('All notifications marked as read', 'success');
    }
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
  }
}

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileToggle = document.getElementById('mobileMenuToggle');

  if (!mobileMenu || !mobileToggle) return;

  mobileMenu.classList.toggle('active');

  // Animate hamburger icon
  const spans = mobileToggle.querySelectorAll('span');
  if (mobileMenu.classList.contains('active')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
  } else {
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  }
}

// ==========================================
// FORM VALIDATIONS
// ==========================================

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate college email
 */
function isCollegeEmail(email) {
  return email.endsWith('@chitkara.edu.in');
}

/**
 * Validate password strength
 */
function isPasswordStrong(password) {
  return password.length >= 6;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Format date to readable string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time to readable string
 */
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Debounce function for search inputs
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Initialize all components on DOM load
 */
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileMenuToggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleMobileMenu);
  }

  // Notification badge update
  updateNotificationBadge();

  // Load notifications if on dashboard
  const notificationList = document.getElementById('notificationList');
  if (notificationList) {
    loadNotifications();

    // Mark all read button
    const markReadBtn = document.getElementById('markReadBtn');
    if (markReadBtn) {
      markReadBtn.addEventListener('click', markAllNotificationsRead);
    }
  }

  // Auto-hide flash messages after 5 seconds
  const flashMessages = document.getElementById('flashMessages');
  if (flashMessages) {
    setTimeout(() => {
      const messages = flashMessages.querySelectorAll('.flash-message');
      messages.forEach((msg) => {
        msg.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => msg.remove(), 300);
      });
    }, 5000);
  }

  // Character counters for textareas
  document.querySelectorAll('textarea[maxlength]').forEach((textarea) => {
    const counter = textarea.parentElement.querySelector('.form-hint span');
    if (counter) {
      textarea.addEventListener('input', () => {
        counter.textContent = textarea.value.length;
      });
    }
  });

  // Confirm delete actions
  document.querySelectorAll('form[method="POST"] button[type="submit"]').forEach((btn) => {
    if (btn.textContent.includes('Delete')) {
      btn.addEventListener('click', (e) => {
        if (!confirm('Are you sure you want to delete this item?')) {
          e.preventDefault();
        }
      });
    }
  });

  console.log('🚀 EduPortaile initialized');
});

// ==========================================
// SERVICE WORKER REGISTRATION (Optional PWA)
// ==========================================

/**
 * Register service worker for PWA support
 * Uncomment if implementing PWA features
 */
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('ServiceWorker registration successful');
    }).catch((err) => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
*/

// ==========================================
// API HELPER FUNCTIONS
// ==========================================

/**
 * Make authenticated fetch request
 */
async function authenticatedFetch(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Merge options
  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    showFlashMessage(error.message, 'error');
    throw error;
  }
}

// Export functions for use in other scripts
window.EduPortaile = {
  showFlashMessage,
  updateNotificationBadge,
  loadNotifications,
  markAllNotificationsRead,
  isValidEmail,
  isCollegeEmail,
  isPasswordStrong,
  formatDate,
  formatTime,
  escapeHtml,
  debounce,
  authenticatedFetch,
};
