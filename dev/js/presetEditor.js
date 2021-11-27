/************************
 * Point Presets
 * 
 * Development from:
 * Nov 16 - Nov 18
 ************************/
var psc = $('presetSelectChoice')
var presetEditorPages = [`<div><h1>Preset list</h1>${getPresetListHTML()}<button onclick="addPreset()">Add Preset...</button></div>`,]

function presetEditorPage(index) {
    if (document.querySelector('.modal')) {
        removeModal();
        setTimeout(function () {
            showModal(index)
        }, 500)
        return
    }
    showModal(index)
}

function showModal(index) {
    let modal = document.createElement('DIV')
    modal.classList.add("modal")
    modal.setAttribute('aria-modal', 'true')
    modal.innerHTML = `<p id="close" onclick="removeModal()">&times;</p>` + presetEditorPages[index]
    let o = $('modalOverlay')
    o.appendChild(modal)
    o.classList.add('showing')
    setTimeout(function () {
        modal.classList.add("showing")
    })
    onkeydown = e => {
        if (e.key == 'Escape') {
            removeModal();
        }
    }
}

function removeModal() {
    document.querySelector('.modal').classList.remove('showing');
    document.querySelector('#modalOverlay').classList.remove('showing');
    setTimeout(() => {
        document.querySelector('.modal').remove();
    }, 500);
    onkeydown = () => { };
}

function getPresetListHTML() {
    let res = `<div id="presetChoice">
      `
    for (let i = 0; i < saveData.presets.length; i++) {
        res += `	<div class="preset"><h1>${saveData.presets[i].name}</h1><button onclick="removePreset(${i});toast('Preset ${saveData.presets[i].name} successfully deleted','success');this.parentElement.remove()">Delete</button><button onclick="editPresetData(${i})">Edit Data</button><button onclick="changePresetName(${i});">Rename</button></div>
          `
    }
    res += `
      </div>`
    return res
}

function getPresetSelectHTML() {
    let res = `<select id="presetChoice">
      `
    for (let i = 0; i < saveData.presets.length; i++) {
        selected = ''
        if (saveData.presets[i].data == saveData.data) selected = 'selected'
        res += `<option value="${i}" ${selected}>${saveData.presets[i].name}</option>
          `
    }
    res += `
      </select>`
    return res
}

function removePreset(index) {
    saveData.presets.splice(index, 1);
    updatePresetPage()
    psc.innerHTML = getPresetSelectHTML()
}
function updatePresetPage() {
    presetEditorPages = [`
    <p id="close" onclick="removeModal()">&times;</p><div><h1>Preset list</h1>${getPresetListHTML()}</div>
`]
}
function changePresetName(index) {
    let newName = prompt('New preset name:')
    saveData.presets[index].name = newName
    $('presetChoice').remove()
    document.querySelector('.modal').innerHTML += getPresetListHTML()
    updatePresetPage()
    psc.innerHTML = getPresetSelectHTML()
}


function editPresetData(index) {
    presetEditorPages[1] = `<p id="close" onclick="removeModal()">&times;</p><div><h1>Editing data for ${saveData.presets[index].name}</h1><textarea style="width:200px; height:300px">${JSON.stringify(saveData.presets[index].data).replace(/\]\,/g, '],&#13;&#10;').replace(/\[\[/g, '[&#13;&#10;[').replace(/\]\]/g, ']&#13;&#10;]')}</textarea><button onclick="savePresetData(${index},this.previousElementSibling)">Save</button>`
    presetEditorPage(1)
    psc.innerHTML = getPresetSelectHTML()
}

function savePresetData(index, textarea) {
    saveData.presets[index].data = JSON.parse(textarea.value.replace('&#13;&#10;', ''))
    toast('Successfully edited preset ' + saveData.presets[index].name, 'success')
}

function addPreset() {
    presetEditorPages[2] = `<p id="close" onclick="removeModal()">&times;</p>
      <div>
      <button onclick="presetEditorPage(0)">Back</button>
      <h1>New preset</h1>
      <p>Name:</p>
      <input type="text" id="presetName" placeholder="Name"><br>
      <p>Data:</p>
      <textarea  id="presetData" style="width:300px; height:200px">[
      [0, 0],
      [0, 0]
  ]</textarea><br>
        <p>View options:</p>
        <div id="presetViewOptions">
            <input type="checkbox" id="plines" checked><label for="ppoints">Show lines</label>
            <input type="checkbox" id="pmidpoints" checked><label for="pmidpoints">Show midpoints</label>
            <input type="checkbox" id="ptrail" checked><label for="ptrail">Show trail</label>
            <input type="checkbox" id="pcontrolpoints" checked><label for="pcontrolpoints">Show control points</label>
            <input type="checkbox" id="pfinalmidpoints" checked><label for="pfinalmidpoints">Show final midpoints</label>
        </div>
      <p style="width:300px">Each point's x & y coordinates is wrapped in brackets []. Example: [100, 130]. This will make a point at x 100 and y 130.</p>
      <br>
      <button onclick="parseAndAddPreset($('presetName'),$('presetData'),$('presetViewOptions'))">Create preset</button>`
    presetEditorPage(2)
}

function parseAndAddPreset(name, data, viewOpts) {
    let newInd = saveData.presets.length
    saveData.presets[newInd] = {}
    saveData.presets[newInd].name = name.value
    saveData.presets[newInd].show = []
    try {
        var newData = JSON.parse(data.value)
    } catch (err) {
        toast('Invalid data structure <br><small style="font-weight:200">' + error + '</small>', 'error')
        return
    }
    if (newData.length < 2) {
        toast('Please add more than 1 point', 'error')
        return
    }
    for (let i = 0; i < newData.length; i++) {
        if (newData[i].length != 2) {
            toast('Point ' + (i + 1) + ' does not have proper coordinates.', 'error')
        }
    }
    for (let i = 0; i < viewOpts.children.length; i++) {
        if (viewOpts.children[i].checked) {
            saveData.presets[newInd].show[i] = true
        } else saveData.presets[newInd].show[i] = false
    }
    saveData.presets[newInd].data = JSON.parse(data.value)
    psc.innerHTML = getPresetSelectHTML()
    toast('Added preset ' + name.value + ' successfully', 'success')
    save.set()
    return presetEditorPage(0)
}
psc.oninput = () => {
    loadPreset(parseInt(psc.value))
    save.set()
}
function loadPreset(number) {
    let toupdate = saveData.presets[number]
    saveData.data = toupdate.data
    let newShow
    if (toupdate.show === null) {
        newShow = {
            "lines": true,
            "midpoints": true,
            "trail": true,
            "controlpoints": true,
            "finalmidpoint": true
        }
    } else newShow = toupdate.show
    saveData.settings.show = newShow
    replay()
    save.set()
    updateCheckboxes()
}
$('presetSelectChoice').innerHTML = getPresetSelectHTML()