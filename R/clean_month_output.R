library(tidyverse)
library(data.table)
month.output <- fread("data/output/month_1_occupancy_normalised.csv")


for (i in 1:12) {
  
  file.path = paste0("data/output/month_", i, "_occupancy_normalised.csv")
  
  if(file.exists(file.path)) {
    
    if (i == 1) {
      month.output <- fread(file.path)
    } else {
      month.output <- rbind(month.output, fread(file.path))
    }
  }
}

colnames(month.output)
# Compute the true historical max
street.max <- month.output %>%
  dplyr::select(street.ID, max_occupied) %>%
  group_by(street.ID) %>%
  summarise(max_occupied = max(max_occupied))

# Replace max occupied with true max
true.max.output <- month.output %>%
  dplyr::select(-max_occupied, -occupied_fraction) %>%
  inner_join(street.max) %>%
  mutate(occupied_fraction = street_occupied / max_occupied)

# Write output
write.csv(true.max.output, "data/8_months.csv", row.names = F, append=FALSE)
