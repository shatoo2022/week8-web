
                    //start of the main content
                    
document.addEventListener('DOMContentLoaded', () => {
    const app = {
        init() {
            this.loadComponents();
            this.setupEventListeners();
            this.handleInitialPage();
            this.observeElements();
        },

        async loadComponents() {
            await this.loadComponent('header', 'header.html');
            await this.loadComponent('footer', 'footer.html');
            // After loading header, setup navigation events
            Navigation.init();
        },

        async loadComponent(elementId, url) {
            const element = document.getElementById(elementId);
            if (element) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        element.innerHTML = await response.text();
                    } else {
                        console.error(`Failed to load ${url}: ${response.statusText}`);
                        element.innerHTML = `<p class="error">Failed to load content.</p>`;
                    }
                } catch (error) {
                    console.error(`Error fetching ${url}:`, error);
                    element.innerHTML = `<p class="error">Error loading content.</p>`;
                }
            }
        },

        setupEventListeners() {
            document.body.addEventListener('click', (e) => {
                const target = e.target.closest('[data-page]');
                if (target) {
                    e.preventDefault();
                    const pageId = target.getAttribute('data-page');
                    this.navigateTo(pageId);
                }
            });
        },

        handleInitialPage() {
            const pageId = window.location.hash.substring(1) || 'home';
            this.navigateTo(pageId, false);
        },

        navigateTo(pageId, updateUrl = true) {
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));

            let targetPage = document.getElementById(pageId);
            if (!targetPage) {
                // If page doesn't exist in the main HTML, load it
                this.loadPageContent(pageId);
            } else {
                targetPage.classList.add('active');
                if (updateUrl) {
                    history.pushState({ page: pageId }, '', `#${pageId}`);
                }
                Navigation.updateActiveLink(pageId);
                this.observeElements(); // Re-observe elements on the new page
            }
        },

        async loadPageContent(pageId) {
            const mainContent = document.querySelector('main');
            if (!mainContent) return;

            try {
                const response = await fetch(`${pageId}.html`);
                if (response.ok) {
                    const pageHTML = await response.text();
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = pageHTML;
                    const newPage = tempDiv.querySelector('.page');
                    
                    if (newPage) {
                        mainContent.appendChild(newPage);
                        this.navigateTo(pageId, true);
                    }
                } else {
                    console.error(`Failed to load page: ${pageId}.html`);
                }
            } catch (error) {
                console.error(`Error loading page ${pageId}:`, error);
            }
        },

        observeElements() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
        }
    };

    const Navigation = {
        init() {
            this.bindEvents();
            this.handleScroll();
        },

        bindEvents() {
            const navToggle = document.querySelector('.nav-toggle');
            const navMenu = document.querySelector('.nav-menu');
            
            if (navToggle && navMenu) {
                navToggle.addEventListener('click', () => {
                    navToggle.classList.toggle('active');
                    navMenu.classList.toggle('active');
                });
            }
        },

        handleScroll() {
            const header = document.querySelector('.header');
            if (header) {
                window.addEventListener('scroll', () => {
                    if (window.scrollY > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                });
            }
        },

        updateActiveLink(pageId) {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-page') === pageId) {
                    link.classList.add('active');
                }
            });
        }
    };

    app.init();
});
