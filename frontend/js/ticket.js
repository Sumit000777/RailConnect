(async function () {
  if (!RMS.requireLogin()) return;

  document.getElementById("logoutLink").addEventListener("click", (e) => {
    e.preventDefault();
    RMS.logout();
  });

  const bookingId = RMS.qs("bookingId");
  if (!bookingId) {
    window.location.href = "history.html";
    return;
  }

  const { ok, data } = await RMS.api(`/api/bookings/${bookingId}`, { auth: true });
  if (!ok) {
    document.getElementById("ticket").innerHTML = `<div class="empty-state">Booking not found.</div>`;
    return;
  }

  const b = data.booking;

  document.getElementById("ticketPnr").textContent = `PNR: ${b.pnr}`;
  const statusEl = document.getElementById("ticketStatus");
  statusEl.textContent = b.status;
  statusEl.className = `badge ${b.status.toLowerCase()}`;

  document.getElementById("depTime").textContent = b.departureTime;
  document.getElementById("depStation").textContent = b.source;
  document.getElementById("arrTime").textContent = b.arrivalTime;
  document.getElementById("arrStation").textContent = b.destination;

  document.getElementById("ticketTrain").textContent = `${b.trainNumber} · ${b.trainName}`;
  document.getElementById("ticketDate").textContent = b.journeyDate;
  document.getElementById("ticketClass").textContent = b.class;
  document.getElementById("ticketBookingId").textContent = b.id;
  document.getElementById("ticketBookedAt").textContent = RMS.formatDateTime(b.bookedAt);
  document.getElementById("ticketFare").textContent = `₹${b.fareTotal}`;

  document.getElementById("ticketPassengers").innerHTML = b.passengers
    .map(
      (p) => `
      <tr>
        <td>${p.name}</td>
        <td>${p.age} / ${p.gender}</td>
        <td class="mono">${p.coach}-${p.seat}</td>
        <td>${p.berthPreference}</td>
      </tr>`
    )
    .join("");
})();
