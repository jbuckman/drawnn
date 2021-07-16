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
        x,ith_fourier(x,1),ith_fourier(x,2),ith_fourier(x,3),ith_fourier(x,4),ith_fourier(x,5),ith_fourier(x,6),ith_fourier(x,7),ith_fourier(x,8),ith_fourier(x,9),
        y,ith_fourier(y,1),ith_fourier(y,2),ith_fourier(y,3),ith_fourier(y,4),ith_fourier(y,5),ith_fourier(y,6),ith_fourier(y,7),ith_fourier(y,8),ith_fourier(y,9),
        ]};
}

function createModel() {
    // Create a sequential model
    const model = tf.sequential();

    // Add a single input layer
    model.add(tf.layers.dense({inputDim: 20, units: 32, useBias: true, activation: 'relu'}));

    // hidden layer
    model.add(tf.layers.dense({units: 64, useBias: true, activation: 'relu'}));
    model.add(tf.layers.dense({units: 128, useBias: true, activation: 'relu'}));
    model.add(tf.layers.dense({units: 128, useBias: true, activation: 'relu'}));
    // // Add an output layer
    model.add(tf.layers.dense({units: 3, useBias: true}));
    self.model = model;
    return model;
}

class SinLayer extends tf.layers.Layer {
  call(input) {
    return tf.tidy(() => {
      return tf.sin(input[0]);
    });
  }
  static get className() {
    return 'SinLayer';
  }
}
tf.serialization.registerClass(SinLayer);

// function createModel() {
//     const sl = (new SinLayer());
//     const input = tf.input({shape: [2]});
//     const dense1a = tf.layers.dense({units: 16, useBias: true, activation: 'relu'}).apply(input);
//     const dense1b = tf.layers.dense({units: 16, useBias: true}).apply(input);
//     const concat1 = tf.layers.concatenate().apply([dense1a, sl.apply(dense1b)]);
//     const dense2a = tf.layers.dense({units: 32, useBias: true, activation: 'relu'}).apply(concat1);
//     const dense2b = tf.layers.dense({units: 32, useBias: true}).apply(concat1);
//     const concat2 = tf.layers.concatenate().apply([dense2a, sl.apply(dense2b)]);
//     const dense3a = tf.layers.dense({units: 64, useBias: true, activation: 'relu'}).apply(concat2);
//     const dense3b = tf.layers.dense({units: 64, useBias: true}).apply(concat2);
//     const concat3 = tf.layers.concatenate().apply([dense3a, sl.apply(dense3b)]);
//     const dense4a = tf.layers.dense({units: 64, useBias: true, activation: 'relu'}).apply(concat3);
//     const dense4b = tf.layers.dense({units: 64, useBias: true}).apply(concat3);
//     const concat4 = tf.layers.concatenate().apply([dense4a, sl.apply(dense4b)]);
//     const output =
//         tf.layers.dense({units: 3, useBias: true}).apply(concat4);
//
//     const model = tf.model({inputs: input, outputs: output});
//     self.model = model;
//     return model;
// }

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
    var steps = 0;
    var last_steps = 0;
    var last_update = Date.now();

    var onBatchEnd = async function(batch, logs) {
        steps++;
    };

    var onYield = async function(epoch, batch, logs) {
        console.log('log:', steps, logs.loss);
        console.log('train steps/sec:', 1000*(steps-last_steps)/(Date.now()-last_update), 'train ms/render:', (Date.now()-last_update));
        console.time('render');
        const imgarray = await renderFromModel(model, event.data.res);
        console.timeEnd('render');
        self.postMessage({
            command: 'update',
            image: imgarray
        });
        last_update = Date.now();
        last_steps = steps;
    };


    model.fit(tf.tensor2d(inputs), tf.tensor2d(outputs), {
       epochs: 100000000000000000000,
       batchSize: 512,
       yieldEvery: event.data.renderRate,
       shuffle: true,
       callbacks: {onYield, onBatchEnd}
     });
};