export const defaultVideoSettings = {
  'autoplay': true,
  'loop': true,
  'muted': true,  
}

export const skipValues = {
  '1s': 1,
  '5s': 5,
  '10s': 10,
  '30s': 30,
  '60s': 60,
}

export const imagesettings = {
  // "className": "fit-to-window"
}

export const defaultStyle = 'fit-to-window'

// export const defaulSearchPath = process.env["HOMEPATH]"]; //process.platform == "win32" ? "%USERPROFILE%" : "$HOME");

export const supportedMIMEType = [
  'video/ogg',
  'video/webm',
  'video/mp4'
]

export const fileFilter = [
  {name: 'Mediafiles', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webm', 'mp4']},
  {name: 'Archives', extensions: ['zip', 'cbz']},
  {name: 'All Types', extensions: ['*']}
]
