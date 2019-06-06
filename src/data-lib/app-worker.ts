import { Value as JSONValue } from 'json-typescript';
import { Dict } from './interfaces';

let RequestID = 0;

type PromiseCallbacks = { resolve: CallableFunction; reject: CallableFunction };

export default class AppWorker {
  private worker: Worker;
  private _requests: Dict<string, PromiseCallbacks> = Object.create(null);

  constructor(srcUrl: string) {
    this.worker = new Worker(srcUrl);
    this.initialize();
  }

  async send<T>(data: JSONValue[]): Promise<T> {
    return new Promise((resolve, reject) => {
      let rid = `${RequestID++}`;
      let event = { rid, data };
      this._requests[rid] = { resolve, reject };
      this.worker.postMessage(JSON.stringify(event));
    });
  }

  private initialize() {
    this.worker.onmessage = event => {
      const { rid, data } = JSON.parse(event.data);
      this._requests[rid].resolve(data);
    };
  }
}
