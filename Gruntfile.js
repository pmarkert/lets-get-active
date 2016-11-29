var grunt = require('grunt');
grunt.loadNpmTasks('grunt-aws-lambda');

grunt.initConfig({
    lambda_invoke: {
        default: {
	    file_name: process.env.EVENT_FILE || grunt.option('event_file') || "event.json",
        }
    },
    lambda_deploy: {
        default: {
            arn: process.env.LAMBDA_ARN,
            timeout: process.env.LAMBDA_TIMEOUT || 300
        }
    },
    lambda_package: {
        default: {
        }
    }
});

grunt.registerTask('invoke', [ 'lambda_invoke' ]);
grunt.registerTask('deploy', ['lambda_package', 'lambda_deploy']);
