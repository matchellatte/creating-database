import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import * as SQLite from 'expo-sqlite'; 

export default function App() {

  const [todos, setTodos] = React.useState([]);
  const [inputValue, setInputValue] = React.useState('');
  const [editId, setEditId] = React.useState(null);

  const db = SQLite.openDatabaseSync('todos.db'); 

  useEffect(() => {
    const initDb = async () => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL);
      `);

      const todosDb = await db.getAllAsync('SELECT * FROM todos');
      setTodos(todosDb);
      console.log(todos); 
    }

    initDb();
  }, []);

  const addTodo = async (todo) => {
    if (editId !== null) {
      await updateTodo(editId, todo);
      return;
    }
    const result = await db.runAsync('INSERT INTO todos (value) VALUES (?)', todo);
    setTodos([...todos, { id: result.lastInsertRowId, value: todo }]);
    setInputValue('');
  };

  const removeTodo = async (id) => {
    await db.runAsync('DELETE FROM todos WHERE id = ?', id);
    const todosDb = await db.getAllAsync('SELECT * FROM todos');
    setTodos(todosDb);
  };

  const updateTodo = async (id, newValue) => {
    await db.runAsync('UPDATE todos SET value = ? WHERE id = ?', [newValue, id]);
    const todosDb = await db.getAllAsync('SELECT * FROM todos');
    setTodos(todosDb);
    setInputValue('');
    setEditId(null);
  };

  const startEditTodo = (id, value) => {
    setInputValue(value);
    setEditId(id);
  };

  return (
    <View style={styles.container}>
      <Text>Simple To Do App with Database</Text>
      {todos.map(todo => (
        <View key={todo.id} style={styles.todoItem}>
          <Text>{todo.value}</Text>
          <Button title="Edit" onPress={() => startEditTodo(todo.id, todo.value)} />
          <Button title="Remove" onPress={() => removeTodo(todo.id)} />
        </View>
      ))}
      <TextInput 
        style={styles.input}
        onChangeText={setInputValue}
        value={inputValue}
      />
      <Button title={editId !== null ? "Update" : "Add Something"} onPress={() => addTodo(inputValue)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderColor: 'black',
    borderWidth: 1,
    padding: 10,
    width: '80%',
    marginBottom: 10,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 10,
  },
});