// API Configuration
const API_BASE_URL = window.location.origin;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
    
    // Initialize booking system
    initializeBookingSystem();
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Special handling for stats counter animation
                if (entry.target.classList.contains('stat-number')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .testimonial-card, .stat, .about-text, .contact-info, .contact-form');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Counter animation for statistics
    function animateCounter(element) {
        const target = parseInt(element.textContent.replace(/\D/g, ''));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Handle different formats (300+, etc.)
            if (element.textContent.includes('+')) {
                element.textContent = Math.floor(current) + '+';
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Validate form
            if (validateForm(data)) {
                // Show success message
                showNotification('תודה! הודעתך נשלחה בהצלחה. נחזור אליך בהקדם.', 'success');
                this.reset();
            } else {
                showNotification('אנא מלא את כל השדות הנדרשים.', 'error');
            }
        });
    }

    // Form validation
    function validateForm(data) {
        return data.name && data.email && data.phone && data.service;
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 350px;
        `;

        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
        `;

        notification.querySelector('.notification-close').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            width: 25px;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeNotification(notification);
        }, 5000);

        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            removeNotification(notification);
        });
    }

    function removeNotification(notification) {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero::before');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // Service cards hover effect enhancement
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            if (this.classList.contains('featured')) {
                this.style.transform = 'scale(1.05)';
            } else {
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
    });

    // Testimonial cards auto-scroll on mobile
    function setupTestimonialScroll() {
        const container = document.querySelector('.testimonials-grid');
        if (window.innerWidth <= 768 && container) {
            let currentIndex = 0;
            const cards = container.querySelectorAll('.testimonial-card');
            
            setInterval(() => {
                currentIndex = (currentIndex + 1) % cards.length;
                container.style.transform = `translateX(-${currentIndex * 100}%)`;
            }, 4000);
        }
    }

    // Form input animations
    const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });

        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // Active navigation highlighting
    function updateActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);

    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close mobile menu if open
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Initialize functions
    setupTestimonialScroll();
    updateActiveNav();

    // Resize handler
    window.addEventListener('resize', function() {
        setupTestimonialScroll();
    });

    // Add loading animation completion
    document.body.classList.add('loaded');
});

// Add CSS for mobile menu toggle
const mobileMenuCSS = `
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            right: -100%;
            top: 70px;
            flex-direction: column;
            background-color: white;
            width: 100%;
            text-align: center;
            transition: 0.3s;
            box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
            padding: 2rem 0;
        }

        .nav-menu.active {
            right: 0;
        }

        .nav-menu li {
            margin: 1rem 0;
        }

        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }

        .hamburger.active span:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
        }

        .hamburger.active span:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
        }

        .nav-menu a.active {
            color: var(--primary-color);
        }
    }

    .loaded {
        opacity: 1;
    }
`;

// Inject mobile menu CSS
const style = document.createElement('style');
style.textContent = mobileMenuCSS;
document.head.appendChild(style);

// Application Initialization
async function initializeApp() {
    try {
        await loadBusinessSettings();
        await loadServices();
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
}

// Load business settings from API
async function loadBusinessSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings`);
        if (response.ok) {
            const settings = await response.json();
            updatePageContent(settings);
        }
    } catch (error) {
        console.error('Failed to load business settings:', error);
    }
}

// Update page content with settings
function updatePageContent(settings) {
    // Update hero section
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    
    if (heroTitle && settings.hero_title) {
        heroTitle.textContent = settings.hero_title;
    }
    
    if (heroSubtitle && settings.hero_subtitle) {
        heroSubtitle.textContent = settings.hero_subtitle;
    }
    
    // Update contact information
    updateElement('contact-phone', settings.contact_phone);
    updateElement('contact-email', settings.contact_email);
    updateElement('contact-address', settings.contact_address);
    updateElement('working-hours', settings.working_hours);
}

// Helper function to update element content
function updateElement(id, content) {
    const element = document.getElementById(id);
    if (element && content) {
        element.innerHTML = content;
    }
}

// Load services from API
async function loadServices() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/services`);
        if (response.ok) {
            const services = await response.json();
            displayServices(services);
            populateServiceSelect(services);
        }
    } catch (error) {
        console.error('Failed to load services:', error);
    }
}

