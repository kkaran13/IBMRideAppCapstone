#include "../include/redis_client.h"
#include <iostream>
#include <sstream>

RedisClient::RedisClient(const std::string& host, int port)
    : host(host), port(port), context(nullptr) {}

RedisClient::~RedisClient() {
    disconnect();
}

bool RedisClient::connect() {
    context = redisConnect(host.c_str(), port);
    if (context == nullptr || context->err) {
        if (context) {
            std::cerr << "Redis connection error: " << context->errstr << std::endl;
            redisFree(context);
        } else {
            std::cerr << "Cannot allocate Redis context" << std::endl;
        }
        return false;
    }
    return true;
}

void RedisClient::disconnect() {
    if (context) {
        redisFree(context);
        context = nullptr;
    }
}

bool RedisClient::setKey(const std::string& key, const std::string& value) {
    redisReply* reply = (redisReply*)redisCommand(context, "SET %s %s", key.c_str(), value.c_str());
    if (reply) {
        freeReplyObject(reply);
        return true;
    }
    return false;
}

std::string RedisClient::getKey(const std::string& key) {
    redisReply* reply = (redisReply*)redisCommand(context, "GET %s", key.c_str());
    if (reply) {
        if (reply->type == REDIS_REPLY_STRING) {
            std::string result(reply->str);
            freeReplyObject(reply);
            return result;
        } else {
            freeReplyObject(reply);
            return "Key not found or wrong type";
        }
    }
    return "Error occurred";
}

// Get geo position of a user
std::pair<double,double> RedisClient::getGeoPos(const std::string& key, const std::string& member) {
    if (!context) {
        throw std::runtime_error("Not connected to Redis");
    }

    redisReply* reply = (redisReply*)redisCommand(context, "GEOPOS %s %s", key.c_str(), member.c_str());

    std::pair<double,double> coords = {0.0, 0.0};

    if (reply && reply->type == REDIS_REPLY_ARRAY && reply->elements > 0 && reply->element[0]) {
        if (reply->element[0]->type == REDIS_REPLY_ARRAY && reply->element[0]->elements == 2) {
            coords.first  = std::stod(reply->element[0]->element[0]->str); // longitude
            coords.second = std::stod(reply->element[0]->element[1]->str); // latitude
        }
    }

    if (reply) freeReplyObject(reply);
    return coords;
}

// Add geo position of a user
bool RedisClient::geoAdd(const std::string& key, double lon, double lat, const std::string& member) {
    if (!context) throw std::runtime_error("Not connected to Redis");

    redisReply* reply = (redisReply*)redisCommand(context, "GEOADD %s %f %f %s", 
                                                  key.c_str(), lon, lat, member.c_str());

    bool success = (reply && reply->type == REDIS_REPLY_INTEGER && reply->integer == 1);

    if (reply) freeReplyObject(reply);
    return success;
}


std::vector<std::string> RedisClient::geoRadius(const std::string& key,
                                               double lon, double lat,
                                               double radius, const std::string& unit) {
    if (!context) throw std::runtime_error("Not connected to Redis");

    redisReply* reply = (redisReply*)redisCommand(context,
        "GEORADIUS %s %f %f %f %s", key.c_str(), lon, lat, radius, unit.c_str());

    std::vector<std::string> results;
    if (reply && reply->type == REDIS_REPLY_ARRAY) {
        for (size_t i = 0; i < reply->elements; i++) {
            if (reply->element[i]->type == REDIS_REPLY_STRING) {
                // std :: cout << reply->element[i]->str;
                results.push_back(reply->element[i]->str);
            }
        }
    }

    if (reply) freeReplyObject(reply);
    return results;
}
