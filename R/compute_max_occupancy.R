library(tidyverse)
library(sf)
library(httr)
library(jsonlite)
library(data.table)

CRS_TARGET = "EPSG:32139"

# Read raw meter transaction data
raw.data <- rbind(fread("data/pems transactions jan-jun2024.csv"),
                  fread("data/pems transactions jul-dec2024.csv")) %>%
  rename(meter.ID = "name")

# Read street data geojson (derived from shape file)
raw.streets <- st_read("data/EPCenterline.geojson") %>%
  st_transform(CRS_TARGET) %>%
  rename(street.ID = "OBJECTID_1")

# Read meters data geojson (derived from shape file)
meters <- st_read("data/meters.geojson")%>%
  st_transform(CRS_TARGET) %>%
  rename(meter.ID = "LocationID")

# Assign each meter to its nearest street
meters$street.ID <- raw.streets[st_nearest_feature(meters, raw.streets),"street.ID"] %>%
  st_drop_geometry() %>%
  unlist()

# Combine raw meter transaction with meter shape data
cleaned.transactions <- raw.data %>% 
  mutate(timestamp = dmy_hm(datetime),
         date = dmy(date),
         min_paid = max(min_paid, 0))

# Assign transaction ID
cleaned.transactions$transaction.ID <- seq(1, dim(raw.data)[1])

# Get only november transactions
nov.transactions <- cleaned.transactions %>%
  filter(month(date) == 11)

# Splits each parking instance into a series of buckets
compute.bucket.occupancy <- function(data, progress = F) {
  
  # Bucket the start times
  data <- data %>%
    mutate(start.by15 = floor_date(timestamp, "15 mins"))
  
  # Handle each row individually
  for (i in seq(1,nrow(data))) {
    
    row.bucket.count <- data[i,"min_paid"][[1]] / 15
    
    row.occupancy.buckets <- data[i,"start.by15"][[1]] + minutes(15 * seq(0, row.bucket.count))
    
    if (i == 1) {
      occupancy.buckets <- row.occupancy.buckets
      
      transaction.ID <- rep(data[i,"transaction.ID"][[1]], row.bucket.count + 1)
      
      if (length(occupancy.buckets) != length(transaction.ID)) {
        print(i)
        print(length(occupancy.buckets))
        print(length(transaction.ID))
        
        stop()
      }
      
    } else {
      
      if (i %% 1000 == 0 & progress) {
        print(paste("FINISHED", i, "ROWS"))
      }
      
      occupancy.buckets <- c(occupancy.buckets, row.occupancy.buckets)
      
      transaction.ID <- c(transaction.ID, rep(data[i,"transaction.ID"][[1]], row.bucket.count + 1))
      
      if (length(occupancy.buckets) != length(transaction.ID)) {
        print(i)
        print(length(occupancy.buckets))
        print(length(transaction.ID))
        
        stop()
      }
    }
  }
  
  return(data.frame(
    transaction.ID,
    occupancy.buckets
  ))
}

# Execute splitting
nov.bucketed.separated <- compute.bucket.occupancy(nov.transactions, T)

# Join back to nov transactions
nov.bucketed <- nov.transactions %>%
  right_join(nov.bucketed.separated) %>%
  group_by(occupancy.buckets, meter.ID) %>%
  summarise(occupied = n()) %>%
  arrange(meter.ID, occupancy.buckets)

# Join to streets via meters
nov.occupancy <- nov.bucketed %>%
  left_join(meters) %>%
  group_by(street.ID, occupancy.buckets) %>%
  summarise(street_occupied = n()) %>%
  arrange(street.ID) %>%
  left_join(raw.streets)

# Write output
st_write(nov.occupancy, "data/nov_occupancy.geojson", row.names = F, append=FALSE)

# Read output
nov.occupancy <- st_read("data/nov_occupancy.geojson")

# Find max occupancy of each street
nov.max <- nov.occupancy %>%
  group_by(street.ID) %>%
  summarise(max_occupied = max(street_occupied)) %>%
  st_drop_geometry()

# Normalise
nov.norm <- nov.occupancy %>%
  left_join(nov.max) %>%
  filter(!is.na(street.ID)) %>%
  mutate(occupied_fraction = street_occupied / max_occupied)
colnames(nov.norm)
# Write normalised output
st_write(nov.norm, "data/nov_occupancy_normalised.geojson", row.names = F, append=FALSE)
