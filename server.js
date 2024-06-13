const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.static('public'));
app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    const inputFilePath = req.file.path;
    const outputFilePath = `resized/${Date.now()}_${req.file.originalname}`;
    try {
        await sharp(inputFilePath)
            .resize(800, 800, { 
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .toFile(outputFilePath);
        fs.unlinkSync(inputFilePath);

        res.json({ file: outputFilePath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing image.' });
    }
});
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const file = path.join(__dirname, 'resized', filename);
    res.download(file);
});
const createDirectories = () => {
    const directories = ['uploads', 'resized'];
    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    });
};
createDirectories();
const PORT = 4000; 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});