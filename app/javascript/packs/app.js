import Vue from 'vue'
const Api = require('./api');

document.addEventListener('DOMContentLoaded', () => {

  var app = new Vue({
    el: '#app', // this has to be added to the parent div, see line 9 on index.html 
    components: {
      'task': { props: ['task'],
                template: `
                <div class="ui segment task" 
                    v-bind:class="task.completed ? 'done' : 'todo' ">
                    <div class="ui grid">
                    <div class="left floated twelve wide column">
                      <div class="ui checkbox">
                        <input type="checkbox" name="task" v-on:click="$parent.toggleDone($event, task.id)" :checked="task.completed">
                        <label>{{ task.name }} <span class="description">{{ task.description }}</span></label>
                      </div>
                    </div>
                    </div class="right floated three wide column">
                      <i class="icon edit blue" alt="Edit" v-on:click="$parent.editTask($event, task.id)"></i>
                      <i class="icon trash red" alt="Delete" v-on:click="$parent.deleteTask($event, task.id)"></i>  
                    </div>
                  </div> 
                </div>
                ` 
              }
    },
    data: {
      tasks: [],
      task: {}, // empty string for updating an existing task
      message: '',
      action: 'create' // for the clear function below
    },
    computed: {
      completedTasks: function() {
        return this.tasks.filter( item => item.completed == true );
      },

      todoTasks: function() {
        return this.tasks.filter( item => item.completed == false );
      },
      nextId: function() {
        return (this.tasks.sort(function(a,b){ return a.id - b.id; })) [this.tasks.length - 1].id + 1;
      }
    },
    methods: {
      listTasks: function() {
        Api.listTasks().then(function(response) {
          app.tasks = response;
        })
      },
      clear: function(){
        this.task = {}; // clear all fields
        this.action = 'create'; // create and edit states 
        this.message = '';
      },

      toggleDone: function(event, id) {
        event.stopImmediatePropagation(); // stops any events from occurring besides the function below.
        let task = this.tasks.find(item => item.id == id);
        
        if(task) {
          task.completed = !task.completed;
          this.message = `Task ${id} updated,`
        }
      },
      createTask: function(event) {
        if(!this.task.completed) {
          this.task.completed = false;
        } else {
          this.task.completed = true;
        }

        Api.createTask(this.task).then(function(response){
          app.listTasks();
          app.clear();
          app.message = `Task ${response.id} created,`
        })
      },
      editTask: function(event, id){
        this.action = 'edit'; // edit state

        let task = this.tasks.find(item => item.id == id);
        if(task) {
          this.task = { id: id, name: task.name, 
                      description: task.description, 
                      completed: task.completed }; // update the current task without showing the original text.
        }
      },
      updateTask: function(event, id){
        event.stopImmediatePropagation();

        Api.updateTask(this.task).then(function(response) {
          app.listTasks();
          app.clear();
          app.message = `Task ${response.id} updated,` 
        })  
        
      },
      deleteTask: function(event, id){
        event.stopImmediatePropagation();
        let taskIndex = this.tasks.findIndex(item => item.id == id);
        if(taskIndex > -1){
          Api.deleteTask(id).then(function(response){
            app.$delete(app.tasks, taskIndex);
            app.message = `Task ${id} deleted.`
          });
        }
      }
    },
    beforeMount() { this.listTasks() }
  })

});