import { Request, Response, NextFunction } from 'express';
import { scaleMetrics } from '../lib/scaleMetrics';

export const requestMetrics = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    scaleMetrics.increment('http.request.count', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
    });

    scaleMetrics.recordLatency('http.request.latency.ms', durationMs, {
      method: req.method,
      path: req.path,
    });
  });

  next();
};
