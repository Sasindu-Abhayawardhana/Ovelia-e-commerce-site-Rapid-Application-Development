const fs = require('fs');
const https = require('https');
const path = require('path');

const dir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const images = [
    { name: 'shirt.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Blue_T-Shirt.jpg/800px-Blue_T-Shirt.jpg' },
    { name: 'bag.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Bottega_Veneta_Knot_Bag.jpg/800px-Bottega_Veneta_Knot_Bag.jpg' },
    { name: 'candle.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/A_burning_candle.jpg/800px-A_burning_candle.jpg' },
    { name: 'pants.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Blue_jeans_2.jpg/800px-Blue_jeans_2.jpg' },
    { name: 'hat.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Panama_hat_Ecuador.jpg/800px-Panama_hat_Ecuador.jpg' }
];

images.forEach(img => {
    const file = fs.createWriteStream(path.join(dir, img.name));
    https.get(img.url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close();  
            console.log('Downloaded', img.name);
        });
    }).on('error', function(err) {
        fs.unlink(path.join(dir, img.name));
        console.error('Error downloading', img.name, err.message);
    });
});