// Display services in the booking section
function displayServices(services) {
    const servicesList = document.getElementById('services-list');
    if (!servicesList) return;
    
    servicesList.innerHTML = '<h3 style="margin-bottom: 20px; color: #333;">השירותים שלנו</h3>';
    
    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.dataset.serviceId = service.id;
        serviceCard.dataset.serviceName = service.name;
        
        serviceCard.innerHTML = `
            <div class="service-name">${service.name}</div>
            <div class="service-description">${service.description || ''}</div>
            <div class="service-details">
                <span>${service.duration} דקות</span>
                <span class="service-price">₪${service.price}</span>
            </div>
        `;
        
        serviceCard.addEventListener('click', () => selectService(serviceCard, service));
        servicesList.appendChild(serviceCard);
    });
}

// Populate service select dropdown
function populateServiceSelect(services) {
    const serviceSelect = document.getElementById('booking-service');
    if (!serviceSelect) return;
    
    serviceSelect.innerHTML = '<option value="">בחר שירות</option>';
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.name;
        option.textContent = `${service.name} (₪${service.price})`;
        serviceSelect.appendChild(option);
    });
}

// Select service function
function selectService(cardElement, service) {
    // Remove previous selection
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Select current service
    cardElement.classList.add('selected');
    
    // Update form
    const serviceSelect = document.getElementById('booking-service');
    if (serviceSelect) {
        serviceSelect.value = service.name;
    }
}

// Initialize booking system
function initializeBookingSystem() {
    const bookingForm = document.getElementById('booking-form');
    const dateInput = document.getElementById('booking-date');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    if (dateInput) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        
        // Load available time slots when date changes
        dateInput.addEventListener('change', loadAvailableTimeSlots);
    }
}

// Load available time slots for selected date
async function loadAvailableTimeSlots() {
    const dateInput = document.getElementById('booking-date');
    const timeSelect = document.getElementById('booking-time');
    
    if (!dateInput.value || !timeSelect) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/available-slots?date=${dateInput.value}`);
        if (response.ok) {
            const timeSlots = await response.json();
            updateTimeSlots(timeSlots);
        }
    } catch (error) {
        console.error('Failed to load time slots:', error);
    }
}

// Update time slots dropdown
function updateTimeSlots(timeSlots) {
    const timeSelect = document.getElementById('booking-time');
    timeSelect.innerHTML = '<option value="">בחר שעה</option>';
    
    timeSlots.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
    });
}

// Handle booking form submission
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const bookingData = Object.fromEntries(formData.entries());
    
    // Validate required fields
    if (!validateBookingData(bookingData)) {
        return;
    }
    
    // Show loading state
    showLoadingState(form);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccessMessage(result.message);
            form.reset();
            clearServiceSelection();
        } else {
            showErrorMessage(result.error || 'שגיאה בקביעת התור');
        }
    } catch (error) {
        console.error('Booking error:', error);
        showErrorMessage('שגיאה בחיבור לשרת');
    } finally {
        hideLoadingState(form);
    }
}

// Validate booking data
function validateBookingData(data) {
    const required = ['name', 'email', 'phone', 'service', 'appointment_date', 'appointment_time'];
    
    for (const field of required) {
        if (!data[field] || data[field].trim() === '') {
            showErrorMessage(`אנא מלא את השדה: ${getFieldLabel(field)}`);
            return false;
        }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showErrorMessage('כתובת אימייל לא תקינה');
        return false;
    }
    
    return true;
}

// Get field label in Hebrew
function getFieldLabel(field) {
    const labels = {
        'name': 'שם מלא',
        'email': 'אימייל',
        'phone': 'טלפון',
        'service': 'שירות',
        'appointment_date': 'תאריך',
        'appointment_time': 'שעה'
    };
    return labels[field] || field;
}

// Clear service selection
function clearServiceSelection() {
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
}

// Show loading state
function showLoadingState(form) {
    form.classList.add('loading');
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'שולח...';
    }
}

// Hide loading state
function hideLoadingState(form) {
    form.classList.remove('loading');
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'קבע תור';
    }
}

// Show success message
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

// Show error message
function showErrorMessage(message) {
    showMessage(message, 'error');
}

// Show message
function showMessage(message, type) {
    // Remove existing messages
    document.querySelectorAll('.success-message, .error-message').forEach(msg => {
        msg.remove();
    });
    
    const messageEl = document.createElement('div');
    messageEl.className = type === 'success' ? 'success-message' : 'error-message';
    messageEl.textContent = message;
    
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.insertBefore(messageEl, bookingForm.firstChild);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
        
        // Scroll to message
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}