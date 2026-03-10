import fs from 'fs';
import google from 'googlethis';

const tsFile = 'src/components/PriceIsRightGame.tsx';
let content = fs.readFileSync(tsFile, 'utf8');

const regex = /\{ name: '([^']+)', nameAr: '([^']+)', price: (\d+), imageUrl: '([^']+)' \}/g;
let match;
const items = [];

while ((match = regex.exec(content)) !== null) {
  items.push({
    fullMatch: match[0],
    name: match[1],
    nameAr: match[2],
    price: match[3],
    oldUrl: match[4]
  });
}

console.log('Found ' + items.length + ' items');

for (const item of items) {
  try {
    const images = await google.image(item.name + ' product white background', { safe: false });
    if (images && images.length > 0) {
      const bestImage = images.find(img => img.url.startsWith('https://') && !img.url.includes('unsplash') && !img.url.includes('shutterstock'));
      if (bestImage) {
        console.log('Updated ' + item.name + ' -> ' + bestImage.url.substring(0, 50));
        content = content.replace(item.oldUrl, bestImage.url);
      }
    }
  } catch (err) {
    console.error('Failed for ' + item.name + ': ' + err.message);
  }
}

fs.writeFileSync(tsFile, content);
console.log('Done!');
