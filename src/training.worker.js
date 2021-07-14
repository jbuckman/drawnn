import * as tf from '@tensorflow/tfjs';

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
};

function ith_fourier(n,i) {
    return Math.sin((2**i) * 2*Math.PI*n)
}

function datarep(shape) {
    return function(coord) {
        const x = coord[0]/shape;
        const y = coord[1]/shape;
        return [
        x,ith_fourier(x,1),ith_fourier(x,2),ith_fourier(x,3),ith_fourier(x,4),ith_fourier(x,5),ith_fourier(x,6),
        y,ith_fourier(y,1),ith_fourier(y,2),ith_fourier(y,3),ith_fourier(y,4),ith_fourier(y,5),ith_fourier(y,6),
        ]};
}

function createModel() {
    // Create a sequential model
    const model = tf.sequential();

    // Add a single input layer
    model.add(tf.layers.dense({inputDim: 14, units: 32, useBias: true, activation: 'relu'}));

    // hidden layer
    model.add(tf.layers.dense({units: 64, useBias: true, activation: 'relu'}));
    model.add(tf.layers.dense({units: 128, useBias: true, activation: 'relu'}));
    model.add(tf.layers.dense({units: 128, useBias: true, activation: 'relu'}));
    // // Add an output layer
    model.add(tf.layers.dense({units: 3, useBias: true}));
    self.model = model;
    return model;
}

async function renderFromModel(model, shape) {
    var inputs = [];
    for (var y=0; y<shape; y++) {
    for (var x=0; x<shape; x++) {
        inputs.push(datarep(shape)([x,y]));
    }}
    const outputs = await (await model.predictOnBatch(tf.tensor2d(inputs))).array();
    var imgarray = [];
    for (var idx=0; idx<shape*shape; idx++) {
        imgarray.push(clamp(Math.round(outputs[idx][0]*255), 0, 255));
        imgarray.push(clamp(Math.round(outputs[idx][1]*255), 0, 255));
        imgarray.push(clamp(Math.round(outputs[idx][2]*255), 0, 255));
        imgarray.push(255);
    }
    return imgarray;
}

export const model = createModel();

model.compile({
    optimizer: tf.train.adam(.005),
    loss: tf.losses.meanSquaredError,
});


self.onmessage = async event => {
    const inputs = event.data.inputs.map(datarep(event.data.width));
    const outputs = event.data.outputs.map(c => [c[0]/255., c[1]/255., c[2]/255.]);
    console.log(event.data.inputs[0], inputs[0], event.data.outputs[0], outputs[0]);
    var steps = 0;
    var last_update = Date.now();

    var onBatchEnd = async function(batch, logs) {
        steps++;
    };

    var onYield = async function(epoch, batch, logs) {
        console.log(steps, logs.loss);
        const imgarray = await renderFromModel(model, event.data.res);
        self.postMessage({
            command: 'update',
            image: imgarray
        });
        last_update = Date.now();
    };


    model.fit(tf.tensor2d(inputs), tf.tensor2d(outputs), {
       epochs: 100000000000000000000,
       batchSize: 512,
       yieldEvery: 2000,
       shuffle: true,
       callbacks: {onYield, onBatchEnd}
     });
};