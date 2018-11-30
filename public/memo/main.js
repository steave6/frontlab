document.addEventListener('DOMContentLoaded', function() {
  const template = `
<div class="">
  <form @submit.prevent='onTodoSubmit'>
    <input v-model.trim='todoField.title' type="text" autofocus id='todoTitle'/>
    <textarea v-model='todoField.text' id='todo-textarea' class='todo-textarea' @enter='todoTextareaEnter'></textarea>
    <button type='button' class='btn-small waves-effect waves-light' @click='saveTodo' style="font-weight: bold;">Save</button>
    <button type='button' class='btn-small waves-effect waves-light' @click='restoreDeleted'>Restore</button>
  </form>
  <div class="">
    <transition-group name="flip-list" tag="ul" class="row">
      <li v-for='todo in todoList' :ref='todo.id' :key='todo.id'
          class="col s12 m6 l4 xl3 todo-each"
          @click='todoItemSelect(todo)'
          @keyup.enter="todoItemSelect(todo)"
          draggable
          @dragstart='todoDragStart($event, todo)'
          @dragend='todoDragEnd'
          @drop='todoDropped($event, todo)'
          @dragover.prevent='todoDragOver'>
        {{todo.id + ". "}}<a v-if='todo.id === currentSelectId'>*</a>
        <span tabindex="0">{{todo.title}}</span>
        <button class='waves-effect waves-light right' tabindex="-1" @click.prevent='todoRemove($event, todo)'>Clear</button>
      </li>
    </transition-group>
  </div>
</div>
  `;
  new Vue({
    el: "#memo",
    template: template.trim(),
    data: {
      indexId: 0,
      currentSelectId: null,
      todoField: {
        title: null,
        text: null,
      },
      todoList: [],
      removedTodos: [],
    },
    computed: {
    },
    watch: {
    },
    filters: {
    },
    methods: {
      onTodoSubmit: function() {
        if (!this.todoField.title) return; // check title setted
        
        if (this.currentSelectId) {// Update item
          let todo = this.todoList.find(e => e.id === this.currentSelectId);
          todo.title = this.todoField.title;
          todo.text = this.todoField.text;
        } else {// New item push
          this.indexId += 1;
          this.todoList.push({id: this.indexId, title: this.todoField.title, text: this.todoField.text});
        }
        this.registerTodoList();
        this.currentSelectId = null;
        this.todoField.title = null;
        this.todoField.text = null;
      },
      todoRemove: function(ev, todo) {
        ev.stopPropagation();
        console.log("hello", todo);
        this.todoList = this.todoList
          .filter(e => {
          if (e.id === todo.id) {
            this.removedTodos.push(e);
          }
          return e.id !== todo.id;
        });
        this.sortTodoList();
        this.todoList.forEach((e, idx) => {
          e.id = idx + 1;
        });
        if (this.currentSelectId === todo.id || 
            this.todoList.find(e => e.id === this.currentSelectId)) {
          this.currentSelectId = null;
          this.todoField = {
            title: null,
            text: null,
          };
        }
        this.registerTodoList();
      },
      saveTodo: function(ev) {
        if (this.currentSelectId) {// Update item
          let todo = this.todoList.find(e => e.id === this.currentSelectId);
          todo.title = this.todoField.title;
          todo.text = this.todoField.text;
          document.getElementById('todo-textarea').focus();
        } else {
          this.onTodoSubmit();
          document.getElementById('todoTitle').focus();
        }
        this.registerTodoList();
      },
      restoreDeleted: function(ev) {
        if (Array.isArray(this.removedTodos) && this.removedTodos.length) {
          this.removedTodos.filter(e => e.title)
            .forEach((e, idx) => {
              console.log(e);
              this.todoList.push(e);
            });
          this.sortTodoList();
          this.registerTodoList();
        }
        this.removedTodos = [];
      },
      todoItemSelect: function(param) {
        this.saveTodo();
        const currentId = this.currentSelectId;
        const selected = this.todoList.find(e => e.id === param.id);
        this.todoField = {
          title: selected.title,
          text: selected.text,
        };
        document.getElementById('todoTitle').focus();
        if (currentId === selected.id) {
          this.$nextTick(function() {
            const textArea = document.querySelector('textarea.todo-textarea');
            const fontSize = parseInt(window.getComputedStyle(textArea, null)
                                .getPropertyValue('font-size').split('px')[0]);
            let wrapLineNum = 0
            textArea.value.split('\n').forEach((v, idx, arr) => {
              if (v.length) {
                wrapLineNum +=  parseInt((v.length * fontSize) / textArea.clientWidth);
              }
            });
            const colNum = textArea.value.split('\n').length;
            if (textArea.clientHeight <= textArea.scrollHeight) {
              textArea.style.height = ((colNum + wrapLineNum) * fontSize + 20) + "px";
            } else {
              textArea.style.height = "";
            }
          });
        }
        this.currentSelectId = selected.id;
      },
      todoTextareaEnter: function(ev) {
        console.log(ev)
        if (ev) {
        }
      },
      registerTodoList: function() {
        this.sortTodoList();
        localforage.setItem('todoList', this.todoList);
      },
      restoreTodoList: function() {
        const self = this;
        localforage.getItem('todoList').then(function(value) {
          if (!value) return;
          self.todoList = value;
          self.todoList.forEach((e, idx) => {
            e.id = idx + 1;
          })
          self.indexId = self.todoList.length;
        });
      },
      todoDropped: function(ev, todo) {
        ev.preventDefault();
        console.log('todoDropped', ev);
        const mTodoId = parseInt(ev.dataTransfer.getData('text/id'));
        const movedTodo = this.todoList.find(e => e.id === mTodoId);
        const position = todo.id;
        // Change Id
        if (todo.id < mTodoId) {
          this.todoList
            .filter(e => e.id >= todo.id)
            .filter(e => e.id < mTodoId)
            .forEach(e => e.id += 1);
        } else {
          this.todoList
            .filter(e => e.id <= todo.id)
            .filter(e =>  e.id > mTodoId)
            .forEach(e => e.id -= 1);
        }
        if (mTodoId === this.currentSelectId) {
          this.currentSelectId = position;
        } else if (position === this.currentSelectId) {
          this.currentSelectId = todo.id;
        }
        movedTodo.id = position;
        this.sortTodoList();
        this.registerTodoList();
      },
      todoDragStart: function(ev, todo) {
        console.log('todoDragStart', ev);
        ev.dataTransfer.effectAllowed = 'move';
        ev.dataTransfer.setData('text/id', todo.id);
        ev.dataTransfer.setData('list/todoList', this.todoList);
      },
      todoDragEnd: function(ev) {
        console.log('todoDragEnd', ev);
      },
      todoDragOver: function(ev) {
        const todoId = ev.dataTransfer.getData('text/id');
        console.log('todoId', todoId);
      },
      sortTodoList() {
        this.todoList.sort((a, b) => {
          if (a.id === b.id) return 0;
          else return a.id > b.id ? 1 : -1;
        });
      },
    },
    mounted: function () {
      this.restoreTodoList();
    },
  });

}, false);
