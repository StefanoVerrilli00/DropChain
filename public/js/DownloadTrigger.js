
$(document).ready(function(){
        const origin = window.location.origin;
        const link = `${origin}/download?cid=${CID}`;
        $("#retryDownload").attr('href',link);
        location.href = link;
})
