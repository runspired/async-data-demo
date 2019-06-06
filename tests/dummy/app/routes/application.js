import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  dataStorage: service('data-store'),
  async model() {
    let user = await this.dataStorage.request({
      params: {
        type: 'user',
        id: '1',
      },
    });
    return user;
  },
});
