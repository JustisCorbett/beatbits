const player = new Tone.Player("/load_sound").toDestination();
    // play as soon as the buffer is loaded
function loadSound() {
    Tone.start();
    player.start()
};