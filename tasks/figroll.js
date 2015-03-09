/*
 * grunt-figroll
 * https://github.com/sam/grunt-figroll
 *
 * Copyright (c) 2015 Sam Clift
 * Licensed under the MIT license.
 *
 *

# To get this go to your site it Figroll, look at the URL - you'll see the ID
SiteId = ""

# Bit more faff to get this - check a GET request made in the Inspector and
# copy the token
UploadKey = ""

# Your public folder
PublicFolder = "/path/to/your/folder"


var envs = map[string]string {
    "dev": "http://localhost:9090",
    "staging": "https://staging.figroll.io",
    "production": "https://app.figroll.io:2113",
}

 */

'use strict';

var request = require('superagent');
var EasyZip = require('easy-zip').EasyZip;
var fs = require('fs');
var path = require('path');

module.exports = function(grunt) {

  grunt.registerMultiTask('figroll', 'A plugin to upload a new version of your static site to figroll.io', function() {

    var done = this.async();
    var options = this.options();

    if(!options.siteId || !options.uploadKey){
        grunt.log.warn('You need to have an upload key and a site id to upload to figroll!');
        done(false);
    }

    if(!options.buildFolder){
        grunt.log.warn('You need to have a build folder specfied to upload to figroll!');
        done(false);
    }

    grunt.log.writeln('Zipping');

    var zip = new EasyZip();
    var zipName = new Date().getTime() + '.zip';

    grunt.log.writeln(zipName);

    zip.zipFolder(options.buildFolder, function(){
        zip.writeToFile('./' + zipName);

        grunt.log.writeln('Starting upload');

        var dirString = path.dirname(fs.realpathSync('GruntFile.js'));

        request
          .post('https://app.figroll.io:2113/sites/' + options.siteId + '/upload')
          .set('Accept', 'multipart/form-data')
          .set('Content-Type', 'multipart/form-data')
          .set('Authorization', options.uploadKey)
          .attach('file', dirString + '/' + zipName)
          .end(function(error, res) {
            grunt.log.writeln(error);
            grunt.log.writeln(res);

            done();
          });
    });



  });

};
