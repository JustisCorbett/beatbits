
let players = {};
let loadedKit = "";
let rows = document.querySelectorAll('.drum-row');
let index = 0;

let playBtn = document.getElementById('play-btn'),
    pauseBtn = document.getElementById('pause-btn'),
    stopBtn = document.getElementById('stop-btn');

//  there is a problem in chrome with starting audio context
//  before a user gesture. This fixes it.
document.documentElement.addEventListener('mousedown', () => {
    if (Tone.context.state !== 'running') Tone.context.resume();
  });

// load rack and kit
window.onload = async () => {
    playBtn = document.getElementById('play-btn'),
    pauseBtn = document.getElementById('pause-btn'),
    stopBtn = document.getElementById('stop-btn');
    rows = document.querySelectorAll('.drum-row');
    Tone.Transport.bpm.value = 140;
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const savingText = document.getElementById('saving-text');

    if (overlay.classList.contains('hidden') === true) overlay.classList.remove('hidden');
    if (loadingText.classList.contains('hidden') === true) loadingText.classList.remove('hidden');
    if (savingText.classList.contains('hidden') === false) savingText.classList.add('hidden');

    let params = (new URL(document.location)).searchParams;

    if (params.has("user") && params.has("rack")) {
        // if there are url params load that rack
        console.log('load_bit_info' + params);
        fetch('load_bit_info?' + params)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw response.text();
            }
        }).then((json) => {
            buildRack(json).then(() => {
                overlay.classList.add('hidden');
            });
        }).catch((err) => {
            // if fetch fails, log error and load default kit
            console.log(err);
            let btn = document.getElementById('kit-select-btn');
            loadKit(btn).then(() => {
                overlay.classList.add('hidden');
            });
        });
    } else if (window.sessionStorage.getItem('anonSave') !== null) {
        // else if there is an anonymous session save load that rack
        let info = window.sessionStorage.getItem('anonSave');
        let rack = JSON.parse(info);
        buildRack(rack).then(() => {
            overlay.classList.add('hidden');
        });
    } else {
        // else load default kit
        let btn = document.getElementById('kit-select-btn');
        loadKit(btn).then(() => {
            overlay.classList.add('hidden');
        });
    }
    console.log('loadedbuild')
    
}

document.addEventListener("keydown", event => {
    if (event.isComposing || event.keyCode === 32) {
        console.log(Tone.Transport.state);
        if (Tone.Transport.state === "paused" || Tone.Transport.state === "stopped") {
            startPattern();
        } else {
            pausePattern();
        }
    }
});

async function buildRack(rack) {
    const btn = document.getElementById('kit-select-btn');
    const nameText = document.getElementById('name');

    document.getElementById('kits').value = rack.kit;
    nameText.innerText = rack.name;
    Tone.Transport.bpm.value = rack.bpm;
    await loadKit(btn).then(() => {
        // loop through each instrument in rack and add a row for it
        // then select pads for the instrument's pattern
        for (const [instrument, info] of Object.entries(rack.rack)) {
            let container = document.querySelector('[data-name="' + instrument + '"]');
            let addBtn = container.getElementsByClassName('add-instr')[0];
            addRow(addBtn);
            let addedRow = document.querySelector('.drum-row[data-instr="' + instrument + '"]');
            let pads = addedRow.getElementsByTagName('div');
            for (i = 0; i < info.pattern.length; i++) {
                if (info.pattern[i] === 1) {
                    selectPad(pads[i]);
                };
            };
        };
    })
    
}

async function loadKit(btn) {
    const kit = document.getElementById('kits').value;
    const machineRows = document.getElementsByClassName('machine-row');
    const machineRow = machineRows[0];
    const rowParent = machineRow.parentNode;
    const options = document.getElementsByClassName('instrument-select')
    const optionParent = document.getElementsByClassName('instrument-select')[0].parentNode;
    

    loadedKit = kit;
    // clear all existing rows
    for (i = machineRows.length; i > 1; i--) {
        rowParent.removeChild(rowParent.lastChild);
    };
    for (i = options.length; i > 1; i--) {
        optionParent.removeChild(optionParent.lastChild);
    }

    let response = await fetch(('load_kit/' + kit));
    if (response.ok) {
        let jsonData = await response.json();
        let instruments = jsonData.instruments;
        for await (const instrument of instruments) {
            let player = null//await new Tone.Player(instrument.path, () => {console.log('loadedbuffer')}).toDestination();
            players[instrument.name] = {
                'path': instrument.path,
                'player': player,
                'pattern': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            };
            let optionClone = document.getElementsByClassName('instrument-select')[0].cloneNode(true);
            let nameText = optionClone.getElementsByClassName('name')[0];
            optionClone.classList.remove('hidden');
            optionClone.setAttribute('data-name', instrument.name);
            nameText.innerText = instrument.name;
            optionParent.append(optionClone);
        };
    }
    
    return null;
}

