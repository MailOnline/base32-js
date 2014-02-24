;(function(){

/**
 * sha1 functions wrap the hash function from Node.js
 *
 * Several ways to use this:
 *
 *     var hash = base32.sha1('Hello World')
 *     base32.sha1(process.stdin, function (err, data) {
 *       if (err) return console.log("Something went wrong: " + err.message)
 *       console.log("Your SHA1: " + data)
 *     }
 *     base32.sha1.file('/my/file/path', console.log)
 */

var crypto, fs
function sha1(input, cb) {
    if (typeof crypto == 'undefined') crypto = require('crypto')
    var hash = crypto.createHash('sha1')
    hash.digest = (function(digest) {
        return function() {
            return encode(digest.call(this, 'binary'))
        }
    })(hash.digest)
    if (cb) { // streaming
        if (typeof input == 'string' || Buffer.isBuffer(input)) {
            try {
                return cb(null, sha1(input))
            } catch (err) {
                return cb(err, null)
            }
        }
        if (!typeof input.on == 'function') return cb({ message: "Not a stream!" })
        input.on('data', function(chunk) { hash.update(chunk) })
        input.on('end', function() { cb(null, hash.digest()) })
        return
    }

    // non-streaming
    if (input) {
        return hash.update(input).digest()
    }
    return hash
}

sha1.file = function(filename, cb) {
    if (filename == '-') {
        process.stdin.resume()
        return sha1(process.stdin, cb)
    }
    if (typeof fs == 'undefined') fs = require('fs')
    return fs.stat(filename, function(err, stats) {
        if (err) return cb(err, null)
        if (stats.isDirectory()) return cb({ dir: true, message: "Is a directory" })
        return sha1(require('fs').createReadStream(filename), cb)
    })
}


if (typeof module !== 'undefined' && module.exports) {
    // nodejs
    module.exports = sha1;
}

})();
