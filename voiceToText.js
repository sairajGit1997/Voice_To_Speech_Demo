const recordButton = document.getElementById('recordButton');
const transcriptionTextarea = document.getElementById('text_converter');

recordButton.addEventListener('click', startRecording);

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);

                // Send the audio data to the backend
                sendAudioToBackend(audioBlob);
            };

            // Record for 15 seconds
            mediaRecorder.start();
            setTimeout(() => {
                mediaRecorder.stop();
            }, 3000);
        })
        .catch((error) => {
            console.error('Error accessing microphone:', error);
        });
}

function sendAudioToBackend(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');

    fetch('/transcribe_audio/', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            transcriptionTextarea.value = data.transcription;
        })
        .catch(error => {
            console.error('Error transcribing audio:', error);
        });
}



// recordButton.addEventListener('click', function(){
//     var speech = true;
//     window.SpeechRecognition = window.webkitSpeechRecognition;
//     const recognition = new SpeechRecognition();
//     recognition.interimResults = true;

//     recognition.addEventListener('result', e=> {
//         const transcript = Array.from(e.results)
//         .map(result => result[0])
//         .map(result => result.transcript)

//         text_converter.innerHTML = transcript;
//     })

//     if(speech == true) {
//         recognition.start();
//     }
// })