function loadKitConfirm(btn) {
    if (confirm('Warning! This will clear all patterns! Continue?')) {
        loadKit(btn);
      } else {
        return null;
      }
}

function changeName() {
    const nameText = document.getElementById('name-input').value;
    let name = document.getElementById('name');
    let btn = document.getElementById('name-panel-button');
    if (nameText.length > 25 || nameText.length < 4) {
        alert('Name must be between 4 and 25 characters');
        return null;
    } else {
        name.innerText = nameText;
        moveNamePanel(btn)
    };
}
// TODO finish
function saveBit() {
    const csrftoken = getCookie('csrftoken');
    const bitName = document.getElementById('name').innerText;
    const bpm = Tone.Transport.bpm.value;
    const kit = loadedKit;
    const rows = document.querySelectorAll('.drum-row');
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const savingText = document.getElementById('saving-text');
    const feedbackEl = document.getElementById('feedback');
    let instruments = [];
    let rack = {};
    if (overlay.classList.contains('hidden') === true) overlay.classList.remove('hidden');
    if (loadingText.classList.contains('hidden') === false) loadingText.classList.add('hidden');
    if (savingText.classList.contains('hidden') === true) savingText.classList.remove('hidden');

    rows.forEach((row) => {
        let name = row.getAttribute('data-instr');
        if (name !== 'none') instruments.push(name);
    });
    instruments.forEach((instrument) => {
        rack[instrument] = {
            path: players[instrument].path,
            pattern: players[instrument].pattern,
        };
    });

    if (csrftoken === null) {
        saveBitToSession({
            bitName: bitName, 
            bpm: bpm, 
            kit: kit, 
            rack: rack
        });
    }
    fetch('save_bit', {
        method: 'POST',
        credentials: 'include',
        headers: new Headers ({
            "X-CSRFToken": csrftoken,
            'content-type': 'application/json'
        }),
        body: JSON.stringify({
            name: bitName,
            bpm: bpm,
            kit: kit,
            rack: rack,
        })
    }).then(response => {
        // if user is not logged in, save current bit to sessionstorage
        // and redirect to login
        if (response.status == 401) {
            saveBitToSession({
                bitName: bitName, 
                bpm: bpm, 
                kit: kit, 
                rack: rack
            });
        }
        if (response.ok) {
            return response.text().then((text) => {
                if (text) {
                    feedbackEl.classList.remove('hidden');
                    feedbackEl.classList.add('has-text-success');
                    feedbackEl.classList.remove('has-text-danger');
                    feedbackEl.innerText = text;
                } 
                overlay.classList.add('hidden');
            });
        } else {
            return response.text().then((text) => {
                feedbackEl.classList.remove('hidden');
                feedbackEl.classList.add('has-text-danger');
                feedbackEl.classList.remove('has-text-success');
                feedbackEl.innerText = text;
                overlay.classList.add('hidden');
            });
        }
    });
}

function saveBitToSession(context) {
    // Save current bit to session storage,
    // then redirect to login.
    sessionStorage.setItem('anonSave', JSON.stringify({
        name: context.bitName,
        bpm: context.bpm,
        kit: context.kit,
        rack: context.rack,
    }))
    window.location.href = "login";
    return null;
}

function changePitch(slider) {
    const instrumentName = slider.parentNode.parentNode.parentNode.getAttribute('data-instr');
    const player = players[instrumentName].player;
    const display = slider.nextElementSibling;

    player.playbackRate = slider.value;
    display.innerText = slider.value;
}

function changeVolume(slider) {
    const instrumentName = slider.parentNode.parentNode.parentNode.getAttribute('data-instr');
    const player = players[instrumentName].player;
    const display = slider.nextElementSibling;

    player.volume.value = slider.value;
    display.innerText = slider.value + 'db';
}

