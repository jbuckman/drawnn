import * as tf from '@tensorflow/tfjs';

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
};

function createModel() {
    // Create a sequential model
    const model = tf.sequential();

    // Add a single input layer
    model.add(tf.layers.dense({inputDim: 2, units: 64, useBias: true, activation: 'relu'}));

    // hidden layer
    model.add(tf.layers.dense({units: 64, useBias: true, activation: 'relu'}));
    model.add(tf.layers.dense({units: 64, useBias: true, activation: 'relu'}));
    model.add(tf.layers.dense({units: 64, useBias: true, activation: 'relu'}));
    // // Add an output layer
    model.add(tf.layers.dense({units: 3, useBias: true}));
    self.model = model;
    return model;
}

async function step(model, inputs, outputs, batch_size) {
    const batch_idx = Array.from({length: batch_size}, () => Math.floor(Math.random() * inputs.length));
    const batch_inputs = batch_idx.map(idx => inputs[idx]);
    const batch_outputs = batch_idx.map(idx => outputs[idx]);
    return await model.trainOnBatch(tf.tensor2d(batch_inputs), tf.tensor2d(batch_outputs));
}

async function renderFromModel(model, shape) {
    var inputs = [];
    for (var y=0; y<shape; y++) {
    for (var x=0; x<shape; x++) {
        inputs.push([x/shape,y/shape])
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
    optimizer: tf.train.adam(.0005),
    loss: tf.losses.meanSquaredError,
});

self.onmessage = async event => {
  const data = event.data;
  if (data.command == 'start'){
    const inputs = data.inputs;
    const outputs = data.outputs;
    var loss;
    var last_update = Date.now();
    while (true) {
        loss = await step(model, inputs, outputs, 32);
        if (Date.now() - last_update > 1000) {
            console.log(loss);
            const imgarray = await renderFromModel(model, 32);
            self.postMessage({
                command: 'update',
                image: imgarray
            });
            last_update = Date.now();
        }
    }
  }
};