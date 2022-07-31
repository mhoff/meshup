import { useEffect, useRef } from 'react';

/**
* Returns the index of the last element in the array where predicate is true, and -1
* otherwise.
* @param array The source array to search in
* @param predicate find calls predicate once for each element of the array, in descending
* order, until it finds one where predicate returns true. If such an element is found,
* findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
*/
function findLastIndex<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number {
  let l = array.length;
  // eslint-disable-next-line no-plusplus
  while (l--) {
    if (predicate(array[l], l, array)) { return l; }
  }
  return -1;
}

function arraysEqual(a: any[], b: any[]) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] instanceof Array && b[i] instanceof Array) {
      if (!arraysEqual(a[i], b[i])) {
        return false;
      }
    }
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

type Module = any

function inputArrayPtr<E, A extends TypedArray>(constr: (_: ArrayLike<E>) => A) {
  return (wasmModule: Module) => ((vals: E[]): [A, number] => {
    const arr = constr(vals);
    // eslint-disable-next-line no-underscore-dangle
    const ptr = wasmModule._malloc(vals.length * arr.BYTES_PER_ELEMENT);
    wasmModule.HEAP32.set(arr, ptr / arr.BYTES_PER_ELEMENT);
    return [arr, ptr];
  });
}

function outputArrayPtr<A extends TypedArray>(constr: () => A) {
  return (wasmModule: Module) => (len: number): [A, number] => {
    const arr = constr();
    // eslint-disable-next-line no-underscore-dangle
    const ptr = wasmModule._malloc(len * arr.BYTES_PER_ELEMENT);
    return [arr, ptr];
  };
}

const inputArrayInt32: (module: Module)
  => ((vals: number[]) => [Int32Array, number]) = inputArrayPtr((vals: ArrayLike<number>) => new Int32Array(vals));

const inputArrayFloat32: (module: Module)
  => ((vals: number[]) => [Float32Array, number]) = inputArrayPtr((vals: ArrayLike<number>) => new Float32Array(vals));

const outputArrayInt32: (module: Module)
  => ((len: number) => [Int32Array, number]) = outputArrayPtr(() => new Int32Array());

function usePrevious<T>(value: T) {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// eslint-disable-next-line import/prefer-default-export
export {
  findLastIndex, arraysEqual, inputArrayInt32, inputArrayFloat32, outputArrayInt32, usePrevious,
};
