const Promise = require('./bluebird');

const Device = require('./device')


function Manager() {

}

Manager.prototype.discover = function(onWaitingDevice, onReopen, delay) {
  return discoverDevices(onWaitingDevice, onReopen, delay)
}



Manager.prototype.getDevices = function() {
  return getKnownDevices()
}


Manager.prototype.close = function() {
  wx.closeBluetoothAdapter({
    success: function(res) {
      console.log('BluetoothAdapter closed')
    },
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
  // var founds = {
  //     devices: []
  // };
  // wx.onBluetoothDeviceFound(function (result) {
  //     founds = result;
  // });

  wx.startBluetoothDevicesDiscovery({
    allowDuplicatesKey: false,
  });

  setTimeout(function() {
    wx.stopBluetoothDevicesDiscovery();
    after && after();
  }, delay);
}

module.exports = {
  Manager
};