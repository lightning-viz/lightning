module.exports = {
  up: function(migration, DataTypes, done) {
    migration
      .createTable('VisualizationTypes', {
        name: DataTypes.STRING
        initial_data_field: DataTypes.STRING
      })
      .complete(done)
  },
  down: function(migration, DataTypes, done) {
    migration
      .dropTable('VisualizationTypes')
      .complete(done)
  }
}
