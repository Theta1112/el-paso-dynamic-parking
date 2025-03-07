function initializeTimeSlider(timeSliderEl, eventBus) {

  // Get slider button
  const openButtonEl = timeSliderEl.querySelector('slider-open-button');

  // Function to open slider if closed and vice versa
  function toggleSlider() {
    if (timeSliderEl.classList.contains('slider-open')) {
      timeSliderEl.classList.remove('slider-open');
    } else {
      timeSliderEl.classList.add('slider-open');
    }
  }

  // Enable button to toggle slider
  openButtonEl.addEventListener('click', toggleSlider)

}

export { initializeTimeSlider }