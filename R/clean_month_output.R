library(tidyverse)
library(data.table)

### STEP 1: Load data

for (i in 1:12) {
  
  file.path = paste0("data/output/month_", i, "_occupancy_normalised.csv")
  
  if(file.exists(file.path)) {
    
    if (i == 1) {
      data <- fread(file.path)
    } else {
      data <- rbind(data, fread(file.path))
    }
  }
}

colnames(data)

meters <- fread("data/EC2_meter_minimal.csv")

# Remove duplicates
data <- data[!duplicated(data %>%
                           dplyr::select(occupancy.buckets, street.ID)),]


# Max the number of cars per meter at 2
data <- data %>%
  mutate(occupied = ifelse(occupied > 2, 2, occupied))


data.street <- data %>%
  left_join(meters) %>%
  group_by(street.ID, occupancy.buckets) %>%
  summarise(occupied = sum(occupied))

### STEP 2: Zeropad data

start_time = min(data.street$occupancy.buckets)
end_time = max(data.street$occupancy.buckets)

# Generate a sequence of 15-minute intervals
time_bins <- seq(from = start_time, to = end_time, by = "15 mins")

# Create a new dataframe with the time bins
time_bins_df <- data.frame(occupancy.buckets = time_bins)

# Get all streets
streets <- data.street %>%
  distinct(street.ID)

# Cross join streets with time to get all time-street combinations
zeropad <- time_bins_df %>% 
  cross_join(streets)

# Zero pad it
data.zeropad <- data.street %>% 
  right_join(zeropad) %>%  
  mutate(across(occupied, ~ replace_na(.x, 0))) 


#### STEP 3: Compute the true historical max

street.max <- data.street %>%
  dplyr::select(street.ID, occupied) %>%
  group_by(street.ID) %>%
  summarise(per_95 = quantile(occupied, probs=0.95, na.rm=TRUE),
            per_99 = quantile(occupied, probs=0.99, na.rm=TRUE),
            per_100 = max(occupied))

street.meters <- meters %>%
  group_by(street.ID) %>%
  summarise(meter_count = n())

# Replace max occupied with true max
data.true.max <- data.zeropad %>%
  inner_join(street.max) %>%
  mutate(occupied_fraction_95 = occupied / per_95,
         occupied_fraction_99 = occupied / per_99,
         occupied_fraction_100 = occupied / per_100)

# Write output
write.csv(data.true.max, "data/12_months.csv", row.names = F, append=FALSE)
