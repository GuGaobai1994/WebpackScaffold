var huadong = {
    upHost: 'upload.qiniup.com',
    backUpHost: 'up.qiniup.com'
}

var huabei = {
    upHost: 'upload-z1.qiniup.com',
    backUpHost: 'up-z1.qiniup.com'
}

var huanan = {
    upHost: 'upload-z2.qiniup.com',
    backUpHost: 'up-z2.qiniup.com'
}

var beimei = {
    upHost: 'upload-na0.qiniup.com',
    backUpHost: 'up-na0.qiniup.com'
}

export function Upload(file, options, cb) {
    var chunks = Chunk(file);
    var ctxlist = new Array();
    var zone;
    var key;
    switch(options.Zone)
    {
    case 'z0':
      zone = huadong;
      break;
    case 'z1':
      zone = huabei;
      break;
    case 'z2':
      zone = huanan;
      break;  
    case 'na0':
      zone = beimei;
      break;  
    } 

    if(typeof(options.Key) == "undefined") {
        key = file.name;
    }  else {
        key = options.Key;
    }

    console.log('upHost: ' + zone.upHost);
    cb("BlockNum: " + chunks.length);

    if(chunks.length < options.Thread) {
        MkBlk(chunks, options.Uptoken, 0, 1, zone, file.size, key,file.name, cb);
    } else {
        for(var i = 0; i < options.Thread; i++) {
            MkBlk(chunks, options.Uptoken, i, options.Thread, zone, file.size, key, file.name, cb);
        }
    }
 }      

function Chunk(file) {
    var chunkSize = 4 * 1024 * 1024; 
    var chunksNum = Math.max(Math.floor(file.size / chunkSize) + 1, 1);
    var chunks = new Array(); 
    if(chunksNum >= 2) {
        for(var i=0 ; i<chunksNum; i++) {
            var startIdx = i*chunkSize;//块的起始位置
            var endIdx = startIdx+chunkSize;//块的结束位置
            if(endIdx > file.size) {
              endIdx = file.size;
            }
            chunks.push(file.slice(startIdx, endIdx));
        }
        return chunks;
    } else {
        chunks.push(file);
        return chunks;
    }
}

 function MkBlk(chunk, UpToken, i, threadNum, zone, filesize, name, filename, cb) {
    if(localStorage.getItem(filename + "_" + i) == null && i < chunk.length) {
        console.log('上传块：' + i);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", '//' + zone.upHost +'/mkblk/' + chunk[i].size + '?chunk=' + i, true);
        xhr.setRequestHeader("Content-type", "application/octet-stream");
        xhr.setRequestHeader("Authorization", "UpToken " + UpToken);
        
        xhr.onreadystatechange = function() {//Call a function when the state changes.
            if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                var ctx =  JSON.parse(xhr.responseText);
                localStorage.setItem(filename + "_" + i, ctx.ctx);
                cb("Uploading: " + "Block " + i + " uploaded");
                for(var n = 0; n < chunk.length; n++) {
                    if(localStorage.getItem(filename + "_" + n) == null) {
                        MkBlk(chunk, UpToken, i + threadNum, threadNum, zone, filesize, name,filename, cb);
                        return;
                    } 
                }
                MkFile(UpToken, zone.upHost, chunk.length, name, filename,filesize, cb);
                cb('Status: Making File');
            }  else if(xhr.readyState == XMLHttpRequest.DONE && xhr.status != 200){
                cb('Error: ' + xhr.responseText);
            }
        }
        xhr.send(chunk[i]); 
    } else {
        if(i + threadNum > chunk.length ){
            for(var n = 0; n < chunk.length; n++) {
                if(localStorage.getItem(filename + "_" + n) == null) {
                    //MkBlk(chunk, UpToken, i + threadNum, threadNum, zone, filesize, name, filename,cb);
                    return;
                } 
            }
            MkFile(UpToken, zone.upHost, chunk.length, name, filename,filesize, cb);
            cb('Status: Making File');
        } else {
            cb("Uploading: " + "Block " + i + " skipped");
            i = i + threadNum;
            var xhr = new XMLHttpRequest();
            xhr.open("POST", '//' + zone.upHost +'/mkblk/' + chunk[i].size + '?chunk=' + i, true);
            xhr.setRequestHeader("Content-type", "application/octet-stream");
            xhr.setRequestHeader("Authorization", "UpToken " + UpToken);
            
            xhr.onreadystatechange = function() {//Call a function when the state changes.
                if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                    var ctx =  JSON.parse(xhr.responseText);
                    localStorage.setItem(filename + "_" + i, ctx.ctx);
                    cb("Uploading: " + "Block " + i + "uploaded");
                    for(var n = 0; n < chunk.length; n++) {
                        if(localStorage.getItem(filename + "_" + n) == null) {
                            //MkBlk(chunk, UpToken, i + threadNum, threadNum, zone, filesize, name, filename,cb);
                            return;
                        } 
                    }
                    MkFile(UpToken, zone.upHost, chunk.length, name, filename,filesize, cb);
                    cb('Status: Making File');
                }
            }
            xhr.send(chunk[i]); 
        }
       
    }
 }


