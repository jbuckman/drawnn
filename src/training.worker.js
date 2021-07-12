import * as tf from 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.0.0/dist/tf.fesm.min.js';

function createModel() {
    // Create a sequential model
    const model = tf.sequential();

    // Add a single input layer
    model.add(tf.layers.dense({inputDim: 2, units: 12, useBias: true, activation: 'relu'}));

    // hidden layer
    model.add(tf.layers.dense({units: 12, useBias: true, activation: 'relu'}));
    model.add(tf.layers.dense({units: 12, useBias: true, activation: 'relu'}));
    model.add(tf.layers.dense({units: 12, useBias: true, activation: 'relu'}));
    // // Add an output layer
    model.add(tf.layers.dense({units: 1, useBias: true}));
    self.model = model;
    return model;
}

function step(model, inputs, outputs, batch_size) {
    const batch_idx = Array.from({length: batch_size}, () => Math.floor(Math.random() * inputs.length));
    const batch_inputs = batch_idx.map(idx => inputs[idx]);
    const batch_outputs = batch_idx.map(idx => outputs[idx]);
    return model.trainOnBatch(tf.tensor2d(batch_inputs), tf.tensor2d(batch_outputs));
}

export const model = createModel();

model.compile({
    optimizer: tf.train.sgd(.01),
    loss: tf.losses.meanSquaredError,
});

self.onmessage = event => {
  const data = event.data;
  console.log('got this data', data);
  if (data.command == 'start'){
    const inputs = data.dataset_inputs;
    const outputs = data.dataset_outputs;
    const out = step(model, inputs, outputs, 32);
    console.log(out);
  }
};