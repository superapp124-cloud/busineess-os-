import { Command } from 'commander';

export const inspectCommand = new Command('inspect')
  .description('Display capability debug metadata (like kubectl describe)')
  .action(() => {
    const isJson = inspectCommand.optsWithGlobals().json;
    const metadata = {
      name: 'Sample',
      version: '1.0.0',
      publisher: 'CHATR',
      actions: 2,
      permissions: ['network']
    };
    if (isJson) {
      console.log(JSON.stringify(metadata));
    } else {
      console.log('Capability Inspection:');
      console.log(`Name: ${metadata.name}`);
      console.log(`Version: ${metadata.version}`);
      console.log(`Actions: ${metadata.actions}`);
    }
  });
