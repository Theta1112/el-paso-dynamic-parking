library(data.table)
library(tidyverse)
library(lubridate)
data <- fread("data/8_months.csv") %>%
  mutate(date = date(occupancy.buckets),
         hour = hour(ymd_hms(occupancy.buckets, quiet = F)),
         minute = minute(ymd_hms(occupancy.buckets, quiet = F)),
         hour = replace_na(hour, 0),
         minute = replace_na(minute, 0),
         timestamp = date + hours(hour) + minutes(minute))

filtered.data <- data %>% 
  filter(month(timestamp) == 1) %>% # For testing
  filter(hour(timestamp) >= 8 & hour(timestamp) < 18 & wday(timestamp) != 7) 

# Generate time bins from min to max time
time_bins <- data.frame(timestamp = seq(from = min(filtered.data$timestamp), 
                 to = max(filtered.data$timestamp), 
                 by = "15 mins")) %>%
  filter(hour(timestamp) >= 8 & hour(timestamp) < 18 & wday(timestamp) != 7) 

# Zero pad the time bins
data.padded <- data %>%
  distinct(street.ID) %>%
  cross_join(time_bins) %>%
  mutate(occupied_fraction_padding = 0,
         street_occupied_padding = 0)

data.train <- filtered.data %>% 
  right_join(data.padded) %>%
  mutate(street_occupied = ifelse(is.na(street_occupied), 0, street_occupied),
         occupied_fraction = ifelse(is.na(occupied_fraction), 0, occupied_fraction),
         street_occupied = street_occupied + street_occupied_padding,
         occupied_fraction = occupied_fraction + occupied_fraction_padding) %>%
  dplyr::select(street.ID, timestamp, street_occupied, occupied_fraction) %>%
  mutate(street.ID = as.character(street.ID),
         hr = as.character(hour(timestamp)),
         day = as.character(wday(timestamp)))

lm.1 <- lm(occupied_fraction ~ street.ID + hr * day, data = data.train)
glm.1 <- glm(occupied_fraction ~ street.ID + hr * day, data = data.train, family = "binomial")

summary(lm.1)
summary(glm.1)
coef(lm.1)

jan.train <- data.train %>%
  filter(month(timestamp) == 1)

jan.train$lm_predict <- predict(lm.1, jan.train)
jan.train$glm_predict <- predict(glm.1, jan.train, type="response")

ggplot(data = jan.train %>% filter(street.ID == "48302")) +
  geom_line(aes(x = timestamp, y = occupied_fraction), colour = "blue") + 
  geom_line(aes(x = timestamp, y = glm_predict), colour = "red") + 
  geom_line(aes(x = timestamp, y = lm_predict), colour = "green")
