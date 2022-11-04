
const Row = class Row{
    constructor(result) {
        this.li = document.createElement("li");
        this.li.setAttribute("class","list-group-item d-flex justify-content-between align-items-center");
        this.li.classList.add(result ? "success" : "error");
        this.mainDiv = document.createElement("div");
        this.mainDiv.setAttribute("class","ms-2 me-auto Dimension");
        this.titleDiv = document.createElement("div");
        this.titleDiv.setAttribute("class","fw-bold overflow-hidden");
    }

    appendToTitle(element){
        this.titleDiv.appendChild(element);
        this.mainDiv.appendChild(this.titleDiv);
    }

    appendToRight(element){
        this.li.appendChild(element);
    }

    appendToSubPar(element){
        this.mainDiv.appendChild(element);
    }

    finalizeCreation(){
        this.li.insertBefore(this.mainDiv,this.li.firstChild);
        return this.li;
    }
}


$(document).ready(function() {
    var myForm = $('#file-form')
    var droppedFiles = new DataTransfer();
    var DefaultText = $('#Count').text();
    const fileInput = document.getElementById('file');
    const fileButton = $('#fileUploadButton');
    const alert = $('#message');
    const ul = document.getElementById('filesList');

    $('.file-drop-area').on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
    })
        .on('dragover dragenter', function() {
            $('.file-drop-area').addClass('is-dragover');
        })
        .on('dragleave dragend drop', function() {
            $('.file-drop-area').removeClass('is-dragover');
        })
        .on('drop', function(e) {
            droppedFiles = e.originalEvent.dataTransfer
            fileInput.files = droppedFiles.files;
            var fileCount = e.originalEvent.dataTransfer.files.length;
            fileButton.prop('disabled',false);
            if(fileCount === 1){
                let filename = e.originalEvent.dataTransfer.files[0].name
                $('#Count').text(` or upload ${filename}`)
            }else{
                $('#Count').text(`or upload ${fileCount} files`)
            }
        });


        myForm.on('submit',function (e){
            e.preventDefault();
            if(myForm.hasClass('uploading')) return false;
            myForm.addClass('uploading').removeClass('error');
            var formData = new FormData(this);
            $.ajax({
                type: "POST",
                url: "/upload",
                data: formData,
                processData: false,
                contentType: false,
                success: [function (data){
                    CreateSuccessfullTransaction(data.SIZE,data.CID);
                    $('#Count').text(`${DefaultText}`);
                    myForm.trigger("reset");
                }],
                error: [function(data){
                    CreateErrorRow(Object.values(data.responseJSON)[0]);
                }]
            }).always(function (){myForm.removeClass('uploading');})
        });


    $(document).on('change','.file-input',function (){
        const fileCount = $(this)[0].files.length;
        fileCount === 0 ? fileButton.prop('disabled',true) : fileButton.prop('disabled',false);
        if(fileCount === 1){
            let fileName = $(this).val().split('\\').pop();
            $('#Count').html(` or upload <br><div class="overflow-hidden">${fileName}</div>`);
        }else if(fileCount > 1){
            $('#Count').html(` or upload <br><div class="overflow-hidden">${fileCount}</div> files`);
        }else{
            $('#Count').text(DefaultText);
        }
    })


    function CreateSuccessRow(link,CID,size){
        const NewRow = new Row(true);
        const a = document.createElement("a");
        a.appendChild(document.createTextNode(CID));
        a.href=link;
        NewRow.appendToTitle(a);
        const sizeText = document.createTextNode(`Size: ${size}`);
        NewRow.appendToSubPar(sizeText);
        const buttonNode = document.createElement("button");
        buttonNode.onclick = function(){
            CopyToClipboard(link);
        }
        buttonNode.appendChild(document.createTextNode("copy"));
        buttonNode.setAttribute("class","btn btn-outline-primary");
        NewRow.appendToRight(buttonNode);
        const li = NewRow.finalizeCreation();
        ul.insertBefore(li,ul.firstChild);

    }

    function CreateSuccessfullTransaction(Size,CID){
        let origin = window.location.origin;
        console.log(CID);
        let DownloadLink = `${origin}/downloadPage?Cid=${CID}`;
        let Val2 = Size;
        CreateSuccessRow(DownloadLink,CID,Val2);
    }

    function CreateErrorRow(errorData){
        const NewRow = new Row(false);
        const ErrorText = document.createTextNode(errorData);
        NewRow.appendToTitle(ErrorText);
        const sizeText = document.createTextNode(`Size: NaN`);
        NewRow.appendToSubPar(sizeText);
        const li = NewRow.finalizeCreation();
        ul.insertBefore(li,ul.firstChild);
    }


    function fallbackClipboard(text){
        var textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback: unable to copy', err);
        }

        document.body.removeChild(textArea);
    }



    function CopyToClipboard(text) {
        if(navigator.clipboard) {
            navigator.clipboard.writeText(text);
        }else{
            fallbackClipboard(text);
        }
        alert.css('display','flex');
        setTimeout(function (){alert.css('display','none');},1000);
    }


    $('.hoverable').hover(function(){
            $('.file-select').addClass('hovered');
        },
        function(){
            $('.file-select').removeClass('hovered');
        });

});