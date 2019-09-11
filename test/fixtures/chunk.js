console.log('Hi, I am the chunk.js!');

require.ensure(
    ['./chunk.js'],
    function() {
        console.log('ensure');
    },
    '_chunk'
);
