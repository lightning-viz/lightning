
/*!
 * Module dependencies.
 */

var expect = require('expect.js');
var models = require('../app/models');
var _ = require('lodash');


describe('repo import tests', function() {

    before(function(done) {

        models.VisualizationType
            .destroy({
                name: 'imported-matrix'
            }).success(function() {
                done();
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

    // it('should create files in the UI folder from a remote repository', function(done) {
    //     models.VisualizationType
    //         .find({
    //             where: {
    //                 name: 'imported-matrix'
    //             }
    //         }).success(function(vizType) {
    //             return vizType.exportToFS();
    //         }).spread(function() {
    //             done();
    //         }).error(function(err) {
    //             console.log(err);
    //             expect(err).to.not.be.ok();
    //         });
    // });

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
            .createManyFromRepoURL('https://github.com/mathisonian/lightning-default-visualizations')
            .spread(function() {
                var vizTypes = Array.prototype.slice.call(arguments, 0);
                expect(vizTypes).to.be.an('array');
                done();
            }).fail(function(err) {
                console.log(err);
                expect(err).to.not.be.ok();
            });
    });

    // it('should create files in the UI folder from the remote repository', function(done) {
    //     models.VisualizationType
    //         .findAll().success(function(vizTypes) {

    //             _.each(vizTypes, function(vizType) {
    //                 vizType.exportToFS();
    //             });

    //         }).spread(function() {
    //             done();
    //         }).error(function(err) {
    //             console.log(err);
    //             expect(err).to.not.be.ok();
    //         });
    // });

});

