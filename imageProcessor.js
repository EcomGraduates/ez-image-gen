import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import axios from 'axios';
import { createCanvas, loadImage } from 'canvas';

// Download an image from a URL
export const downloadImage = async (url) => {
  const response = await axios({ url, responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
};

// Apply opacity to the watermark
export const applyOpacityToWatermark = async (watermarkBuffer, opacity) => {
  const image = await loadImage(watermarkBuffer);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  ctx.globalAlpha = opacity;
  ctx.drawImage(image, 0, 0);

  return canvas.toBuffer();
};

// Add watermark to the base image
export const addWatermark = async (baseImage, watermarkOptions) => {
  let watermarkImage;

  if (watermarkOptions.path.startsWith('http')) {
    watermarkImage = await downloadImage(watermarkOptions.path);
  } else {
    watermarkImage = fs.readFileSync(watermarkOptions.path);
  }

  let resizedWatermark = await sharp(watermarkImage)
    .resize({
      width: watermarkOptions.width,
      height: watermarkOptions.height,
      fit: sharp.fit.cover,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFormat('png')
    .toBuffer();

  const transparentWatermark = await applyOpacityToWatermark(resizedWatermark, watermarkOptions.opacity);

  const finalImage = await sharp(baseImage)
    .composite([
      {
        input: transparentWatermark,
        gravity: watermarkOptions.position,
        blend: 'over'
      }
    ])
    .toBuffer();

  return finalImage;
};

// Calculate automatic font size
export const getAutoFontSize = (width, height) => {
  return Math.round((width + height) / 2 * 0.1);
};

// Generate an image with specified options
export const generateImage = async (options) => {
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

  let finalImage = await sharp(background)
    .composite([{
      input: text,
      blend: 'over'
    }])
    .toBuffer();

  if (options.watermark) {
    finalImage = await addWatermark(finalImage, options.watermark);
  }

  const outputDirectory = options.outputPath || '.';
  const outputFilePath = path.join(outputDirectory, `${options.filename}.${options.format}`);
  await sharp(finalImage).toFile(outputFilePath);

  console.log(`Generated ${outputFilePath}`);
};

// Process a list of image generation options
export const processList = async (listPath, options) => {
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
