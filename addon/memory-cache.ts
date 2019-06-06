import { Dict, Middleware, NextFn, Request, Response } from './interfaces';

export default class AsyncMemoryCache implements Middleware {
  private lidMappings: Dict<string, any> = Object.create(null);
  private idMappings: Dict<string, Dict<string, any>> = Object.create(null);

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

        return Promise.resolve({ content: record });
      }
    }

    return next(request);
  }
}
