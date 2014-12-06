module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished

    migration.addColumn('Visualizations', 'settings', 'JSON');


    done();
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    migration.removeColumn('Visualizations', 'settings');
    done();
  }
};
