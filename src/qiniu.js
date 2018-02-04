export function Upload(file, cb) {
    var chunks = Chunk(file);
    var ctxlist = new Array();
    cb("块数量: " + chunks.length, '');
    for(var n = 0; n < chunks.length; n++) {
        if(localStorage.getItem(file.name + "_" + n) == null) {
            MkBlk(chunks[n], '', chunks.length, n,  file.size, file.name,cb);
        } else  {
            ctxlist.push(localStorage.getItem(file.namename + "_" + n));
            if(ctxlist.length = chunks.length) {
                MkFile(chunks.length, file.name,file.size, cb);
                return;
            }
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


 function MkBlk(chunk, UpToken, num, i,  filesize, name, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://upload.qiniup.com/mkblk/' + chunk.size, true);
    xhr.setRequestHeader("Content-type", "application/octet-stream");
    xhr.setRequestHeader("Authorization", "UpToken FMVCRs2-LO1ivRNi4l7mEZE6ZDvPv-519D12kZCO:2OTrWWMFWy3I9Jgcg7GJQz8TRzw=:eyJzY29wZSI6IjA4MTZkaXNwbGF5IiwiZGVhZGxpbmUiOjE1NTM3MTc3NTZ9");
    
    xhr.onreadystatechange = function() {//Call a function when the state changes.
        if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            var ctx =  JSON.parse(xhr.responseText);
            localStorage.setItem(name + "_" + i, ctx.ctx);
            cb("块" + i + "上传完成");
            for(var n = 0; n < num; n++) {
                if(localStorage.getItem(name + "_" + n) == null) {
                    return;
                } 
            }
            MkFile(num, name,filesize, cb);
            cb('合并文件中：');
        }
    }
    xhr.send(chunk); 
 }

function MkFile(num, name, filesize, cb){
    var ctxlist = new Array();
    for(var i = 0 ; i < num; i++) {
        ctxlist.push(localStorage.getItem(name + "_" + i));
        console.log('内部存储', localStorage.length);
    }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://upload.qiniup.com/mkfile/' + filesize, true);
    xhr.setRequestHeader("Content-type", "text/plain");
    xhr.setRequestHeader("Authorization", "UpToken FMVCRs2-LO1ivRNi4l7mEZE6ZDvPv-519D12kZCO:2OTrWWMFWy3I9Jgcg7GJQz8TRzw=:eyJzY29wZSI6IjA4MTZkaXNwbGF5IiwiZGVhZGxpbmUiOjE1NTM3MTc3NTZ9");
    
    xhr.onreadystatechange = function() {//Call a function when the state changes.
        if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            cb('上传完成: ' + xhr.responseText);
        }
    }
    xhr.send(ctxlist.join(",")); 
}
   


 