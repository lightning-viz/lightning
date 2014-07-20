
/*!
 * Module dependencies.
 */
var graph = require('fbgraph');
var _ = require('lodash');

exports.index = function (req, res) {
  res.render('index', {
    title: 'Node Express Mongoose Boilerplate'
  });
};



exports.results = function(req, res) {

    var nsp = req.io.of('/' + req.params.uid);

    var categories = {};
    var totalPosts = 0;
    var sharedStory = 0;

    var handleResults = function(err, res) {
        if(err) {
            console.log(err);
            return;
        }

        if(res.data) {
            totalPosts += res.data.length;

            // console.log('Got ' + res.data.length + ' results. ' + totalPosts + ' total posts fetched.');

            _.each(res.data, function(d) {
                var category = d.from.category || 'People';
                categories[category] = (categories[category]) ? categories[category] + 1 : 1;

                if(d.status_type && d.status_type === 'shared_story') {
                    sharedStory++;
                }
            });
        }

        if(res.paging && res.paging.next) {
            graph.get(res.paging.next, handleResults);
        }


        // console.log('');
        // console.log('Current Breakdown');
        // console.log('-----------------');
        // console.log(totalPosts + ' total posts');
        // console.log((sharedStory / totalPosts * 100).toFixed(2) + '% are links');

        // console.log('');
        // _.each(_.sortBy(_.keys(categories), function(k) { return -categories[k]; }), function(key) {
        //     var val = categories[key];
        //     console.log((val / totalPosts * 100).toFixed(2) + '% from ' + key);
        // });
        // console.log('');

        console.log('emitting update');
        nsp.emit('update', {
            totalPosts: totalPosts,
            sharedStory: sharedStory,
            categories: categories
        });

    };

    graph.get('/me/home', { access_token: req.user.accessToken}, handleResults);



    res.render('results', {
        title: 'Analysis Results'
    });
}