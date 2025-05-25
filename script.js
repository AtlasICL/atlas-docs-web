// Navigation and section management
class DocumentationSite {
    constructor() {
        this.currentSection = 'home';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupKeyboardNavigation();
        this.setupSearchFunctionality();
        this.handleInitialLoad();
    }

    setupNavigation() {
        // Handle navigation link clicks
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('href').substring(1);
                this.showSection(targetSection);
                this.updateActiveNavLink(link);
            });
        });

        // Handle section navigation clicks
        document.querySelectorAll('.section-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('href').substring(1);
                this.showSection(targetSection);
                this.updateActiveNavLink(document.querySelector(`[href="#${targetSection}"]`));
            });
        });
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Update URL without page reload
            history.pushState({ section: sectionId }, '', `#${sectionId}`);
            
            // Scroll to top of content
            document.querySelector('.main-content').scrollTop = 0;
            
            // Update page title
            this.updatePageTitle(sectionId);
        }
    }

    updateActiveNavLink(activeLink) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to clicked link
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

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

    setupMobileMenu() {
        // Create mobile menu toggle button
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '☰';
        mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
        
        // Add mobile toggle to the page
        document.body.insertBefore(mobileToggle, document.body.firstChild);

        // Handle mobile menu toggle
        mobileToggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('open');
            mobileToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            const isClickInsideSidebar = sidebar.contains(e.target);
            const isClickOnToggle = mobileToggle.contains(e.target);

            if (!isClickInsideSidebar && !isClickOnToggle && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                mobileToggle.classList.remove('active');
            }
        });

        // Close mobile menu when navigation link is clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    document.querySelector('.sidebar').classList.remove('open');
                    mobileToggle.classList.remove('active');
                }
            });
        });
    }

    setupSmoothScrolling() {
        // Handle hash changes (browser back/forward)
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.showSection(e.state.section);
                const navLink = document.querySelector(`[href="#${e.state.section}"]`);
                this.updateActiveNavLink(navLink);
            }
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC key closes mobile menu
            if (e.key === 'Escape') {
                const sidebar = document.querySelector('.sidebar');
                const mobileToggle = document.querySelector('.mobile-menu-toggle');
                if (sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    mobileToggle.classList.remove('active');
                }
            }

            // Arrow keys for navigation (when focused on nav links)
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

    setupSearchFunctionality() {
        // Create search input
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <input type="text" class="search-input" placeholder="Search documentation..." aria-label="Search documentation">
            <div class="search-results"></div>
        `;

        // Insert search after sidebar header
        const sidebarHeader = document.querySelector('.sidebar-header');
        sidebarHeader.insertAdjacentElement('afterend', searchContainer);

        const searchInput = searchContainer.querySelector('.search-input');
        const searchResults = searchContainer.querySelector('.search-results');

        // Simple search functionality
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 2) {
                searchResults.innerHTML = '';
                searchResults.style.display = 'none';
                return;
            }

            const results = this.searchContent(query);
            this.displaySearchResults(results, searchResults);
        });

        // Hide search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    }

    searchContent(query) {
        const results = [];
        const sections = document.querySelectorAll('.content-section');

        sections.forEach(section => {
            const sectionId = section.id;
            const title = section.querySelector('h1, h2')?.textContent || '';
            const content = section.textContent.toLowerCase();

            if (content.includes(query) || title.toLowerCase().includes(query)) {
                // Find specific matches within the section
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

        return results.slice(0, 10); // Limit to 10 results
    }

    createSnippet(text, query) {
        const index = text.toLowerCase().indexOf(query.toLowerCase());
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + query.length + 50);
        
        let snippet = text.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';
        
        // Highlight the query
        const regex = new RegExp(`(${query})`, 'gi');
        snippet = snippet.replace(regex, '<mark>$1</mark>');
        
        return snippet;
    }

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

            // Add click handlers to search results
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

    handleInitialLoad() {
        // Handle initial page load with hash
        const hash = window.location.hash.substring(1);
        if (hash) {
            this.showSection(hash);
            const navLink = document.querySelector(`[href="#${hash}"]`);
            this.updateActiveNavLink(navLink);
        } else {
            // Set initial state
            history.replaceState({ section: 'home' }, '', '#home');
        }
    }
}

// Global function for card clicks (called from HTML)
function showSection(sectionId) {
    if (window.docSite) {
        window.docSite.showSection(sectionId);
        const navLink = document.querySelector(`[href="#${sectionId}"]`);
        window.docSite.updateActiveNavLink(navLink);
    }
}

// Copy code functionality
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

// Theme toggle functionality
function setupThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '🌙';
    themeToggle.title = 'Toggle theme';
    
    // Add theme toggle to sidebar header
    const sidebarHeader = document.querySelector('.sidebar-header');
    sidebarHeader.appendChild(themeToggle);
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        themeToggle.innerHTML = isLight ? '🌞' : '🌙';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.innerHTML = '🌞';
    }
}

// Initialize the documentation site
document.addEventListener('DOMContentLoaded', () => {
    window.docSite = new DocumentationSite();
    setupCodeCopyButtons();
    setupThemeToggle();
    
    // Add loading animation
    document.body.classList.add('loaded');
});

// Handle window resize
window.addEventListener('resize', () => {
    const sidebar = document.querySelector('.sidebar');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (window.innerWidth > 1024) {
        sidebar.classList.remove('open');
        if (mobileToggle) {
            mobileToggle.classList.remove('active');
        }
    }
});

// Service worker registration for offline functionality (optional)
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