const Promise = require('./bluebird')

function Device(meta) {
  this.meta = meta
  this.id = meta.deviceId
  this.name = meta.name
}

Device.prototype.connect = function() {
  var self = this
  return new Promise(function(resolve, reject) {
    wx.createBLEConnection({
      deviceId: self.id,
      success: function(res) {
        resolve(res)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

Device.prototype.disconnect = function() {
  var self = this
  return new Promise(function(resolve, reject) {
    wx.closeBLEConnection({
      deviceId: self.id,
      success: function(res) {
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

Device.prototype.getBandServices = function () {
  return this.getServices().then(function(srvs) {

    return Promise.resolve(srvs.filter(s => s.id.indexOf('0000FF20') === 0))
  })
}

Device.prototype.getWriteCharacteristic = function(){
  var self = this
  return new Promise(function(resolve, rej) {
    self.getBandServices().then(function (srvs) {
      srvs.forEach(function(srv) {
        srv.getCharacteristics().then(function(chars) {
          for (var i = 0; i < chars.length; i ++) {
            var char = chars[i]
            if (char.properties.write) {
              resolve(char)
              break
            }
          }
        })
      })
    })
  })
}

Device.prototype.getNotifyCharacteristic = function(){
  var self = this
  return new Promise(function(resolve, rej) {
    self.getBandServices().then(function (srvs) {
      srvs.forEach(function(srv) {
        srv.getCharacteristics().then(function(chars) {
          for (var i = 0; i < chars.length; i ++) {
            var char = chars[i]
            if (char.properties.indicate || char.properties.notify) {
              resolve(char)
              break
            }
          }
        })
      })
    })
  })
}

Device.prototype.notifying = function() {

  var self = this
  return this.getNotifyCharateristic().then(function(char) {
    return self.notifyingFrom(char)
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

Device.prototype.write = function(buffer) {
  var self = this
  return this.getWriteCharateristic().then(function(char) {
    if (char) {
      return self.writeTo(char, buffer)
    } else {
      return Promise.reject('no write charateristic found!')
    }
  })
  
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