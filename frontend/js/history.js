(function () {
  if (!RMS.requireLogin()) return;

  document.getElementById("logoutLink").addEventListener("click", (e) => {
    e.preventDefault();
    RMS.logout();
  });

  const body = document.getElementById("historyBody");
  const empty = document.getElementById("historyEmpty");
  const table = document.querySelector(".panel table");

  function render(bookings) {
    if (!bookings.length) {
      table.style.display = "none";
      empty.style.display = "block";
      return;
    }
    table.style.display = "table";
    empty.style.display = "none";

    body.innerHTML = bookings
      .map((b) => {
        const cancellable = b.status === "Confirmed";
        return `
        <tr data-id="${b.id}">
          <td class="mono">${b.pnr}</td>
          <td>${b.trainNumber} · ${b.trainName}</td>
          <td>${b.source} → ${b.destination}</td>
          <td>${b.journeyDate}</td>
          <td>${b.class}</td>
          <td class="mono">₹${b.fareTotal}</td>
          <td><span class="badge ${b.status.toLowerCase()}">${b.status}</span></td>
          <td>
            <a class="btn btn-outline btn-sm" href="ticket.html?bookingId=${b.id}">View</a>
            ${cancellable ? `<button class="btn btn-danger btn-sm cancel-btn">Cancel</button>` : ""}
          </td>
        </tr>`;
      })
      .join("");

    body.querySelectorAll(".cancel-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const row = e.target.closest("tr");
        const id = row.dataset.id;
        if (!confirm("Cancel this booking? This cannot be undone.")) return;

        btn.disabled = true;
        btn.textContent = "Cancelling…";
        const { ok } = await RMS.api(`/api/bookings/${id}/cancel`, { method: "POST", auth: true });
        if (ok) {
          load();
        } else {
          btn.disabled = false;
          btn.textContent = "Cancel";
        }
      });
    });
  }

  async function load() {
    const { ok, data } = await RMS.api("/api/bookings", { auth: true });
    if (ok) render(data.bookings);
  }

  load();
})();
