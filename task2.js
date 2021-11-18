const AWS = require('aws-sdk');
const fs = require('fs');
const promiseArray = [];

for (let i = 0; i < 1000; i++) {
    const byteSize = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
    const bytes = Array(byteSize).fill(0).join("");

    let indexBuffer = "0000" + i;
    let index = indexBuffer.substring(indexBuffer.length - 4);

    promiseArray.push(fs.promises.writeFile('./files/filename' + index + '_' + byteSize + '.txt', bytes).then(() => {
        console.log("file " + index + " created");
    }));
}

Promise.all(promiseArray).then(() => {
    console.log("All files ready");

    const uploadParams = [];
    const files = fs.readdirSync('./files/');
    files.forEach(file => {
        if (file.match(/filename\d{4}_\d{4}.txt/g)) {
            uploadParams.push({
                Bucket: "kimball-test",
                Key: file,
                Body: fs.readFileSync('./files/' + file)
            })
        }
    });

    return uploadParams;
}).then((uploadParams) => {
    let jobs = uploadParams;
    const totalJobs = jobs.length;
    let jobsActive = 0;
    let concurrencyLimit = 64;

    AWS.config.update({region: 'us-east-1'});
    const s3 = new AWS.S3({apiVersion: '2006-03-01'});

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
            s3.putObject(job).promise().then((result) => {
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
}).then(() => {
    console.log("All files uploaded")
});
