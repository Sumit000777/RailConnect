(function () {
  if (!RMS.requireLogin()) return;

  document.getElementById("logoutLink").addEventListener("click", (e) => {
    e.preventDefault();
    RMS.logout();
  });

  const form = document.getElementById("searchForm");
  const body = document.getElementById("resultsBody");
  const empty = document.getElementById("resultsEmpty");
  const table = document.querySelector(".panel table");
  const countLabel = document.getElementById("resultsCount");
  const heading = document.getElementById("resultsHeading");

  function durationLabel(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  function render(trains) {
    if (!trains.length) {
      table.style.display = "none";
      empty.style.display = "block";
      countLabel.textContent = "";
      return;
    }
    table.style.display = "table";
    empty.style.display = "none";
    countLabel.textContent = `${trains.length} train${trains.length === 1 ? "" : "s"}`;

    body.innerHTML = trains
      .map(
        (t) => `
        <tr>
          <td class="mono">${t.trainNumber}</td>
          <td>${t.trainName}<br><span style="color:var(--text-muted);font-size:0.78rem;">${t.type}</span></td>
          <td>${t.source} → ${t.destination}</td>
          <td class="mono">${t.departureTime}</td>
          <td class="mono">${t.arrivalTime}${t.dayOffset ? ` <span style="color:var(--accent);">+${t.dayOffset}d</span>` : ""}</td>
          <td>${durationLabel(t.durationMinutes)}</td>
          <td>${t.classesAvailable.join(", ")}</td>
          <td class="mono">₹${t.baseFare}</td>
          <td><a class="btn btn-primary btn-sm" href="booking.html?trainId=${t.id}">Book Now</a></td>
        </tr>`
      )
      .join("");
  }

  async function search(params) {
    const query = new URLSearchParams(params).toString();
    const { ok, data } = await RMS.api(`/api/trains?${query}`);
    if (ok) {
      render(data.trains);
      heading.textContent = query ? "Search results" : "All trains";
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    search({
      from: document.getElementById("from").value,
      to: document.getElementById("to").value,
      number: document.getElementById("number").value,
      name: document.getElementById("name").value,
    });
  });

  // Initial load: show everything.
  search({});
})();
