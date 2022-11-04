$(document).ready(function(){
        let href = $('#retryDownload');
        href.click();
        let link = href.attr('href');
        location.href = link;
})
function Download(CID) {
        const origin = window.location.origin;
        const link = `${origin}/download?cid=${CID}`
        const href = document.getElementById('retryDownload');
        href.href = link;
    }
