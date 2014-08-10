require.config({
    paths: {
        "jquery": "lib/jquery",
        "zlib": "lib/zlib.min",
        "tmxjs": "lib/tmxjs",
    },
    shim: {
        zlib: { exports: "Zlib" }
    }
});

require([
    "jquery",
    "tmxjs/map",
], function (
    $,
    Map
) {
    console.log('hi!');
    // Code that uses TMXjs goes here.
    var url = "images/tilemap.tmx";
    var options = {
        // Extracts the URL path. This is required to be passed to Map.fromXML(...) or
        // it will assume all resources like TSX files and images are in the current folder.
        dir: url.split("/").slice(0, -1) || "."
    };

    $.get(url, {}, null, "xml").done(function (xml) {
        // fromXML calls are asynchronous because TSX resources may need to be loaded by TMXjs.
        Map.fromXML(xml, options).done(function (map) {
            // Code that uses the Map object goes here.
            console.log(map);
        });
    });
});