// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "./model/";

let model, webcam, labelContainer, maxPredictions;

document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("container") !== null)
        init();
});

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(300, 300, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    webcam.canvas.classList.add("webcam");
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    let guessNumber = -1, guessProbability = 0.0;
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
        prediction[i].className +
        ": " +
        prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;

        if (guessProbability < prediction[i].probability) {
            guessProbability = prediction[i].probability;
            guessNumber = i+1;
        }
    }

    await Promise.all([
        setGuessNumber(guessNumber),
        setGuessImage(guessNumber)
    ]);
}

function setGuessNumber(guessNumber) 
{
    var guessSpan = document.getElementById("text-result");
    if (guessSpan == null) return;

    if (guessNumber < 0 || guessNumber > maxPredictions) {
        guessSpan.innerHTML = "No Guess";
        return;
    }

    guessSpan.innerHTML = guessNumber;
} 

function setGuessImage(guessNumber){
    var imgDiv = document.getElementById("img-result");
    if (imgDiv == null) return;

    var newImg = guessNumberToImage(guessNumber);
    if (newImg.src === imgDiv.childNodes[0].src)
        return;
    imgDiv.innerHTML = ""; // Clear previous image
    imgDiv.appendChild(newImg);
//     var newImgString = guessNumberToImage(guessNumber);
//     if (newImgString === "" || newImgString === imgDiv.innerHTML)
//         return;
//     imgDiv.innerHTML = newImgString;
}

function guessNumberToImage(guessNumber) {
    if (guessNumber < 0 || guessNumber > maxPredictions) return "";
    var img = document.createElement("img");
    img.classList.add("guess-image");
    img.src = `./assets/numbers/${guessNumber}.png`;
    img.alt = "Guess Image";
    return img;
    // return `<img class="guess-image" src="./assets/numbers/${guessNumber}.png" alt="Guess Image">`;
}