import path from 'path';

export default class Manifest {
    constructor(options = {}) {
        this.options = Object.assign(
            {
                name: 'webApp',
                short_name: 'Web App',
                description: '',
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
            },
            options,
        );
    }
    apply(compiler) {
        compiler.hooks.done.tap('Hello World Plugin', stats => {
            console.log(
                '\n\n ************* \n Hello World! \n ************* \n\n',
            );
        });

        console.log('\n\n ************* \n');
        console.log(this.constructor.name);
        console.log('\n\n ************* \n');

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
                    this.addTag(htmlPluginData, compilation).then(data => {
                        callback(null, data);
                    });
                },
            );
        });

        compiler.hooks.emit.tapAsync(
            this.constructor.name,
            (compilation, callback) => {
                let file_name = 'test__manifest';
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
    addTag(htmlPluginData, compilation) {
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
            `<meta name="theme-color" content="${this.options.theme_color}">`,
            // `<link rel="icon" sizes="192x192" href="icon.png">`,
            // `<link rel="apple-touch-icon" href="ios-icon.png">`,
            `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`,
            `<meta name="apple-mobile-web-app-capable" content="yes">`,
            `<meta name="apple-mobile-web-app-title" content="${this.options.name}">`,
        ].concat(
            this.options.icons.map(item => {
                return `<link rel="icon" sizes="${item.sizes}" href="${item.src}">`;
            }),
        );
        const max = Math.max(...this.options.icons.map(i => parseInt(i.sizes))),
            app_tag = this.options.icons.find(i => {
                let val = parseInt(i.sizes);
                return val === max;
            });
        app_tag &&
            tags.push(`<link rel="apple-touch-icon" href="${app_tag.src}">`);

        return tags;
    }
}
