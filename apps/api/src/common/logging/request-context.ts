import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  requestId: string;
  startedAt: number;
  userId?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();
