const Promise = require('./bluebird')
const {ab2hex} = require('./utils')
function Device(meta) {
  this.meta = meta
  this.id = meta.deviceId
  this.name = meta.name
  this.connected = false
}

Device.prototype.connect = function() {
  var self = this
  if (this.connected) {
    return Promise.resolve({
      code: 0
    })
  }

  return new Promise(function(resolve, reject) {
    wx.createBLEConnection({
      deviceId: self.id,
      success: function(res) {
        self.connected = true
        resolve(res)
      },
      fail(err) {
        self.connected = false
        reject(err)
      }
    })
  })
}

Device.prototype.disconnect = function() {
  var self = this
  if (!this.connected){
    return Promise.resolve({
      code: 0
    })
  }

  return new Promise(function(resolve, reject) {
    wx.closeBLEConnection({
      deviceId: self.id,
      success: function(res) {
        self.connected = false
        resolve(res)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

Device.prototype.getServices = function() {
  var self = this

  return new Promise(function(resolve, rej) {
    wx.getBLEDeviceServices({
      deviceId: self.id,
      success: function(res) {
        resolve(res.services.map(function(srv) {
          return new Service(self.id, srv.uuid)
        }))
      },
      fail(err) {
        rej(err)
      }
    })
  })
}

Device.prototype.notifyingFrom = function(char) {
  var self = this

  return new Promise(function(resolve, reject) {
    wx.notifyBLECharacteristicValueChange({
      deviceId: self.id,
      serviceId: char.serviceId,
      characteristicId: char.uuid,
      state: true,
      success: resolve,
      fail(err) {
        reject(errMessage(err))
      }
    })
  })
}

Device.prototype.characteristicChanging = function (cb) {
  wx.onBLECharacteristicValueChange(cb)
}

Device.prototype.writeTo = function(char, buffer){
  var self = this

  return new Promise(function(resolve, rej) {
    wx.writeBLECharacteristicValue({
      deviceId: self.id,
      serviceId: char.serviceId,
      characteristicId: char.uuid,
      value: buffer,
      success: resolve,
      fail: function (err) {
        rej(errMessage(err))
      }
    })
  })
}

Device.prototype.readFrom = function(char) {
  var self = this

  return new Promise(function(resolve, reject) {
    wx.readBLECharacteristicValue({
      deviceId: self.id,
      serviceId : char.serviceId,
      characteristicId : char.uuid,
      success(res) {
        resolve(res)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

function Service(deviceId, id) {
  this.id = id
  this.deviceId = deviceId
}

Service.prototype.getCharacteristics = function() {

  var self = this
  return new Promise(function(resolve, rej) {
    wx.getBLEDeviceCharacteristics({
      deviceId: self.deviceId,
      serviceId: self.id,
      success: function (res) {
        resolve(res.characteristics.map(function(char) {
          char.serviceId = self.id

          return char
        }))
      },
      fail(err) {
        rej(errMessage(err))
      }
    });
  })

}


/**
 * 
 * @param {Object} err 
 */
function errMessage(err){
  if (typeof err !== 'object') {
    return err
  }

  if (err.hasOwnProperty('errMsg')) {
    return err.errMsg
  }
  return err
}

module.exports = Device