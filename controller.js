// manages actual functionality and the logic behind each route used in this app

const { json } = require('stream/consumers');
const fs = require('fs');
const filePath = './data.json';
const fileContents = fs.readFileSync(filePath);
const data = JSON.parse(fileContents);
let length = data.length;
class controller{
      //getting all todos
      async getTodos() {
            return new Promise((resolve,_) => {
                  resolve(data)});
      }

      // function to get todo based on the ID of the todo
      async getTodo(id) {
            return new Promise((resolve, reject) => {
                  let todo = data.find((todo) => todo.id == parseInt(id));
                  if(todo){
                        resolve(todo);
                  }else{
                        reject(`Todo with ID ${id} is not found`);
                  }
            });
      }

      // method to create a todo
      async createTodo(todo){
            return new Promise((resolve, _) => {
                  // creating a new todo
                  let newTodo = {
                        id : ++length,
                        title:todo.name,
                        description:todo.desc,
                        completed:'false'
                  };
                  // return the new created todo
                  resolve(newTodo);
                  data.push(newTodo);
                  fs.writeFileSync('./data.json',JSON.stringify(data));
            });
      }

      // method to update a todo
      async updateTodo(updatedData){
            return new Promise((resolve, reject) => {
                  //get the todo
            for(let i = 0; i < data.length; i++){
                   const index = data.findIndex((obj => obj.id == parseInt(updatedData.id)) )
                        if(index !== -1){
                              data[index] = updatedData
                              fs.writeFileSync(filePath,JSON.stringify(data));
                              resolve(data);
                  } 
                  else{
                        reject('Unable to update data');
                  }
                  
            }
        });
   }

      async deleteTodo(id){
            return new Promise((resolve, reject) => {
                  
                  //deleting todo from todos
                  const index = data.findIndex(obj => obj.id === parseInt(id));
                  if(index !== -1){
                   data.splice(index, 1);
                  }
                  for(let i =0 ; i< data.length ; i++){
                        data[i].id = i + 1;
                  }
                  fs.writeFileSync('./data.json', JSON.stringify(data));
                  resolve(data);
            })
      }
}

module.exports = controller;