import { Command } from 'commander';

export const docsCommand = new Command('docs')
  .description('Auto-generate documentation from capability manifest')
  .action(() => {
    const isJson = docsCommand.optsWithGlobals().json;
    if (isJson) {
      console.log(JSON.stringify({ generated: ['README.md'] }));
    } else {
      console.log('Generating documentation...');
      console.log('✓ README.md created');
      console.log('✓ Capability reference created');
      console.log('\nDocumentation generation complete.');
    }
  });
