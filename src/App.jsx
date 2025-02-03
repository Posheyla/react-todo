
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Fragment, useEffect } from 'react'
import { useState } from 'react'
import './App.css'
import TodoList from './TodoList'
import AddTodoForm from './AddTodoForm'
import { GoChecklist } from "react-icons/go";


function App() {
  const [todoList,setTodoList]=useState([]);
  const [isLoading,setIsloading]=useState(true);

  const fetchData = async()=> {
    setIsloading (true);
    const options= {
       method:"GET",
       headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_AIRTABLE_API_TOKEN}`},
         
    };
    
    const url = `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
    try {
      const response = await fetch(url, options); 
      
      if (!response.ok) {
        const message = `Error has ocurred: ${response.status}`;
        throw new Error(message);
      }
      const data = await response.json();
      
      const todos = data.records.map((todo) => ({
            id: todo.id,
            title: todo.fields.Title,
      }));
       console.log(todos);
       setTodoList (todos);
       setIsloading (false);

    } catch (error){
        console.log(error.message);
    }
      finally {
        setIsloading(false); 
    }
  
  };


  useEffect (()=> {
     fetchData();
    
  }, []);

  useEffect(()=> {
    if (!isLoading) {
     localStorage.setItem('savedTodoList',JSON.stringify(todoList));
    }
  }, [todoList,isLoading]); 
 
 async function addTodo (newTodo){
   const options ={
     method: "POST",
     HEADERS: {
       "Content-type": "application/json",
       Authorization:  `Bearer ${import.meta.env.VITE_AIRTABLE_API_TOKEN}`,
     },
     body: JSON.stringify({
        records: [
          {
            fields: {
              Title: newTodo.title, 
            },
          },
        ],
      }),
   }
   const url = `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const message = `Error occurred while saving todo: ${response.status}`;
        throw new Error(message);
      }

      const data = await response.json();
      const savedTodo = {
        id: data.records[0].id, // Airtable's record ID
        title: data.records[0].fields.Title, // Airtable's "Title" field
      };

      setTodoList((prevList) => [savedTodo, ...prevList]);
    } catch (error) {
      console.error("Failed to add todo:", error.message);
    }
 }
   

 async function removeTodo(id) {
    const options = {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_TOKEN}`,
      },
    };

    const url = `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}/${id}`;

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const message = `Error occurred while deleting todo: ${response.status}`;
        throw new Error(message);
      }

      // Update the local state
      setTodoList((prevList) => prevList.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Failed to delete todo:", error.message);
    }
  }

  return (
    <Fragment>
      <BrowserRouter>
        <Routes>
          <Route path="/" 
                 element={ 
                        <>
                         <div>
                          <h1><GoChecklist />Todo List</h1>
                          </div>
                          <AddTodoForm onAddTodo={addTodo}/>
                           {isLoading?(<p>Loading...</p>): <TodoList todoList={todoList}  onRemoveTodo={removeTodo}/>}
                         
                        
                        </>
                  }
          />
          <Route path="/new"
                 element={
                  <>
                          <h1>New Todo List</h1>
                  </>      
                 }
          
          />
        </Routes>
      </BrowserRouter>
      
    </Fragment>
  )
}

export default App
