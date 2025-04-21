// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const mobileMenuButton = document.querySelector('.mobile-menu-button');
  const navMenu = document.querySelector('.nav-menu');
  
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Form validation
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      if (!validateForm(form)) {
        e.preventDefault();
      }
    });
  });

  // Auto-logout timer for authenticated pages
  if (document.body.classList.contains('authenticated')) {
    startAutoLogoutTimer();
  }

  // Initialize tabs if they exist
  initTabs();

  // Initialize appointment booking calendar if it exists
  initAppointmentCalendar();

  // Initialize search functionality
  initSearch();
});

// Form validation
function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    
    // Remove any existing error messages
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Check required fields
    if (input.hasAttribute('required') && !input.value.trim()) {
      errorElement.textContent = 'This field is required';
      input.parentElement.appendChild(errorElement);
      isValid = false;
    }
    
    // Email validation
    if (input.type === 'email' && input.value.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(input.value)) {
        errorElement.textContent = 'Please enter a valid email address';
        input.parentElement.appendChild(errorElement);
        isValid = false;
      }
    }
    
    // Password validation (if this is a password field)
    if (input.type === 'password' && input.id === 'password') {
      const passwordValue = input.value.trim();
      if (passwordValue.length < 8) {
        errorElement.textContent = 'Password must be at least 8 characters long';
        input.parentElement.appendChild(errorElement);
        isValid = false;
      } else if (!/[A-Z]/.test(passwordValue) || !/[a-z]/.test(passwordValue) || !/[0-9]/.test(passwordValue)) {
        errorElement.textContent = 'Password must contain uppercase, lowercase letters and numbers';
        input.parentElement.appendChild(errorElement);
        isValid = false;
      }
    }
    
    // Password confirmation validation
    if (input.id === 'confirm-password') {
      const password = document.getElementById('password');
      if (password && input.value !== password.value) {
        errorElement.textContent = 'Passwords do not match';
        input.parentElement.appendChild(errorElement);
        isValid = false;
      }
    }
  });
  
  return isValid;
}

// Auto logout timer (for security)
function startAutoLogoutTimer() {
  let inactivityTime = 0;
  const logoutTime = 20; // 20 minutes
  
  const resetTimer = () => {
    inactivityTime = 0;
  };
  
  // Events that reset the timer
  document.addEventListener('mousemove', resetTimer);
  document.addEventListener('keypress', resetTimer);
  document.addEventListener('click', resetTimer);
  document.addEventListener('scroll', resetTimer);
  
  // Check inactivity every minute
  setInterval(() => {
    inactivityTime++;
    if (inactivityTime >= logoutTime) {
      // Store current page URL to redirect back after login
      localStorage.setItem('redirectAfterLogin', window.location.href);
      
      // Alert user before logout
      alert('You will be logged out due to inactivity in 1 minute');
      
      // Logout after one more minute if no activity
      setTimeout(() => {
        if (inactivityTime >= logoutTime + 1) {
          window.location.href = 'logout.html';
        }
      }, 60000);
    }
  }, 60000); // Check every minute
}

// Tabs functionality for dashboard, profile, etc.
function initTabs() {
  const tabContainers = document.querySelectorAll('.tabs-container');
  
  tabContainers.forEach(container => {
    const tabs = container.querySelectorAll('.tab-button');
    const tabContents = container.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show selected tab content
        tabContents.forEach(content => {
          content.style.display = 'none';
          if (content.getAttribute('id') === target) {
            content.style.display = 'block';
          }
        });
      });
    });
    
    // Activate first tab by default
    if (tabs.length > 0) {
      tabs[0].click();
    }
  });
}

