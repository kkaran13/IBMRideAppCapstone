#include "RideMatchService.h"
#include <vector>

RideMatchService::RideMatchService(RedisClient& redis) : redisClient(redis) {}

std::vector<std::string> RideMatchService::findNearbyDrivers(const std::string& key,
                                                            double lon, double lat,
                                                            double radius,
                                                            const std::string& unit) {
    return redisClient.geoRadius(key, lon, lat, radius, unit);
}

std::vector<std::string> RideMatchService::matchDrivers(const std::string& key,
                                                       double lon, double lat,
                                                       double radius,
                                                       const std::string& unit,
                                                       int minRating,
                                                       const std::string& carType) {
    // Step 1: Get nearby drivers from Redis
    auto nearby = redisClient.geoRadius(key, lon, lat, radius, unit);

    // Step 2: Apply business filters (in real app, fetch metadata from DB/Redis)
    std::vector<std::string> filtered;
    for (auto& driver : nearby) {
        // TODO: Fetch driver info and filter
        if (driver.find(carType) != std::string::npos) { // dummy filter
            filtered.push_back(driver);
        }
    }
    return filtered;
}