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

    describe(`${descriptionPrefix} suite: `, function() {
        function applyCompiler(config = {}, callback) {
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
                    plugins: [
                        new HtmlWebpackPlugin(),
                        new manifestPlugin({
                            ...config
                        })
                    ]
                },
                function(err, result) {
                    typeof callback === 'function' && callback.call(this, err, result);
                }
            );
            compiler.outputFileSystem = new MemoryFileSystem();
        }

        it('should add the <meta> and <link> tags', function(done) {
            applyCompiler({}, function(err, result) {
                expect(err).toBeFalsy(err);
                expect(result.compilation.errors.length).toBe(0, result.compilation.errors.join('\n=========\n'));

                const html = result.compilation.assets['index.html'].source();
                const dom = new JSDOM(html);

                // meta
                const all_meta_list = dom.window.document.head.querySelectorAll('meta');
                expect(all_meta_list.length).not.toBe(0);

                const name_list = ['theme-color', 'apple-mobile-web-app-status-bar-style', 'apple-mobile-web-app-capable', 'apple-mobile-web-app-title'];
                const meta_list = Array.prototype.filter.call(all_meta_list, item => {
                    let name = item.getAttribute('name');
                    return name_list.indexOf(name) > -1;
                });
                expect(meta_list.length).toBe(name_list.length);

                // link
                const all_link_list = dom.window.document.head.querySelectorAll('link');
                expect(all_link_list.length).not.toBe(0);

                const apple_icons = dom.window.document.head.querySelectorAll('link[rel="apple-touch-icon"]');
                expect(apple_icons.length).toBe(1);

                const icon_list = dom.window.document.head.querySelectorAll('link[rel="icon"]');
                expect(icon_list.length).toBe(2);

                expect(Array.prototype.find.call(icon_list, i => i.getAttribute('sizes') === '192x192')).not.toBeUndefined();
                expect(Array.prototype.find.call(icon_list, i => i.getAttribute('sizes') === '512x512')).not.toBeUndefined();

                // rel="manifest"
                const manifest = dom.window.document.head.querySelectorAll('link[rel="manifest"]');
                expect(manifest.length).toBe(1);

                done();
            });
        });

        
    });
};
