(function () {
  if (!RMS.requireLogin()) return;

  document.getElementById("logoutLink").addEventListener("click", (e) => {
    e.preventDefault();
    RMS.logout();
  });

  const trainId = RMS.qs("trainId");
  if (!trainId) {
    window.location.href = "train-timings.html";
    return;
  }

  const msgBox = document.getElementById("formMsg");
  function showMsg(text, type) {
    msgBox.textContent = text;
    msgBox.className = `form-msg show ${type}`;
  }

  const passengerList = document.getElementById("passengerList");
  const template = document.getElementById("passengerTemplate");
  let train = null;

  function addPassengerRow() {
    const node = template.content.cloneNode(true);
    node.querySelector(".remove-passenger").addEventListener("click", (e) => {
      if (passengerList.children.length <= 1) return; // always keep at least one
      e.target.closest(".passenger-card").remove();
      updateSummary();
    });
    passengerList.appendChild(node);
    updateSummary();
  }

  document.getElementById("addPassenger").addEventListener("click", addPassengerRow);

  function fareMultiplier(cls) {
    return { "1A": 3, "2A": 2, "3A": 1.5 }[cls] || 1;
  }

  function updateSummary() {
    if (!train) return;
    const cls = document.getElementById("preferredClass").value;
    const paxCount = passengerList.children.length;
    document.getElementById("sumPax").textContent = paxCount;
    document.getElementById("sumClass").textContent = cls;
    const fare = Math.round(train.baseFare * paxCount * fareMultiplier(cls));
    document.getElementById("sumFare").textContent = `₹${fare}`;
  }

  async function loadTrain() {
    const { ok, data } = await RMS.api(`/api/trains/${trainId}`);
    if (!ok) {
      showMsg("Could not load this train. It may no longer be available.", "error");
      return;
    }
    train = data.train;

    document.getElementById("trainSummary").textContent =
      `${train.trainNumber} · ${train.trainName} — ${train.source} to ${train.destination}`;
    document.getElementById("sumTrain").textContent = `${train.trainNumber} ${train.trainName}`;
    document.getElementById("sumRoute").textContent = `${train.source} → ${train.destination}`;
    document.getElementById("sumDep").textContent = `${train.departureTime} (${train.durationMinutes >= 60 ? Math.floor(train.durationMinutes / 60) + "h " : ""}${train.durationMinutes % 60}m journey)`;

    const classSelect = document.getElementById("preferredClass");
    classSelect.innerHTML = train.classesAvailable.map((c) => `<option value="${c}">${c}</option>`).join("");
    classSelect.addEventListener("change", updateSummary);

    // journey date: default to tomorrow, min = today
    const dateInput = document.getElementById("journeyDate");
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    dateInput.min = today.toISOString().split("T")[0];
    dateInput.value = tomorrow.toISOString().split("T")[0];

    addPassengerRow();
    updateSummary();
  }

  document.getElementById("confirmBtn").addEventListener("click", async () => {
    const journeyDate = document.getElementById("journeyDate").value;
    const preferredClass = document.getElementById("preferredClass").value;

    if (!journeyDate) {
      showMsg("Please choose a journey date.", "error");
      return;
    }

    const passengers = [...passengerList.querySelectorAll(".passenger-card")].map((card) => ({
      name: card.querySelector(".pax-name").value.trim(),
      age: card.querySelector(".pax-age").value,
      gender: card.querySelector(".pax-gender").value,
      contact: card.querySelector(".pax-contact").value.trim(),
      berthPreference: card.querySelector(".pax-berth").value,
    }));

    if (passengers.some((p) => !p.name || !p.age)) {
      showMsg("Please fill in every passenger's name and age.", "error");
      return;
    }

    const confirmBtn = document.getElementById("confirmBtn");
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Booking…";

    const { ok, data } = await RMS.api("/api/bookings", {
      method: "POST",
      auth: true,
      body: { trainId, journeyDate, preferredClass, passengers },
    });

    if (ok) {
      window.location.href = `ticket.html?bookingId=${data.booking.id}`;
      return;
    }

    showMsg(data.message || "Could not complete booking. Please try again.", "error");
    confirmBtn.disabled = false;
    confirmBtn.textContent = "Confirm Booking";
  });

  loadTrain();
})();
