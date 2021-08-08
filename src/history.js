export default function UndoHistory(historySize = 10, options = {}) {
  const _size = historySize;
  const _onUpdate = options.onUpdate || (() => {});
  let _stack = [];
  let _cursor = -1;
  let _end = -1;

  const api = {
    get atStart() {
      return _cursor <= 0;
    },

    get atEnd() {
      return _cursor === _end;
    },

    get atCapacity() {
      return _cursor === _size - 1;
    },

    get size() {
      return _size;
    },

    get currentItem() {
      return _stack[_cursor];
    },

    reset(initialItem = null) {
      _stack = [];
      _cursor = -1;
      _end = -1;
      if (initialItem != null) {
        api.push(initialItem);
      }
      _onUpdate();
    },

    push(item) {
      if (!api.atEnd || _stack.length === _size) {
        _stack[_cursor + 1] = item;
      } else {
        _stack.push(item);
      }

      if (api.atCapacity) {
        _stack.shift();
      } else {
        _cursor += 1;
        _end = _cursor;
      }
      _onUpdate();
    },

    undo() {
      if (api.atStart) return;
      _cursor -= 1;
      _onUpdate();
    },

    redo() {
      if (api.atEnd) return;
      _cursor += 1;
      _onUpdate();
    },

    toString() {
      return `UndoHistory {size: ${api.size}, atStart: ${api.atStart}, atEnd: ${api.atEnd}, atCapacity: ${api.atCapacity}}`;
    },
  };

  return api;
}

export function testHistory() {
  const assert = (msg, pred) => pred || console.error(msg, h);

  const h = UndoHistory(3);

  assert('h.size === 3', h.size === 3);
  assert('h.atStart', h.atStart);
  assert('h.atEnd', h.atEnd);

  h.push(1);
  assert('h.currentItem === 1', h.currentItem === 1);
  assert('h.atStart', h.atStart);
  assert('h.atEnd', h.atEnd);

  h.push(2);
  assert('h.currentItem === 2', h.currentItem === 2);
  assert('h.atStart', !h.atStart);
  assert('h.atEnd', h.atEnd);

  h.undo();
  assert('h.currentItem === 1', h.currentItem === 1);
  assert('h.atStart', h.atStart);
  assert('h.atEnd', !h.atEnd);
  assert('h.atCapacity', !h.atCapacity);

  h.redo();
  assert('h.currentItem === 2', h.currentItem === 2);
  assert('h.atStart', !h.atStart);
  assert('h.atEnd', h.atEnd);
  assert('h.atCapacity', !h.atCapacity);

  h.push(3);
  assert('h.currentItem', h.currentItem === 3);
  assert('h.atStart', !h.atStart);
  assert('h.atEnd', h.atEnd);
  assert('h.atCapacity', h.atCapacity);

  h.undo();
  assert('h.currentItem', h.currentItem === 2);
  assert('h.atStart', !h.atStart);
  assert('h.atEnd', !h.atEnd);
  assert('h.atCapacity', !h.atCapacity);

  h.push(4);
  assert('h.currentItem === 4', h.currentItem === 4);
  assert('h.atStart', !h.atStart);
  assert('h.atEnd', h.atEnd);
  assert('h.atCapacity', h.atCapacity);

  h.push(5);
  assert('h.currentItem === 5', h.currentItem === 5);
  assert('h.atStart', !h.atStart);
  assert('h.atEnd', h.atEnd);
  assert('h.atCapacity', h.atCapacity);

  h.undo();
  h.undo();
  assert('h.currentItem === 2', h.currentItem === 2);
  assert('h.atStart', h.atStart);
  assert('h.atEnd', !h.atEnd);
  assert('h.atCapacity', !h.atCapacity);

  h.push(6);
  assert('h.currentItem === 6', h.currentItem === 6);
  assert('h.atStart', !h.atStart);
  assert('h.atEnd', h.atEnd);
  assert('h.atCapacity', !h.atCapacity);

  h.push(7);
  assert('h.currentItem === 7', h.currentItem === 7);
  assert('h.atStart', !h.atStart);
  assert('h.atEnd', h.atEnd);
  assert('h.atCapacity', h.atCapacity);

  h.push(8);
  assert('h.currentItem === 8', h.currentItem === 8);
  assert('h.atStart', !h.atStart);
  assert('h.atEnd', h.atEnd);
  assert('h.atCapacity', h.atCapacity);

  h.push(9);
  assert('h.currentItem === 9', h.currentItem === 9);
  assert('h.atStart', !h.atStart);
  assert('h.atEnd', h.atEnd);
  assert('h.atCapacity', h.atCapacity);

  h.undo();
  assert('h.currentItem === 8', h.currentItem === 8);
  assert('h.atStart', !h.atStart);
  assert('h.atEnd', !h.atEnd);
  assert('h.atCapacity', !h.atCapacity);

  h.undo();
  assert('h.currentItem === 7', h.currentItem === 7);
  assert('h.atStart', h.atStart);
  assert('h.atEnd', !h.atEnd);
  assert('h.atCapacity', !h.atCapacity);

  h.undo();
  assert('h.currentItem === 7', h.currentItem === 7);
  assert('h.atStart', h.atStart);
  assert('h.atEnd', !h.atEnd);
  assert('h.atCapacity', !h.atCapacity);

  h.redo();
  h.redo();
  assert('h.currentItem === 9', h.currentItem === 9);
  assert('h.atStart', !h.atStart);
  assert('h.atEnd', h.atEnd);
  assert('h.atCapacity', h.atCapacity);

  h.undo();
  h.undo();
  h.push(0);
  h.push(1);
  h.push(2);
  assert('h.currentItem === 2', h.currentItem === 2);
  assert('h.atStart', !h.atStart);
  assert('h.atEnd', h.atEnd);
  assert('h.atCapacity', h.atCapacity);

  h.redo();
  assert('h.currentItem === 2', h.currentItem === 2);
  assert('h.atStart', !h.atStart);
  assert('h.atEnd', h.atEnd);
  assert('h.atCapacity', h.atCapacity);
}
