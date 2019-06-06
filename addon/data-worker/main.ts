import RequestManager from '../request-manager';
import MemoryCache from '../memory-cache';
import LocalCache from '../local-cache';
import WorkerShell from './shell';
import { Middleware, Request, Response } from '../interfaces';

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
