import { createRequire } from "module";
const require = createRequire(import.meta.url);

const getMime = require('name2mime');
const bodyParser = require('body-parser');
import * as IPFS from 'ipfs-core';
import express from 'express'
import toBuffer from "it-to-buffer";
const all = require('it-all')
const multer = require("multer");
const path = require("path");
import { CID } from 'multiformats/cid'
import { fileURLToPath } from 'url';

const app = express();

app.use(bodyParser.json());

app.set('view engine','ejs');
app.use(express());


let node = await IPFS.create().catch((e)=>{console.log(e);process.exit(1)});

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

app.set('views','public/Views');
app.use(express.static(__dirname + '/public'));

const publicPath = path.join(__dirname,'public/Views');
app.use(express.static(publicPath));
const storage = multer.memoryStorage();

const maxSize =50*1024*1024;

const FileUpload = multer({storage: storage, limits: {fileSize: maxSize}});

app.get('/',(req,res)=>{
    let file = `${publicPath}/home.html`;
    res.sendFile(file.toString());
});


app.post('/upload',FileUpload.array('file',100),async (req, res) => {
    if(req.files.length === 0){
        return res.status(400).send({errorMessage: "No file selected"});
    }
    const fileObjectArray = req.files.map((file) =>{
        return {path : file.originalname, content: file.buffer}})

    if(fileObjectArray.length > 1){
        const addedFiles = await all(node.addAll(fileObjectArray,{wrapWithDirectory: true}));
        const directoryCID = addedFiles[addedFiles.length -1].cid;
        res.send({CID:directoryCID.toString(),SIZE:addedFiles[addedFiles.length-1].size});
    }else{
        const FileToAdd = await node.add(fileObjectArray[0],{wrapWithDirectory:true});
        res.send({CID:FileToAdd.cid.toString(),SIZE:FileToAdd.size})
    }

});


app.get('/downloadPage',async (req,res) =>{
    const CID = req.query.Cid;
    if(isCID(CID)){
        return res.render(`SuccessDownload.ejs`,{Cid : CID});
    }else{
        return res.status(404).render(`ErrorDownload.ejs`,{error: "File undefined, please check if the link is correct"});
    }
})



app.get('/download',async(req,res) =>{
    const CIDToPass = req.query.cid;
    let files
    try{
        files = await all(node.ls(CIDToPass))
    }catch (e){
        return res.status(404).render(`ErrorDownload.ejs`,{error: "File undefined, please check if the link is correct"});
    }
    let isDirectory = files.length > 1;
    let buffer;
    if(isDirectory){
       buffer = await toBuffer(node.get(CIDToPass.toString(),{compress:true,compressionLevel:1,archive:true}));
       res.setHeader("Content-Type",`application/zip`);
       res.setHeader("Content-Disposition",`attachment; filename=Archive.zip`);
   }else{
       buffer = await toBuffer(node.cat(files[0].cid.toString()));
        const ext = getMime(files[0].name.toString()).type
        res.setHeader('Content-Type',ext);
       res.setHeader('Content-Disposition','attachment;filename='+files[0].name.toString())
        res.setHeader('Content-Length', buffer.length);
   }

    res.end(buffer);

})

function isCID (hash){
    try {
        return Boolean(CID.parse(hash))
    } catch {
        return false
    }
}

app.listen(3000);

