const fs = require("fs"); 
const Path = require ("path");
const sharp = require('sharp');


module.exports = function (req, res, next) {
    
    // config
    var filename = '';
    var format = 'png';
    var width = 100;
    var height = 100;

    // resizing
    const readStream = fs.createReadStream(filename);
    var transform = sharp();

    if (format) {
        transform = transform.toFormat(format);
    }
    if (width || height) {
        transform = transform.resize(width, height);
    }


    
    res.type(`image/${format || 'png'}`);
    readStream.pipe(transform).pipe(res);
}