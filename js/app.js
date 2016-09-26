document.addEventListener("DOMContentLoaded", function (event) {

    //Function which generates a camo layer, using Perlini noise, and puts it into imgData
    function generateCamoLayer(imgdata, red, green, blue, threshold, seed) {
        noise.seed(seed);

        for (var x = 0; x < canvas.width; x++) {
            for (var y = 0; y < canvas.height; y++) {
                var value = noise.perlin2(x / 100, y / 100);

                if (value < threshold) {
                    imgdata[cell + 3] = 255;
                    var cell = (x + y * canvas.width) * 4;
                    imgdata[cell] = red;
                    imgdata[cell + 1] = green;
                    imgdata[cell + 2] = blue;
                }
            }
        }
    };

    //Naive function of pixelation. Takes left-most pixel of every square (size of pixelation parameter) and
    //fills this square with the same color.
    function pixelate(context, pixelation) {
        pixelated = true;

        var imageData = context.getImageData(0, 0, canvas.width, canvas.height),
            data = imageData.data;

        for (var i = 0; i < data.length; i++) {
            backup[i] = data[i];
        }

        for (var y = 0; y < canvas.height; y += pixelation) {

            for (var x = 0; x < canvas.width; x += pixelation) {

                var red = data[((canvas.width * y) + x) * 4];
                var green = data[((canvas.width * y) + x) * 4 + 1];
                var blue = data[((canvas.width * y) + x) * 4 + 2];

                for (var n = 0; n < pixelation; n++) {

                    for (var m = 0; m < pixelation; m++) {

                        if (x + m < canvas.width) {
                            data[((canvas.width * (y + n)) + (x + m)) * 4] = red;
                            data[((canvas.width * (y + n)) + (x + m)) * 4 + 1] = green;
                            data[((canvas.width * (y + n)) + (x + m)) * 4 + 2] = blue;
                        }

                    }

                }

            }

        }

        context.putImageData(imageData, 0, 0);
    };

    //Removes pixelation from the image, using backed-up canvas in process of pixelation
    function depixelate(context) {
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height),
            data = imageData.data;

        for (var i = 0; i < backup.length; i++) {
            data[i] = backup[i];
        }

        context.putImageData(imageData, 0, 0);
        pixelated = false;
    };

    function pixelateOrNoPixelate(context, pixelation) {
        if (pixelated) {
            depixelate(context);
        } else {
            pixelate(context, pixelation);
        }
    };

    //Function which puts a camo layer to the context
    function putCamoLayer(context, camo) {
        var img = context.createImageData(canvas.width, canvas.height);

        for (var i = 0; i < camo.length; i++) {
            generateCamoLayer(img.data, camo[i].red, camo[i].green, camo[i].blue, camo[i].treshhold, layerSeeds[i])
        }

        ctx.putImageData(img, 0, 0);

    };

    //Function which updates controls accordingly to the camouflage preset
    function setControls(camo) {
        for (var i = 0; i < camo.length; i++) {
            if (i !== 0) {document.getElementById("layer" + i + "tr").value = camo[i].treshhold;} //Skipping base layer
            document.getElementById("layer" + i + "color").jscolor.fromRGB(camo[i].red, camo[i].green, camo[i].blue);
        }
    };


    //Fucntion which updates a canvas accordingly to the settings
    function updateCurrent() {

        for (var i = 0; i < numOfLayers; i++) {
            if (i !== 0) {current[i].treshhold = document.getElementById('layer' + i + 'tr').value;} //Skipping base layer

            var currentColor = document.getElementById("layer" + i + "color");
            current[i].red = currentColor.jscolor.rgb[0];
            current[i].green = currentColor.jscolor.rgb[1];
            current[i].blue = currentColor.jscolor.rgb[2];
        }

        putCamoLayer(ctx, current);
    };

    function ColorLayer(red, green, blue, treshhold) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.treshhold = treshhold;
    }

    function reSeed() {
        for (var i = 0; i < layerSeeds.length; i++) {
            layerSeeds[i] = Math.random();
        }
    }

    //Camo presets
    var greenCamo = [
        new ColorLayer(213, 209, 138, 1),
        new ColorLayer(143, 148, 92, 0.2),
        new ColorLayer(82, 92, 68, -0.1),
        new ColorLayer(40, 50, 39, -0.3)
    ];

    var winterCamo = [
        new ColorLayer(223, 223, 223, 1),
        new ColorLayer(192, 192, 192, 0.2),
        new ColorLayer(142, 142, 142, -0.1),
        new ColorLayer(48, 48, 48, -0.3)
    ];

    var desertCamo = [
        new ColorLayer(241, 214, 193, 1),
        new ColorLayer(231, 196, 164, 0.2),
        new ColorLayer(212, 182, 144, -0.1),
        new ColorLayer(149, 105, 70, -0.3)
    ];

    var greenAndBrown = [
        new ColorLayer(64, 103, 24, 1),
        new ColorLayer(38, 61, 19, 0.1),
        new ColorLayer(37, 50, 22, -0.1),
        new ColorLayer(66, 45, 16, -0.3)
    ];

    var possibleCamos = [greenCamo, winterCamo, desertCamo, greenAndBrown];

    var layerSeeds = [
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random()
    ];

    //App flow
    var backup = [];

    var pixelated = false;
    var pixelation = 16;
    var numOfLayers = 4;

    var canvas = document.getElementsByTagName('canvas')[0];
    canvas.width = 512;
    canvas.height = 512;

    var ctx = canvas.getContext('2d');
    var current = greenCamo;
    putCamoLayer(ctx, current);
    setControls(current);


    // Event Listeners for buttons and etc
    document.getElementById('camotype').addEventListener("change", function () {
        current = possibleCamos[document.getElementById('camotype').value];
        putCamoLayer(ctx, current);
        if (pixelated) {
            pixelate(ctx, pixelation);
        }
        setControls(current);
    });

    document.getElementById('pixelated').addEventListener("change", function () {
        pixelateOrNoPixelate(ctx, pixelation);
    });

    document.getElementById('regen').addEventListener("click", function () {
        updateCurrent(ctx, pixelation);
        if (pixelated) {
            pixelate(ctx, pixelation);
        }
    });

    document.getElementById('reseed').addEventListener("click", function () {
        reSeed();
        updateCurrent(ctx, pixelation);
        if (pixelated) {
            pixelate(ctx, pixelation);
        }
    });

});