// Appointment booking calendar
function initAppointmentCalendar() {
  const calendar = document.getElementById('appointment-calendar');
  if (!calendar) return;
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  let selectedDate = null;
  let availableSlots = {};
  
  // Mock data for available time slots (would come from backend)
  // Format: "YYYY-MM-DD": ["09:00", "10:00", "14:00"]
  const mockAvailableSlots = {
    [`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`]: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    [`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-16`]: ['09:00', '11:00', '13:00', '16:00'],
    [`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-17`]: ['10:00', '11:00', '14:00', '15:00', '16:00'],
  };
  
  availableSlots = mockAvailableSlots;
  
  renderCalendar(calendar, currentMonth, currentYear);
  
  // Next month button
  document.getElementById('next-month').addEventListener('click', () => {
    const nextMonth = (currentMonth + 1) % 12;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    renderCalendar(calendar, nextMonth, nextYear);
  });
  
  // Previous month button
  document.getElementById('prev-month').addEventListener('click', () => {
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    renderCalendar(calendar, prevMonth, prevYear);
  });
  
  function renderCalendar(calendarElement, month, year) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('month-year').textContent = `${monthNames[month]} ${year}`;
    
    const calendarBody = calendarElement.querySelector('.calendar-body');
    calendarBody.innerHTML = '';
    
    let date = 1;
    
    // Create calendar rows and cells
    for (let i = 0; i < 6; i++) {
      const row = document.createElement('tr');
      
      for (let j = 0; j < 7; j++) {
        const cell = document.createElement('td');
        
        if (i === 0 && j < firstDay) {
          // Empty cells before the first day
          cell.textContent = '';
        } else if (date > daysInMonth) {
          // Break if we've reached the end of the month
          break;
        } else {
          // Fill in the date
          cell.textContent = date;
          
          // Format date for checking availability
          const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
          
          // Highlight dates with available slots
          if (availableSlots[formattedDate]) {
            cell.classList.add('available');
            
            // Add click event to select date
            cell.addEventListener('click', () => {
              // Remove selection from all cells
              document.querySelectorAll('.calendar-body td.selected').forEach(td => {
                td.classList.remove('selected');
              });
              
              // Add selection to clicked cell
              cell.classList.add('selected');
              
              // Update selected date
              selectedDate = formattedDate;
              
              // Show available time slots
              showTimeSlots(formattedDate);
            });
          } else {
            cell.classList.add('unavailable');
          }
          
          date++;
        }
        
        row.appendChild(cell);
      }
      
      calendarBody.appendChild(row);
      
      if (date > daysInMonth) {
        // Break if we've reached the end of the month
        break;
      }
    }
  }
  
  function showTimeSlots(date) {
    const timeSlotsContainer = document.getElementById('time-slots');
    timeSlotsContainer.innerHTML = '';
    
    if (!availableSlots[date]) {
      timeSlotsContainer.innerHTML = '<p>No available slots for this day</p>';
      return;
    }
    
    const slotsTitle = document.createElement('h3');
    slotsTitle.textContent = `Available slots for ${date}`;
    timeSlotsContainer.appendChild(slotsTitle);
    
    const slotsList = document.createElement('div');
    slotsList.className = 'slots-list';
    
    availableSlots[date].forEach(time => {
      const slot = document.createElement('div');
      slot.className = 'time-slot';
      slot.textContent = time;
      
      slot.addEventListener('click', () => {
        // Remove selection from all slots
        document.querySelectorAll('.time-slot.selected').forEach(s => {
          s.classList.remove('selected');
        });
        
        // Add selection to clicked slot
        slot.classList.add('selected');
        
        // Update hidden form fields
        document.getElementById('appointment-date').value = date;
        document.getElementById('appointment-time').value = time;
        
        // Enable submit button
        document.getElementById('book-appointment-btn').disabled = false;
      });
      
      slotsList.appendChild(slot);
    });
    
    timeSlotsContainer.appendChild(slotsList);
  }
}

// Search functionality for doctor search
function initSearch() {
  const searchForm = document.getElementById('doctor-search-form');
  if (!searchForm) return;
  
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const specialty = document.getElementById('search-specialty').value;
    const location = document.getElementById('search-location').value;
    
    // In a real app, this would make an API call to get doctors
    // For demo, we'll use mock data
    const mockDoctors = [
      { name: 'Dr. John Smith', specialty: 'cardiology', location: 'New York', rating: 4.8, image: 'images/doctor1.jpg' },
      { name: 'Dr. Emily Johnson', specialty: 'dermatology', location: 'Chicago', rating: 4.9, image: 'images/doctor2.jpg' },
      { name: 'Dr. Michael Brown', specialty: 'pediatrics', location: 'New York', rating: 4.7, image: 'images/doctor3.jpg' },
      { name: 'Dr. Sarah Williams', specialty: 'cardiology', location: 'Boston', rating: 4.5, image: 'images/doctor4.jpg' },
      { name: 'Dr. James Wilson', specialty: 'neurology', location: 'Chicago', rating: 4.6, image: 'images/doctor5.jpg' },
    ];
    
    // Filter doctors based on search criteria
    let filteredDoctors = mockDoctors;
    
    if (specialty) {
      filteredDoctors = filteredDoctors.filter(doctor => doctor.specialty === specialty.toLowerCase());
    }
    
    if (location) {
      filteredDoctors = filteredDoctors.filter(doctor => doctor.location.toLowerCase().includes(location.toLowerCase()));
    }
    
    // Display results
    displaySearchResults(filteredDoctors);
  });
  
  function displaySearchResults(doctors) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    
    if (doctors.length === 0) {
      resultsContainer.innerHTML = '<p class="no-results">No doctors found matching your criteria</p>';
      return;
    }
    
    doctors.forEach(doctor => {
      const doctorCard = document.createElement('div');
      doctorCard.className = 'doctor-card';
      
      doctorCard.innerHTML = `
        <img src="${doctor.image}" alt="${doctor.name}" class="doctor-image">
        <div class="doctor-info">
          <h3>${doctor.name}</h3>
          <p>Specialty: ${doctor.specialty.charAt(0).toUpperCase() + doctor.specialty.slice(1)}</p>
          <p>Location: ${doctor.location}</p>
          <div class="rating">
            <span>${doctor.rating}</span>
            <div class="stars">
              ${getStarRating(doctor.rating)}
            </div>
          </div>
          <a href="doctor-profile.html?id=${doctor.name.replace(/\s+/g, '-').toLowerCase()}" class="btn btn-primary">View Profile</a>
        </div>
      `;
      
      resultsContainer.appendChild(doctorCard);
    });
  }
  
  function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<span class="star full">★</span>';
    }
    
    // Half star
    if (halfStar) {
      starsHTML += '<span class="star half">★</span>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<span class="star empty">☆</span>';
    }
    
    return starsHTML;
  }
} 