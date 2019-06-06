import RequestManager from '../data-lib/request-manager';
import LocalCache from '../data-lib/local-cache';
import MemoryCache from '../data-lib/memory-cache';
import WorkerCache from '../data-lib/worker-cache';
import { Request } from '../data-lib/interfaces';
import { makeUIRecord } from './ui-proxy';

export default class DataService {
  private manager: RequestManager;

  constructor() {
    this.manager = new RequestManager();
    // use in-memory first
    this.manager.use(new MemoryCache());
    // fallback to index-db
    this.manager.use(new LocalCache());
    // fallback to data-worker (still might be local)
    this.manager.use(new WorkerCache());
  }

  async request(request: Request): Promise<any> {
    // console.log('Requesting', request.params);
    let response = await this.manager.request(request);
    let { content } = response;

    if (Array.isArray(content.data)) {
      return content.data.map(d => makeUIRecord(d, this));
    } else if (content.data === null) {
      return null;
    } else {
      return makeUIRecord(content.data, this);
    }
  }
}
