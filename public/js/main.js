const app = new Vue({
  el: "#app",
  data: {
    message: "Hello world",
    tickets: null,
    departments: null,
    organizations: null,
    ticket_count: {
      all: 0,
      open: 0,
      closed: 0,
      prosrocheno: 0,
      like: 0,
      dislike: 0,
    },
  },
  mounted: function () {
    fetch("/api/v1/count_tickets")
      .then((res) => res.json())
      .then((data) => {
        this.ticket_count = data;
        console.log(data);
      });
    // Департаметы
    fetch("/api/v1/departments")
      .then((response) => response.json())
      .then((response) => {
        this.departments = response.data;
      });

    // Организации
    fetch("/api/v1/organizations")
      .then((response) => response.json())
      .then((response) => {
        this.organizations = response.data;
      });
  },
});
