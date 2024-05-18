/*
https://github.com/jasonsjones/doubly-linked-list/tree/master

DoublyLinkedList
createNewNode
getHeadNode
getTailNode
isEmpty
getSize
clear
insert
insertFirst
insertAt
insertBefore
insertAfter
concat
remove
removeFirst
removeAt
removeNode
indexOf
find
findAt
contains
forEach
toArray
interruptEnumeration
*/

export class DoublyLinkedListNode<T> {
  value: T;
  next: DoublyLinkedListNode<T> | null = null;
  prev: DoublyLinkedListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export default class DoublyLinkedList<T> {
  _head: DoublyLinkedListNode<T> | null = null;
  _tail: DoublyLinkedListNode<T> | null = null;
  private _size = 0;

  get head() {
    return this._head;
  }
  get tail() {
    return this._tail;
  }
  get size() {
    return this._size;
  }

  constructor();
  constructor(array: T[]);
  constructor(doublyList: DoublyLinkedList<T>, copyType?: "shallow" | "deep");
  constructor(list?: T[] | DoublyLinkedList<T>, copyType?: "shallow" | "deep") {
    if (list instanceof DoublyLinkedList) {
      if (copyType === "shallow") {
        this._head = list._head;
        this._tail = list._tail;
        this._size = list.size;
      } else {
        let current = list._head;
        while (current) {
          this.add(current.value);
          current = current.next;
        }
      }
    }

    if (Array.isArray(list)) {
      for (const value of list) {
        this.add(value);
      }
    }
  }

  *values() {
    let current = this._head;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }

  toArray<U>(callback?: (value: T, index: number) => U): U[] {
    const newArr = new Array<U>(this._size);
    let current = this._head;
    let index = 0;

    if (callback) {
      while (current) {
        newArr[index] = callback(current.value, index);
        current = current.next;
        index++;
      }
      return newArr;
    }

    while (current) {
      newArr[index] = current.value as unknown as U;
      current = current.next;
      index++;
    }

    return newArr;
  }

  toReversedArray<U>(callback?: (value: T, index: number) => U): U[] {
    const newArr = new Array<U>(this._size);
    let current = this._tail;
    let index = 0;

    if (callback) {
      while (current) {
        newArr[index] = callback(current.value, index);
        current = current.prev;
        index++;
      }
      return newArr;
    }

    while (current) {
      newArr[index] = current.value as unknown as U;
      current = current.prev;
      index++;
    }

    return newArr;
  }

  clear() {
    this._head = null;
    this._tail = null;
    this._size = 0;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  add(value: T) {
    const newNode = new DoublyLinkedListNode(value);
    this._size += 1;

    if (!this._head) {
      this._head = newNode;
      this._tail = newNode;
      return;
    }

    this._tail!.next = newNode;
    newNode.prev = this._tail;
    this._tail = newNode;
  }

  remove(value: T): boolean {
    if (!this._head) {
      return false;
    }

    let current: DoublyLinkedListNode<T> | null = this._head;
    while (current && current.value !== value) {
      current = current.next;
    }

    if (!current) {
      return false;
    }

    if (current.prev) {
      current.prev.next = current.next;
    } else {
      this._head = current.next;
    }

    if (current.next) {
      current.next.prev = current.prev;
    } else {
      this._tail = current.prev;
    }

    this._size -= 1;
    return true;
  }

  // contains(value: T): boolean {
  //   let current = this.head;
  //   while (current) {
  //     if (current.value === value) {
  //       return true;
  //     }
  //     current = current.next;
  //   }
  //   return false;
  // }

  // getNodeAt(index: number): LinkedListNode<T> | null {
  //   if (index < 0 || index >= this._size) return null;
  //   let current;
  //   if (index < this._size / 2) {
  //     current = this.head;
  //     for (let i = 0; i < index; i++) {
  //       // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  //       current = current!.next;
  //     }
  //   } else {
  //     current = this.tail;
  //     for (let i = this._size - 1; i > index; i--) {
  //       // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  //       current = current!.prev;
  //     }
  //   }
  //   return current;
  // }

  // forEach(callback: (value: T, index: number) => void) {
  //   let current = this.head;
  //   let index = 0;
  //   while (current) {
  //     callback(current.value, index);
  //     current = current.next;
  //     index++;
  //   }
  // }

  // find(callback: (value: T) => boolean): T | null {
  //   let current = this.head;
  //   while (current) {
  //     if (callback(current.value)) {
  //       return current.value;
  //     }
  //     current = current.next;
  //   }
  //   return null;
  // }

  // reverse() {
  //   let current = this.head;
  //   let prev: LinkedListNode<T> | null = null;
  //   this.tail = this.head;

  //   while (current) {
  //     const next = current.next;
  //     current.next = prev;
  //     current.prev = next;
  //     prev = current;
  //     current = next;
  //   }

  //   this.head = prev;
  // }

  // insertBefore(node: LinkedListNode<T>, value: T) {
  //   const newNode = new LinkedListNode(value);
  //   newNode.next = node;
  //   newNode.prev = node.prev;
  //   if (node.prev) {
  //     node.prev.next = newNode;
  //   } else {
  //     this.head = newNode;
  //   }
  //   node.prev = newNode;
  //   this._size++;
  // }

  // insertAfter(node: LinkedListNode<T>, value: T) {
  //   const newNode = new LinkedListNode(value);
  //   newNode.next = node.next;
  //   newNode.prev = node;
  //   if (node.next) {
  //     node.next.prev = newNode;
  //   } else {
  //     this.tail = newNode;
  //   }
  //   node.next = newNode;
  //   this._size++;
  // }

  // removeFirst() {
  //   if (!this.head) return;
  //   this.head = this.head.next;
  //   if (this.head) {
  //     this.head.prev = null;
  //   } else {
  //     this.tail = null;
  //   }
  //   this._size--;
  // }

  // removeLast() {
  //   if (!this.tail) return;
  //   this.tail = this.tail.prev;
  //   if (this.tail) {
  //     this.tail.next = null;
  //   } else {
  //     this.head = null;
  //   }
  //   this._size--;
  // }

  // removeAt(index: number): T | null {
  //   if (index < 0 || index >= this._size) return null;
  //   let current = this.head;
  //   let count = 0;
  //   while (current && count !== index) {
  //     current = current.next;
  //     count++;
  //   }
  //   if (!current) return null;
  //   if (current.prev) {
  //     current.prev.next = current.next;
  //   } else {
  //     this.head = current.next;
  //   }
  //   if (current.next) {
  //     current.next.prev = current.prev;
  //   } else {
  //     this.tail = current.prev;
  //   }
  //   this._size--;
  //   return current.value;
  // }

  // concat(list: LinkedList<T>): void {
  //   if (list.isEmpty()) return;
  //   if (this.isEmpty()) {
  //     this.head = list.head;
  //     this.tail = list.tail;
  //     this._size = list._size;
  //   } else {
  //     this.tail!.next = list.head;
  //     list.head!.prev = this.tail;
  //     this.tail = list.tail;
  //     this._size += list._size;
  //   }
  // }

  // copy(): LinkedList<T> {
  //   const newList = new LinkedList<T>();
  //   let current = this.head;
  //   while (current) {
  //     newList.add(current.value);
  //     current = current.next;
  //   }
  //   return newList;
  // }
  // shallowCopy(): LinkedList<T> {
  //   const newList = new LinkedList<T>();
  //   newList.head = this.head;
  //   newList.tail = this.tail;
  //   newList._size = this._size;
  //   return newList;
  // }
}
