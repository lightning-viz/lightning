"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    migration.addColumn('VisualizationTypes', 'isModule', DataTypes.BOOLEAN);
    migration.addColumn('VisualizationTypes', 'isStreaming', DataTypes.BOOLEAN);
    done();
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn('VisualizationTypes', 'isModule');
    migration.removeColumn('VisualizationTypes', 'isStreaming');
    done();
  }
};
