import { scheduleUpdate } from '../rendering';
import DataService from './data-service';

/**
 * A Future is a data structure that represent an async
 * value. This value may be resolved from either local
 * or remote sources where a source is something along
 * the lines of:
 *
 * - localStorage
 * - indexDB
 * - a Worker/ServiceWorker
 * - An API
 * - Memory
 *
 * Futures that fulfill from remote sources should not
 * block a render; however, Futures that fulfill from local
 * sources should deliver their content in-time so-as
 * to avoid excess renders.
 */
export class Future {
  public content: any = null;

  constructor(promise: Promise<any>) {
    promise.then((content: any) => {
      this.content = content;
      scheduleUpdate();
    });
  }
}

export function makeUIRecord(target: any, dataService: DataService) {
  return new Proxy(target, new RecordHandler(dataService));
}

class RecordHandler {
  constructor(private _dataService: DataService) {}

  get(target: any, propertyName: string): any {
    if (target[propertyName] !== undefined) {
      return target[propertyName];
    } else if (target.attributes && target.attributes[propertyName]) {
      return target.attributes[propertyName];
    } else if (target.relationships && target.relationships[propertyName]) {
      let rel = target.relationships[propertyName];
      // we have no related record
      if (rel.data === null) {
        return null;
      }

      // fetch the related records
      if (Array.isArray(rel.data)) {
        return rel.data.map((d: any) => {
          let promise = this._dataService.request({
            params: d,
          });
          return new Future(promise);
        });

        // fetch the related record
      } else {
        let promise = this._dataService.request({
          params: rel.data,
        });
        return new Future(promise);
      }
    }
    return undefined;
  }
}
