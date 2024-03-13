const path = require('node:path')

module.exports = {
  packagerConfig: {
    asar: true,
    icon: path.join(__dirname, 'lib/img/icon.png') // no file extension required
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: path.join(__dirname, 'lib/img/icon.png'),
          maintainer: 'mcz',
          homepage: 'https://github.com/unclemcz/wodict'
        }
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
