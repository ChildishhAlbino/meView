
import Window from '../modules/Window.js'
import {ELEMENTS} from '../../config.json'

export default class View {
  constructor() {
    this.view = document.getElementById(ELEMENTS.view)
    this.autoheight = document.getElementById(ELEMENTS.autoheight)
    this._initEventListeners()
  }

  _initEventListeners() {
    document.body.ondblclick = () => {
      Window.setFullscreen()
    }
  }

  show(mediafile) {
    if(this.view.hasChildNodes()) {
      this.view.removeChild(this.view.firstChild)
    }
    if(mediafile) {
      let elem = mediafile.element
      elem.mediafile = mediafile
      this.view.appendChild(elem)
    }
  }

  showError(message) {
    if(this.view.hasChildNodes()) {
      this.view.removeChild(this.view.firstChild)
    }
    let errElement = document.createElement('div')
    errElement.classList.add('message')
    errElement.innerHTML = `<div>${message}</div>`
    this.view.appendChild(errElement)
  }
}
