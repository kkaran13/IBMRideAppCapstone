#pragma once
#include <string>
#include <hiredis.h>
#include <vector>

class RedisClient {
    public :
        RedisClient(const std::string& host = "127.0.0.1", int port = 6379);
        ~RedisClient();

        bool connect();
        void disconnect();
        bool setKey(const std::string& key, const std::string& value);
        std::string getKey(const std::string& key);

        // Geo Locations 
        std::pair<double,double> getGeoPos(const std::string& key, const std::string& member);
        bool geoAdd(const std::string& key, double lon, double lat, const std::string& member);
        std::vector<std::string> geoRadius(const std::string& key,
                                   double lon, double lat,
                                   double radius, const std::string& unit);

    private:
        std::string host;
        int port;
        redisContext* context;
};