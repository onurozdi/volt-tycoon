import sharp from 'sharp';
const dir = 'C:/Users/onuro/Documents/claude code oyun geliştirme/ev-tycoon/assets';
const out = process.argv[2];
await sharp(dir + '/icon.svg', { density: 300 }).resize(512, 512).png().toFile(out + '/play-icon-512.png');
await sharp(dir + '/feature.svg', { density: 300 }).resize(1024, 500).png().toFile(out + '/play-feature-1024x500.png');
console.log('magaza gorselleri hazir');
