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

filtered.data <- data %>% 
  #filter(month(timestamp) == 1 & year(timestamp) == 2024) %>% # For testing
  filter(hour(timestamp) >= 8 & hour(timestamp) < 18 & wday(timestamp) != 7) 

data.train <- filtered.data %>% 
  dplyr::select(street.ID, timestamp, occupied, occupied_fraction) %>%
  mutate(street.ID = as.character(street.ID),
         hr = as.character(hour(timestamp)),
         day = as.character(wday(timestamp)))

lm.1 <- lm(occupied_fraction ~ street.ID + hr * day, data = data.train)
# glm.1 <- glm(occupied_fraction ~ street.ID + hr * day, data = data.train, family = "binomial")

summary(lm.1)
# summary(glm.1)
coef(lm.1)

jan.train <- data.train # %>%
  # filter(month(timestamp) == 1)

jan.train$lm_predict <- predict(lm.1, jan.train)
# jan.train$glm_predict <- predict(glm.1, jan.train, type="response")
jan.train %>% distinct(street.ID) %>% pull()

t <- jan.train %>%
  filter(street.ID == "23037")
ggplot(data = jan.train %>% 
         filter(street.ID == "36536" & month(timestamp) == 3 & day(timestamp) == 1)) +
  geom_line(aes(x = timestamp, y = occupied_fraction), colour = "blue") + 
  # geom_line(aes(x = timestamp, y = glm_predict), colour = "green") + 
  geom_line(aes(x = timestamp, y = lm_predict), colour = "red")
