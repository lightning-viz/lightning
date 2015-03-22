
window.define = undefined;

var did = document.URL.substring(document.URL.lastIndexOf('/dashboards/') + '/dashboards/'.length);
did = did.slice(0, did.indexOf('/'));
did = (window.lightning || {}).did || did;

var Dashboard = require('../models/dashboard');
var dashboard = new Dashboard({
    id: did
});

var DashboardView = require('../views/dashboard');

new DashboardView({
    el: $('.dashboard.container')[0],
    model: dashboard
});
