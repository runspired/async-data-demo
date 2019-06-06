import Service from '@ember/service';
import RequestManager from 'async-data-demo/request-manager';
import LocalCache from 'async-data-demo/local-cache';
import MemoryCache from 'async-data-demo/memory-cache';
import WorkerCache from 'async-data-demo/worker-cache';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
import EmberObject from '@ember/object';

// essentially an ES Proxy proxying to the eventual resolution of the target promise
const PromiseProxy = EmberObject.extend(PromiseProxyMixin);

// essentially an ES Proxy but with broader compat in the Ember ecosystem
class Record extends EmberObject {
  unknownProperty(propertyName) {
    let target = this._target;
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
        return rel.data.map(d => {
          let promise = this._dataService.request({
            params: d,
          });
          return PromiseProxy.create({ promise });
        });

        // fetch the related record
      } else {
        let promise = this._dataService.request({
          params: rel.data,
        });
        return PromiseProxy.create({ promise });
      }
    }
    return undefined;
  }
}

export default Service.extend({
  init() {
    this._super(...arguments);
    this.manager = new RequestManager();
    // use in-memory first
    this.manager.use(new MemoryCache());
    // fallback to index-db
    this.manager.use(new LocalCache());
    // fallback to data-worker (still might be local)
    this.manager.use(new WorkerCache());
  },

  async request(request) {
    console.log('Requesting', request.params);
    let response = await this.manager.request(request);
    let { content } = response;

    if (Array.isArray(content.data)) {
      return content.data.map(d => Record.create({ _target: d, _dataService: this }));
    } else if (content.data === null) {
      return null;
    } else {
      return Record.create({ _target: content.data, _dataService: this });
    }
  },
});
