window.lightning = window.lightning || {};
var lightningCommMap = {};

var readCommData = function(commData, field) {
    try {
        return commData.content.data[field];
    } catch (err) {
        return;
    }
};


var init_comm = function() {
    IPython.notebook.kernel.comm_manager.register_target('lightning', function(comm, data) {
        var id = readCommData(data, 'id');
        lightningCommMap[id] = comm;
    });

    window.lightning.comm_map = lightningCommMap;
}


if(IPython && IPython.notebook) {

    if(IPython.notebook.kernel) {
        init_comm();
    }

    IPython.notebook.events.on('kernel_connected.Kernel', init_comm);

}
