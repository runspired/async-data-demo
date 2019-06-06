import { Value as JSONValue } from 'json-typescript';
import { Middleware, NextFn, Request, Response } from './interfaces';
import AppWorker from './app-worker';

export default class AsyncWorkerCache implements Middleware {
  private worker: AppWorker;
  constructor() {
    this.worker = new AppWorker('./data-worker.js');
  }

  async request(request: Request, next: NextFn): Promise<Response> {
    let record = await this.worker.send<Response>(['request', (request as unknown) as JSONValue]);

    if (!record) {
      return next(request);
    }

    return record;
  }
}
