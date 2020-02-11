const tickets = Vue.component('tickets', {
  name: 'tickets',
  props: ['data'],
  template:`
  <div>
    <div class="ui list" v-for="item in data">

      <div class="item">
        <i class="sticky note outline icon"></i>
        {{ item.title }}
      </div>


      <div class="item">
        <i class="building icon"></i>
        Департамент: {{ item.department_name }}
      </div>

      <div class="item">
        <i class="envelope icon"></i>
        Почта пользователя: {{ item.user_email }}
      </div>
      
      <div class="item">
        <i class="calendar alternate outline icon"></i>
        Дата создания: {{ item.date_created }}
      </div>


      <a class="ui blue tag label" v-if="item.status_id === 'open'">Открытая заявка</a>
      <a class="ui teal tag label" v-else >Закрытая заявка</a>
      <div class="ui divider"></div>
    </div>
  </div>
  `
})


const app = new Vue({
  el: '#app',
  components: {
    'tickets': tickets
  },
  data: {
    message: 'Hello world',
    tickets: null,
    departments: null,
    organizations: null,
    open_tickets: null,
    closed_tickets: null,
    ticketCount: {
      open: 0,
      closed: 0
    }
  },
  mounted: function() {
    // Заявки
    fetch('/api/v1/tickets', {
      'method': 'get',
      'Content-Type': 'application/json'
    }).then(response => response.json())
      .then(response => {
        this.tickets = response.data
      })

    // Открытые заявки
    fetch('/api/v1/tickets/open', {
      'method': 'get',
      'Content-Type': 'application/json'
    }).then(response => response.json())
      .then(response => {
        this.open_tickets = response.data
      })

    // Закрытые заявки
    fetch('/api/v1/tickets/closed', {
      'method': 'get',
      'Content-Type': 'application/json'
    }).then(response => response.json())
      .then(response => {
        this.closed_tickets = response.data
      })

    // Сумма открытых заявок
    fetch('/api/v1/tickets/opentickets', {
        'method': 'get',
        'Content-Type': 'application/json'
      }).then(response => response.json())
        .then(response => {
          this.ticketCount.open = parseInt(response);
        })

    // Сумма закрытых заявок
    fetch('/api/v1/tickets/closedtickets', {
        'method': 'get',
        'Content-Type': 'application/json'
      }).then(response => response.json())
        .then(response => {
          this.ticketCount.closed = parseInt(response);
        })

    // Департаметы
    fetch('/api/v1/departments', {
      'method': 'get',
      'Content-Type': 'application/json'
    }).then(response => response.json())
      .then(response => {
        this.departments = response.data
      })

    // Организации
    fetch('/api/v1/organizations', {
      'method': 'get',
      'Content-Type': 'application/json'
    }).then(response => response.json())
      .then(response => {
        this.organizations = response.data;
      })
  }
})