function removeInstr(btn) {
    const machineRow = btn.parentNode.parentNode.parentNode.parentNode;
    const instrument = machineRow.getAttribute('data-instr');
    const selector = document.querySelector('[data-name="' + instrument + '"]');
    const selectorBtn = selector.getElementsByClassName('button')[1];

    machineRow.remove();
    selectorBtn.removeAttribute('disabled');
    // restart transport to stop removed row from playing
    stopPattern();
}

// Load player buffer if instrument doesn't have one,
// then play sample.
async function playSample(btn) {
    const selection = btn.parentNode.parentNode.getAttribute('data-name');
    instrument = players[selection]
    let player = instrument.player;

    if (player === null) {
        btn.classList.add('is-loading');
        instrument.player = await new Tone.Player().toDestination();
        await instrument.player.load(instrument.path);
        btn.classList.remove('is-loading');
    } else {
        player.start();
    }
}

async function addRow(btn) {
    const selection = btn.parentNode.parentNode.getAttribute('data-name');
    const machineRow = document.getElementsByClassName('machine-row')[0];
    const machineRowClone = machineRow.cloneNode(true);
    const name = machineRowClone.getElementsByClassName('name')[0];
    const drumRow = machineRowClone.getElementsByClassName('drum-row')[0];
    // Make sure sample is loaded before adding.
    playSample(btn);

    machineRowClone.classList.remove('hidden');
    machineRowClone.setAttribute('data-instr', selection);
    name.innerText = selection;
    drumRow.setAttribute('data-instr', selection);

    machineRow.parentNode.append(machineRowClone);
    btn.setAttribute('disabled', true); // disable option to prevent copies of players
    // restart transport to play added row
    stopPattern();
}

function muteInstr(btn) {
    const icon = btn.getElementsByTagName('svg')[0];
    const instrument = btn.parentNode.parentNode.parentNode.parentNode.getAttribute('data-instr');
    const player = players[instrument].player;
    btn.classList.add('is-loading');
    if (player.mute === true) {
        player.mute = false;
    } else {
        player.mute = true;
    };
    btn.classList.toggle('is-dark');
    btn.classList.toggle('is-grey');
    if (icon.getAttribute('data-icon') === 'volume-up') {
        icon.setAttribute('data-icon', 'volume-mute');
    } else {
        icon.setAttribute('data-icon', 'volume-up');
    };
    btn.classList.remove('is-loading');
}

function moveNamePanel(btn) {
    const icon = btn.getElementsByTagName('svg')[0];
    const panel = document.getElementById('name-panel');
    const label = document.getElementsByClassName('name-label')[0];
    const input = document.getElementById('name-input');
    const name = document.getElementById('name').innerText;

    input.setAttribute('placeholder', name);
    panel.classList.toggle('hidden');
    label.classList.toggle('hidden');
    if (icon.getAttribute('data-icon') === 'plus') {
        icon.setAttribute('data-icon', 'times')
    } else {
        icon.setAttribute('data-icon', 'plus')
    };
}

function movePanel(btn) {
    const icon = btn.getElementsByTagName('svg')[0];
    const controls = btn.previousElementSibling;

    controls.classList.toggle('hidden');
    if (icon.getAttribute('data-icon') === 'angle-down') {
        icon.setAttribute('data-icon', 'angle-up');
    } else {
        icon.setAttribute('data-icon', 'angle-down');
    };
}

function selectPad(pad){
    let note = pad.getAttribute('data-i');
    let instrumentName = pad.parentNode.getAttribute('data-instr');
    let instrument = players[instrumentName];
    
    if (instrument.pattern[note] === 0) {
        instrument.pattern[note] = 1;
    } else {
        instrument.pattern[note] = 0;
    }

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
    // must use querySelectorAll because it returns a static list
    const lit = document.querySelectorAll(".highlighted");
    for (let i = 0; i < lit.length; i++) {
        lit[i].classList.remove('highlighted');
    };
}

function repeat(time) {
  let step = index % 16;
  // start iteration at 1 to ignore hidden template row
  for (let i = 1; i < rows.length; i++) {
    let row = rows[i],
        pads = row.getElementsByTagName('div'),
        pad = pads[step],
        previous = pads[(step - 1)],
        last = pads[(pads.length - 1)],
        instrName = row.getAttribute('data-instr'),
        pattern = players[instrName].pattern,
        player = players[instrName].player;
    if (previous !== undefined) {
        pad.classList.add('highlighted');
        previous.classList.remove('highlighted');
    } else {
        pad.classList.add('highlighted');
        last.classList.remove('highlighted');
    };
    if (pattern[step] == 1) player.start(time);
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