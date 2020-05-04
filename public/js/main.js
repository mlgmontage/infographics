const app = new Vue({
  el: "#app",
  data: {
    message: "Hello world",
    tickets: null,
    departments: null,
    organizations: null,
    ticketCount: {
      open: 0,
      closed: 0,
      prosrocheno: 0,
    },
  },
  mounted: function () {
    // Заявки
    fetch("/api/v1/tickets", {
      method: "get",
      "Content-Type": "application/json",
    })
      .then((response) => response.json())
      .then((response) => {
        this.tickets = response.data;
      });

    // Сумма открытых заявок
    fetch("/api/v1/count_tickets/open", {
      method: "get",
      "Content-Type": "application/json",
    })
      .then((response) => response.json())
      .then((response) => {
        this.ticketCount.open = parseInt(response);
      });

    // Сумма закрытых заявок
    fetch("/api/v1/count_tickets/closed", {
      method: "get",
      "Content-Type": "application/json",
    })
      .then((response) => response.json())
      .then((response) => {
        this.ticketCount.closed = parseInt(response);
      });

    fetch("/api/v1/count_tickets/prosrocheno", {
      method: "get",
      "Content-Type": "application/json",
    })
      .then((response) => response.json())
      .then((response) => {
        this.ticketCount.prosrocheno = parseInt(response);
      });

    // Департаметы
    fetch("/api/v1/departments", {
      method: "get",
      "Content-Type": "application/json",
    })
      .then((response) => response.json())
      .then((response) => {
        this.departments = response.data;
      });

    // Организации
    fetch("/api/v1/organizations", {
      method: "get",
      "Content-Type": "application/json",
    })
      .then((response) => response.json())
      .then((response) => {
        this.organizations = response.data;
      });
  },
});
