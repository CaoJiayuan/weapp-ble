module.exports = {
    ab2hex (buffer) {
        const hexArr = Array.prototype.map.call(
            new Uint8Array(buffer),
            function (bit) {
                return ('00' + bit.toString(16)).slice(-2)
            }
        )
        return hexArr.join('')
    },
    ab2String (buffer) {
        var result = ''
        let v = new DataView(buffer)
        for (var i = 0; i < buffer.byteLength; i++) {
            result += String.fromCharCode(v.getUint8(i))
        }
        return result
    },
    string2ab (str) {
        var ab = new ArrayBuffer(str.length)
        let v = new DataView(ab)

        for (var i = 0; i < str.length; i++) {
            v.setUint8(i, str.charCodeAt(i))
        }
        return ab
    }
}
