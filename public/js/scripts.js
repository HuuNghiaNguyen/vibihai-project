(async () => {
  // Load model
  console.log('1');

  const MAX_UNKNOWN_COUNT = 20;
  let unknown_count = 0;
  /**
   * Init pubnub instance
   */
  const uuid = PubNub.generateUUID();

  const pubnub = new PubNub({
    publishKey: 'pub-c-a3d37452-ad21-4fa0-93a1-de4900faa04e',
    subscribeKey: 'sub-c-ad92f4ea-c08c-11eb-8415-662615fc053c',
    uuid,
  });

  await faceapi.nets.ssdMobilenetv1.loadFromUri('../models');
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  await faceapi.nets.faceExpressionNet.loadFromUri('/models');
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

  let response = await fetch('http://localhost:3002/web/getModel/', {
    method: 'GET',
  });

  response = await response.json();

  console.log('response: ', response);
  // }
  const labeledFaceDescriptors = response.model.map(
    ({ label, descriptors }) => {
      return new faceapi.LabeledFaceDescriptors(
        label,
        descriptors.map((arr) => {
          return new Float32Array(arr);
        })
      );
    }
  );

  console.log('labeledFaceDescriptors: ', labeledFaceDescriptors);

  // localStorage.setItem('labeledFaceDescriptors', JSON.stringify(labeledFaceDescriptors))

  await startVideo();
  const video = document.getElementById('video');

  // video.addEventListener('playing', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withFaceExpressions();
    // console.log(detections)
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    // faceapi.draw.drawDetections(canvas, resizedDetections)
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    // faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    if (detections) {
      // detections.forEach(fd => {
      //     const bestMatch = faceMatcher.findBestMatch(fd.descriptor);
      //     // const box = resizedDetections.detection.box;
      //     // const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.label });
      //     // drawBox.draw(canvas);
      //     console.log(bestMatch.toString())

      // })
      const results = detections.map((fd) =>
        faceMatcher.findBestMatch(fd.descriptor)
      );

      results.forEach((bestMatch, i) => {
        const box = resizedDetections[i].detection.box;
        const text = bestMatch.toString();
        console.log({ text });
        if (text.includes('unknown')) {
          unknown_count++;
        }
        console.log({ unknown_count });
        if (unknown_count > MAX_UNKNOWN_COUNT) {
          pubnub.publish({
            channel: 'ADRUINO',
            message: 1,
          });
          unknown_count = 0;
        }

        const drawBox = new faceapi.draw.DrawBox(box, { label: text });
        drawBox.draw(canvas);
      });
    }
  }, 100);
  // });

  /**
   * End
   */
})();

async function startVideo() {
  //   navigator.getUserMedia(
  //     { video: {} },
  //     (stream) => (video.srcObject = stream),
  //     (err) => console.error(err)
  //   );
  if (flvjs.isSupported()) {
    var videoElement = document.getElementById('video');
    var flvPlayer = flvjs.createPlayer({
      type: 'flv',
      isLive: true,
      url: 'http://localhost:8000/live/tinho.flv',
    });
    await flvPlayer.attachMediaElement(videoElement);
    await flvPlayer.load();
    await flvPlayer.play();
  }
}

// async function detectAllLabeledFaces() {
//     const labels = ['Nancy', 'Yeonwoo', 'Sader', 'MaiCuong'];

//     const parentFolder = './images';

//     return Promise.all(
//         labels.map(async (label) => {
//             const descriptions = [];
//             for (let i = 1; i <= 2; i++) {

//                 // fs.readdir(parentFolder + '/' + label, (err, files) => {
//                 //     files.forEach(async file => {
//                 // console.log('file: ', file);
//                 const img = await faceapi.fetchImage(`./images/${label}/${i}.jpg`);
//                 const detection = await faceapi
//                     .detectSingleFace(img)
//                     .withFaceLandmarks()
//                     .withFaceDescriptor();
//                 descriptions.push(detection.descriptor);
//                 // })
//                 // })
//             }
//             return new faceapi.LabeledFaceDescriptors(label, descriptions);
//         })
//     );
// }

// async function detectNancyFace() {
//     const label = 'Nancy';
//     const numberImage = 5;
//     const descriptions = [];
//     for (let i = 1; i <= numberImage; i++) {
//         const img = await faceapi.fetchImage(`./images/Nancy/${i}.jpg`);
//         const detection = await faceapi
//             .detectSingleFace(img)
//             .withFaceLandmarks()
//             .withFaceDescriptor();
//         descriptions.push(detection.descriptor);
//     }
//     return new faceapi.LabeledFaceDescriptors(label, descriptions);
// }
