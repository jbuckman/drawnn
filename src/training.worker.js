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

// function createModel() {
//     // Create a sequential model
//     const model = tf.sequential();
//
//     // Add a single input layer
//     model.add(tf.layers.dense({inputDim: 20, units: 32, useBias: true, activation: 'relu'}));
//
//     // hidden layer
//     model.add(tf.layers.dense({units: 64, useBias: true, activation: 'relu'}));
//     model.add(tf.layers.dense({units: 128, useBias: true, activation: 'relu'}));
//     model.add(tf.layers.dense({units: 128, useBias: true, activation: 'relu'}));
//     // // Add an output layer
//     model.add(tf.layers.dense({units: 3, useBias: true}));
//     self.model = model;
//     return model;
// }

class SinLayer extends tf.layers.Layer {
  call(input) {
    return tf.tidy(() => {
      return tf.add(input[0], tf.mul(.1, tf.sin(tf.sin(tf.mul(10., input[0])))));
    });
  }
  static get className() {
    return 'SinLayer';
  }
}
tf.serialization.registerClass(SinLayer);

function createModel() {
    const input = tf.input({shape: [20]});
    // const input = tf.input({shape: [2]});
    // const dense1 = tf.layers.dense({units: 18, useBias: true}).apply(input);
    // const sl = (new SinLayer()).apply(dense1);
    // const concat1 = tf.layers.concatenate().apply([dense1, sl]);
    // const dense2 = tf.layers.dense({units: 32, useBias: true, activation: 'relu'}).apply(concat1);
    const dense2 = tf.layers.dense({units: 32, useBias: true, activation: 'relu'}).apply(input);
    const dense3 = tf.layers.dense({units: 64, useBias: true, activation: 'relu'}).apply(dense2);
    const dense4 = tf.layers.dense({units: 128, useBias: true, activation: 'relu'}).apply(dense3);
    const dense5 = tf.layers.dense({units: 128, useBias: true, activation: 'relu'}).apply(dense4);
    const output = tf.layers.dense({units: 3, useBias: true}).apply(dense5);


    /*
    const sl = (new SinLayer());
    const input = tf.input({shape: [2]});
    const dense2 = tf.layers.dense({units: 32, useBias: true}).apply(input);
    const dense3 = tf.layers.dense({units: 64, useBias: true}).apply(sl.apply(dense2));
    const dense4 = tf.layers.dense({units: 128, useBias: true}).apply(sl.apply(dense3));
    const dense5 = tf.layers.dense({units: 128, useBias: true}).apply(sl.apply(dense4));
    const output = tf.layers.dense({units: 3, useBias: true}).apply(sl.apply(dense5));
    */

    const model = tf.model({inputs: input, outputs: output});
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

    onYield(0,0,{loss: 9999});

    model.fit(tf.tensor2d(inputs), tf.tensor2d(outputs), {
       epochs: 100000000000000000000,
       batchSize: 512,
       yieldEvery: event.data.renderRate,
       shuffle: true,
       callbacks: {onYield, onBatchEnd}
     });
};