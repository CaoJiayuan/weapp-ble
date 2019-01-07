const Promise = require('./bluebird');

const Device = require('./device')
const Buffer = require('./buffer').Buffer


function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('')
}

function Manager() {
  this.opened = false
}

Manager.prototype.discover = function(delay) {

  delay = delay || 3000
  var promise = function(){
    return new Promise(function(resolve, reject) {
      startDiscovery(delay, resolve)
    })
  }

  if (!this.opened) {
    return this.open().then(function() {
      return promise()
    })
  }

  return promise()
}



Manager.prototype.getDevices = function() {
  return getKnownDevices()
}

Manager.prototype.open = function(onWaitingDevice, onReopen) {
  var self = this

  return new Promise(function(resolve, reject) {
    wx.openBluetoothAdapter({
      success(res) {
        self.opened = true
        console.log('BluetoothAdapter opened')
        resolve(res)
      },
      fail(err) {
        onWaitingDevice && onWaitingDevice()
        wx.onBluetoothAdapterStateChange(function(res) {
          if (res.available) {
            onReopen && onReopen()
            wx.openBluetoothAdapter({
              success(res) {
                self.opened = true
                console.log('BluetoothAdapter opened')

                resolve(res)
              },
              fail(e) {
                self.opened = false
                console.log('BluetoothAdapter open failed')

                reject(e)
              }
            })
          } else {
            self.opened = false
            console.log('BluetoothAdapter open failed')

            reject(err);
          }
        });
      }
    })
  })
}

Manager.prototype.close = function() {
  var self = this

  return new Promise(function(resolve) {
    wx.closeBluetoothAdapter({
      success: function(res) {
        console.log('BluetoothAdapter closed')
        self.opened = false
        resolve(res)
      },
    })
  })
}

function discoverDevices(onWaitingDevice, onReopen, delay) {
  delay = delay || 3000;
  onWaitingDevice = onWaitingDevice || function() {

  }
  onReopen = onReopen || function() {

  }
  return new Promise(function(resolve, reject) {
    wx.openBluetoothAdapter({
      success(res) {
        startDiscovery(delay, resolve);
      },
      fail(err) {
        onWaitingDevice()
        wx.onBluetoothAdapterStateChange(function(res) {
          if (res.available) {
            onReopen()
            wx.openBluetoothAdapter({
              success(res) {
                startDiscovery(delay, resolve);
              },
              fail(e) {
                reject(e)
              }
            })
          } else {
            reject(err);
          }
        });
      }
    });
  });

}

function getKnownDevices() {

  return new Promise(function(resolve, reject) {
    wx.getBluetoothDevices({
      success(res) {
        resolve(res.devices.map(function(meta) {
          return new Device(meta)
        }))
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

function startDiscovery(delay, after) {
  wx.startBluetoothDevicesDiscovery({
    allowDuplicatesKey: false,
  });

  setTimeout(function() {
    wx.stopBluetoothDevicesDiscovery();
    after && after();
  }, delay);
}

module.exports = {
  Manager,
  ab2hex,
  Buffer,
  Device
};