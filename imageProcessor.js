import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import axios from 'axios';
import { createCanvas, loadImage } from 'canvas';

export const downloadImage = async (url) => {
  const response = await axios({ url, responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
};

export const applyOpacityToWatermark = async (watermarkBuffer, opacity) => {
  const image = await loadImage(watermarkBuffer);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  ctx.globalAlpha = opacity;
  ctx.drawImage(image, 0, 0);

  return canvas.toBuffer();
};

export const addWatermarks = async (baseImage, watermarkOptionsArray) => {
  let finalImage = baseImage;

  for (let watermarkOptions of watermarkOptionsArray) {
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

    let transparentWatermark = await applyOpacityToWatermark(resizedWatermark, watermarkOptions.opacity);

    if (watermarkOptions.rotation) {
      transparentWatermark = await sharp(transparentWatermark)
        .rotate(watermarkOptions.rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
    }

    finalImage = await sharp(finalImage)
      .composite([
        {
          input: transparentWatermark,
          gravity: watermarkOptions.position,
          blend: 'over'
        }
      ])
      .toBuffer();
  }

  return finalImage;
};

export const getAutoFontSize = (width, height) => {
  return Math.round((width + height) / 2 * 0.1);
};

export const generateImage = async (options) => {
  const fontSize = options.autoFontSize ? getAutoFontSize(options.width, options.height) : options.fontSize;

  let background = await sharp({
    create: {
      width: options.width,
      height: options.height,
      channels: 4,
      background: options.backgroundColor
    }
  }).toFormat('png').toBuffer();

  const textSVG = `<svg width="${options.width}" height="${options.height}">
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
    style="fill:${options.textColor};font-family:Arial;font-size:${fontSize}px;">${options.textOverlay}</text>
  </svg>`;

  let finalImage = await sharp(background)
    .composite([{
      input: Buffer.from(textSVG),
      gravity: 'center'
    }])
    .toFormat('png').toBuffer();

  if (options.watermarks) {
    finalImage = await addWatermarks(finalImage, options.watermarks);
  }

  if (options.format === 'jpg' || options.format === 'jpeg') {
    finalImage = await sharp(finalImage)
      .flatten({ background: options.backgroundColor })
      .jpeg()
      .toBuffer();
  }

  const outputDirectory = options.outputPath || '.';
  const outputFilePath = path.join(outputDirectory, `${options.filename}.${options.format}`);
  await sharp(finalImage).toFile(outputFilePath);
  if (options.verbose) console.log(`Generated ${outputFilePath}`);
};

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