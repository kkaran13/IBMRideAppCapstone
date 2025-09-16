import cron from 'node-cron';
import RideMatchScheduler from './jobschedulers/RideMatchScheduler.js';

function rideMatchScheduler(){
    cron.schedule('* * * * *', async () => {
        await RideMatchScheduler.ridematch();
    });
}

const runScheduler = () => {
    console.log("Schdeuler is runnning");
    
    rideMatchScheduler();
}

export default runScheduler;