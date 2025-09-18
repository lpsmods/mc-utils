import { unitTestMap } from "./command/test";
import { Queue } from "./queue";

const queue = new Queue<string>();
queue.run(function* (job) {
  // Process item.
  console.warn(job.item);

  // Mark as complete.
  job.queue.done();
});

export default (units: unitTestMap) => {
  units.set("queue", (ctx, message) => {
    queue.put(message ?? "apple");
  });
};
