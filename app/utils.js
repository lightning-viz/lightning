'use strict';
var _ = require('lodash');
var titleCase = require('title-case');
var config = require('../config/config');
var path = require('path');
var knox = require('knox');
var Q = require('q');
var randomstring = require('randomstring');


module.exports = {



    sortByKey: function(list, key) {
        return _.sortBy(list, key);
    },

    getRandomArbitrary: function(min, max) {
        var val = Math.random() * (max - min) + min;
        return val;
    },

    groupByN: function(arr, size) {
        var arrays = [];
        
        while (arr.length > 0) {
            arrays.push(arr.splice(0, size));
        }

        return arrays;
    },

    titleCase: function(str) {
        return titleCase(str)
    },

    getStaticUrl: function() {
        var baseUrl = config.baseURL;
        var static_url = baseUrl;
        if(config.url) {
            static_url = config.url + baseUrl;
        }
    },

    uploadToS3: function(filepath) {

        // check if thumbnailing exists,
        // and if s3 creds exist
        var s3Exists = !!config.s3.key;
        var s3Client = knox.createClient(_.extend(config.s3), {
            secure: false
        });

        if(!s3Exists) {
            throw new Error('Could not find s3 credentials');
        }

        // Image file info
        var imgPath = filepath;
        var extension = path.extname(imgPath).toLowerCase();
        var filenameWithoutExtension = path.basename(imgPath, extension);

        // Upload paths for s3
        var uploadName = randomstring.generate();
        var destPath = '/viz-type-thumbnails/';
        var s3Path = destPath + uploadName;

        // s3 headers
        var headers = {
          'x-amz-acl': 'public-read',
          'Access-Control-Allow-Origin': '*',
        };
        if( extension === '.jpg' || extension === '.jpeg' ) {
            headers['Content-Type'] = 'image/jpeg';
        } else if (extension === '.png') {
            headers['Content-Type'] = 'image/png';
        } else if (extension === '.gif') {
            headers['Content-Type'] = 'image/gif';
        }

        return Q.ninvoke(s3Client, 'putFile', imgPath, s3Path, headers);
    },


    getASCIILogo: function() {
        var logo = "\n\n\n  ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,` \n";
        logo += " ,`                                ,.\n";
        logo += ",`                                  ,\n";
        logo += ",                                   ,\n";
        logo += ",                      .            ,\n";
        logo += ",                     ,             ,\n";
        logo += ",                    `,             ,\n";
        logo += ",                    ,.             ,\n";
        logo += ",                   ,,              ,\n";
        logo += ",                  ,,,              ,\n";
        logo += ",                 ,,,.              ,\n";
        logo += ",                .,,,               ,\n";
        logo += ",               `,,,,               ,\n";
        logo += ",               ,,,,`               ,\n";
        logo += ",              ,,,,,                ,\n";
        logo += ",             ,,,,,,                ,\n";
        logo += ",            ,,,,,,,,,,,,,,.        ,\n";
        logo += ",           .,,,,,,,,,,,,,,         ,\n";
        logo += ",           ,,,,,,,,,,,,,,          ,\n";
        logo += ",          ,,,,,,,,,,,,,,           ,\n";
        logo += ",         ,,,,,,,,,,,,,,            ,\n";
        logo += ",                 ,,,,,`            ,\n";
        logo += ",                ,,,,,,             ,\n";
        logo += ",                ,,,,,              ,\n";
        logo += ",                ,,,,               ,\n";
        logo += ",               ,,,,                ,\n";
        logo += ",               ,,,`                ,\n";
        logo += ",              `,,.                 ,\n";
        logo += ",              ,,,                  ,\n";
        logo += ",              ,,                   ,\n";
        logo += ",             `,                    ,\n";
        logo += ",             ,                     ,\n";
        logo += ",             `                     ,\n";
        logo += ",            `                      ,\n";
        logo += ",                                   ,\n";
        logo += "`,                                 .,\n";
        logo += " .,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, \n\n\n\n";
        return logo;
    }

};