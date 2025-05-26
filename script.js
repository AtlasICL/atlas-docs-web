/**
 * Main class for managing the documentation site's navigation and functionality.
 * Handles section switching, mobile menu, search, and keyboard navigation.
 */
class DocumentationSite {
    constructor() {
        this.currentSection = 'home';
        this.init();
    }

    /**
     * Initializes all site functionality in the correct order.
     * Order matters: navigation must be set up before search functionality.
     */
    init() {
        this.setupNavigation();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupKeyboardNavigation();
        this.setupSearchFunctionality();
        this.handleInitialLoad();
    }

    /**
     * Sets up event listeners for all navigation elements.
     * Handles three types of navigation: sidebar links, section nav, and inline links.
     */
    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('href').substring(1);
                this.showSection(targetSection);
                this.updateActiveNavLink(link);
            });
        });

        document.querySelectorAll('.section-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('href').substring(1);
                this.showSection(targetSection);
                this.updateActiveNavLink(document.querySelector(`[href="#${targetSection}"]`));
            });
        });

        // Global click handler for any internal anchor links not already handled
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
                // Avoid double-handling links already processed above
                if (link.classList.contains('nav-link') || link.closest('.section-nav')) {
                    return;
                }
                
                e.preventDefault();
                const targetSection = link.getAttribute('href').substring(1);
                this.showSection(targetSection);
                const navLink = document.querySelector(`[href="#${targetSection}"].nav-link`);
                this.updateActiveNavLink(navLink);
            }
        });
    }

    /**
     * Displays the specified section and updates browser state.
     * @param {string} sectionId - The ID of the section to display
     */
    showSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Update browser history for proper back/forward navigation
            history.pushState({ section: sectionId }, '', `#${sectionId}`);
            
            // Reset scroll position for better UX
            document.querySelector('.main-content').scrollTop = 0;
            
            this.updatePageTitle(sectionId);
        }
    }

    /**
     * Updates the active state of navigation links.
     * @param {HTMLElement} activeLink - The link element to mark as active
     */
    updateActiveNavLink(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Updates the page title based on the current section.
     * @param {string} sectionId - The ID of the current section
     */
    updatePageTitle(sectionId) {
        const titles = {
            'home': 'Atlas Docs - Development Documentation',
            'python': 'Python - Atlas Docs',
            'python-updating': 'Updating Python - Atlas Docs',
            'python-pip': 'Using pip - Atlas Docs',
            'python-venv': 'Virtual Environments - Atlas Docs',
            'python-compile': 'Compiling Releases - Atlas Docs',
            'git': 'Git - Atlas Docs',
            'git-install': 'Installing Git - Atlas Docs',
            'git-repo': 'Creating Repos - Atlas Docs',
            'git-changes': 'Making Changes - Atlas Docs',
            'git-github': 'GitHub Integration - Atlas Docs',
            'git-config': 'Git Configuration - Atlas Docs',
            'ssh': 'SSH - Atlas Docs',
            'ssh-keys': 'Generating SSH Keys - Atlas Docs',
            'ssh-usage': 'Using SSH - Atlas Docs'
        };

        document.title = titles[sectionId] || 'Atlas Docs - Development Documentation';
    }

    /**
     * Creates and configures the mobile menu toggle functionality.
     * Handles toggle creation, click events, and outside click detection.
     */
    setupMobileMenu() {
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '☰';
        mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
        
        document.body.insertBefore(mobileToggle, document.body.firstChild);

        mobileToggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('open');
            mobileToggle.classList.toggle('active');
        });

        // Close menu when clicking outside - improves mobile UX
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            const isClickInsideSidebar = sidebar.contains(e.target);
            const isClickOnToggle = mobileToggle.contains(e.target);

            if (!isClickInsideSidebar && !isClickOnToggle && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                mobileToggle.classList.remove('active');
            }
        });

        // Auto-close menu after navigation on mobile for better UX
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    document.querySelector('.sidebar').classList.remove('open');
                    mobileToggle.classList.remove('active');
                }
            });
        });
    }

    /**
     * Handles browser back/forward navigation.
     * Ensures sections update correctly when user uses browser navigation.
     */
    setupSmoothScrolling() {
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.showSection(e.state.section);
                const navLink = document.querySelector(`[href="#${e.state.section}"]`);
                this.updateActiveNavLink(navLink);
            }
        });
    }

    /**
     * Adds keyboard navigation support for accessibility.
     * Supports ESC to close mobile menu and arrow keys for nav link navigation.
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const sidebar = document.querySelector('.sidebar');
                const mobileToggle = document.querySelector('.mobile-menu-toggle');
                if (sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    mobileToggle.classList.remove('active');
                }
            }

            // Enable arrow key navigation when focused on nav links
            if (e.target.classList.contains('nav-link')) {
                const navLinks = Array.from(document.querySelectorAll('.nav-link'));
                const currentIndex = navLinks.indexOf(e.target);

                if (e.key === 'ArrowDown' && currentIndex < navLinks.length - 1) {
                    e.preventDefault();
                    navLinks[currentIndex + 1].focus();
                } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                    e.preventDefault();
                    navLinks[currentIndex - 1].focus();
                }
            }
        });
    }

    /**
     * Creates and configures the search functionality.
     * Builds search UI, handles input events, and manages result display.
     */
    setupSearchFunctionality() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <div class="search-input-wrapper">
                <input type="text" class="search-input" placeholder="Search documentation..." aria-label="Search documentation">
                <button class="search-clear-btn" aria-label="Clear search" title="Clear search">×</button>
            </div>
            <div class="search-results"></div>
        `;

        const sidebarHeader = document.querySelector('.sidebar-header');
        sidebarHeader.insertAdjacentElement('afterend', searchContainer);

        const searchInput = searchContainer.querySelector('.search-input');
        const searchResults = searchContainer.querySelector('.search-results');
        const clearBtn = searchContainer.querySelector('.search-clear-btn');

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            // Toggle clear button visibility based on input content
            clearBtn.style.display = e.target.value.length > 0 ? 'block' : 'none';
            
            // Require minimum 2 characters to avoid too many results
            if (query.length < 2) {
                searchResults.innerHTML = '';
                searchResults.style.display = 'none';
                return;
            }

            const results = this.searchContent(query);
            this.displaySearchResults(results, searchResults);
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            clearBtn.style.display = 'none';
            searchInput.focus();
        });

        // Hide results when clicking outside search area
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    }

    /**
     * Searches through all content sections for the given query.
     * @param {string} query - The search term to look for
     * @returns {Array} Array of search result objects
     */
    searchContent(query) {
        const results = [];
        const sections = document.querySelectorAll('.content-section');

        sections.forEach(section => {
            const sectionId = section.id;
            const title = section.querySelector('h1, h2')?.textContent || '';
            const content = section.textContent.toLowerCase();

            if (content.includes(query) || title.toLowerCase().includes(query)) {
                // Search within specific elements for more precise results
                const paragraphs = section.querySelectorAll('p, li, h3, h4');
                paragraphs.forEach(element => {
                    const text = element.textContent.toLowerCase();
                    if (text.includes(query)) {
                        results.push({
                            sectionId,
                            title: title || sectionId,
                            snippet: this.createSnippet(element.textContent, query),
                            element
                        });
                    }
                });
            }
        });

        return results.slice(0, 10); // Limit results to prevent UI overflow
    }

    /**
     * Creates a text snippet with highlighted search terms.
     * @param {string} text - The full text to create a snippet from
     * @param {string} query - The search term to highlight
     * @returns {string} HTML snippet with highlighted search terms
     */
    createSnippet(text, query) {
        const index = text.toLowerCase().indexOf(query.toLowerCase());
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + query.length + 50);
        
        let snippet = text.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';
        
        // Highlight matching terms with <mark> tags
        const regex = new RegExp(`(${query})`, 'gi');
        snippet = snippet.replace(regex, '<mark>$1</mark>');
        
        return snippet;
    }

    /**
     * Renders search results in the UI and adds click handlers.
     * @param {Array} results - Array of search result objects
     * @param {HTMLElement} container - Container element for results
     */
    displaySearchResults(results, container) {
        if (results.length === 0) {
            container.innerHTML = '<div class="search-no-results">No results found</div>';
        } else {
            container.innerHTML = results.map(result => `
                <div class="search-result" data-section="${result.sectionId}">
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-snippet">${result.snippet}</div>
                </div>
            `).join('');

            // Add navigation functionality to search results
            container.querySelectorAll('.search-result').forEach(resultElement => {
                resultElement.addEventListener('click', () => {
                    const sectionId = resultElement.dataset.section;
                    this.showSection(sectionId);
                    const navLink = document.querySelector(`[href="#${sectionId}"]`);
                    this.updateActiveNavLink(navLink);
                    container.style.display = 'none';
                    document.querySelector('.search-input').value = '';
                });
            });
        }

        container.style.display = 'block';
    }

    /**
     * Handles initial page load, including URL hash navigation.
     * Sets up proper initial state based on URL or defaults to home.
     */
    handleInitialLoad() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            this.showSection(hash);
            const navLink = document.querySelector(`[href="#${hash}"]`);
            this.updateActiveNavLink(navLink);
        } else {
            // Ensure browser history starts with a proper state
            history.replaceState({ section: 'home' }, '', '#home');
        }
    }
}

/**
 * Global function for card clicks (called from HTML onclick attributes).
 * Provides a bridge between HTML onclick and the DocumentationSite instance.
 * @param {string} sectionId - The section ID to navigate to
 */
function showSection(sectionId) {
    if (window.docSite) {
        window.docSite.showSection(sectionId);
        const navLink = document.querySelector(`[href="#${sectionId}"]`);
        window.docSite.updateActiveNavLink(navLink);
    }
}

/**
 * Adds copy-to-clipboard functionality to all code blocks.
 * Creates copy buttons with visual feedback for successful/failed operations.
 */
function setupCodeCopyButtons() {
    document.querySelectorAll('pre').forEach(pre => {
        const button = document.createElement('button');
        button.className = 'copy-code-btn';
        button.innerHTML = '📋';
        button.title = 'Copy code';
        
        button.addEventListener('click', async () => {
            const code = pre.querySelector('code').textContent;
            try {
                await navigator.clipboard.writeText(code);
                button.innerHTML = '✅';
                button.title = 'Copied!';
                setTimeout(() => {
                    button.innerHTML = '📋';
                    button.title = 'Copy code';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy code:', err);
                button.innerHTML = '❌';
                setTimeout(() => {
                    button.innerHTML = '📋';
                    button.title = 'Copy code';
                }, 2000);
            }
        });
        
        pre.style.position = 'relative';
        pre.appendChild(button);
    });
}

// Initialize the documentation site when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.docSite = new DocumentationSite();
    setupCodeCopyButtons();
    
    // Trigger loading animation
    document.body.classList.add('loaded');
});

// Handle responsive behavior on window resize
window.addEventListener('resize', () => {
    const sidebar = document.querySelector('.sidebar');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    // Auto-close mobile menu when switching to desktop view
    if (window.innerWidth > 1024) {
        sidebar.classList.remove('open');
        if (mobileToggle) {
            mobileToggle.classList.remove('active');
        }
    }
});

// Optional: Service worker registration for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 