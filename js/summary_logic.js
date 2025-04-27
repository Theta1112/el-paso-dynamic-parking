import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

export function initializeSummaryLogic(eventBus, data) {
    let currentFilters = {
      cluster: 'all',
      month: 'all',
      year: '2024' // default
    };

    let predictMode = false;
  
    function updateSummaryBoxes() {
      let filtered = data;
  
      if (currentFilters.cluster !== 'all') {
        filtered = filtered.filter(d => d.cluster === parseInt(currentFilters.cluster));
      }
      if (currentFilters.month !== 'all') {
        filtered = filtered.filter(d => d.month === parseInt(currentFilters.month));
      }
      if (currentFilters.year !== 'all') {
        filtered = filtered.filter(d => d.year === parseInt(currentFilters.year));
      }

      //console.log('Filters:', currentFilters);
      //console.log('Filtered Rows:', filtered.length);
  
      //console.log(filtered)

      // Choose correct fields depending on mode
      const occField = predictMode ? 'predicted_avg_occ' : 'avg_occ';
      const revField = predictMode ? 'predicted_revenue' : 'total_revenue';
      const tocField = predictMode ? 'predicted_toc' : 'toc';

      const avg_occ = d3.mean(filtered, d => d[occField]) ?? 0;
      const tot_revenue = d3.sum(filtered, d => d[revField]) ?? 0;
      const toc = d3.sum(filtered, d => d[tocField]) ?? 0;
  
      const summaryBoxes = document.querySelectorAll('.summary-box');
      if (summaryBoxes.length >= 3) {
        summaryBoxes[0].innerHTML = `${(avg_occ * 100).toFixed(1)}%<br><small>Avg. Occupancy</small>`;
        summaryBoxes[1].innerHTML = `${tot_revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}<br><small>Total Revenue</small>`;
        summaryBoxes[2].innerHTML = `${(toc * 100).toFixed(1)}%<br><small>Time over Capacity (TOC)</small>`;        
      }
    }
  
    function handleFilterChange(type, value) {
      if (type !== undefined){
        currentFilters[type] = value;
      } 
    
      const filterChange = new CustomEvent('filter-change', { detail: currentFilters});

      console.log("EVENT: FILTER CHANGE")

      eventBus.dispatchEvent(filterChange);
      updateSummaryBoxes();
    }
  
    // Event listeners for all three filters
    document.querySelector('#district-select').addEventListener('change', e => {
      handleFilterChange('cluster', e.target.value);
    });
  
    document.querySelector('#month-select').addEventListener('change', e => {
      handleFilterChange('month', e.target.value);
    });
  
    document.querySelector('#year-select').addEventListener('change', e => {
        handleFilterChange('year', e.target.value);
      });
    
    // Listen for mode change from toggle_mode.js
    eventBus.addEventListener('mode-change', e => {
      predictMode = e.detail.isDark;
      updateSummaryBoxes();
    });
  
    handleFilterChange(); // initial display
  }
  