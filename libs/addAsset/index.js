import '@babel/polyfill';

export default class AddAsset {
    constructor(filePath, source) {
        this.filePath = filePath;
        this.source = source;
    }
    apply(compiler) {
        compiler.hooks.emit.tapPromise(
            this.constructor.name,
            async compilation => {
                // console.log(`\n\n ************* \n`);
                // console.log(compilation);
                // console.log(`\n\n ************* \n`);

                const source =Ï
                    typeof this.source === 'string'
                        ? this.source
                        : await this.source(compilation);
                compilation.assets[this.filePath] = {
                    source: _ => source,
                    size: _ => source.length,
                };
            },
        );
    }
}
