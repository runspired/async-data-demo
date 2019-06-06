import { Middleware, Request, Response } from './interfaces';

export default class RequestManager {
  private _wares: Middleware[] = [];

  use(middleware: Middleware) {
    this._wares.push(middleware);
  }

  request(request: Request): Promise<Response> {
    return Promise.resolve(perform(this._wares, request));
  }
}

function perform(wares: Middleware[], request: Request, i: number = 0): Promise<Response> {
  if (i === wares.length) {
    throw new Error(`No middleware was able to handle this request ${request}`);
  }

  function next(r: Request): Promise<Response> {
    return perform(wares, r, i + 1);
  }

  return wares[i].request(request, next);
}
