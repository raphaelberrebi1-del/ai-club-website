// Standalone Calendar Widget - Pure JavaScript Version
(function() {
  'use strict';

  // Mobile detection
  const isMobile = window.innerWidth <= 768;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Calendar Component HTML Template
  const calendarHTML = `
    <div id="calendar-widget" class="space-y-6 ${isMobile ? 'mobile-calendar' : ''}">
      <!-- Calendar -->
      <div class="bg-gradient-to-br from-black/20 to-black/40 rounded-2xl p-6 border border-white/10 shadow-xl backdrop-blur-sm ${isMobile ? 'mobile-calendar-container' : ''}">
        <div id="calendar-container" class="rounded-xl"></div>
      </div>

      <!-- Time Slots for Selected Date -->
      <div id="time-slots-container" class="space-y-4" style="display: none;">
        <h4 id="selected-date-title" class="text-lg font-semibold text-white"></h4>
        <div id="time-slots" class="space-y-3"></div>
      </div>

      <!-- Selected Slot Confirmation -->
      <div id="selected-slot-confirmation" class="bg-gradient-to-br from-orange-400/10 to-pink-500/10 border border-orange-400/20 rounded-xl p-4 backdrop-blur-sm" style="display: none;">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <div>
            <div id="selected-slot-text" class="text-sm font-semibold text-white"></div>
            <div id="selected-slot-details" class="text-xs text-orange-200"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Google Sheets Web App URL - configured in main HTML
  const SHEETS_URL = window.GOOGLE_SHEETS_WEB_APP_URL || 'https://script.google.com/macros/s/AKfycbwmjgsOo8mButmGjG_R0lsfi5AA2o7O1LEmEMt3xQjHhOYEu5ryU4WwfUnJzvlvrcCJ3w/exec';

  // Live time slots data - will be populated from Google Sheets
  let mockTimeSlots = [];

  // Fetch groups data from Google Sheets
  async function fetchGroupsFromSheets() {
    try {
      const response = await fetch(SHEETS_URL, {
        method: 'GET',
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();

        // Transform Google Sheets data to our calendar format
        mockTimeSlots = data.groups.map(group => {
          const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
          const ageMap = { '8-10': '8-10 Years', '11-13': '11-13 Years', '14-18': '14-18 Years' };

          // Determine status based on enrollment
          let status = 'available';
          const percentFull = group.currentCount / group.maxCapacity;
          if (group.currentCount >= group.maxCapacity) {
            status = 'full';
          } else if (percentFull >= 0.8) {
            status = 'nearly-full';
          } else if (group.status === 'Coming Soon') {
            status = 'coming-soon';
          }

          // Convert 24-hour time to 12-hour format
          const [startTime, endTime] = group.time.split('-');
          const formatTime = (time) => {
            const [hours, minutes] = time.trim().split(':');
            const h = parseInt(hours);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
            return `${h12}:${minutes} ${ampm}`;
          };

          return {
            id: group.groupId.toLowerCase(),
            time: `${formatTime(startTime)} - ${formatTime(endTime)}`,
            ageGroup: ageMap[group.ageRange] || group.ageRange,
            capacity: group.maxCapacity,
            enrolled: group.currentCount,
            status: status,
            dayOfWeek: dayMap[group.day] || 0,
            originalData: group
          };
        });

        // Re-render calendar with new data
        if (window.selectedDate) {
          renderTimeSlots();
        }

        console.log('Fetched groups from Google Sheets:', mockTimeSlots);
        return mockTimeSlots;
      }
    } catch (error) {
      console.log('Failed to fetch from Google Sheets, using default schedule:', error);
    }

    // Fallback to default schedule if fetch fails
    if (mockTimeSlots.length === 0) {
      mockTimeSlots = [
        {
          id: 'sun-young-1',
          time: '4:00 PM - 5:00 PM',
          ageGroup: '8-10 Years',
          capacity: 10,
          enrolled: 0,
          status: 'available',
          dayOfWeek: 0
        },
        {
          id: 'sun-tech-1',
          time: '5:30 PM - 6:45 PM',
          ageGroup: '11-13 Years',
          capacity: 10,
          enrolled: 0,
          status: 'available',
          dayOfWeek: 0
        },
        {
          id: 'sun-future-1',
          time: '7:00 PM - 8:30 PM',
          ageGroup: '14-18 Years',
          capacity: 10,
          enrolled: 0,
          status: 'available',
          dayOfWeek: 0
        }
      ];
    }

    return mockTimeSlots;
  }

  // Initial fetch on load
  fetchGroupsFromSheets();

  let selectedDate = new Date();
  let selectedSlot = null;

  // Utility functions
  function getSlotStatusColor(status) {
    switch (status) {
      case 'available':
        return 'bg-green-400/20 border-green-400/30 text-green-200 backdrop-blur-sm';
      case 'nearly-full':
        return 'bg-orange-400/20 border-orange-400/30 text-orange-200 backdrop-blur-sm';
      case 'full':
        return 'bg-red-400/20 border-red-400/30 text-red-200 backdrop-blur-sm';
      case 'coming-soon':
        return 'bg-slate-400/20 border-slate-400/30 text-slate-200 backdrop-blur-sm';
      default:
        return 'bg-slate-400/20 border-slate-400/30 text-slate-200 backdrop-blur-sm';
    }
  }

  function getSlotStatusText(slot) {
    switch (slot.status) {
      case 'available':
        return `${slot.capacity - slot.enrolled} spots left`;
      case 'nearly-full':
        return `${slot.capacity - slot.enrolled} spots left`;
      case 'full':
        return 'Full';
      case 'coming-soon':
        return 'Coming Soon';
      default:
        return 'Unavailable';
    }
  }

  function getAvailableDates() {
    const dates = [];
    const today = new Date();

    // Add next 4 Sundays and some Mondays
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Add Sundays and some Mondays
      if (date.getDay() === 0 || (date.getDay() === 1 && i > 7)) {
        dates.push(date);
      }
    }

    return dates;
  }

  function getTimeSlotsByDay(date) {
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0) { // Sunday
      return mockTimeSlots.filter(slot => slot.id.startsWith('sun-'));
    } else if (dayOfWeek === 1) { // Monday
      return mockTimeSlots.filter(slot => slot.id.startsWith('mon-'));
    }

    return [];
  }

  function renderCalendar() {
    const calendarContainer = document.getElementById('calendar-container');
    const availableDates = getAvailableDates();

    // Simple calendar implementation
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const today = new Date();

    let calendarHtml = `
      <div class="calendar-header text-white text-center mb-4">
        <h3 class="text-lg font-semibold">${selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
      </div>
      <div class="calendar-grid grid grid-cols-7 gap-1 text-center text-white">
    `;

    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
      calendarHtml += `<div class="p-2 text-sm font-medium text-gray-400">${day}</div>`;
    });

    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      calendarHtml += '<div class="p-2"></div>';
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isAvailable = availableDates.some(availableDate =>
        availableDate.toDateString() === date.toDateString()
      );
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isPast = date < today;

      let dayClass = 'p-2 text-sm rounded-lg cursor-pointer transition-all';

      if (isPast || !isAvailable) {
        dayClass += ' text-gray-500 cursor-not-allowed';
      } else if (isSelected) {
        dayClass += ' bg-gradient-to-br from-orange-400 to-pink-500 text-white';
      } else {
        dayClass += ' hover:bg-white/10 text-white';
      }

      calendarHtml += `<div class="${dayClass}" data-date="${date.toISOString()}" ${!isPast && isAvailable ? `onclick="selectDate('${date.toISOString()}')"` : ''}>${day}</div>`;
    }

    calendarHtml += '</div>';
    calendarContainer.innerHTML = calendarHtml;
  }

  function renderTimeSlots() {
    const timeSlotsContainer = document.getElementById('time-slots-container');
    const timeSlotsDiv = document.getElementById('time-slots');
    const titleDiv = document.getElementById('selected-date-title');

    const slots = getTimeSlotsByDay(selectedDate);

    if (slots.length === 0) {
      timeSlotsContainer.style.display = 'none';
      return;
    }

    titleDiv.textContent = `Available Times - ${selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })}`;

    let slotsHtml = '';
    slots.forEach(slot => {
      const statusColor = getSlotStatusColor(slot.status);
      const statusText = getSlotStatusText(slot);
      const isClickable = slot.status === 'available' || slot.status === 'nearly-full';
      const isSelected = selectedSlot && selectedSlot.id === slot.id;

      slotsHtml += `
        <div class="p-4 rounded-xl border cursor-pointer transition-all duration-200 ${statusColor} ${isSelected ? 'ring-2 ring-orange-400/50' : ''} ${!isClickable ? 'cursor-not-allowed opacity-60' : 'hover:scale-[1.02] hover:shadow-lg'}"
             ${isClickable ? `onclick="selectSlot('${slot.id}')"` : ''}>
          <div class="flex items-center justify-between">
            <div>
              <div class="font-semibold text-sm">${slot.time}</div>
              <div class="text-xs opacity-80">${slot.ageGroup}</div>
            </div>
            <div class="text-right">
              <div class="text-xs font-medium">${statusText}</div>
              <div class="text-xs opacity-60">${slot.enrolled}/${slot.capacity} enrolled</div>
            </div>
          </div>
        </div>
      `;
    });

    timeSlotsDiv.innerHTML = slotsHtml;
    timeSlotsContainer.style.display = 'block';
  }

  function renderSelectedSlot() {
    const confirmationDiv = document.getElementById('selected-slot-confirmation');
    const textDiv = document.getElementById('selected-slot-text');
    const detailsDiv = document.getElementById('selected-slot-details');

    if (selectedSlot) {
      textDiv.textContent = `Selected: ${selectedSlot.time}`;
      detailsDiv.textContent = `${selectedSlot.ageGroup} • ${selectedDate.toLocaleDateString()}`;
      confirmationDiv.style.display = 'block';
    } else {
      confirmationDiv.style.display = 'none';
    }
  }

  // Global functions for onclick handlers
  window.selectDate = function(dateString) {
    selectedDate = new Date(dateString);
    selectedSlot = null; // Reset selected slot when date changes
    renderCalendar();
    renderTimeSlots();
    renderSelectedSlot();
  };

  window.selectSlot = function(slotId) {
    const slot = mockTimeSlots.find(s => s.id === slotId);
    if (slot && (slot.status === 'available' || slot.status === 'nearly-full')) {
      selectedSlot = slot;
      renderTimeSlots();
      renderSelectedSlot();

      // Trigger custom event
      const event = new CustomEvent('calendarSlotSelected', {
        detail: { slot, date: selectedDate }
      });
      document.dispatchEvent(event);

      console.log('Calendar slot selected:', slot, selectedDate);
    }
  };

  // Initialize calendar widget
  function initAIKidsCalendarWidget(containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
      console.error(`Container with ID "${containerId}" not found`);
      return;
    }

    // Insert calendar HTML
    container.innerHTML = calendarHTML;

    // Store selected date globally for refresh
    window.selectedDate = selectedDate;

    // Fetch initial data from Google Sheets
    fetchGroupsFromSheets().then(() => {
      // Initial render after data is loaded
      renderCalendar();
      renderTimeSlots();
      renderSelectedSlot();
    });

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchGroupsFromSheets().then(() => {
        // Re-render time slots with updated data
        if (window.selectedDate) {
          renderTimeSlots();
        }
      });
    }, 30000); // 30 seconds

    return {
      destroy: function() {
        clearInterval(refreshInterval);
        container.innerHTML = '';
      },
      refresh: function() {
        return fetchGroupsFromSheets();
      }
    };
  }

  // Make function globally available
  window.initAIKidsCalendarWidget = initAIKidsCalendarWidget;

})();