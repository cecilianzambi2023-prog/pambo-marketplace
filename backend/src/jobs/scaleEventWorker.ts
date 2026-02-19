import { eventQueue, startEventQueueWorker, PlatformEvent } from '../lib/eventQueue';
import { scaleMetrics } from '../lib/scaleMetrics';

const registerHandlers = () => {
  eventQueue.registerHandler('MATCHMAKING_SEARCH', async (event: PlatformEvent) => {
    scaleMetrics.increment('worker.matchmaking_search.processed');
  });

  eventQueue.registerHandler('LISTING_CREATED', async (event: PlatformEvent) => {
    scaleMetrics.increment('worker.listing_created.processed');
  });

  eventQueue.registerHandler('LISTING_SEARCH', async (event: PlatformEvent) => {
    scaleMetrics.increment('worker.listing_search.processed');
  });
};

export const startScaleEventWorker = () => {
  registerHandlers();
  return startEventQueueWorker(1000, 200);
};
