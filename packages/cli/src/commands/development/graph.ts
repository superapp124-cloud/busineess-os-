import { Command } from 'commander';

export const graphCommand = new Command('graph')
  .description('Output the capability dependency graph')
  .action(() => {
    const isJson = graphCommand.optsWithGlobals().json;
    if (isJson) {
      console.log(JSON.stringify({ nodes: [], edges: [] }));
    } else {
      console.log('Dependency Graph:');
      console.log('Capability -> Connector -> Resources');
    }
  });
