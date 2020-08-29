
let players = {};
let rows = document.querySelectorAll('.drum-row');
let index = 0;

let playBtn = document.getElementById('play-btn'),
    pauseBtn = document.getElementById('pause-btn'),
    stopBtn = document.getElementById('stop-btn');

window.onload = () => {
    playBtn = document.getElementById('play-btn'),
    pauseBtn = document.getElementById('pause-btn'),
    stopBtn = document.getElementById('stop-btn');
    rows = document.querySelectorAll('.drum-row');
    Tone.Transport.bpm.value = 140;

    //load default kit
    btn = document.getElementById('kit-select-btn');
    loadKit(btn);
}

function loadKit(btn) {
    const kit = document.getElementById('kits').value;
    const addBtn = document.getElementById('add-instr-btn');
    const instrSelect = document.getElementById('instrument-select');
    const machineRows = document.getElementsByClassName('machine-row');
    const machineRow = machineRows[0];
    const rowParent = machineRow.parentNode;
    const info = machineRow.getElementsByClassName('instr-info-box')[0];
    const name = info.getElementsByClassName('name')[0];
    const drumRow = machineRow.getElementsByClassName('drum-row')[0];

    instrSelect.classList.add('is-loading');
    addBtn.classList.add('is-loading');
    btn.classList.add('is-loading');
    // clear all existing rows
    for (i = machineRows.length; i > 1; i--) {
        rowParent.removeChild(rowParent.lastChild);
    };

    fetch(('load_kit/' + kit)
    ).then(response => {
        return response.json();
    }).then(data => {
        let options = ['<option id="instr-none" value="none">Select an instrument...</option>',];
        instruments = data.instruments;
        instruments.forEach((instrument) => {
            let player = new Tone.Player(instrument.path).toDestination();
            players[instrument.name] = {
                'path': instrument.path,
                'player': player,
                'pattern': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            };
            options.push('<option id="instr-'+ instrument.name +'" value="'+ instrument.name +'">'+ instrument.name +'</option>');
        });
        instrSelect.innerHTML = options.join('')
        info.setAttribute('data-instr', instruments[0].name);
        name.innerText = instruments[0].name;
        drumRow.setAttribute('data-instr', instruments[0].name);
        btn.classList.remove('is-loading');
        addBtn.classList.remove('is-loading');
        instrSelect.classList.remove('is-loading');
        return null;
    });
}


// UPDATE: there is a problem in chrome with starting audio context
//  before a user gesture. This fixes it.
document.documentElement.addEventListener('mousedown', () => {
  if (Tone.context.state !== 'running') Tone.context.resume();
});

function addRow() {
    const selector = document.getElementById('instrument-select');
    const selection = selector.value;
    if (selection === "none") return; // stop function if default option is selected
    const machineRow = document.getElementsByClassName('machine-row')[0];
    const machineRowClone = machineRow.cloneNode(true);
    const info = machineRowClone.getElementsByClassName('instr-info-box')[0];
    const name = info.getElementsByClassName('name')[0];
    const drumRow = machineRowClone.getElementsByClassName('drum-row')[0];
    const instrumentOption = document.getElementById('instr-' + selection);

    machineRowClone.classList.remove('hidden');
    info.setAttribute('data-instr', selection);
    name.innerText = selection;
    drumRow.setAttribute('data-instr', selection);

    machineRow.parentNode.append(machineRowClone);
    instrumentOption.setAttribute('disabled', true); // disable option to prevent copies of players
    selector.selectedIndex = 0;
    // restart transport to play added row
    stopPattern();
}

function muteInstr(btn) {
    const icon = btn.getElementsByTagName('svg')[0];
    const instrument = btn.parentNode.parentNode.parentNode.getAttribute('data-instr');
    const player = players[instrument].player;
    btn.classList.add('is-loading');
    if (player.mute === true) {
        player.mute = false;
    } else {
        player.mute = true;
    };
    btn.classList.toggle('is-dark');
    btn.classList.toggle('is-light');
    if (icon.getAttribute('data-icon') === 'volume-up') {
        icon.setAttribute('data-icon', 'volume-mute');
    } else {
        icon.setAttribute('data-icon', 'volume-up');
    };
    btn.classList.remove('is-loading');
}

