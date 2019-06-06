import Shell, { WorkerGlobalScope } from './shell';
import Main from './main';

new Shell((self as unknown) as WorkerGlobalScope, Main);
