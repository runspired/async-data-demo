import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/render-count';

export default class RenderCount extends Component.extend({
  // anything which *must* be merged to prototype here
}) {
  layout = layout;

  renderCount: number = 0;

  willRender() {
    this.incrementProperty('renderCount');
  }
}
