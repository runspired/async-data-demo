import { Middleware, NextFn, Request, Response } from './interfaces';
import Fixtures from './fixtures';

export default class AsyncLocalCache implements Middleware {
  private dbRef: IDBOpenDBRequest;
  private db: IDBDatabase | null = null;
  private _readyPromise: Promise<any>;

  constructor(isWorker = false, dbName = 'async-data-demo:main-db') {
    this.dbRef = indexedDB.open(dbName, 1);
    ensureLocalDatabase(this.dbRef);
    this._readyPromise = promisify(this.dbRef).then(async () => {
      let db = (this.db = this.dbRef.result);

      let count = Math.floor(Fixtures.length / 4);

      // use partition 2
      let start = count;

      if (isWorker) {
        // use partition 4
        start = count * 3;
      }

      let end = start + count;
      let ids = [];
      for (let i = start; i < end; i++) {
        let resource = Fixtures[i];
        let { type, id } = resource;
        ids.push(id);
        let transaction: IDBTransaction = db.transaction(type, 'readwrite');
        let store = transaction.objectStore(type);
        await promisify(store.put(resource));
      }

      console.log(`${isWorker ? 'worker' : 'main'}:indexdb-cache handles IDs ${ids.join(', ')}`);

      return this.db;
    });
  }

  ready() {
    return this._readyPromise;
  }

  async request(request: Request, next: NextFn): Promise<Response> {
    if (request.params !== undefined) {
      let { type, id, lid } = request.params;
      if (typeof type === 'string' && (id || lid)) {
        let db = await this.ready();

        let transaction: IDBTransaction = db.transaction(type, 'readonly');
        let store = transaction.objectStore(type);
        let record = null;

        if (typeof id === 'string') {
          try {
            let event = await promisify(store.get(id));
            record = event.target.result || null;
          } catch (e) {
            if (e.name !== 'DataError') {
              throw e;
            }
            record = null;
          }
        }

        if (record === null && typeof lid === 'string') {
          try {
            let local = store.index('by_lid');
            let event = await promisify(local.get(lid));
            record = event.target.result || null;
          } catch (e) {
            if (e.name !== 'DataError') {
              throw e;
            }
            record = null;
          }
        }

        if (record !== null) {
          return {
            content: { data: record },
          };
        }
      }
    }

    return next(request);
  }
}

function promisify(obj: any): Promise<any> {
  return new Promise((resolve, reject) => {
    obj.onsuccess = (event: any) => resolve({ target: obj, event });
    obj.onerror = (error: any) => reject({ target: obj, error });
  });
}

function ensureLocalDatabase(req: IDBOpenDBRequest): void {
  req.onupgradeneeded = (event: IDBVersionChangeEvent) => {
    let db: IDBDatabase = req.result;

    if (!event.oldVersion || event.newVersion === 1) {
      let store: IDBObjectStore = db.createObjectStore('user', {
        keyPath: 'id',
      });
      store.createIndex('by_lid', 'lid', { unique: true });
    }
  };
}
