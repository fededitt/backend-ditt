const socket = io();

/* ---------- Servicios ---------- */

const list = document.getElementById("services-list");

const cardSkeleton = `
  <h2 class="name"></h2>
  <p class="description"></p>
  <ul>
    <li>Duración: <span class="duration"></span> min</li>
    <li>Precio: $<span class="price"></span></li>
    <li>Categoría: <span class="category"></span></li>
  </ul>
  <span class="badge"></span>
  <div class="actions">
    <button class="toggle">Cambiar disponibilidad</button>
    <button class="delete">Eliminar</button>
  </div>
`;

function fillCard(card, service) {
  card.dataset.id = service._id;
  card.querySelector(".name").textContent = service.name;
  card.querySelector(".description").textContent = service.description;
  card.querySelector(".duration").textContent = service.duration;
  card.querySelector(".price").textContent = service.price;
  card.querySelector(".category").textContent = service.category;

  const badge = card.querySelector(".badge");
  badge.textContent = service.available ? "Disponible" : "No disponible";
  badge.className = `badge ${service.available ? "ok" : "off"}`;
}

function findCard(id) {
  return list?.querySelector(`.card[data-id="${id}"]`);
}

socket.on("service:created", (service) => {
  if (!list) return;
  document.getElementById("empty-msg")?.remove();

  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = cardSkeleton;
  fillCard(card, service);
  list.appendChild(card);
});

socket.on("service:updated", (service) => {
  const card = findCard(service._id);
  if (card) fillCard(card, service);
});

socket.on("service:deleted", (service) => {
  findCard(service._id)?.remove();
});

// Botones de cada tarjeta (delegación de eventos)
list?.addEventListener("click", async (event) => {
  const card = event.target.closest(".card");
  if (!card) return;
  const id = card.dataset.id;

  if (event.target.classList.contains("toggle")) {
    const isAvailable = card.querySelector(".badge").classList.contains("ok");
    await fetch(`/api/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !isAvailable }),
    });
  }

  if (event.target.classList.contains("delete")) {
    await fetch(`/api/services/${id}`, { method: "DELETE" });
  }
});

// Formulario para crear un servicio
const form = document.getElementById("service-form");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const message = document.getElementById("form-message");

  const response = await fetch("/api/services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      duration: Number(data.duration),
      price: Number(data.price),
      available: data.available === "true",
    }),
  });
  const result = await response.json();

  if (response.ok) {
    form.reset();
    message.textContent = "Servicio creado";
  } else {
    message.textContent = result.message;
  }
});

/* ---------- Reservas ---------- */

const bookingsBody = document.getElementById("bookings-body");

function createBookingRow(booking) {
  const row = document.createElement("tr");
  row.dataset.id = booking._id;

  [
    booking.clientName,
    booking.clientEmail,
    booking.date,
    booking.time,
    booking.status,
    "—",
  ].forEach((text) => {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
  });

  return row;
}

socket.on("booking:created", (booking) => {
  if (!bookingsBody) return;
  document.getElementById("empty-row")?.remove();
  bookingsBody.prepend(createBookingRow(booking));
});