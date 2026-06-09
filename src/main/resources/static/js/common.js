function getCookieValue(name) {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
}

function initCsrfProtection() {
    if (window.__csrfBound) return;
    window.__csrfBound = true;

    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, options = {}) => {
        const method = (options.method || 'GET').toUpperCase();
        if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
            const token = getCookieValue('XSRF-TOKEN');
            if (token) {
                options.headers = { ...(options.headers || {}), 'X-XSRF-TOKEN': decodeURIComponent(token) };
            }
        }
        return originalFetch(input, options);
    };

    document.addEventListener('submit', (event) => {
        const form = event.target;
        if (!(form instanceof HTMLFormElement) || (form.method || 'GET').toUpperCase() !== 'POST') return;
        if (form.querySelector('input[name="_csrf"]')) return;
        const token = getCookieValue('XSRF-TOKEN');
        if (!token) return;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = '_csrf';
        input.value = decodeURIComponent(token);
        form.appendChild(input);
    }, true);
}

function initToastHost() {
    if (document.getElementById('toastHost')) return;
    const host = document.createElement('div');
    host.id = 'toastHost';
    host.className = 'fixed top-5 right-5 z-[9999] space-y-3';
    document.body.appendChild(host);
}

function showToast(message, type = 'success') {
    initToastHost();
    const toast = document.createElement('div');
    const color = type === 'error' ? 'bg-red-500' : 'bg-[#47654c]';
    toast.className = `${color} text-white rounded-lg shadow-lg px-5 py-3 text-sm font-semibold transition-opacity`;
    toast.textContent = message;
    document.getElementById('toastHost').appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 250);
    }, 2400);
}

window.showToast = showToast;

function initCommonSearch() {
    const searchToggleBtn = document.getElementById('searchToggleBtn');
    const searchExpand = document.getElementById('searchExpand');
    const searchInput = document.getElementById('searchInput');
    const header = document.querySelector('header');

    if (!searchToggleBtn || !searchExpand || !header || searchToggleBtn.dataset.bound === 'true') {
        return;
    }

    searchToggleBtn.dataset.bound = 'true';

    searchToggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        header.classList.add('search-expanded');
        setTimeout(function() {
            if (searchInput) {
                searchInput.focus();
            }
        }, 100);
    });

    document.addEventListener('click', function(e) {
        if (header.classList.contains('search-expanded')) {
            if (!searchExpand.contains(e.target) && !searchToggleBtn.contains(e.target)) {
                header.classList.remove('search-expanded');
            }
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            header.classList.remove('search-expanded');
        }
    });

    const form = searchExpand.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            if (searchInput && searchInput.value.trim() === '') {
                e.preventDefault();
                header.classList.remove('search-expanded');
            }
        });
    }
}

function initCommonLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn || logoutBtn.dataset.bound === 'true') {
        return;
    }

    logoutBtn.dataset.bound = 'true';
    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/user/logout', {
                method: 'POST',
                credentials: 'same-origin'
            });
        } finally {
            window.location.href = '/';
        }
    });
}

function initCommon() {
    initCsrfProtection();
    initToastHost();
    initCommonSearch();
    initCommonLogout();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommon);
} else {
    initCommon();
}
