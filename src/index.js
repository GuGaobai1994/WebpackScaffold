import {Upload, Chunk, CtxList} from './qiniu.js';

var fileList = new Array();

var pullfiles=function(){ 
    // love the query selector
    var fileInput = document.querySelector("#myfiles");
    var files = fileInput.files;
    var i = 0;
    while ( i < files.length) {
        // localize file var in the loop
        var file = files[i];
        fileList.push(file);
        i++;
    } 
    var options = {
        Zone: 'z0',
        Uptoken: 'FMVCRs2-LO1ivRNi4l7mEZE6ZDvPv-519D12kZCO:2OTrWWMFWy3I9Jgcg7GJQz8TRzw=:eyJzY29wZSI6IjA4MTZkaXNwbGF5IiwiZGVhZGxpbmUiOjE1NTM3MTc3NTZ9',
        Key: '',
        Thread: 5
    }   

    var startTime = new Date();
    var fileSize = fileList[0].size;

    Upload( fileList[0], options, function(callback) { 
        //console.log(callback.split(':')[1]);
        document.getElementById("demo").innerHTML = callback;
        if(callback.split(':')[0] == "Success") {
            alert("上传完成" + "\n" + "文件大小： "+ fileSize + "\n开始时间: " + startTime + "\n完成时间: " + new Date());
        }
    });
}

// set the input element onchange to call pullfiles
document.querySelector("#myfiles").onchange=pullfiles;
