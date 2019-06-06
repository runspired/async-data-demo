import { Value as JSONValue } from 'json-typescript';
// apparently there are no complete typings for Workers :'(
// so we just define what we need here
export interface WorkerGlobalScope {
  onmessage: (event: MessageEvent) => void;
  postMessage: (data: JSONValue) => void;
}

export default class WorkerShell {
  private app: any;

  constructor(private context: WorkerGlobalScope, App: any) {
    this.initialize();
    this.app = new App(this);
  }

  private initialize() {
    this.context.onmessage = async event => {
      const { rid, data } = JSON.parse(event.data);
      const [method, ...args] = data;
      let result = await this.app[method](...args);
      this.send({
        rid,
        data: result,
      });
    };
  }

  send(message: { rid: string; data: JSONValue }) {
    this.context.postMessage(JSON.stringify(message));
  }
}
