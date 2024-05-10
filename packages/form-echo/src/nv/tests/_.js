import { getPaths, setValue } from "../utils/index.js";

const paths = getPaths("todos[].content");
console.log("paths", paths);
// paths [ 'todos', 0, 'content' ]
const paths2 = getPaths("todos[0].content");
console.log("paths2", paths2);
// paths2 [ 'todos', 0, 'content' ]
const paths3 = getPaths("todos[53].content");
console.log("paths3", paths3);
// paths3 [ 'todos', 53, 'content' ]

const target = {};
setValue(target, "todos[0].content", () => "Hello, world!");
console.log("target", target);
// target { todos: [ { content: 'Hello, world!' } ] }

const target2 = {
  todos: [{ content: "Hello, world!" }, { content: "Hello!" }],
};
setValue(target2, "todos[1].content", (curr) => curr + "!");
console.log("target2", target2);
// target2 { todos: [ { content: 'Hello, world!' }, { content: 'Hello!!' } ] }
