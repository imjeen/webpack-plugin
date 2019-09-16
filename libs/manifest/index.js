import path from 'path';
import fs from 'fs';

export default class Manifest {
    constructor(options = {}, config = {}) {
        this.options = Object.assign(
            {
                name: 'webApp',
                short_name: 'Web App',
                description: 'a web app',
                icons: [
                    {
                        src: '/images/icons-192.png',
                        type: 'image/png',
                        sizes: '192x192',
                    },
                    {
                        src: '/images/icons-512.png',
                        type: 'image/png',
                        sizes: '512x512',
                    },
                ],
                start_url: '/?source=pwa',
                background_color: '#fff',
                display: 'standalone',
                scope: '/',
                theme_color: '#fff',
                // the native app install prompt will be shown or not be shown
                related_applications: [],
                prefer_related_applications: false,
            },
            options,
        );
        this.config = Object.assign(
            {
                publicPath: './',
                outputPath: '',
                ingnore_htmls: [],
            },
            config,
        );
        // this.outputPath = '';
    }
    apply(compiler) {
        // console.log(`\n\n ************* \n
        //         ${compiler.options.output.path}
        //     \n\n ************* \n`);

        // this.outputPath = compiler.options.output.path;

        compiler.hooks.compilation.tap(this.constructor.name, compilation => {
            // This is set in html-webpack-plugin pre-v4.
            let html_hook =
                compilation.hooks.htmlWebpackPluginAfterHtmlProcessing;

            if (!html_hook) {
                const [HtmlWebpackPlugin] = compiler.options.plugins.filter(
                    plugin => plugin.constructor.name === 'HtmlWebpackPlugin',
                );
                html_hook = HtmlWebpackPlugin.constructor.getHooks(compilation)
                    .beforeEmit;
            }

            html_hook.tapAsync(
                this.constructor.name,
                (htmlPluginData, callback) => {
                    if (
                        this.config.ingnore_htmls.indexOf(
                            htmlPluginData.outputName,
                        ) > -1
                    ) {
                        return callback(null, htmlPluginData);
                    }
                    this.addTag(htmlPluginData).then(data => {
                        callback(null, data);
                    });
                },
            );
        });

        compiler.hooks.emit.tapAsync(
            this.constructor.name,
            (compilation, callback) => {
                this.setIcons(compilation);
                let file_name = './manifest.json';
                this.addFileToAssets(file_name, compilation).then(_ => {
                    callback();
                });
            },
        );
    }
    addFileToAssets(filename, compilation) {
        // filename = path.resolve(compilation.compiler.context, filename);
        return Promise.resolve().then(_ => {
            let file_content = JSON.stringify(this.options, null, 2);
            compilation.assets[filename] = {
                source: _ => file_content,
                size: _ => file_content.length,
            };
        });
    }
    addTag(htmlPluginData) {
        const { html } = htmlPluginData;
        if (!html.includes('</head>')) return Promise.resolve(htmlPluginData);

        let tags = this.getTags();
        htmlPluginData.html = html.replace(
            '</head>',
            tags.concat('</head>').join('\n'),
        );

        return Promise.resolve(htmlPluginData);
    }
    getTags() {
        let tags = [
            `<link rel="manifest" href="./manifest.json">
            <meta name="theme-color" content="${this.options.theme_color}">`,
            // `<link rel="icon" sizes="192x192" href="icon.png">`,
            // `<link rel="apple-touch-icon" href="ios-icon.png">`,
            `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`,
            `<meta name="apple-mobile-web-app-capable" content="yes">`,
            `<meta name="apple-mobile-web-app-title" content="${this.options.name}">`,
        ].concat(
            this.options.icons.map(item => {
                return `<link rel="icon" sizes="${item.sizes}" href="${this
                    .config.publicPath +
                    path.join(
                        this.config.outputPath,
                        path.basename(item.src),
                    )}">`;
            }),
        );
        const max = Math.max(...this.options.icons.map(i => parseInt(i.sizes))),
            app_tag = this.options.icons.find(i => {
                let val = parseInt(i.sizes);
                return val === max;
            });
        app_tag &&
            tags.push(
                `<link rel="apple-touch-icon" href="${this.config.publicPath +
                    path.join(
                        this.config.outputPath,
                        path.basename(app_tag.src),
                    )}">`,
            );

        return tags;
    }
    setIcons(compilation) {
        this.options.icons = this.options.icons
            .filter(item => {
                let src = item.src;
                if (!fs.existsSync(src)) {
                    console.log(`${src} file not exit!`);
                    return false;
                }
                return true;
            })
            .map(item => {
                let src = item.src;
                let filename = path.join(
                        // this.config.publicPath,
                        this.config.outputPath,
                        path.basename(src),
                    ),
                    fileData = fs.readFileSync(src);

                compilation.assets[filename] = {
                    source: _ => fileData,
                    size: _ => fileData.length,
                };
                return {
                    ...item,
                    src: filename,
                };
            });
    }
}
