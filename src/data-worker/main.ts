import RequestManager from '../data-lib/request-manager';
import MemoryCache from '../data-lib/memory-cache';
import LocalCache from '../data-lib/local-cache';
import WorkerShell from './shell';
import { Middleware, Request, Response } from '../data-lib/interfaces';

export default class WorkerMain implements Middleware {
  private manager = new RequestManager();
  constructor(private shell: WorkerShell) {
    this.manager.use(new MemoryCache(true));
    this.manager.use(new LocalCache(true, 'async-data-demo:worker-db'));
  }

  request(request: Request): Promise<Response> {
    return this.manager.request(request);
  }
}
