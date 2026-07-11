// SVG ikonlardan @capacitor/assets'in beklediği PNG kaynaklarını üretir
import sharp from 'sharp';
import path from 'node:path';

const dir = process.argv[2]; // ev-tycoon/assets
const p = (f) => path.join(dir, f);

// 1024 ana ikon + adaptif katmanlar
await sharp(p('icon.svg'), { density: 300 }).resize(1024, 1024).png().toFile(p('icon.png'));
await sharp(p('icon-fg.svg'), { density: 300 }).resize(1024, 1024).png().toFile(p('icon-foreground.png'));
await sharp(p('icon-bg.svg'), { density: 300 }).resize(1024, 1024).png().toFile(p('icon-background.png'));

// 2732x2732 splash: koyu zemin ortasında logo (~%40 genişlik)
const logo = await sharp(p('icon.svg'), { density: 300 }).resize(1100, 1100).png().toBuffer();
const splash = sharp({
  create: { width: 2732, height: 2732, channels: 4, background: { r: 10, g: 17, b: 40, alpha: 1 } },
}).composite([{ input: logo, gravity: 'center' }]);
await splash.png().toFile(p('splash.png'));
await sharp(p('splash.png')).toFile(p('splash-dark.png'));
console.log('assets hazir');
