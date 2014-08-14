module.exports = {
  up: function(migration, DataTypes, done) {
    migration
      .createTable('Visualizations', {
        data: DataTypes.JSON
        name: DataTypes.STRING
        images: DataTypes.ARRAY
      })
      .complete(done)
  },
  down: function(migration, DataTypes, done) {
    migration
      .dropTable('Visualizations')
      .complete(done)
  }
}
