import { randomUUID } from 'crypto';
import { scaleMetrics } from './scaleMetrics';

export interface PlatformEvent {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

type EventHandler = (event: PlatformEvent) => Promise<void> | void;

const MAX_QUEUE_SIZE = 20000;

class EventQueue {
  private queue: PlatformEvent[] = [];
  private handlers = new Map<string, EventHandler[]>();

  emit(type: string, source: string, payload: Record<string, unknown>) {
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      this.queue.shift();
      scaleMetrics.increment('event.queue.dropped', { reason: 'max_queue_size' });
    }

    const event: PlatformEvent = {
      id: randomUUID(),
      type,
      source,
      timestamp: new Date().toISOString(),
      payload,
    };

    this.queue.push(event);
    scaleMetrics.increment('event.emitted', { type, source });
    scaleMetrics.increment('event.queue.depth', { metric: 'current' }, 1);
  }

  registerHandler(type: string, handler: EventHandler) {
    const existing = this.handlers.get(type) || [];
    existing.push(handler);
    this.handlers.set(type, existing);
  }

  async processBatch(limit: number = 100) {
    const batch = this.queue.splice(0, limit);
    if (batch.length === 0) return;

    scaleMetrics.increment('event.batch.processed', { size: batch.length });

    for (const event of batch) {
      const handlers = this.handlers.get(event.type) || [];
      for (const handler of handlers) {
        try {
          await handler(event);
          scaleMetrics.increment('event.handler.success', { type: event.type });
        } catch (error) {
          scaleMetrics.increment('event.handler.failure', { type: event.type });
        }
      }
    }

    scaleMetrics.increment('event.queue.depth', { metric: 'current' }, -batch.length);
  }

  stats() {
    return {
      depth: this.queue.length,
      registeredEventTypes: Array.from(this.handlers.keys()),
    };
  }
}

export const eventQueue = new EventQueue();

export const startEventQueueWorker = (intervalMs: number = 1000, batchSize: number = 100) => {
  const timer = setInterval(async () => {
    await eventQueue.processBatch(batchSize);
  }, intervalMs);

  return () => clearInterval(timer);
};
