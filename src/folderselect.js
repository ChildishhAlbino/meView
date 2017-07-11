import {remote, ipcRenderer} from 'electron'

import {DirectoryTraverser} from './modules/DirectoryTraverser.js'

import {supportedArchivesFormats} from '../config.json'

let travis
const curDir = document.createElement('option')
curDir.value = '.'
curDir.innerText = '. (Current Directory)'
const parDir = document.createElement('option')
parDir.value = '..'
parDir.innerText = '.. (Parent Directory)'

const selector = document.getElementById('folderselect')
const cwdText = document.getElementById('cwd')
const recursiveButton = document.getElementById('recursive')

const openButton = document.getElementById('btnOpen')
const cancelButton = document.getElementById('btnCancel')


ipcRenderer.on('cwd', (event, currentWorkingDir) => {
  travis = new DirectoryTraverser(currentWorkingDir, {fileFilter: supportedArchivesFormats})
  // cwdText.value = cwd
  travis.cd('.')
    .then(({cwd, files, previous, file}) => {
      cwdText.value = cwd
      updateSelector(cwd, files, previous)
    })
})


function updateSelector(cwd, files, previous) {
  while (selector.firstChild) {
    selector.removeChild(selector.firstChild)
  }
  selector.appendChild(curDir)
  selector.appendChild(parDir)
  let selected = false
  files.forEach((file) => {
    let opt = document.createElement('option')
    opt.value = opt.innerText = file
    if(file === previous) {
      selected = true
      opt.selected = 'selected'
    }
    selector.appendChild(opt)
  })
  if(!selected) {
    curDir.selected = 'selected'
  }
}

selector.onkeyup = (e) => {
  let key = e.which
  // Left-Arrow
  if(key === 37) {
    travis.cd('..')
      .then(({cwd, files, previous, file}) => {
        // console.log({cwd, files, previous})
        updateSelector(cwd, files, previous)
      })
  } else if(key === 39) {
    let dirname = selector.options[selector.selectedIndex].value
    travis.cd(dirname)
      .then(({cwd, files, previous, file}) => {
        // console.log({cwd, files, previous})
        if(travis.dirname === previous || e.shiftKey || file) {
          // Shift+Right-Arrow => Open folder recrusively
          open(travis.cwd, e.shiftKey)
        } else {
          updateSelector(cwd, files, previous)
        }
      })
  }
}

selector.onkeypress = (e) => {
  let key = e.which
  // Return or Enter
  if(key === 13) {
    let dirname = selector.options[selector.selectedIndex].value
    travis.cd(dirname)
      .then(({cwd, files, previous, file}) => {
        if(travis.dirname === previous || event.ctrlKey  || file) {
          open(travis.cwd, e.shiftKey)
        } else {
          updateSelector(cwd, files, previous)
        }
      })
  }
}

// close window without chaning cwd, if ESC key was pressed
document.onkeyup = (e) => {
  if (e.keyCode === 27) { // 27 = ESC
    remote.getCurrentWindow().destroy()
  }
}

function open(path, recursive) {
  if(!recursive) {
    recursive = recursiveButton.checked
  }
  ipcRenderer.send('folderBrowser', {
    filepath: path,
    recursive: recursive
  }) // sendSync will block destroy()
  remote.getCurrentWindow().destroy()
}

selector.ondblclick = (e) => {
  if(e.target.value) {
    let prev = travis.dirname
    travis.cd(e.target.value)
      .then(({cwd, files, previous, file}) => {
        // console.log({cwd, files, previous})
        if(travis.dirname === previous || e.ctrlKey || file) {
          open(travis.cwd, e.shiftKey)
        } else {
          updateSelector(cwd, files, previous)
        }
      })
  }
}


openButton.onclick = (e) => {
  let dirname = selector.options[selector.selectedIndex].value

  travis.cd(dirname)
    .then(({cwd, files, previous, file}) => {
      if(travis.dirname === previous || event.ctrlKey) {
        open(travis.cwd, e.shiftKey)
      } else {
        updateSelector(cwd, files, previous)
      }
    })
}

// close window without new cwd if cancel button is clicked
cancelButton.onclick = () => {
  remote.getCurrentWindow().destroy()
}