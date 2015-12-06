
/*!
 * Module dependencies.
 */

var expect = require('expect.js');
var models = require('../app/models');
var utils = require('../app/utils');
var npm = require('npm');
var _ = require('lodash');


describe('repo import tests', function() {

    before(function(done) {
        models.sequelize.sync({force: false})
        .then(function() {
            models.VisualizationType
                .destroy({
                    where: {
                        name: {
                            in: ['lightning-wordcloud', 'hexbin']
                        }
                    }
                }).then(function() {
                    npm.load(utils.getNPMConfig(), function() {
                        done();
                    });
                });
        });
    });


    it('should create a VisualizationType from github', function(done) {
        models.VisualizationType
            .createFromNPM('lightning-viz/lightning-wordcloud', 'lightning-wordcloud')
            .then(function(vizType) {
                expect(vizType).to.be.an('object');
                expect(vizType.name).to.be('lightning-wordcloud');
                done();
            }).fail(function(err) {
                console.log(err);
                expect(err).to.not.be.ok();
            });
    });

    it('should create a VisualizationType from npm', function(done) {
        models.VisualizationType
            .createFromNPM('lightning-hexbin')
            .then(function(vizType) {
                expect(vizType).to.be.an('object');
                expect(vizType.name).to.be('hexbin');
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
