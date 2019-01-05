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
        reject()
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

Device.prototype.getNotifyCharateristic = function(){
  var self = this
  return new Promise(function(resolve, rej) {
    self.getBandServices().then(function (srvs) {
      srvs.forEach(function(srv) {
        srv.getCharateristics().then(function(chars) {
          for (var i = 0; i < chars.length; i ++) {
            var char = chars[i]
            char.serviceId = srv.id

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

Device.prototype.notifying = function(cb) {

  var self = this
  this.getNotifyCharateristic().then(function(char) {
    wx.notifyBLECharacteristicValueChange({
      deviceId: self.id,
      serviceId: char.serviceId,
      characteristicId: char.uuid,
      state: true,
      success: function(res) {
        cb && cb(res)
      },
    })
  })
}


function Service(deviceId, id) {
  this.id = id
  this.deviceId = deviceId
}

Service.prototype.getCharateristics = function() {

  var self = this
  return new Promise(function(resolve, rej) {
    wx.getBLEDeviceCharacteristics({
      deviceId: self.deviceId,
      serviceId: self.id,
      success: function (res) {
        resolve(res.characteristics)
      },
      fail(err) {
        rej(err)
      }
    });
  })

}

module.exports = Device