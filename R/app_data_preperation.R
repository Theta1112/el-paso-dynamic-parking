library(data.table)
library(tidyverse)
library(lubridate)

data <- fread("data/12_months.csv") %>%
  mutate(date = date(occupancy.buckets),
         hour = hour(ymd_hms(occupancy.buckets, quiet = F)),
         minute = minute(ymd_hms(occupancy.buckets, quiet = F)),
         hour = replace_na(hour, 0),
         minute = replace_na(minute, 0),
         timestamp = date + hours(hour) + minutes(minute))


transactions <- rbind(fread("data/pems transactions jan-jun2024.csv"),
                      fread("data/pems transactions jul-dec2024.csv")) %>%
  rename(meter.ID = "name")

# Clean minutes paid
transactions <- transactions %>%
  mutate(min_paid = ifelse(min_paid >= 0, min_paid, 0))

hist(transactions$min_paid)

# Get buckets
get.buckets <- function(transaction.data, buckets) {

  qty.col <- numeric()
  
  buckets <- c(0, buckets)
  
  for (i in 1:length(buckets)) {
    
    if (i < length(buckets)){
      min.range <- buckets[i]
      max.range <- buckets[i+1]
      
      qty <- transactions %>%
        filter(min_paid < max.range & min_paid >= min.range) %>%
        summarise(count = n()) %>%
        pull()
      
    } else {
      min.range <- buckets[i]
      # print(min.range)
      qty <- transactions %>%
        filter(min_paid >= min.range) %>%
        summarise(count = n()) %>%
        pull()
      
    }
    
    qty.col <- c(qty.col, qty)
  
  }
  
  # print(buckets)
  # print(qty.col)
  
  out <- data.frame(bucket = buckets, qty = qty.col)
  
  return(out)
}

duration.buckets <- get.buckets(transactions, seq(15, 240, by=15))

write.csv(duration.buckets, "app_data/duration_hist.csv", row.names = F, append=FALSE)


data.raw <- fread("data/12_months.csv") %>%
  mutate(date = date(occupancy.buckets),
         hour = hour(ymd_hms(occupancy.buckets, quiet = F)),
         minute = minute(ymd_hms(occupancy.buckets, quiet = F)),
         hour = replace_na(hour, 0),
         minute = replace_na(minute, 0),
         timestamp = date + hours(hour) + minutes(minute)) %>%
  dplyr::select(-occupancy.buckets)

data <- data.raw %>%
  filter(hour >= 8 & hour < 18) %>%
  mutate(dotw = wday(timestamp),
    tod = case_when(
    (hour > 8 & hour <= 11) ~ "morning",
    (hour > 11 & hour <= 14) ~ "midday",
    T ~ "afternoon"
  ))

average_occupancy <- data %>%
  group_by(tod, dotw) %>%
  summarise(occupancy = mean(occupied_fraction_95))

write.csv(average_occupancy, "app_data/average_occupancy.csv", row.names = F, append=FALSE)
