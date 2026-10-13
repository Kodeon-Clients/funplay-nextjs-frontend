/* FunPlay landing pages (school, builders, generic). Original campaign.js with the form handler
   posting to /api/contact (reCAPTCHA v3 when <html data-recaptcha> is set), plus Tawk/WhatsApp chat. */
function fpToken(action) {
    var key = document.documentElement.getAttribute('data-recaptcha');
    if (!key) return Promise.resolve(null);
    return new Promise(function (resolve) {
        function run() { grecaptcha.ready(function () { grecaptcha.execute(key, { action: action }).then(resolve, function () { resolve(null); }); }); }
        if (window.grecaptcha) return run();
        var s = document.createElement('script');
        s.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(key);
        s.onload = run; s.onerror = function () { resolve(null); };
        document.head.appendChild(s);
    });
}
document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-tawk]');
    if (a && window.Tawk_API && typeof window.Tawk_API.toggle === 'function') { e.preventDefault(); window.Tawk_API.toggle(); }
});
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form[data-fp-standalone]');
    forms.forEach(form => {
        const submitBtn = form.querySelector('button[type="submit"]');

        const fields = {
            name: form.elements['name'],
            phone: form.elements['phone'],
            email: form.elements['email'],
            location: form.elements['location'], //city
            state: form.elements['state'],
            comment: form.elements['comment']
        };

        if (form.elements['typeOfProject']) {
            fields.typeOfProject = form.elements['typeOfProject'];
        }
        if (form.elements['companyname']) {
            fields.companyname = form.elements['companyname'];
        }
        if (form.elements['institutionname']) {
            fields.institutionname = form.elements['institutionname'];
        }

        const validators = {
            name: val => /^[A-Za-z\s]+$/.test(val),
            phone: val => /^[0-9]{10}$/.test(val),
            email: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            location: val => /^[A-Za-z\s]+$/.test(val),
            state: val => val !== '',
            comment: val => val !== ''
        };

        ['typeOfProject', 'companyname', 'institutionname'].forEach(field => {
            if (fields[field]) validators[field] = val => val !== '';
        });

        const errorDisplay = Object.assign(document.createElement('p'), {
            className: 'text-red-500 text-sm mt-4 uppercase'
        });

        form.appendChild(errorDisplay);

        form.addEventListener('submit', e => {
            e.preventDefault();
            errorDisplay.textContent = '';
            submitBtn.disabled = false;
            Object.values(fields).forEach(f => f.style.border = '1px solid #DDD2D2');

            for (const [key, field] of Object.entries(fields)) {
                let value = field.value.trim();

                if (!validators[key](value)) {
                    const label = field.labels?.[0]?.textContent || key;
                    errorDisplay.textContent = `${label.replace('*','')} is invalid or required`;
                    field.style.border = '1px solid red';
                    return;
                }
            }

            const fileInput = form.elements['layout'];
            if (fileInput) {
                const file = fileInput.files[0];
                if (!file) {
                    errorDisplay.textContent = 'File is required';
                    fileInput.style.border = '1px solid red';
                    return;
                }
                if (file.size > 5 * 1024 * 1024) {
                    errorDisplay.textContent = 'File must be less than 5MB';
                    fileInput.style.border = '1px solid red';
                    return;
                }
                fileInput.style.border = '1px solid #DDD2D2';
            }

            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');

            if (fields.comment && fields.comment.value.trim() === '') {
                fields.comment.value = 'No comments';
            }

            const formData = new FormData(form);
            formData.append('page_url', window.location.href);

            fpToken('contact')
                .then(t => {
                    if (t) formData.set('g-recaptcha-response', t);
                    return fetch(form.action, { method: 'POST', body: formData, headers: { Accept: 'application/json' } });
                })
                .then(res => res.json().catch(() => ({})).then(d => ({ ok: res.ok && d.ok, d })))
                .then(({ ok, d }) => {
                    if (!ok) throw new Error((d && d.message) || 'Something went wrong. Please try again.');
                    form.reset();
                    window.location.href = '/thank-you-campaign.html';
                })
                .catch(err => {
                    errorDisplay.textContent = err && err.message && err.message !== 'Failed to fetch' ? err.message : 'Something went wrong. Please try again.';
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                });
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    var acc = document.getElementsByClassName("accordion-container");

    for (var i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function () {
            // First close all other panels
            var allPanels = document.querySelectorAll(".panel");
            var allAccordions = document.querySelectorAll(".accordion");

            allPanels.forEach(function (panel) {
                if (panel !== this.querySelector(".panel")) {
                    panel.style.maxHeight = null;
                }
            }.bind(this));

            allAccordions.forEach(function (accordion) {
                if (accordion !== this.querySelector(".accordion")) {
                    accordion.classList.remove("active");
                }
            }.bind(this));

            // Then toggle the clicked one
            var panel = this.querySelector(".panel");
            var accordion = this.querySelector(".accordion");

            accordion.classList.toggle("active");

            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    }
});

// Section : Here are some key project we have done in the past
const projectCarousel = document.getElementById('projectCarousel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let projectScrollAmount = 0;
let projectScrollStep = 843; // Default desktop step (819px + 24px)

function calculateScrollStep() {
    // For mobile screens (less than 768px), use full width of carousel container
    if (window.innerWidth < 768) {
        projectScrollStep = projectCarousel.clientWidth;
    } else {
        projectScrollStep = 843; // Desktop step
    }
}

function scrollProject(direction) {
    calculateScrollStep(); // Recalculate step on each scroll

    // Calculate the maximum scroll amount
    const maxScroll = projectCarousel.scrollWidth - projectCarousel.clientWidth;

    // Prevent scrolling beyond limits
    if (direction === 'left') {
        projectScrollAmount = Math.max(0, projectScrollAmount - projectScrollStep);
    } else {
        projectScrollAmount = Math.min(maxScroll, projectScrollAmount + projectScrollStep);
    }

    projectCarousel.scrollTo({
        left: projectScrollAmount,
        behavior: 'smooth'
    });

    // Update button states immediately and after scroll
    updateProjectButtonStates();
    setTimeout(updateProjectButtonStates, 300);
}

prevBtn.addEventListener('click', () => scrollProject('left'));
nextBtn.addEventListener('click', () => scrollProject('right'));

// Disable buttons when at start or end and update styles
function updateProjectButtonStates() {
    // Get current scroll position and max scroll
    const currentScroll = projectCarousel.scrollLeft;
    const maxScroll = projectCarousel.scrollWidth - projectCarousel.clientWidth;

    // Determine if at start or end (with small buffer to account for rounding)
    const atStart = currentScroll <= 10;
    const atEnd = currentScroll >= maxScroll - 10;

    // Update previous button
    prevBtn.disabled = atStart;
    if (atStart) {
        prevBtn.classList.remove('bg-[#EE535C]');
        prevBtn.classList.add('bg-white', 'border-[#ACACAC]');
        prevBtn.querySelector('img').src = "images/campaign/icons/left-arrow-alt.svg";
        prevBtn.querySelector('img').classList.remove('rotate-180');
    } else {
        prevBtn.classList.remove('bg-white');
        prevBtn.classList.add('bg-[#EE535C]');
        prevBtn.querySelector('img').src = "images/campaign/icons/right-arrow-alt.svg";
        prevBtn.querySelector('img').classList.add('rotate-180');
    }

    // Update next button
    nextBtn.disabled = atEnd;
    if (atEnd) {
        nextBtn.classList.remove('bg-[#EE535C]');
        nextBtn.classList.add('bg-white', 'border', 'border-[#ACACAC]');
        nextBtn.querySelector('img').src = "images/campaign/icons/left-arrow-alt.svg";
        nextBtn.querySelector('img').classList.add('rotate-180');
    } else {
        nextBtn.classList.remove('bg-white');
        nextBtn.classList.add('bg-[#EE535C]');
        nextBtn.querySelector('img').src = "images/campaign/icons/right-arrow-alt.svg";
        nextBtn.querySelector('img').classList.remove('rotate-180');
    }
}

// Update button states on scroll
projectCarousel.addEventListener('scroll', () => {
    projectScrollAmount = projectCarousel.scrollLeft;
    updateProjectButtonStates();
});

// Handle window resize
window.addEventListener('resize', () => {
    calculateScrollStep();
    updateProjectButtonStates();
});

// Initial setup
calculateScrollStep();
updateProjectButtonStates();



// Section : What our customers say
const customerCarousel = document.getElementById('customerCarousel');
const cusprevBtn = document.getElementById('cusprevBtn');
const cusnextBtn = document.getElementById('cusnextBtn');

let customerScrollAmount = 0;
let customerScrollStep = 590; // Default desktop step (566px + 24px)

function calculateCustomerScrollStep() {
    // For mobile screens (less than 768px), use full width of carousel container
    if (window.innerWidth < 768) {
        customerScrollStep = customerCarousel.clientWidth;
    } else {
        customerScrollStep = 590; // Desktop step
    }
}

function scrollCustomer(direction) {
    calculateCustomerScrollStep(); // Recalculate step on each scroll

    // Calculate the maximum scroll amount
    const maxScroll = customerCarousel.scrollWidth - customerCarousel.clientWidth;

    // Prevent scrolling beyond limits
    if (direction === 'left') {
        customerScrollAmount = Math.max(0, customerScrollAmount - customerScrollStep);
    } else {
        customerScrollAmount = Math.min(maxScroll, customerScrollAmount + customerScrollStep);
    }

    customerCarousel.scrollTo({
        left: customerScrollAmount,
        behavior: 'smooth'
    });

    // Update button states immediately and after scroll
    updateCustomerButtonStates();
    setTimeout(updateCustomerButtonStates, 300);
}

cusprevBtn.addEventListener('click', () => scrollCustomer('left'));
cusnextBtn.addEventListener('click', () => scrollCustomer('right'));

// Disable buttons when at start or end and update styles
function updateCustomerButtonStates() {
    // Get current scroll position and max scroll
    const currentScroll = customerCarousel.scrollLeft;
    const maxScroll = customerCarousel.scrollWidth - customerCarousel.clientWidth;

    // Determine if at start or end (with small buffer to account for rounding)
    const atStart = currentScroll <= 10;
    const atEnd = currentScroll >= maxScroll - 10;

    // Update previous button
    cusprevBtn.disabled = atStart;
    if (atStart) {
        cusprevBtn.classList.remove('bg-[#EE535C]');
        cusprevBtn.classList.add('bg-white', 'border-[#ACACAC]');
        cusprevBtn.querySelector('img').src = "images/campaign/icons/left-arrow-alt.svg";
        cusprevBtn.querySelector('img').classList.remove('rotate-180');
    } else {
        cusprevBtn.classList.remove('bg-white');
        cusprevBtn.classList.add('bg-[#EE535C]');
        cusprevBtn.querySelector('img').src = "images/campaign/icons/right-arrow-alt.svg";
        cusprevBtn.querySelector('img').classList.add('rotate-180');
    }

    // Update next button
    cusnextBtn.disabled = atEnd;
    if (atEnd) {
        cusnextBtn.classList.remove('bg-[#EE535C]');
        cusnextBtn.classList.add('bg-white', 'border', 'border-[#ACACAC]');
        cusnextBtn.querySelector('img').src = "images/campaign/icons/left-arrow-alt.svg";
        cusnextBtn.querySelector('img').classList.add('rotate-180');
    } else {
        cusnextBtn.classList.remove('bg-white');
        cusnextBtn.classList.add('bg-[#EE535C]');
        cusnextBtn.querySelector('img').src = "images/campaign/icons/right-arrow-alt.svg";
        cusnextBtn.querySelector('img').classList.remove('rotate-180');
    }
}
// Update button states on scroll
customerCarousel.addEventListener('scroll', () => {
    customerScrollAmount = customerCarousel.scrollLeft;
    updateCustomerButtonStates();
});

// Handle window resize
window.addEventListener('resize', () => {
    calculateCustomerScrollStep();
    updateCustomerButtonStates();
});

// Initial setup
calculateCustomerScrollStep();
updateCustomerButtonStates();

document.querySelectorAll('[name="typeOfProject"]').forEach(function (el) {
    el.addEventListener('change', function () {
        if (this.value !== '') {
            this.classList.add('has-value');
        } else {
            this.classList.remove('has-value');
        }
    });
});

document.querySelectorAll('[name="state"]').forEach(function (el) {
    el.addEventListener('change', function () {
        if (this.value !== '') {
            this.classList.add('has-value');
        } else {
            this.classList.remove('has-value');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const clipDiv = document.getElementById('clip-div');
    const slider = document.getElementById('slider');
    let isDragging = false;

    // Initial setup
    function updateSliderPosition(percent) {
        clipDiv.style.width = `${percent}%`;
        slider.style.left = `${percent}%`;
    }

    // Mouse events
    slider.addEventListener('mousedown', function (e) {
        isDragging = true;
        e.preventDefault(); // Prevent text selection
    });

    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;

        const container = slider.parentElement;
        const containerRect = container.getBoundingClientRect();
        let percent = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        // Keep within bounds
        percent = Math.max(0, Math.min(100, percent));

        updateSliderPosition(percent);
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
    });

    // Touch events for mobile
    slider.addEventListener('touchstart', function (e) {
        isDragging = true;
        e.preventDefault();
    });

    document.addEventListener('touchmove', function (e) {
        if (!isDragging) return;

        const container = slider.parentElement;
        const containerRect = container.getBoundingClientRect();
        let percent = ((e.touches[0].clientX - containerRect.left) / containerRect.width) * 100;

        // Keep within bounds
        percent = Math.max(0, Math.min(100, percent));

        updateSliderPosition(percent);
    });

    document.addEventListener('touchend', function () {
        isDragging = false;
    });

    // Initialize position
    updateSliderPosition(50);
});



document.addEventListener('DOMContentLoaded', function () {
    const carouselContainer = document.getElementById('carouselContainer');

    if (!carouselContainer) {
        return;
    }

    const cards = Array.from(carouselContainer.getElementsByClassName('group'));
    const cardWidth = 388.73;
    const gap = 20;
    const slideInterval = 2000;
    let slideTimer;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;

    function initCarousel() {
        const firstCard = cards[0].cloneNode(true);
        carouselContainer.appendChild(firstCard);

        carouselContainer.style.transition = 'none';
        carouselContainer.style.transform = 'translateX(0)';

        carouselContainer.addEventListener('mousedown', dragStart);
        carouselContainer.addEventListener('touchstart', dragStart);
        carouselContainer.addEventListener('mouseup', dragEnd);
        carouselContainer.addEventListener('mouseleave', dragEnd);
        carouselContainer.addEventListener('touchend', dragEnd);
        carouselContainer.addEventListener('mousemove', drag);
        carouselContainer.addEventListener('touchmove', drag);
    }

    function slideNext() {
        if (isDragging) return;

        const scrollAmount = cardWidth + gap;
        carouselContainer.style.transition = 'transform 0.5s ease-in-out';
        carouselContainer.style.transform = `translateX(-${scrollAmount}px)`;

        setTimeout(() => {
            const firstCard = cards.shift();
            carouselContainer.removeChild(firstCard);
            carouselContainer.appendChild(firstCard);
            cards.push(firstCard);

            carouselContainer.style.transition = 'none';
            carouselContainer.style.transform = 'translateX(0)';
        }, 500);
    }

    function slidePrev() {
        const lastCard = cards.pop();
        carouselContainer.removeChild(lastCard);
        carouselContainer.insertBefore(lastCard, carouselContainer.firstChild);
        cards.unshift(lastCard);

        carouselContainer.style.transition = 'none';
        carouselContainer.style.transform = `translateX(-${cardWidth + gap}px)`;

        setTimeout(() => {
            carouselContainer.style.transition = 'transform 0.5s ease-in-out';
            carouselContainer.style.transform = 'translateX(0)';
        }, 10);
    }

    function startAutoSlide() {
        slideTimer = setInterval(slideNext, slideInterval);
    }

    function dragStart(e) {
        startPos = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        isDragging = true;
        clearInterval(slideTimer);
        carouselContainer.style.transition = 'none';
        animationID = requestAnimationFrame(animation);
    }

    function drag(e) {
        if (!isDragging) return;
        const currentPosition = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        currentTranslate = prevTranslate + currentPosition - startPos;
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        cancelAnimationFrame(animationID);

        const movedBy = currentTranslate - prevTranslate;

        if (movedBy < -100) {
            slideNext();
        } else if (movedBy > 100) {
            slidePrev();
        } else {
            carouselContainer.style.transition = 'transform 0.5s ease-in-out';
            carouselContainer.style.transform = `translateX(0)`;
        }

        startAutoSlide();
    }

    function animation() {
        carouselContainer.style.transform = `translateX(${currentTranslate}px)`;
        animationID = requestAnimationFrame(animation);
    }

    initCarousel();
    startAutoSlide();
});



document.addEventListener('DOMContentLoaded', function () {
    // Smooth scroll for all anchor links
    document.querySelectorAll('a.smooth-scroll').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update URL without page jump
                history.pushState(null, null, targetId);
            }
        });
    });
});

document.querySelectorAll('.file').forEach(function (fileInput) {
    fileInput.addEventListener('change', function (e) {
        const label = fileInput.nextElementSibling;

        if (e.target.files.length > 0) {
            fileInput.style.color = "#727A7E";
            label.classList.add('has-file-label');
        } else {
            fileInput.style.color = "transparent";
            label.classList.remove('has-file-label');
        }
    });
});