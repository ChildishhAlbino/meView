import {join} from 'path'

import View from '../controllers/View.js'
import Counter from '../controllers/Counter.js'
import Filename from '../controllers/Filename.js'
import MediaList from './MediaList.js'
import UserSettings from './UserSettings.js'
import Window from './Window.js'
import {ELEMENTS} from '../../config.json'



let instance
class Viewer  {
  constructor() {
    if(!instance) {
      this.view = new View()
      this.counter = new Counter()
      this.filename = new Filename()
      this.mediafiles = new MediaList()
      this._initStatusbarListeners()
      this._initMediaListListeners()
      instance = this
    }
    return instance
  }

  _initStatusbarListeners() {
    this.counter.on('index.change', (idx) => {
      this.goto(idx)
    })
  }

  _initMediaListListeners() {
    this.mediafiles.on('file.start', (mf, idx) => {
      this.view.show(mf)
      // I can't tell why this super short timeout works, but it isn't there I get
      // "The play() request was interrupted by a call to pause()"
      setTimeout(() => {
        this._playcurrent(mf)
      }, 1)
      this.filename.name = join(this.mediafiles.root, mf.name)
      this.counter.updateCurrent(idx)
    })
    this.mediafiles.on('file.added', (mf, len) => {
      this.counter.updateMax(len)
    })

    this.mediafiles.on('file.current', (mf, idx) => {
      this.view.show(mf)  
      this._playcurrent(mf)
      this.filename.name = join(this.mediafiles.root, mf.name)
      this.counter.updateCurrent(idx)
    })

    this.mediafiles.on('endoflist', (last) => {
      Window.showFolderSelector()
    })
  }

  

  get currentFilepath() {
    return join(this.mediafiles.root, this.mediafiles.current.name)
  }

  get currentRoot() {
    return this.mediafiles.root
  }

  open(fileorpath, recursive = false) {
    return new Promise((resolve, reject) => {
      let oldcurrent = this.mediafiles.current
      this.mediafiles.open(fileorpath, {recursive})
        .then(() => {
          this._stopcurrent(oldcurrent)
          resolve()
        })
        .catch(() => {
          reject()
        })
    })
  }

  slideshowStart(timeout, shuffled) {
    return new Promise((resolve, reject) => {
      if(!this.mediafiles.opened) {
        reject()
      }
      if(!timeout) {
        timeout = UserSettings.slideshowInterval
      }
      this.mediafiles.slideshowStart(timeout, shuffled)
      resolve()
    })
  }

  slideshowStop() {
    this.mediafiles.slideshowStop()
  }

  slideshowTogglePlayPause() {
    this.mediafiles.slideshowTogglePlayPause()
  }

  shuffle() {
    this.mediafiles.shuffle()
  }

  random() {
    this.mediafiles.random()
  }

  play() {
    this.mediafiles.current.play()
  }

  pause() {
    this.mediafiles.current.pause()
  }

  stop() {
    this.mediafiles.current.stop()
  }

  forward() {
    this.mediafiles.current.forward(UserSettings.videoSkipInterval)
  }

  rewind() {
    this.mediafiles.current.rewind(UserSettings.videoSkipInterval)
  }

  togglePlayPause() {
    if(this.mediafiles.current) {
      this.mediafiles.current.togglePlayPause()
    }
  }

  next() {
    this._stopcurrent()
    this.mediafiles.next
  }

  previous() {
    this._stopcurrent()
    this.mediafiles.previous
  }

  first() {
    this._stopcurrent()
    this.mediafiles.first
  }

  last() {
    this._stopcurrent()
    let mf = this.mediafiles.last
  }

  goto(index) {
    this._stopcurrent()
    this.mediafiles.goto(index)
  }

  _stopcurrent(current) {
    current = current || this.mediafiles.current
    if(current) {
      if(current.isVideo()) {
        current.stop()
      }
    }
  }
  _playcurrent(current) {
    current = current || this.mediafiles.current
    if(current) {
      if(current.isVideo() && UserSettings.videoAutoplay) {
        current.stop()
        current.play()
      }
    }
  }
}

export default new Viewer()
