export function Chunk(file) {
    var chunkSize = 4 * 1024 * 1024; 
    var chunksNum = Math.max(Math.floor(file.size / chunkSize), 1)+1;
    console.log(chunksNum);
    
    var chunks = new Array(); 
    if(chunksNum >= 2) {
        for(var i=0 ; i<chunksNum; i++) {
            var startIdx = i*chunkSize;//块的起始位置
            var endIdx = startIdx+chunkSize;//块的结束位置
            if(endIdx > file.size) {
              endIdx = file.size;
            }
            chunks.push(file.slice(startIdx, endIdx));
            console.log(chunks.length);
        }
        return chunks;
    } else {
        chunks.push(file);
        return chunks;
    }
}

 export function Upload(chunks) {
    var result = MkBlk(chunks[0], '');
    console.log(result);
  }   

 function MkBlk(chunk, UpToken) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://upload.qiniup.com/mkblk/410936', true);
    xhr.setRequestHeader("Content-type", "application/octet-stream");
    
    xhr.onreadystatechange = function() {//Call a function when the state changes.
        if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 401) {
            console.log(xhr.responseText);
            return xhr.responseText;
        }
    }
    xhr.send(chunk); 
 }

 