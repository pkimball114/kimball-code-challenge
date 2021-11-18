## Research & Caveats
According to a 2011 study done by Mark S. Rasumussen (http://improve.dk/pushing-the-limits-of-amazon-s3-upload-performance/ - section "Number of threads – finding the sweet spot") the ideal number of threads to run for the data payloads we're expecting (<10KB) is 64. Based on AWS's restrictions for the Free Usage Tier (https://aws.amazon.com/s3/faqs/) I did not want to exceed 2000 Put Requests, so I tested my code using smaller sample sizes ensuring proper functionality before setting the values to the final expected numbers you see in the code submitted.

I would like to highlight that due to the style in which the jobs array is defined in Task 1, the promises begin to execute immediately. Although 20 threads are created to process 1000 jobs, after 3 seconds from when the array is filled all jobs will be completed.

Since Task 2 focused on optimizing the parallelization, I broke apart the file creation and upload into three parts - first asynchronously creating the 1000 files; second synchronously building an array of upload parameters; and third asynchronously processing this array with concurrency limits. 

---

### Task 1:
We have 1000 jobs that take 0-3 seconds each to complete. Jobs are defined by the following function:

> async function job() {\
> await new Promise((r) => setTimeout(() => r(), 3000 * Math.random())); }\
> let jobs = Array(1000).fill().map(job);

There is an imposed concurrency limit of processing 20 jobs at a time. Create a function that batches (based on the concurrency limit) and processes all 1000 jobs in the fastest way possible. If you need, you can rewrite the job-creation function to return meta data about the jobs duration. 

---

### Task 2:
Build a function that creates 1000 files of 1-10kb in size locally (approx. 5MB total size). Create a storage bucket on GCP or AWS. Find and use a public library to connect with GCP or AWS to store files in the bucket. Adapt (or use) function from task 1, to upload 1000 files as fast as possible (constrained by cloud providers' API limits and your network connection).
