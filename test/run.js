import path from 'path';
import Jasmine from 'jasmine';

let jasmine = new Jasmine();
jasmine.loadConfigFile(path.resolve(__dirname, './support/jasmine.json'));
jasmine.execute(['test/unit/* ', 'test/demo/index.js']);
jasmine.onComplete(function(passed) {
    if (passed) {
        console.log('All specs have passed');
    } else {
        console.log('At least one spec has failed');
    }
});
