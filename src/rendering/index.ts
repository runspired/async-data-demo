let isScheduled = false;

function scheduleViaMicrotask() {
  isScheduled = true;
  Promise.resolve().then(() => {
    isScheduled = false;
    render();
  });
}

const channel = new MessageChannel();
channel.port1.onmessage = () => {
  if (isScheduled === true) {
    isScheduled = false;
    render();
  }
};

function scheduleViaMacrotask() {
  isScheduled = true;
  requestAnimationFrame(() => {
    if (isScheduled === true) {
      isScheduled = false;
      // render();
    }
  });
  channel.port2.postMessage('render');
}

export function scheduleUpdate() {
  scheduleViaMacrotask();
}

type AsyncRenderFn = () => Promise<DocumentFragment>;
type SyncRenderFn = () => DocumentFragment;
type RenderFn = AsyncRenderFn | SyncRenderFn;

let _renderFn: RenderFn;
let _target: HTMLElement;

async function render() {
  console.count('render!');
  let fragment = await _renderFn();
  _target.innerHTML = '';
  _target.appendChild(fragment);
}

export async function createApp(fn: RenderFn, target: HTMLElement) {
  _renderFn = fn;
  _target = target;
  await render();
}

/*
 raf + postMessage race
 vs Promise.resolve

 for both click / message event generated / initial load

 each "resolve" of a relationship should schedule a render
*/
