library(data.table)
library(tidyverse)

historical <- fread("data/8_months.csv") %>%
  mutate(date = date(occupancy.buckets),
         hour = hour(ymd_hms(occupancy.buckets, quiet = F)),
         minute = minute(ymd_hms(occupancy.buckets, quiet = F)),
         hour = replace_na(hour, 0),
         minute = replace_na(minute, 0),
         timestamp = date + hours(hour) + minutes(minute)) %>%
  dplyr::select(-occupancy.buckets)

jan.data <- historical %>%
  filter(month(timestamp) == 1) %>%
  rename(street_ID = "street.ID")

write.csv(jan.data, "data/jan_data.csv", row.names = F, append=FALSE)

any(is.na(jan.data$street_occupied))
