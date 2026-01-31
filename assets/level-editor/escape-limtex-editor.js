tiled.registerMapFormat("ell-map", {
    name: "ESCAPE LIMTEX LABORATORIES Map (v0.6.0+)",
    extension: "json", 
    write: function(map, fileName) {
        let entries = [];

        function pushEntry(tileId, tx, ty, dataValue) {
            let parts = [tileId, tx, ty];

            if (dataValue !== undefined && dataValue !== null && String(dataValue) !== "") {
                if (typeof dataValue === "object")
                    dataValue = JSON.stringify(dataValue);
                parts.push(String(dataValue));
            }

            entries.push(parts.join(", "));
        }

        for (let layer of map.layers) {
            if (layer.isTileLayer) {
                for (let y = 0; y < layer.height; ++y) {
                    for (let x = 0; x < layer.width; ++x) {
                        let tile = layer.tileAt(x, y);
                        if (tile !== null) {
                            let tileId = tile.id + 1;

                            let flippedY = layer.height - 1 - y;

                            let dataVal;
                            try { dataVal = tile.property("data"); } catch (e) { dataVal = undefined; }

                            pushEntry(tileId, x, flippedY, dataVal);
                        }
                    }
                }

            } else if (layer.isObjectLayer) {
                for (let obj of layer.objects) {
                    if (!obj.tile) continue;

                    let tile = obj.tile;
                    let tx = Math.floor(obj.x / map.tileWidth);
                    // Flip Y coordinate relative to map height
                    let ty = 1 + (map.height - 1 - Math.floor(obj.y / map.tileHeight));

                    let tileId = tile.id + 1;

                    let dataVal;
                    try { dataVal = obj.property("data"); } catch (e) { dataVal = undefined; }
                    if (dataVal === undefined || dataVal === null) {
                        try { dataVal = tile.property("data"); } catch (e) { dataVal = undefined; }
                    }

                    pushEntry(tileId, tx, ty, dataVal);
                }
            }
        }

        let file = new TextFile(fileName, TextFile.WriteOnly);
        file.write(JSON.stringify(entries, null, 4));
        file.commit();
    }
});