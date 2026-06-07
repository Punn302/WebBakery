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
    initCommonSearch();
    initCommonLogout();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommon);
} else {
    initCommon();
}
