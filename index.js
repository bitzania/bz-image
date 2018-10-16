const Path = require('path');
var fs = require('fs');
var express = require('express');
const sharp = require('sharp');
var mime = require('mime-types');


module.exports = function(basePath) {
    var router = express.Router();

    if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);

    var cachePath = Path.join(basePath,'cache_bz_image');
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);


    var resizeImage = async function(fileid, width, height, fitStrategy="inside", fnPath) {
        var prefix = [];
        if (width && width>0) {
            prefix.push('w'+width);
            width = width * 1;
        }
        else {
            prefix.push('wauto')
            width = null;
        }

        if (height && height>0) {
            prefix.push('h'+height);
            height = height *1;
        }
        else {
            prefix.push('hauto');
            height = null;
        }

        if (!fitStrategy) fitStrategy = 'inside';
        if (fitStrategy) prefix.push('f'+fitStrategy);
        else prefix.push('fauto');
        
        prefix.push(fileid);

        var cacheFilename = prefix.join('_');

        try {
            var filename = fnPath(fileid);
            var resizedFilename = fnPath(cacheFilename, true);

            if (fs.existsSync(resizedFilename)) {
                // console.log("return cache");
                return Promise.resolve(resizedFilename);
            }
            else {
                console.log("RESIZE IMAGE", width, height, fitStrategy);
                return sharp(filename).resize(null, null, {width:width, height:height, fit:fitStrategy})
                .toFile(resizedFilename)
                .then((data)=> {
                    return resizedFilename;
                })

            }

            
        } catch (error) {
            return Promise.reject(error);
        }
        
    }
    

    router.use((req, res, next)=> {
        // register helper
        req._bz_getImagePath = function(filename, isCache=false) {
            if (!filename) {
                if (isCache) 
                    return cachePath;
                else
                    return basePath;
            }


            if (isCache) 
                return cachePath + Path.sep + filename
            else
                return basePath  + Path.sep + filename
        };
        next();
    })

    
    router.get('/clear-cache', (req, res, next)=> {
    
        var directory = req._bz_getImagePath(null, true);
        fs.readdir(directory, (err, files) => {
            if (err) throw err;
        
            for (const file of files) {
                fs.unlink(Path.join(directory, file), err => {
                    if (err) throw err;
                });
            }

            res.send("OK");
        });
    
    });
    
    
    router.get('/:width?.:height?.:fitStrategy?/:fileid', async (req, res, next)=> {
        try {
            var f;
            if (!req.params.width && !req.params.height && !req.params.fitStrategy) {
                f = req._bz_getImagePath(req.params.fileid);
            }
            else {
                f = await resizeImage(req.params.fileid, req.params.width, req.params.height, req.params.fitStrategy, req._bz_getImagePath);
            }
            var img = fs.readFileSync(f);
            var contentType = mime.contentType(img);
            res.writeHead(200, {'Content-Type': contentType });
            res.end(img, 'binary');
        } catch (error) {
            console.log("ERROR", error);
            next(error);
        }
    
    });

    return router;
}