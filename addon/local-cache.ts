import { Middleware, NextFn, Request, Response } from './interfaces';

export default class AsyncLocalCache implements Middleware {
  private dbRef: IDBOpenDBRequest;
  private db: IDBDatabase | null = null;
  private _readyPromise: Promise<any>;

  constructor(dbName = 'async-data-demo:db') {
    this.dbRef = indexedDB.open(dbName, 1);
    ensureLocalDatabase(this.dbRef);
    this._readyPromise = promisify(this.dbRef).then(() => {
      this.db = this.dbRef.result;
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
            record = await promisify(store.get(id));
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
            record = await promisify(local.get(lid));
          } catch (e) {
            if (e.name !== 'DataError') {
              throw e;
            }
            record = null;
          }
        }

        if (record !== null) {
          return {
            content: record,
          };
        }
      }
    }

    return next(request);
  }
}

function promisify(obj: any): Promise<any> {
  return new Promise((resolve, reject) => {
    obj.onsuccess = resolve;
    obj.onerror = reject;
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
