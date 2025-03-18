library(dplyr)
library(data.table)
library(lubridate)


cleaned.transactions = fread("data/EC2_cleaned_transactions.csv")

meters = fread("data/EC2_meter_minimal.csv")

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

monthwise.occupancy <- function(cleaned.transactions, progress = T) {
  
  for (i in 9:12) {
    
    if (progress) {
      print(paste("EXECUTING MONTH:", i))
    }
    
    # Get only month transactions
    month.transactions <- cleaned.transactions %>%
      filter(month(date) == i)
    
    # Execute splitting
    month.bucketed.separated <- compute.bucket.occupancy(month.transactions)
    
    # Join back to month transactions
    month.bucketed <- month.transactions %>%
      right_join(month.bucketed.separated) %>%
      group_by(occupancy.buckets, meter.ID) %>%
      summarise(occupied = n()) %>%
      arrange(meter.ID, occupancy.buckets)
    
    # Join to streets via meters
    month.occupancy <- month.bucketed %>%
      left_join(meters) %>%
      group_by(street.ID, occupancy.buckets) %>%
      summarise(street_occupied = n()) %>%
      arrange(street.ID)
    
    # Find max occupancy of each street
    month.max <- month.occupancy %>%
      group_by(street.ID) %>%
      summarise(max_occupied = max(street_occupied))
    
    # Normalise
    month.norm <- month.occupancy %>%
      left_join(month.max) %>%
      filter(!is.na(street.ID)) %>%
      mutate(occupied_fraction = street_occupied / max_occupied)
    
    # Write normalised output
    write.csv(month.norm, 
             paste0("output/month_",i,"_occupancy_normalised.csv"), 
             row.names = F, append=FALSE)
  }
  
}

# Execute for the whole year
monthwise.occupancy(cleaned.transactions)
