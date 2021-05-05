(async () => {
    // Load model
    console.log('1')
    // await faceapi.nets.faceRecognitionNet.loadFromUri("../models");
    // await faceapi.nets.faceLandmark68Net.loadFromUri("../models");
    
    
    await faceapi.nets.ssdMobilenetv1.loadFromUri("../models");
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    await faceapi.nets.faceExpressionNet.loadFromUri('/models')
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

    startVideo();
    const video = document.getElementById('video')
    
    
    video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)
        const displaySize = { width: video.width, height: video.height }
        faceapi.matchDimensions(canvas, displaySize)

        

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors().withFaceExpressions()
            // console.log(detections)
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            // faceapi.draw.drawDetections(canvas, resizedDetections)
            // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
            // faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

            

            const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.7);
            if (detections) {
                // detections.forEach(fd => {
                //     const bestMatch = faceMatcher.findBestMatch(fd.descriptor);
                //     // const box = resizedDetections.detection.box;
                //     // const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.label });
                //     // drawBox.draw(canvas);
                //     console.log(bestMatch.toString())
                    
                // })
                const results = detections.map(fd => faceMatcher.findBestMatch(fd.descriptor))

                results.forEach((bestMatch, i) => {
                    const box = resizedDetections[i].detection.box
                    const text = bestMatch.toString()
                    const drawBox = new faceapi.draw.DrawBox(box, { label: text })
                    drawBox.draw(canvas)
                  })
            }
                }, 100)
            })

    /**
     * End
     */
  
    
})();

function startVideo() {
    navigator.getUserMedia(
      { video: {} },
      stream => video.srcObject = stream,
      err => console.error(err)
    )
  }
  
async function detectAllLabeledFaces() {
    const labels = ["Nancy", "Yeonwoo", "Sader"];
    return Promise.all(
        labels.map(async label => {
        const descriptions = [];
        for (let i = 1; i <= 2; i++) {
            const img = await faceapi.fetchImage(
            `./images/${label}/${i}.jpg`
            );
            const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
            descriptions.push(detection.descriptor);
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    );
}

async function detectNancyFace() {
    const label = "Nancy";
    const numberImage = 5;
    const descriptions = [];
    for (let i = 1; i <= numberImage; i++) {
        const img = await faceapi.fetchImage(
        `./images/Nancy/${i}.jpg`
        );
        const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
        descriptions.push(detection.descriptor);
    }
    return new faceapi.LabeledFaceDescriptors(label, descriptions);
}
  