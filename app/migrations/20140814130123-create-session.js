module.exports = {
  up: function(migration, DataTypes, done) {
    migration
      .createTable('Sessions', {
        name: DataTypes.STRING
      })
      .complete(done)
  },
  down: function(migration, DataTypes, done) {
    migration
      .dropTable('Sessions')
      .complete(done)
  }
}
