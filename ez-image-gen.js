#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const getAutoFontSize = (width, height) => {
  return Math.round((width + height) / 2 * 0.1);
};

const generateImage = async (options) => {
  const fontSize = options.autoFontSize ? getAutoFontSize(options.width, options.height) : options.fontSize;

  const background = await sharp({
    create: {
      width: options.width,
      height: options.height,
      channels: 4,
      background: options.backgroundColor
    }
  }).toFormat(options.format).toBuffer();

  const textSVG = `<svg width="${options.width}" height="${options.height}">
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
    style="fill:${options.textColor};font-family:Arial;font-size:${fontSize}px;">${options.textOverlay}</text>
  </svg>`;

  const text = await sharp({
    create: {
      width: options.width,
      height: options.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  }).composite([{
    input: Buffer.from(textSVG),
    gravity: 'center'
  }]).toFormat(options.format).toBuffer();
  const outputDirectory = options.outputPath || '.';
  const outputFilePath = path.join(outputDirectory, `${options.filename}.${options.format}`);
  await sharp(background)
    .composite([{
      input: text,
      blend: 'over'
    }])
    .toFile(outputFilePath);

  console.log(`Generated ${outputFilePath}`);
};

const processList = async (listPath, options) => {
  let list;
  if (path.extname(listPath) === '.json') {
    list = JSON.parse(fs.readFileSync(listPath, 'utf-8'));
  } else {
    list = fs.readFileSync(listPath, 'utf-8').split(/\r?\n/).map(line => ({ textOverlay: line }));
  }

  for (let [index, itemOptions] of list.entries()) {
    await generateImage({
      ...options,
      ...itemOptions,
      filename: `${options.prefix}${index + 1}`,
    });
  }
};

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
