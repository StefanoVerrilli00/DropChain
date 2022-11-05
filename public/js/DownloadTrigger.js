$(document).ready(function(){
        let href = $('#retryDownload');
        href.click();
        location.href = href.attr('href');
})
function Download(CID) {
        const origin = window.location.origin;
        const link = `${origin}/download?cid=${CID}`
        const href = document.getElementById('retryDownload');
        href.href = link;
    }
