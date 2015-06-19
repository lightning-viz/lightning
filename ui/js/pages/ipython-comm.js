window.lightning = window.lightning || {};
var lightningCommMap = {};

var readCommData = function(commData, field) {
    try {
        return commData.content.data[field];
    } catch (err) {
        return;
    }
};


if(IPython.notebook.kernel) {
    IPython.notebook.kernel.comm_manager.register_target('lightning', function(comm, data) {
        var id = readCommData(data, 'id');
        lightningCommMap[id] = comm;
    });

    window.lightning.comm_map = lightningCommMap;
}