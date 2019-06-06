import { Dict, Middleware, NextFn, Request, Response } from './interfaces';
import Fixtures from './fixtures';

export default class AsyncMemoryCache implements Middleware {
  private lidMappings: Dict<string, any> = Object.create(null);
  private idMappings: Dict<string, Dict<string, any>> = Object.create(null);

  constructor(isWorker = false) {
    let count = Math.floor(Fixtures.length / 4);

    // use partition 1
    let start = 0;

    if (isWorker) {
      // use partition 3
      start = count * 2;
    }

    let end = start + count;
    let ids = [];
    for (let i = start; i < end; i++) {
      let resource = Fixtures[i];
      let { type, id } = resource;
      ids.push(id);
      this.idMappings[type] = this.idMappings[type] || Object.create(null);
      this.idMappings[type][id] = resource;
    }

    // console.log(`${isWorker ? 'worker' : 'main'}:in-memory-cache handles IDs ${ids.join(', ')}`);
  }

  async request(request: Request, next: NextFn): Promise<Response> {
    if (request.params !== undefined) {
      let { type, id, lid } = request.params;
      if (typeof type === 'string' && (id || lid)) {
        let record = null;
        if (typeof lid === 'string') {
          record = this.lidMappings[lid];
        }

        if (!record) {
          let cache = this.idMappings[type];

          if (cache === undefined || typeof id !== 'string' || !cache[id]) {
            return next(request);
          }

          record = cache[id];
        }

        return Promise.resolve({ content: { data: record } });
      }
    }

    return next(request);
  }
}
