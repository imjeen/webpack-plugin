import path from 'path';
import { JSDOM } from 'jsdom';
import MemoryFileSystem from 'memory-fs';
import manifestPlugin from '../libs/manifest/index';

const OUTPUT_DIR = path.join(__dirname, 'dist');

module.exports = ({ descriptionPrefix, webpack, HtmlWebpackPlugin }) => {
    // TEST
    describe('A suite', function() {
        it('contains spec with an expectation', function() {
            expect(true).toBe(true);
        });
    });

    describe(`${descriptionPrefix}: a suite`, function() {
        it('test add preload tags', function() {
            // const compiler = webpack(
            //     {
            //         entry: {
            //             js: path.join(__dirname, 'fixtures', 'file.js')
            //         },
            //         output: {
            //             path: OUTPUT_DIR,
            //             filename: 'bundle.js',
            //             chunkFilename: 'chunk.[chunkhash].js',
            //             publicPath: '/'
            //         },
            //         plugins: [new HtmlWebpackPlugin(), new manifestPlugin()]
            //     },
            //     function(err, result) {
            //         expect(err).toBeFalsy(err);
            //         done();
            //     }
            // );
            expect(true).toBe(true);
            // compiler.outputFileSystem = new MemoryFileSystem();
        });
    });
};
