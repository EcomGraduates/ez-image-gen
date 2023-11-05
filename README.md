---
# Image Generator CLI

Image Generator CLI is a Node.js command-line utility for creating images with customizable text overlays. It allows users to quickly generate images with specific dimensions, background colors, and text properties, useful for batch processing image creation for various needs such as placeholders, test data, or social media.

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

## Usage

### Generate a Single Image or Multiple Images

You can generate a single image or specify the number of images to generate with the `--amount` option:

```
node ez-image-gen.js --amount 5
```

This command generates 5 images with default settings.

### Customize Image Properties

You can customize the width, height, background color, text color, and font size of the images:

```
node ez-image-gen.js --amount 1 --width 300 --height 300 --bg "#FFFFFF" --tc "#000000" --fontSize 24
```

This will generate a 300x300 image with a white background, black text, and font size 24.

### Use a Text or JSON List for Bulk Generation

To generate images using a list of text overlays, use the `--list` option with a `.txt` or `.json` file:

```
node ez-image-gen.js --list path/to/textList.txt
```

For advanced customization, use a `.json` file with specific properties for each image:

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

In the future, if the tool is published to npm:

```
npm i ez-image-gen
```

### Use Command `ez-image-gen`

After installation, you can run the tool directly:

```
ez-image-gen --amount 10 --prefix "custom-" --format png --output "./output"
```

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

## License

Distributed under the MIT License. See `LICENSE` for more information.

---