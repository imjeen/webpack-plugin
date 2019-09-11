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
        it('test add preload tags', function(done) {
            const compiler = webpack(
                {
                    entry: {
                        js: path.join(__dirname, 'fixtures', 'file.js')
                    },
                    output: {
                        path: OUTPUT_DIR,
                        filename: 'bundle.js',
                        chunkFilename: 'chunk.[chunkhash].js',
                        publicPath: '/'
                    },
                    plugins: [new HtmlWebpackPlugin(), new manifestPlugin()]
                },
                function(err, result) {
                    expect(err).toBeFalsy(err);
                    expect(result.compilation.errors.length).toBe(0, result.compilation.errors.join('\n=========\n'));

                    const html = result.compilation.assets['index.html'].source();
                    const dom = new JSDOM(html);

                    const all_meta_list = dom.window.document.head.querySelectorAll('head meta');
                    expect(all_meta_list.length).not.toBe(0);

                    const name_list = ['theme-color', 'apple-mobile-web-app-status-bar-style', 'apple-mobile-web-app-capable', 'apple-mobile-web-app-title'];
                    const meta_list = Array.prototype.filter.call(all_meta_list, item => {
                        let name = item.getAttribute('name');
                        return name_list.indexOf(name) > -1;
                    });
                    expect(meta_list.length).toBe(name_list.length);

                    done();
                }
            );
            compiler.outputFileSystem = new MemoryFileSystem();
        });
    });
};