function moveAddPanel(btn) {
    const icon = btn.getElementsByTagName('svg')[0];
    const panel = document.getElementById('add-instr-panel');
    const label = document.getElementsByClassName('add-instr-label')[0];

    panel.classList.toggle('hidden');
    label.classList.toggle('hidden');
    btn.classList.toggle('is-light');
    btn.classList.toggle('is-dark');
    if (icon.getAttribute('data-icon') === 'plus') {
        icon.setAttribute('data-icon', 'times')
    } else {
        icon.setAttribute('data-icon', 'plus')
    };
}

function movePanel(btn) {
    const icon = btn.getElementsByTagName('svg')[0];
    const controls = btn.previousElementSibling;
    const name = controls.previousElementSibling;

    controls.classList.toggle('hidden');
    name.classList.toggle('hidden');
    if (icon.getAttribute('data-icon') === 'angle-right') {
        icon.setAttribute('data-icon', 'angle-left');
    } else {
        icon.setAttribute('data-icon', 'angle-right');
    };
}

function selectPad(pad){
    instrument = pad.parentNode.getAttribute('data-instr');
    if (pad.getAttribute('data-selected') === "0") {
        pad.setAttribute('data-selected', "1");
        pad.classList.add('selected');
    } else {
        pad.setAttribute('data-selected', "0");
        pad.classList.remove("selected");
    }
}

function changeBpm(slider) {
    let info = document.getElementById('bpm');
    let bpm = slider.value;
    info.innerText = bpm;
    Tone.Transport.bpm.rampTo(bpm, 0.1);
}

function startPattern() {
    rows = document.querySelectorAll('.drum-row');
    pauseBtn.removeAttribute('disabled');
    stopBtn.removeAttribute('disabled');
    playBtn.setAttribute('disabled', true);

    Tone.Transport.scheduleRepeat(repeat, '8n');
    Tone.Transport.start();
}

function pausePattern() {
    playBtn.removeAttribute('disabled');
    stopBtn.removeAttribute('disabled');
    pauseBtn.setAttribute('disabled', true);
    
    Tone.Transport.pause();
    Tone.Transport.cancel();
    
}

function stopPattern() {
    playBtn.removeAttribute('disabled');
    pauseBtn.removeAttribute('disabled');
    stopBtn.setAttribute('disabled', true);
    

    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.seconds = 0;
    index = 0;
    let lit = document.getElementsByClassName('highlighted');
    for (let i = 0; i < lit.length; i++) {
        lit[i].classList.remove('highlighted');
    };
}

function repeat(time) {
  let step = index % 16;
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i],
        pad = row.querySelector(`div:nth-child(${step + 1})`),
        previous = pad.previousElementSibling;
        last = row.querySelector(`div:last-child`);
        instrName = row.getAttribute('data-instr'),
        player = players[instrName].player,
        isSelected = (pad.getAttribute('data-selected') === "1" );
    if (previous !== null) {
        previous.classList.remove('highlighted');
        pad.classList.add('highlighted');
    } else {
        last.classList.remove('highlighted');
        pad.classList.add('highlighted');
    };
    
    if (isSelected) player.start(time);
  }
  index++;

}


document.addEventListener('DOMContentLoaded', () => {

    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {

        // Add a click event on each of them
        $navbarBurgers.forEach(el => {
            el.addEventListener('click', () => {

                // Get the target from the "data-target" attribute
                const target = el.dataset.target;
                const $target = document.getElementById(target);

                // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
                el.classList.toggle('is-active');
                $target.classList.toggle('is-active');

            });
        });
    }

});


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