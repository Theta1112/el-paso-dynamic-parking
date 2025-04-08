function initializeDistrictSelect(districtEl, eventBus) {

  districtEl.addEventListener('change', (e) => {
    console.log(e.target.value)

    const districtSelected = new CustomEvent('district-selected', { detail: { district: e.target.value }});
    eventBus.dispatchEvent(districtSelected); 
  })

}

export { initializeDistrictSelect }