import 'whatwg-fetch';
export function upload(file) {
    var chunkSize = 4 * 1024 * 1024; 
    var chunksNum = Math.max(Math.floor(file.size / chunkSize), 1)+1;
    console.log(chunksNum);
    
    var chunks = new Array();
    if(chunksNum > 2) {
        for(var i=0 ; i<chunksNum; i++) {
            var startIdx = i*chunkSize;//块的起始位置
            var endIdx = startIdx+chunkSize;//块的结束位置
            if(endIdx > file.size) {
              endIdx = file.size;
            }
            chunks.push(file.slice(startIdx, endIdx));
            console.log(chunks.length);
        }
    }

    // fetch('https://jsonplaceholder.typicode.com/users')
    // .then(response => response.json())
    // .then(json => {
    //  console.log('We retrieved some data! AND we\'re confident it will work on a variety of browser distributions.')
    //  console.log(json)
    // })
    // .catch(error => console.error('Something went wrong when fetching this data: ', error))
}