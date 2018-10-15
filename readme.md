# bz-mailer

## Install
`npm install bz-image -S`

## Usage Example

### Register Route

```javascript
const bzImage = require('bz-image');
var imageDirectory = path.join(__dirname,'_uploads')
app.use('/images', bzImage(imageDirectory));
```

### Routes
**/images/width.height.fitStrategy/filename**


width ( optional )  
target image width

height ( optional )  
target image height

fitStrategy ( optional )  
if width and height specified, fitStrategy can be used with values:
- contain
- cover
- inside
- outside
- fill


#### Examples
Fit Width  
`/images/200/image1.jpg`

Fit Height  
`/images/0.200/image1.jpg`

Fit Both with Fith Strategy = Contain  
`/images/200.200.contain/image1.jpg`
