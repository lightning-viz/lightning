var sid = document.URL.substring(document.URL.lastIndexOf('/sessions/') + '/sessions/'.length, document.URL.lastIndexOf('/feed'));

var socket = io.connect('/sessions/' + sid);
socket.on('viz', function (viz) {

    console.log(viz);
    $('.feed-container .empty').remove();
    $('.feed-container').prepend('<div class="feed-item"><pre>' + JSON.stringify(viz.data) + '</pre></div>');
    // $('#results').html(intermediateResultsTemplate(data));
});
