type CodeTodo = {
  id: string;
  type: 'TODO' | 'FIXME';
  text: string;
  file: string;
  line: number;
  relativePath: string;
};
