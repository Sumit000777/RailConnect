(async function () {
  if (!RMS.requireLogin()) return;

  const user = RMS.getUser();
  document.getElementById("greeting").textContent = user ? user.email : "";
  document.getElementById("userNameHead").textContent = user ? `, ${user.name.split(" ")[0]}` : "";
  document.getElementById("statEmail").textContent = user ? user.email : "—";

  document.getElementById("logoutLink").addEventListener("click", (e) => {
    e.preventDefault();
    RMS.logout();
  });

  const { ok, data } = await RMS.api("/api/bookings/summary/stats", { auth: true });
  if (!ok) return;

  document.getElementById("statTotal").textContent = data.totalBooked;
  document.getElementById("statActive").textContent = data.activeBookings;
  document.getElementById("statCancelled").textContent = data.totalCancelled;

  const tbody = document.getElementById("recentBody");
  const empty = document.getElementById("recentEmpty");

  if (!data.recent.length) {
    document.querySelector("#recentWrap table").style.display = "none";
    empty.style.display = "block";
    return;
  }

  tbody.innerHTML = data.recent
    .map(
      (b) => `
      <tr>
        <td class="mono">${b.pnr}</td>
        <td>${b.trainNumber} · ${b.trainName}</td>
        <td>${b.source} → ${b.destination}</td>
        <td>${b.journeyDate}</td>
        <td><span class="badge ${b.status.toLowerCase()}">${b.status}</span></td>
      </tr>`
    )
    .join("");
})();
