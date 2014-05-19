module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    BASE_PATH: '',
    DEVELOPMENT_PATH: '',

    yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    extension: '.js',                               
                    paths: '<%= DEVELOPMENT_PATH %>' + 'src/',
                    outdir: '<%= BASE_PATH %>' + 'docs/'
                }
            }
        },

    uglify: {
        build: {
            files: {
              'src/cocoonInAppPurchase-<%= pkg.version %>.min.js': ['<%= pkg.main %>']
            }
        },

        intro: {
            files: {
              'examples/intro/final/gamemin.js': [
                'lib/CocoonJSExtensions/CocoonJS.js',
                'lib/CocoonJSExtensions/CocoonJS_Ad.js',
                'lib/CocoonJSExtensions/CocoonJS_App.js',
                'lib/CocoonJSExtensions/CocoonJS_App_ForCocoonJS.js',
                'lib/CocoonJSExtensions/CocoonJS_Store.js',
                'lib/kiwi.js',
                'src/cocoonInAppPurchase-<%= pkg.version %>.js',
                'lib/plugins/bitmapText-1.1.js',
                'examples/intro/main.js'
              ]
            }
        },

        sierra: {
            files: {
              'examples/sierra/final/gamemin.js': [
                'lib/CocoonJSExtensions/CocoonJS.js',
                'lib/CocoonJSExtensions/CocoonJS_Ad.js',
                'lib/CocoonJSExtensions/CocoonJS_App.js',
                'lib/CocoonJSExtensions/CocoonJS_App_ForCocoonJS.js',
                'lib/CocoonJSExtensions/CocoonJS_Store.js',
                'lib/kiwi.js',
                'src/cocoonInAppPurchase-<%= pkg.version %>.js',
                'examples/sierra/main.js'
              ]
            }
        },

        bootcamp: {
            files: {
              'examples/bootcamp/final/gamemin.js': [
                'lib/CocoonJSExtensions/CocoonJS.js',
                'lib/CocoonJSExtensions/CocoonJS_Ad.js',
                'lib/CocoonJSExtensions/CocoonJS_App.js',
                'lib/CocoonJSExtensions/CocoonJS_App_ForCocoonJS.js',
                'lib/CocoonJSExtensions/CocoonJS_Store.js',
                'lib/kiwi.js',
                'src/cocoonInAppPurchase-<%= pkg.version %>.js',
                'lib/plugins/bitmapText-1.1.js',
                'lib/plugins/saveManager-1.0.1.js',
                'examples/bootcamp/classes.js',
                'examples/bootcamp/main.js'
              ]
            }
        }

    },
 
    copy: {

        whole: {
          src: ['src/**', 'examples/**', 'lib/**', 'docs/**', 'README.md'],
          dest: 'dist/<%= pkg.name %>-<%= pkg.version %>/'
        },

        intro: {
          expand: true,
          flatten: true,
          cwd: 'examples/intro/images/',
          src: '**',
          dest: 'examples/intro/final/images/'
        },

        sierra: {
          expand: true,
          flatten: true,
          cwd: 'examples/sierra/images/',
          src: '**',
          dest: 'examples/sierra/final/images/'
        },

        bootcamp: {
          expand: true,
          flatten: true,
          cwd: 'examples/bootcamp/images/',
          src: '**',
          dest: 'examples/bootcamp/final/images/'
        }

    }

 });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-contrib-copy');

  
  
  
  grunt.registerTask("default", ["uglify:build"]);
  grunt.registerTask("full", ["uglify:build","yuidoc:compile","copy:whole"]);


  grunt.registerTask('intro', ["copy:intro", "uglify:intro" ]);
  grunt.registerTask('sierra', ["copy:sierra", "uglify:sierra" ]);
  grunt.registerTask('bootcamp', ["copy:bootcamp", "uglify:bootcamp" ]);


};