library(tidyverse)
library(sf)
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
         min_paid = ifelse(min_paid < 0, 0, min_paid))

# Assign transaction ID
cleaned.transactions$transaction.ID <- seq(1, dim(raw.data)[1])

write.csv(cleaned.transactions, "data/EC2_cleaned_transactions.csv", row.names = F, append=FALSE)

write.csv(meters %>% 
            dplyr::select(meter.ID, street.ID) %>%
            st_drop_geometry(), "data/EC2_meter_minimal.csv", row.names = F, append=FALSE)