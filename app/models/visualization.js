/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;

/**
 * User schema
 */

var VisualizationSchema = new Schema({
    data: Schema.Types.Mixed
});

/**
 * User plugin
 */

// SessionSchema.plugin(userPlugin, {});
VisualizationSchema.plugin(findOrCreate);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */

VisualizationSchema.method({

});

/**
 * Statics
 */

VisualizationSchema.static({

});

/**
 * Register
 */

mongoose.model('Visualization', VisualizationSchema);


module.exports = VisualizationSchema;