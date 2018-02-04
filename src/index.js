import _ from 'lodash';
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
    Upload( fileList[0], function(callback) { 
        console.log("cb: " + callback);
    });


}

// set the input element onchange to call pullfiles
document.querySelector("#myfiles").onchange=pullfiles;
