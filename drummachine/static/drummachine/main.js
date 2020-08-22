
    // play as soon as the buffer is loaded
function loadSound() {
    players.forEach((instrument) => {
        instrument.player.restart();
    })
    Tone.start();
};

let players = []

function loadKit(btn) {
    const kit = document.getElementById('kits').value;
    
    btn.setAttribute('disabled', true);
    fetch(('load_kit/' + kit)
    ).then(response => {
        return response.json();
    }).then(data => {
        instruments = data.instruments;
        instruments.forEach((instrument) => {
            let player = new Tone.Player(instrument.path).toDestination();
            players.push({'name': instrument.name, "player": player});
        })
        console.log(instruments);
        btn.removeAttribute('disabled');
        return null;
    });
}


// UPDATE: there is a problem in chrome with starting audio context
//  before a user gesture. This fixes it.
document.documentElement.addEventListener('mousedown', () => {
  if (Tone.context.state !== 'running') Tone.context.resume();
});


const gain = new Tone.Gain(0.6);
gain.toDestination();

synths.forEach(synth => synth.connect(gain));

const rows = document.body.querySelectorAll('div > div');

let index = 0;

Tone.Transport.scheduleRepeat(repeat, '8n');
Tone.Transport.start();

function repeat(time) {
  let step = index % 8;
  for (let i = 0; i < rows.length; i++) {
    let player = players[i].player,
        row = rows[i],
        input = row.querySelector(`input:nth-child(${step + 1})`);
    if (input.checked) player.start(time);
  }
  index++;
}


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}