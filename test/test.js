
/*!
 * Module dependencies.
 */

var expect = require('expect.js');
var models = require('../app/models');
var _ = require('lodash');


describe('repo import tests', function() {

    before(function(done) {
        models.sequelize.sync({force: false})
        .success(function() {
            models.VisualizationType
                .destroy({
                    name: 'imported-matrix'
                }).success(function() {
                    done();
                });
        });
    });


    it('should create a VisualizationType from a remote repository', function(done) {
        models.VisualizationType
            .createFromRepoURL('https://gist.github.com/9b4bdba9a686086e7c87.git', { name: 'imported-matrix'})
            .then(function(vizType) {
                expect(vizType).to.be.an('object');
                expect(vizType.name).to.be('imported-matrix');
                done();
            }).fail(function(err) {
                console.log(err);
                expect(err).to.not.be.ok();
            });
    });
});


describe('multi repo import tests', function() {

    before(function(done) {

        models.VisualizationType
            .destroy({
            }).success(function() {
                done();
            });
    });

    it('should fetch default visualizations from a remote repository', function(done) {
        models.VisualizationType
            .createManyFromRepoURL('https://github.com/lightning-viz/lightning-default-visualizations')
            .spread(function() {
                var vizTypes = Array.prototype.slice.call(arguments, 0);
                expect(vizTypes).to.be.an('array');
                done();
            }).fail(function(err) {
                console.log(err);
                expect(err).to.not.be.ok();
            });
    });


});



describe('visualization model', function() {

    var data = {
        key1: ['an', 'array', 'of', 'strings'],
        key2: {
            an: 'object'
        },
        key3: 'a string'
    };

    it('should query json data', function(done) {

        models.Visualization.create({
            data: data,
            type: 'line'
        }).then(function(viz) {
            var vid = viz.id;

            models.Visualization
                .queryDataForVisualization(vid, ['key1'])
                .then(function(results) {
                    expect(results).to.be.an('array');
                    expect(results.length).to.be(1);
                    expect(results[0]).to.have.property('data');
                    expect(results[0].data).to.eql(data.key1);
                    done();
                });

        });
    });

    it('should get query a named object', function(done) {
        
        models.Visualization.create({
            data: data,
            type: 'line'
        }).then(function(viz) {
            var vid = viz.id;

            models.Visualization
                .getNamedObjectForVisualization(vid, 'key2')
                .then(function(results) {
                    expect(results).to.be.an('array');
                    expect(results.length).to.be(1);
                    expect(results[0]).to.have.property('key2');
                    expect(results[0].key2).to.eql(data.key2);
                    done();
                });

        });
    });

    it('should get query a named with index', function(done) {
        
        models.Visualization.create({
            data: data,
            type: 'line'
        }).then(function(viz) {
            var vid = viz.id;

            models.Visualization
                .getNamedObjectAtIndexForVisualization(vid, 'key1', 2)
                .then(function(results) {
                    expect(results).to.be.an('array');
                    expect(results.length).to.be(1);
                    expect(results[0]).to.have.property('key1');
                    expect(results[0].key1).to.eql(data.key1[2]);
                    done();
                });

        });
    });

    it('should get query settings', function(done) {
        
        models.Visualization.create({
            settings: data,
            type: 'line'
        }).then(function(viz) {
            var vid = viz.id;


            models.Visualization
                .querySettingsForVisualization(vid, ['key1'])
                .then(function(results) {
                    expect(results).to.be.an('array');
                    expect(results.length).to.be(1);
                    expect(results[0]).to.have.property('settings');
                    expect(results[0].settings).to.eql(data.key1);
                    done();
                });

        });
    });

})