#!/usr/bin/env node

// Import required modules and functions
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { generateImage, processList } from './imageProcessor.js'; // Assuming this is the module containing your image processing logic

const argv = yargs(hideBin(process.argv))
  .option('amount', {
    alias: 'a',
    describe: 'Amount of images to generate',
    type: 'number',
    demandOption: false
  })
  .option('width', {
    alias: 'w',
    describe: 'Width of the images',
    type: 'number',
    default: 100
  })
  .option('height', {
    alias: 'h',
    describe: 'Height of the images',
    type: 'number',
    default: 100
  })
  .option('format', {
    alias: 'f',
    describe: 'Format of the images',
    choices: ['jpg', 'png', 'webp'],
    default: 'png'
  })
  .option('backgroundColor', {
    alias: 'bg',
    describe: 'Background color of the images',
    type: 'string',
    default: '#D3D3D3'
  })
  .option('textColor', {
    alias: 'tc',
    describe: 'Font color for text overlay',
    type: 'string',
    default: '#000000'
  })
  .option('textOverlay', {
    alias: 'text',
    describe: 'Text to overlay on the images',
    type: 'string',
    default: ''
  })
  .option('fontSize', {
    describe: 'Font size for text overlay',
    type: 'number',
    default: 48
  })
  .option('autoFontSize', {
    alias: 'auto-fs',
    describe: 'Automatically adjust font size based on image dimensions',
    type: 'boolean',
    default: false
  })
  .option('output', {
    alias: 'o',
    describe: 'Output path for the generated images',
    type: 'string',
    default: process.cwd()
  })
  .option('list', {
    describe: 'Path to a text or JSON file with a list of options for generating multiple images',
    type: 'string'
  })
  .option('prefix', {
    describe: 'Prefix for filenames when generating multiple images',
    type: 'string',
    default: 'image-'
  })
  .option('watermark', {
    describe: 'Watermark settings',
    type: 'object',
    coerce: arg => {
      if (typeof arg === 'string') {
        return JSON.parse(arg);
      }
      return arg;
    }
  })
  .check(argv => {
    if (!argv.list && !argv.amount) {
      throw new Error('You must provide either --amount for single image generation or --list for bulk generation.');
    }
    if (argv.list && argv.amount) {
      throw new Error('Please provide either --list or --amount, not both.');
    }
    if (argv.autoFontSize && argv.fontSize) {
      throw new Error('Please provide either --fontSize or --autoFontSize, not both.');
    }
    if (!argv.output) {
      throw new Error('Output path is required.');
    }
    return true;
  })
  .argv;

const main = async () => {
  if (argv.list) {
    await processList(argv.list, argv);
  } else {
    for (let i = 0; i < argv.amount; i++) {
      await generateImage({
        ...argv,
        filename: `${argv.prefix}${i + 1}`,
      });
    }
  }
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
