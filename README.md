---
# Image Generator CLI 

Image Generator CLI is a Node.js command-line utility for creating images with customizable text overlays and watermarks. It allows users to quickly generate images with specific dimensions, background colors, text properties, and watermarking, useful for batch processing image creation for various needs such as placeholders, test data, or social media.

## Getting Started

Ensure you have Node.js installed on your machine to use this tool.

### Installation

1. Clone the repository: `git clone https://github.com/EcomGraduates/ez-image-gen.git`
2. Navigate to the directory: `cd ez-image-gen`
3. Install the required NPM packages: `npm install`

### Dependencies

This tool requires the following npm packages:

- `sharp` - A high-performance Node.js image processing library used to generate images.
- `yargs` & `@yargs/helpers` - Libraries to help build interactive command-line tools by parsing arguments and generating an elegant user interface.
- `fs` & `path` - Core Node.js modules to handle the file system and file paths.
- `canvas` - A Node.js module that provides a Canvas API for Node.js, used for image manipulation such as applying opacity to watermarks.

## Usage

### Generate a Single Image or Multiple Images

You can generate a single image or specify the number of images to generate with the `--amount` option:

```
node ez-image-gen.js --amount 5
```

This command generates 5 images with default settings.

### Customize Image Properties

You can customize the width, height, background color, text color, font size, and watermarks of the images:

```
node ez-image-gen.js --amount 1 --width 300 --height 300 --bg "#FFFFFF" --tc "#000000" --fontSize 24 --watermarks "[{\"path\":\"path/to/watermark1.png\",\"position\":\"southeast\",\"opacity\":0.6,\"width\":100,\"height\":100, \"rotation\":45}, {\"path\":\"path/to/watermark2.png\",\"position\":\"center\",\"opacity\":0.4,\"width\":80,\"height\":80, \"rotation\":-30}]"
```

This will generate a 300x300 image with a white background, black text, font size 24, and  watermarks at the southeast position with 60% opacity 45 degree rotation and center position with 40% opacity and -30 degree rotation.

### Watermark Options

You can add a watermark to your images by specifying the watermark option in the JSON configuration. The watermark option should include:

- `path`: URL or local path to the watermark image.
- `position`: Position of the watermark on the image (e.g., `center`, `southeast`, `northwest`).
- `opacity`: Opacity level of the watermark, ranging from 0 (fully transparent) to 1 (fully opaque).
- `width`: Width of the watermark in pixels.
- `height`: Height of the watermark in pixels.

### Use a Text or JSON List for Bulk Generation

To generate images using a list of text overlays and watermarks, use the `--list` option with a `.json` file:

```
node ez-image-gen.js --list path/to/configList.json
```

### Specify Output Filename and Format

By default, images are saved using a prefix and an auto-incrementing number. You can specify a different prefix and choose the format of the images (`jpg`, `png`, `webp`):

```
node ez-image-gen.js --amount 10 --prefix "custom-" --format png --output "./output"
```

### Auto Font Size Adjustment

The `--autoFontSize` option allows the font size to be automatically adjusted based on the image dimensions:

```
node ez-image-gen.js --amount 1 --auto-fs
```

### Output Path

Use the `--output` option to specify the directory where the generated images will be saved:

```
node ez-image-gen.js --amount 1 --output path/to/outputDirectory
```

## Installing via NPM

```
npm i ez-image-gen
```

### Use Command `ez-image-gen`

After installation, you can run the tool directly:

```
ez-image-gen --amount 10 --prefix "custom-" --format png --output "./output"
```

---

## Using as a Node.js Module

In addition to being a command-line utility, Image Generator CLI can also be used as a module in your Node.js projects. This feature allows you to integrate image generation capabilities directly into your applications.

### Module Installation

If you have not already cloned the repository and installed dependencies:

```
npm install ez-image-gen
```

### Usage as a Module

To use Image Generator in your Node.js application, import the `generateImage` function from the `ez-image-gen` package:

```javascript
import { generateImage } from 'ez-image-gen';

const options = {
      width: 1000,
      height: 1000,
      backgroundColor: "#0000ff",
      textColor: "#FFFFFF",
      fontSize: 24,
      autoFontSize: true,
      textOverlay: 'Your text here',
      outputPath: `./your_path_here`,
      filename: 'filename',
      format: 'png',
      verbose: true,
      watermarks: [
        {
            path: "https://ecomgraduates.com/cdn/shop/files/big_social_32x32.png?v=1626614407",
            position: "southeast",
            opacity: 0.6,
            width: 100,
            height: 100,
            rotation: 45
        },
        {
            path: "https://ecomgraduates.com/cdn/shop/files/big_social_32x32.png?v=1626614407",
            position: "center",
            opacity: 0.4,
            width: 80,
            height: 80,
            rotation: -30
        }
      ],
    }

generateImage(options)
  .then(() => console.log('Image generated successfully'))
  .catch(err => console.error(err));
```

This will generate an image based on the specified options and save it to the output path.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

## License

Distributed under the MIT License. See `LICENSE` for more information.

---