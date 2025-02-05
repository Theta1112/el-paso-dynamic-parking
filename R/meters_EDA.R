library(tidyverse)
library(sf)
library(httr)
library(jsonlite)
library(data.table)

raw.data <- rbind(fread("data/pems transactions jan-jun2024.csv"),
                  fread("data/pems transactions jul-dec2024.csv"))

meters <- st_read("data/meters-shape.geojson")

t <- raw.data %>% 
  left_join(meters, join_by(name == LocationID)) %>%
  mutate(timestamp = dmy_hm(datetime),
         date = dmy(date),
         min_paid = max(min_paid, 0))

t.agg <- t %>%
  filter(area == "Uptown District") %>%
  group_by(date) %>%
  summarise(total_min = sum(min_paid)) %>%
  ungroup()


ggplot(data = t.agg) + 
  geom_line(aes(x = date, y = total_min)) + 
  xlim(dmy("1/1/2024"), dmy("31/1/2024"))

t.name <- t %>%
  filter(area == "Uptown District") %>%
  group_by(geometry) %>%
  summarise(total_min = sum(min_paid),
            ave_rev = mean(min_paid)) %>%
  ungroup()
  


ggplot(data = t.name) +
  geom_sf(aes(colour = total_min))
