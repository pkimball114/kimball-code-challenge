async function job() {
    await new Promise((r) => setTimeout(() => r(), 3000 * Math.random()));
}

const totalJobs = 1000;
let jobs = Array(totalJobs).fill().map(job);
let jobsActive = 0;
let concurrencyLimit = 20;

function processJob() {
    //cap the number of running functions to the concurrencyLimit
    while (jobs.length && jobsActive < concurrencyLimit) {
        //grab a job from the queue
        const job = jobs[0];
        const jobIndex = totalJobs - jobs.length;
        jobs = jobs.slice(1);
        jobsActive += 1;
        console.log("job " + jobIndex + " triggered");

        //once the job is complete, retrigger function
        job.then((result) => {
            jobsActive -= 1;
            console.log("job " + jobIndex + " complete");
            return processJob();
        }).catch((err) => {
            jobsActive -= 1;
            console.log("job " + jobIndex + " complete (with failure)");
            processJob();
            throw err;
        });
    }
}

processJob();
