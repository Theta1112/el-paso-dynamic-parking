function initializeSideSlider(sideSliderEl, eventBus) {

  // Get slider button
  const openButtonEl = sideSliderEl.querySelector('.slider-open-button');

  // Function to open slider if closed and vice versa
  function toggleSlider() {
    if (sideSliderEl.classList.contains('slider-open')) {
      sideSliderEl.classList.remove('slider-open');
    } else {
      sideSliderEl.classList.add('slider-open');
    }
  }

  // Enable button to toggle slider
  openButtonEl.addEventListener('click', toggleSlider)

}

export { initializeSideSlider }