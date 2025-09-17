import redisClient from '../config/redisClient.js';
import RideRepository from '../repositories/RideRepository.js';
import RideMatchingService from '../services/RideMatchingService.js';

class RideMatchScheduler {
    async ridematch() {
        try {

            // 1. Fetch ongoing rides that are still waiting for drivers
            const allAvailableRides = await RideRepository.getAvailableRides();

            console.log(`Found ${allAvailableRides.length} rides to process...`);

            const ridePromises = allAvailableRides.map(async (ride) => {
                const { ride_id, pickup_latitude, pickup_longitude } = ride;
                
                // 2. Skip if ride already in progress
                const inProgress = await redisClient.redis.get(`ride:inprogress:${ride_id}`);
                
                if (inProgress) {
                    console.log(`Skipping ride ${ride_id}, already in progress`);
                    return;
                }

                console.log(`Starting match for ride ${ride_id}...`);

                // 3. Mark ride as in-progress with TTL (1 hour)
                await redisClient.redis.set(`ride:inprogress:${ride_id}`, 'true', 'EX', 3600);
                

                try {
                    // 4. Call the matching service
                    await RideMatchingService.searchForDrivers(
                        pickup_latitude,
                        pickup_longitude,
                        ride_id,
                        ride?.dataValues
                    );
                } catch (err) {
                    console.error(`Error processing ride ${ride_id}:`, err);
                } finally {
                    // cleanup in-progress flag after done
                    await redisClient.redis.del(`ride:inprogress:${ride_id}`);
                }
            });

            // 5. Run all rides concurrently, but don't crash if one fails
            await Promise.allSettled(ridePromises);

            console.log("Ride matching cycle complete.");
        } catch (error) {
            console.error("Error in ride matching scheduler:", error);
            throw error;
        }
    }
}

export default new RideMatchScheduler();