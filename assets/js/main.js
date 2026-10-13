/* Fal-consumé — site behaviour */
(function () {
  "use strict";

  /* Navigation ---------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector(".nav-toggle__label").textContent = open ? "Close" : "Menu";
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 62.0625rem)").addEventListener("change", function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* Reveal on scroll ---------------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Reservations -------------------------------------------------------- */
  var calEl = document.getElementById("calendar");
  if (!calEl) return;

  var OPENING = new Date(2027, 0, 1);
  var FULLY_BOOKED_UNTIL = new Date(2027, 2, 13); // Saturday 13 March 2027
  var FIRST_MONTH = new Date(2027, 0, 1);
  var LAST_MONTH = new Date(2027, 5, 1);          // June 2027
  var SERVICE_DAYS = [4, 5, 6];                   // Thu, Fri, Sat
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  var SPECIAL = {
    "2027-01-01": "Opening night",
    "2027-02-12": "Valentine’s weekend",
    "2027-02-13": "Valentine’s weekend"
  };

  var view = new Date(FIRST_MONTH);
  var selected = null;

  var titleEl = document.getElementById("cal-title");
  var gridEl = document.getElementById("cal-grid");
  var prevBtn = document.getElementById("cal-prev");
  var nextBtn = document.getElementById("cal-next");
  var summaryEl = document.getElementById("cal-summary");
  var dateSelect = document.getElementById("date");

  function key(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function longDate(d) {
    return DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  }
  function status(d) {
    if (d < OPENING || SERVICE_DAYS.indexOf(d.getDay()) === -1) return "closed";
    if (d <= FULLY_BOOKED_UNTIL) return "booked";
    return "open";
  }
  function fromKey(k) {
    var p = k.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  function render() {
    var y = view.getFullYear(), m = view.getMonth();
    titleEl.textContent = MONTHS[m] + " " + y;
    prevBtn.disabled = view <= FIRST_MONTH;
    nextBtn.disabled = view >= LAST_MONTH;

    var first = new Date(y, m, 1);
    var offset = (first.getDay() + 6) % 7; // Monday-first
    var daysIn = new Date(y, m + 1, 0).getDate();
    var html = "", cell = 0, booked = 0, open = 0;

    html += "<tr>";
    for (var i = 0; i < offset; i++, cell++) html += '<td><span class="day day--empty" aria-hidden="true"></span></td>';
    for (var d = 1; d <= daysIn; d++, cell++) {
      if (cell > 0 && cell % 7 === 0) html += "</tr><tr>";
      var date = new Date(y, m, d), k = key(date), s = status(date);
      var note = SPECIAL[k] ? " — " + SPECIAL[k] : "";
      if (s === "open") {
        open++;
        var isSel = selected === k;
        html += '<td><button type="button" class="day day--open' + (isSel ? " day--selected" : "") + '" data-date="' + k + '" aria-pressed="' + isSel + '" aria-label="' + longDate(date) + note + ", tables available to request" + '">' + d + '<span class="day__status" aria-hidden="true">Request</span></button></td>';
      } else if (s === "booked") {
        booked++;
        html += '<td><span class="day day--booked" role="img" aria-label="' + longDate(date) + note + ', fully booked">' + '<span aria-hidden="true">' + d + '</span><span class="day__status" aria-hidden="true">Full</span></span></td>';
      } else {
        html += '<td><span class="day day--closed" role="img" aria-label="' + longDate(date) + ', closed"><span aria-hidden="true">' + d + "</span></span></td>";
      }
    }
    while (cell % 7 !== 0) { html += '<td><span class="day day--empty" aria-hidden="true"></span></td>'; cell++; }
    html += "</tr>";
    gridEl.innerHTML = html;

    if (open === 0) {
      summaryEl.textContent = MONTHS[m] + ": all " + booked + " service evenings are fully booked.";
    } else if (booked === 0) {
      summaryEl.textContent = MONTHS[m] + ": " + open + " service evenings currently accepting reservation requests.";
    } else {
      summaryEl.textContent = MONTHS[m] + ": " + booked + " evenings fully booked, " + open + " accepting reservation requests.";
    }
  }

  prevBtn.addEventListener("click", function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); });
  nextBtn.addEventListener("click", function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); });

  gridEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-date]");
    if (!btn) return;
    selected = btn.getAttribute("data-date");
    dateSelect.value = selected;
    render();
    var again = gridEl.querySelector('[data-date="' + selected + '"]');
    if (again) again.focus();
    announce(longDate(fromKey(selected)) + " selected. Continue to the reservation request form.");
  });

  var live = document.getElementById("cal-live");
  function announce(msg) { live.textContent = ""; setTimeout(function () { live.textContent = msg; }, 50); }

  // Populate the date select
  (function () {
    var open = document.createElement("optgroup");
    open.label = "Accepting requests";
    var wait = document.createElement("optgroup");
    wait.label = "Fully booked — waiting list only";
    for (var d = new Date(OPENING); d < new Date(2027, 6, 1); d.setDate(d.getDate() + 1)) {
      var s = status(d);
      if (s === "closed") continue;
      var o = document.createElement("option");
      o.value = key(d);
      o.textContent = longDate(d) + (SPECIAL[key(d)] ? " (" + SPECIAL[key(d)] + ")" : "");
      (s === "open" ? open : wait).appendChild(o);
    }
    dateSelect.appendChild(open);
    dateSelect.appendChild(wait);
  })();

  dateSelect.addEventListener("change", function () {
    if (!dateSelect.value) return;
    var d = fromKey(dateSelect.value);
    selected = status(d) === "open" ? dateSelect.value : null;
    view = new Date(d.getFullYear(), d.getMonth(), 1);
    render();
  });

  render();

  /* Form ---------------------------------------------------------------- */
  var form = document.getElementById("reservation-form");
  var summary = document.getElementById("error-summary");
  var result = document.getElementById("form-result");

  var rules = [
    { id: "name", test: function (v) { return v.trim().length > 1; }, msg: "Please enter your full name." },
    { id: "email", test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }, msg: "Please enter a valid email address." },
    { id: "date", test: function (v) { return !!v; }, msg: "Please choose an evening." },
    { id: "time", test: function (v) { return !!v; }, msg: "Please choose a seating." },
    { id: "guests", test: function (v) { return !!v; }, msg: "Please tell us how many guests." },
    { id: "terms", test: function (_, el) { return el.checked; }, msg: "Please confirm you have read our note on the season." }
  ];

  function setError(el, msg) {
    var err = document.getElementById(el.id + "-error");
    if (msg) { el.setAttribute("aria-invalid", "true"); err.textContent = msg; }
    else { el.removeAttribute("aria-invalid"); err.textContent = ""; }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var errors = [];
    rules.forEach(function (r) {
      var el = document.getElementById(r.id);
      var ok = r.test(el.value, el);
      setError(el, ok ? "" : r.msg);
      if (!ok) errors.push(r);
    });

    if (errors.length) {
      summary.hidden = false;
      summary.querySelector("h3").textContent = "Please check the following";
      summary.querySelector("ul").innerHTML = errors.map(function (r) {
        return '<li><a href="#' + r.id + '">' + r.msg + "</a></li>";
      }).join("");
      summary.focus();
      return;
    }
    summary.hidden = true;

    var val = function (id) { return document.getElementById(id).value; };
    var payload = {
      name: val("name"), email: val("email"), phone: val("phone"),
      date: val("date"), time: val("time"), guests: val("guests"),
      occasion: val("occasion"), notes: val("notes"),
      terms: document.getElementById("terms").checked,
      company: val("company")
    };
    var button = form.querySelector('button[type="submit"]');
    var label = button.textContent;
    button.disabled = true;
    button.textContent = "Sending request\u2026";
    form.setAttribute("aria-busy", "true");

    fetch("/api/reserve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (data) { if (!r.ok || !data.ok) throw new Error(data.error || r.status); return data; }); })
      .then(function (data) { showConfirmation(payload, data.ref, data.waitlist); })
      .catch(function () {
        summary.hidden = false;
        summary.querySelector("h3").textContent = "We could not send your request";
        summary.querySelector("ul").innerHTML = "<li>Please try again in a few moments. Your details have not been lost.</li>";
        summary.focus();
      })
      .then(function () {
        button.disabled = false;
        button.textContent = label;
        form.removeAttribute("aria-busy");
      });
  });

  function showConfirmation(p, ref, isWait) {
    var d = fromKey(p.date);
    var name = p.name.trim().split(" ")[0];
    result.innerHTML =
      '<p class="eyebrow">Request received &middot; Ref. ' + escapeHtml(ref) + "</p>" +
      "<h3>" + (isWait ? "You have been placed on the waiting list" : "Thank you, " + escapeHtml(name)) + "</h3>" +
      "<p>" + (isWait
        ? "We regret that " + longDate(d) + " is fully committed. Your request for " + p.guests + " at " + p.time + " has been entered on the waiting list in the order in which it was received."
        : "Your request for " + p.guests + " on " + longDate(d) + " at " + p.time + " has been received.") + "</p>" +
      "<p>Please note this is a <em>request</em> and not a confirmed reservation. A member of our reservations team will write to you should a table be confirmed.</p>" +
      '<p class="muted">Please do not telephone.</p>';
    form.hidden = true;
    result.hidden = false;
    result.focus();
  }

  form.addEventListener("input", function (e) {
    if (e.target.getAttribute("aria-invalid") === "true") {
      var r = rules.filter(function (x) { return x.id === e.target.id; })[0];
      if (r && r.test(e.target.value, e.target)) setError(e.target, "");
    }
  });

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
})();
