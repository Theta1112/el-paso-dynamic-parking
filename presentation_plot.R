plot.cluster.patterns <- function(data.clustered, input.dotw) {
  
  cluster.grouped <- data.clustered %>% 
    mutate(dotw = wday(timestamp)) %>%
    group_by(hour, street.ID, dotw, cluster)
  
  plot.day <- case_when(
    input.dotw == 1 ~ "Sunday",
    input.dotw == 2 ~ "Monday",
    input.dotw == 3 ~ "Tuesday",
    input.dotw == 4 ~ "Wednesday",
    input.dotw == 5 ~ "Thursday",
    input.dotw == 6 ~ "Friday",
    input.dotw == 7 ~ "Saturday",
    T ~ "Unknown")
  
  p <- ggplot(data = cluster.grouped %>%
                filter(dotw == input.dotw) %>%
                summarise(occupied_fraction = mean(occupied_fraction_95))) +
    geom_line(aes(x = hour, 
                  y = occupied_fraction, 
                  group = street.ID, 
                  color = cluster),
              size = 2) +
    scale_color_manual(values = COLOUR.VEC) + 
    geom_line(data = cluster.grouped %>%
                group_by(hour, dotw, cluster) %>%
                filter(dotw == input.dotw) %>%
                summarise(occupied_fraction = mean(occupied_fraction_95)),
              aes(x = hour, y = occupied_fraction), color = "black", size = 2) + 
    guides(color="none") +
    geom_vline(xintercept = 18, linetype="dashed", size = 2) + 
    facet_wrap(~cluster, nrow = 2) + 
    ylim(0,1) + 
    labs(y = "Average Street Occupancy", 
         title = paste(plot.day)) + 
    theme(text = element_text(size = 20),
          plot.title = element_text(size = 30, face = "bold"))
  
  print(p)
}

plot.cluster.patterns(data.clustered, 7)


ggplot(data = metrics) + 
  geom_point(aes(x = ave_occupancy, y = toc)) +
  function_line(function(x) x^2.3, color = "blue")



plot.cluster <- function(data.clustered, input.dotw, input.cluster) {
  
  cluster.grouped <- data.clustered %>% 
    mutate(dotw = wday(timestamp)) %>%
    filter(cluster == input.cluster) %>%
    group_by(hour, street.ID, dotw, cluster)
  
  plot.day <- case_when(
    input.dotw == 1 ~ "Sunday",
    input.dotw == 2 ~ "Monday",
    input.dotw == 3 ~ "Tuesday",
    input.dotw == 4 ~ "Wednesday",
    input.dotw == 5 ~ "Thursday",
    input.dotw == 6 ~ "Friday",
    input.dotw == 7 ~ "Saturday",
    T ~ "Unknown")
  
  p <- ggplot(data = cluster.grouped %>%
                filter(dotw == input.dotw) %>%
                summarise(occupied_fraction = mean(occupied_fraction_95))) +
    geom_line(aes(x = hour, 
                  y = occupied_fraction, 
                  group = street.ID, 
                  color = cluster),
              size = 2) +
    scale_color_manual(values = COLOUR.VEC[input.cluster]) + 
    geom_line(data = cluster.grouped %>%
                group_by(hour, dotw) %>%
                filter(dotw == input.dotw) %>%
                summarise(occupied_fraction = mean(occupied_fraction_95)),
              aes(x = hour, y = occupied_fraction), color = "black", size = 4) + 
    guides(color="none") +
    geom_vline(xintercept = 18, linetype="dashed", size = 2) + 
    ylim(0,1) + 
    labs(y = "Street Occupancy Rate", 
         title = paste(plot.day)) + 
    theme(text = element_text(size = 25),
          plot.title = element_text(size = 30, face = "bold"))
  
  print(p)
}

plot.cluster(data.clustered, 3, 5)

colnames(data.clustered)




################ LINEGRAPH #################################


library(lubridate)
library(scales)

business.street <- 20000

entertainment.street <- 20434

business <- data.frame(
  hour = c(18,19,20,21),
  street.ID = rep(business.street,4),
  occupancy = (12 - c(11,5,5,6)) / 12 # N STANTON
)

entertainment <- data.frame(
  hour = c(18,19,20,21),
  street.ID = rep(entertainment.street,4),
  occupancy = (6 - c(0,0, 0,0)) / 6 # N OREGON
)


line.data<- data.clustered %>%
  filter(street.ID %in% c(business.street, entertainment.street) 
         & date(timestamp) == "2024-11-21" & hour < 18 & hour >= 8) %>%
  group_by(street.ID, hour) %>%
  summarise(occupancy = mean(occupied_fraction_99))


line.data <- line.data %>%
  mutate(timestamp = hm(paste0(hour,":00" ) ) ) 

ggplot() +
  ylim(0, 1.01) + 
  geom_point(data = line.data,
             aes(x = timestamp, y = occupancy, color = factor(street.ID)),
             size = 7) +
  geom_line(data = line.data,
            aes(x = timestamp, y = occupancy, color = factor(street.ID)),
            size = 3) + 
  scale_color_manual(values = c('#ff7f00', '#377eb8')) + 
  scale_x_time(breaks = c(hm("8:00"),
                          hm("10:00"),
                          hm("12:00"),
                          hm("14:00"),
                          hm("16:00"),
                          hm("18:00"))) + 
  guides(color="none") + 
  scale_y_continuous(labels = scales::percent) + 
  labs(y = "Average Occupancy",
       x = "21 Nov 2024") + 
  theme(text = element_text(size = 20),
        plot.title = element_text(size = 30, face = "bold"))