function MkFile(upToken, upHost, num, name, filename,filesize, cb){
    var ctxlist = new Array();
    for(var i = 0 ; i < num; i++) {
        ctxlist.push(localStorage.getItem(filename + "_" + i));
    }
    var xhr = new XMLHttpRequest();
    
    if(name == ''){
        xhr.open("POST", '//' + upHost + '/mkfile/' + filesize, true);
    } else {
        xhr.open("POST", '//' + upHost + '/mkfile/' + filesize + '/' + 'key/' + URLSafeBase64Encode(name), true);
    }
    

    xhr.setRequestHeader("Content-type", "text/plain");
    xhr.setRequestHeader("Authorization", "UpToken " + upToken);
    
    xhr.onreadystatechange = function() {//Call a function when the state changes.
      if(xhr.readyState == 4) {
        if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            cb('Success: ' + xhr.responseText);
            localStorage.clear();
        } else {
            cb('Failed: ' + xhr.responseText);
        }
      }  
    }
    xhr.send(ctxlist.join(",")); 
}
   
function URLSafeBase64Encode(data) {
    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        enc = '',
        tmp_arr = [];

    if (!data) {
        return data;
    }

    data = utf8_encode(data + '');

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1 << 16 | o2 << 8 | o3;

        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
            break;
        case 2:
            enc = enc.slice(0, -1) + '=';
            break;
    }

    return enc.replace(/\//g, '_').replace(/\+/g, '-');
}

function utf8_encode(argString) {
    
    if (argString === null || typeof argString === 'undefined') {
        return '';
    }

    var string = (argString + ''); // .replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var utftext = '',
        start, end, stringl = 0;

    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;

        if (c1 < 128) {
            end++;
        } else if (c1 > 127 && c1 < 2048) {
            enc = String.fromCharCode(
                (c1 >> 6) | 192, (c1 & 63) | 128
            );
        } else if (c1 & 0xF800 ^ 0xD800 > 0) {
            enc = String.fromCharCode(
                (c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
            );
        } else { // surrogate pairs
            if (c1 & 0xFC00 ^ 0xD800 > 0) {
                throw new RangeError('Unmatched trail surrogate at ' + n);
            }
            var c2 = string.charCodeAt(++n);
            if (c2 & 0xFC00 ^ 0xDC00 > 0) {
                throw new RangeError('Unmatched lead surrogate at ' + (n - 1));
            }
            c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
            enc = String.fromCharCode(
                (c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
            );
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.slice(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }

    if (end > start) {
        utftext += string.slice(start, stringl);
    }

    return utftext;
}

 