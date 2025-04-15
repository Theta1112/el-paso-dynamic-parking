export function initializeDistrictSelector(eventBus, avgClusterOccupancyData) {
  eventBus.addEventListener('district-filter-changed', (e) => {
    const selectedCluster = e.detail.cluster;

    const container = document.querySelector('.summary-box');

    if (selectedCluster === 'all') {
      // Compute global average across all clusters
      const avgAll = avgClusterOccupancyData.reduce((sum, row) => sum + row.avg_occupancy, 0) / avgClusterOccupancyData.length;

      container.innerHTML = `${(avgAll * 100).toFixed(1)}%<br><small>Avg. Occupancy</small>`;
    } else {
      const match = avgClusterOccupancyData.find(d => d.cluster === selectedCluster);
      if (match) {
        container.innerHTML = `${(match.avg_occupancy * 100).toFixed(1)}%<br><small>Avg. Occupancy</small>`;
      } else {
        console.warn(`Cluster ${selectedCluster} not found in avg occupancy data.`);
      }
    }
  });
}
