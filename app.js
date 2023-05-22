const http = require('http');
const url = require('url');
const fs = require('fs');
const querystring = require('querystring');
const controller = require('./controller');
const PORT = process.env.PORT || 5000;

const fileContents = fs.readFileSync('./data.json','utf-8');
const data = JSON.parse(fileContents);

const temp = fs.readFileSync('./assets/template-todo.html','utf-8');
const tempTodo = fs.readFileSync('./assets/index.html','utf-8');
const addTodo = fs.readFileSync('./assets/add-todo.html','utf-8');
const updateTodo = fs.readFileSync('./assets/update-todo.html','utf-8');

const replaceTemplate = (tem, todo)=> {
      let output = tem.replace(/<%TODOID%>/g, todo.id);
      output = output.replace(/<%TODOTITLE%>/g, todo.title);
      output = output.replace(/<%TODODESC%>/g, todo.description);
      output = output.replace(/<%TODOCOMP%>/g, todo.completed);
      output = output.replace(/<%TODOSTATUS%>/g, todo.completed == false?"checked":"");
      return output;
}


const server = http.createServer(async (req,res) => {
      const parsedUrl = url.parse(req.url,true);
      //Home page
      if(parsedUrl.pathname == '/' && req.method == 'GET'){ 
           
                  //Set response Headers
                  res.writeHead(200,{'Content-Type': 'text/html'});
                 // mapping through the data and replace the placeholders from the template
                  const todosHtml = data.map(el => replaceTemplate(temp,el)).join('');
                  const output = tempTodo.replace(/<%TODOS%>/g,todosHtml);
                  res.end(output);
             }

      //add-todo page
      else if(parsedUrl.pathname == '/add-todo' && req.method == 'GET'){
            res.writeHead(200,{'Content-Type': 'text/html'});
            res.end(addTodo);
      }
      
      //update-todo page
      else if( req.url.match(/\/update-todo\/([0-9]+)/) && req.method == 'GET'){
            const id = req.url.split("/")[2];
            const oldData = data[id-1];
            console.log(oldData);
            const updateHmtl = replaceTemplate(updateTodo, oldData);
            res.writeHead(200,{'Content-Type': 'text/html'});
            res.end(updateHmtl);
            console.log(oldData);
      }
      
      // else if(parsedUrl.pathname == '/api/data' && req.method == 'GET'){ 
      //       res.writeHead(200,{"Content-Type" : "application/json"});
      //       res.end(JSON.stringify(data));

      // }
      // else if(parsedUrl.pathname == '/api/todos' && req.method ==='GET'){
      //       const todos = await new controller().getTodos();

      //       res.writeHead(200, {"content-Type" : "application/json"});
      //       res.end(JSON.stringify(todos));
      // }

      // //get todos with ID
      // else if(req.url.match(/\/api\/todos\/([0-9]+)/) && req.method === 'GET'){
      //       try{
      //             //get id from url
      //             const id = req.url.split("/")[3];
      //             //get todo
      //             const todo = await new controller().getTodo(id);

      //             res.writeHead(200, {'Content-Type':'application/json'});
      //             res.end(JSON.stringify(todo));
      //       }
      //       catch(error){
      //             res.writeHead(404, {"Content-Type":"application/json"});
      //             res.end(JSON.stringify({message:error}));
      //       }
      // }

      // Delete todos with ID
      else if(req.url.match(/\/api\/todos\/([0-9]+)/) && req.method ==="DELETE"){
            console.log('Reached the delete page');
            try{
                  const id = req.url.split("/")[3];

                  // delete todo
                  let todo = await new controller().deleteTodo(id);
                  console.log(todo);
                  const todosHtml = todo.map(el => replaceTemplate(temp,el)).join('');
                  const output = tempTodo.replace(/<%TODOS%>/g,todosHtml);
                  res.writeHead(200, {'Content-Type':'application/html'});
                  res.end(output);
            }
            catch(error){
                  res.writeHead(404, {'Content-Type':'application/json'});
                  res.end(JSON.stringify({message:error}));
            }
      }

      // update todo
      else if(req.url.match(/\/api\/todos\/([0-9]+)/) && req.method ==="PUT"){
            try{
                  const id = req.url.split("/")[3];
                  let body = '';
                  req.on('data', chunk => {
                   body +=chunk.toString();
                  });
       
                  req.on('end', async ()=>{
                   const data = querystring.parse(body);
                  let updated_data = await new controller().updateTodo(data);
                  const todosHtml = updated_data.map(el => replaceTemplate(temp,el)).join('');
                  const output = tempTodo.replace(/<%TODOS%>/g,todosHtml);
                  res.writeHead(200, {'Content-Type':'application/html'});
                  res.end(output);
                  });
            }
            catch(error){
                  res.writeHead(404, {'Content-Type':'application/json'});
                  res.end(JSON.stringify({message:error}));
            }
      }
      else if(req.url === "/api/todos" && req.method ==="POST"){
            // get the data sent along 
           let body = '';
           req.on('data', chunk => {
            body +=chunk.toString();
           });

           req.on('end', async ()=>{
            const data = querystring.parse(body);
             //create the todo
             let todo =  await new controller().createTodo(data);
             res.writeHead(200, {"Content-Type" : "text/html"});
             res.end(addTodo);
           })
           

      }
      else{
            res.writeHead(404, {'Content-Type':'application/json'});
            res.end(JSON.stringify({message : 'Data not found'}));
      }
})

.listen(PORT, () => {
      console.log(`Server listening to port ${PORT}`);
})