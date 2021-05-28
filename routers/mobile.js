const express = require('express')
const router = new express.Router()
const sharp = require('sharp')
const fs = require('fs');
const path = require('path')
const formidable = require('formidable');
const faceapi = require('face-api.js')

const multer = require('multer')
var storage = multer.memoryStorage()    //store buffer in MemoryStorage

/* Uploaded avatar store in "/avatar" */
const upload = multer({
    dest: 'temp',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload: JPEG, PNG, JPG!'))
        }

        cb(undefined, true)
    },
    storage: storage
})

/* Upload Avatar */
// router.post('/mobile/image', upload.single('image'), async (req, res) => {
//     res.send('Uploaded!')
// }, (error, req, res, next) => {
//     res.status(400).send({
//         error: error.message
//     })
// })

router.post('/mobile/image/:id', (req, res, next) => {

    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {

        var oldPath = files.image.path;
        var folderPath = path.join(__dirname, '../temp') + '/' + req.params.id
        var rawData = fs.readFileSync(oldPath)

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        let nextIdx = 0;

        fs.readdir(folderPath, (err, files) => {
            console.log(files.length)
            nextIdx = files.length + 1
        });

        var newPath = path.join(folderPath, nextIdx + '.jpg')

        fs.writeFile(newPath, rawData, function (err) {
            if (err) console.log(err)
            return res.send("Successfully uploaded")
        })
    })
});


router.get('/web/getLabeledDescriptor', async (req, res) => {
    // Load model
    console.log('1');
    // await faceapi.nets.faceRecognitionNet.loadFromUri("../models");
    // await faceapi.nets.faceLandmark68Net.loadFromUri("../models");

    await faceapi.nets.ssdMobilenetv1.loadFromUri('../public/models');
    await faceapi.nets.tinyFaceDetector.loadFromUri('../public/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('../public/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('../public/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('../public/models');
    // console.log('2')
    // // Detect Face
    // const input = document.getElementById("myImg");

    // const result = await faceapi
    //   .detectSingleFace(input, new faceapi.SsdMobilenetv1Options())
    //   .withFaceLandmarks()
    //   .withFaceDescriptor();

    //   console.log('3')
    // const displaySize = { width: input.width, height: input.height };
    // // resize the overlay canvas to the input dimensions
    // const canvas = document.getElementById("myCanvas");
    // faceapi.matchDimensions(canvas, displaySize);
    // const resizedDetections = faceapi.resizeResults(result, displaySize);
    // console.log(resizedDetections);

    /**
     * Real time face detection
     */

    // Recognize Face
    // let labeledFaceDescriptors = JSON.parse(localStorage.getItem('labeledFaceDescriptors'));
    // console.log('1', labeledFaceDescriptors);
    // if (!labeledFaceDescriptors){
    const labeledFaceDescriptors = await detectAllLabeledFaces();
    // }
    console.log('2', labeledFaceDescriptors);
    // localStorage.setItem('labeledFaceDescriptors', JSON.stringify(labeledFaceDescriptors))


    res.send({ data: labeledFaceDescriptors })

    /**
     * End
     */
})

async function detectAllLabeledFaces() {
    const labels = ['Nancy', 'Yeonwoo', 'Sader', 'MaiCuong'];

    // const parentFolder = '../public/images';

    return Promise.all(
        labels.map(async (label) => {
            const descriptions = [];
            for (let i = 1; i <= 2; i++) {

                // fs.readdir(parentFolder + '/' + label, (err, files) => {
                //     files.forEach(async file => {
                // console.log('file: ', file);
                const img = await faceapi.fetchImage(`../public/images/${label}/${i}.jpg`);
                const detection = await faceapi
                    .detectSingleFace(img)
                    .withFaceLandmarks()
                    .withFaceDescriptor();
                descriptions.push(detection.descriptor);
                // })
                // })
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    );
}

module.exports = router;
