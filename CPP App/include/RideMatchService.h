#pragma once
#include <iostream>
#include <string>
#include "redis_client.h"

class RideMatchService {
public:
    RideMatchService(RedisClient& redis);

    // Core function: find nearby drivers
    std::vector<std::string> findNearbyDrivers(const std::string& key,
                                               double lon, double lat,
                                               double radius,
                                               const std::string& unit);

    // Future: filter by rating, car type, active status, etc.
    std::vector<std::string> matchDrivers(const std::string& key,
                                          double lon, double lat,
                                          double radius,
                                          const std::string& unit,
                                          int minRating,
                                          const std::string& carType);

private:
    RedisClient& redisClient;
};