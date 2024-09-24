import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as SQLite from 'expo-sqlite'; 

export default function App() {

  const [todos, setTodos] = React.useState([]);
  const [inputValue, setInputValue] = React.useState('');
  const db = SQLite.openDatabase('todos.db'); 


  useEffect(() => {
    const initDb = async () => {
      await db.transaction(async (tx) => {
        await tx.executeSql(`
          CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL);
        `);
      });

      db.transaction((tx) => {
        tx.executeSql('SELECT * FROM todos', [], (_, { rows }) => {
          setTodos(rows._array);
        });
      });
    };

    initDb();
  }, []);

  const addTodo = async (todo) => {
    await db.transaction((tx) => {
      tx.executeSql('INSERT INTO todos (value) VALUES (?)', [todo], (_, { insertId }) => {
        setTodos((prevTodos) => [...prevTodos, { id: insertId, value: todo }]);
      });
    });
  };

  const removeTodo = async (id) => {
    await db.transaction((tx) => {
      tx.executeSql('DELETE FROM todos WHERE id = ?', [id], () => {
        setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id)); 
      });
    });
  };

  return (
    <View style={styles.container}>
      {todos.map(todo => (
        <View key={todo.id}>
          <Text>{todo.value}</Text>
          <Button title="Remove" onPress={() => removeTodo(todo.id)} />
        </View>
      ))}
      <Button title="Add Something" onPress={() => addTodo("Something")} />
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
});
