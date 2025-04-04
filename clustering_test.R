library(data.table)
library(tidyverse)
library(stats)
library(sf)

COLOUR.VEC <- c('#e41a1c',
  '#377eb8',
  '#4daf4a',
  '#984ea3',
  '#ff7f00',
  '#ffff33',
  '#a65628')

data.raw <- fread("data/12_months.csv") %>%
  mutate(date = date(occupancy.buckets),
         hour = hour(ymd_hms(occupancy.buckets, quiet = F)),
         minute = minute(ymd_hms(occupancy.buckets, quiet = F)),
         hour = replace_na(hour, 0),
         minute = replace_na(minute, 0),
         timestamp = date + hours(hour) + minutes(minute)) %>%
  dplyr::select(-occupancy.buckets)

streets.sf <- st_read("data/EPCenterline.geojson") %>%
  rename(street.ID = "OBJECTID_1")

data <- data.raw %>% 
  filter(!is.na(street.ID)) %>%
  filter(hour >= 8 & hour < 18)



# Prepares data for clustering operation
prepare.clustering.data <- function(data, streets.sf) {
  # Get distinct streets
  streets <- data %>% 
    filter(!is.na(street.ID)) %>%
    distinct(street.ID) %>%
    arrange(street.ID)
  
  # Join to streets.sf to get geom data
  street.centres <- streets.sf %>% 
    right_join(streets) %>%
    st_centroid() %>%
    st_coordinates()
  
  # Join street centres back
  streets$lon = street.centres[,1]
  streets$lat = street.centres[,2]
  
  streets <- streets %>%
    mutate(lon = (lon - mean(lon)) / sd(lon),
           lat = (lat - mean(lat)) / sd(lat))
  
  for (dotw.iter in min(wday(data$timestamp)):max(wday(data$timestamp))) {
    for(hour.iter in min(data$hour):max(data$hour)) {
      streets[[paste0('dotw_',dotw.iter, '_hr_', hour.iter)]] <- data %>%
        filter(hour == hour.iter & wday(timestamp) == dotw.iter) %>%
        group_by(street.ID) %>%
        summarise(value = mean(occupied_fraction_99)) %>%
        arrange(street.ID) %>%
        pull(value)
    }
  }
  

  
  return(streets)
}


# Normalize and scale coordinates. Then perform k means.
# geographic inflation factor (gif): represents how much importance geography is to clustering 
kmeans_streets <- function(clustering.data, k, gif = 1, streets.sf = NA, seed = NA) {
  
  if (is.numeric(seed)) {
    set.seed(seed)
  }
  
  clustering.data <- clustering.data %>%
    mutate(lon = gif * lon,
           lat = gif * lat)
  
  # Perform k means and assign clusters
  clustering.data$cluster <- factor(kmeans(clustering.data %>% select(-street.ID), k)$cluster)
  
  p <- NA
  
  if (!is.null(dim(streets.sf))) {
    clustering.data.sf <- streets.sf %>% 
      right_join(clustering.data)
    
    p <- ggplot() + 
      geom_sf(data = clustering.data.sf, aes(color = cluster)) + 
      scale_color_manual(values = COLOUR.VEC)
    
    print(p)
  }
  
  
  return(clustering.data)
}

# kmeans.ss = numeric()
# for (i in 1:8) {
#  kmeans.ss <- c(kmeans.ss, kmeans(streets %>% select(-street.ID), i)$tot.withinss)
#}


# Prepare data for clustering operation
clustering.data <- prepare.clustering.data(data, streets.sf)

# Execute clustering
clustered <- kmeans_streets(clustering.data, 7, gif = 5, streets.sf, 123)

# Aggregate and join back to data
data.clustered <- data %>%
  left_join(clustered %>% dplyr::select(street.ID, cluster))

# Plot out the occupancy pattern over a particular day across clusters
ggplot(data = data.clustered %>% 
         mutate(dotw = wday(timestamp)) %>%
         group_by(hour, street.ID, dotw, cluster) %>%
         filter(dotw == 3) %>%
         summarise(occupied_fraction = mean(occupied_fraction_95))) +
  geom_line(aes(x = hour, y = occupied_fraction, group = street.ID, color = cluster)) +
  scale_color_manual(values = COLOUR.VEC) + 
  facet_wrap(~cluster)

