function initializeStatControl(statEl, eventBus) {

  eventBus.addEventListener('district-selected', (e) => {
    
    statEl.innerHTML = "" + e.detail.district + "<br><small>Avg. Occupancy";
  })

  

}

export { initializeStatControl }